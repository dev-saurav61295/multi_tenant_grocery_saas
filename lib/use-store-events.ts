"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ORDERS_CHANGED_EVENT, storeChannelName } from "@/lib/store-channel";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const POLL_FALLBACK_MS = 30_000;
const REFRESH_DEBOUNCE_MS = 500;

let browserClient: SupabaseClient | null = null;

function getBrowserClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null;
  }

  browserClient ??= createClient(SUPABASE_URL, SUPABASE_KEY);
  return browserClient;
}

/**
 * Re-fetches the current route's server data whenever another user changes
 * this store's orders. Subscribes to the store's Supabase Realtime broadcast
 * channel (see lib/realtime.ts for the publisher); when Supabase env is not
 * configured, degrades to polling every 30s so dashboards still stay fresh.
 */
export function useStoreEvents(storeId: string) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Coalesce bursts of events (e.g. verify + assign) into one refresh.
    const refresh = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => router.refresh(), REFRESH_DEBOUNCE_MS);
    };

    const client = getBrowserClient();

    if (!client) {
      const interval = setInterval(() => router.refresh(), POLL_FALLBACK_MS);
      return () => clearInterval(interval);
    }

    const channel = client
      .channel(storeChannelName(storeId))
      .on("broadcast", { event: ORDERS_CHANGED_EVENT }, refresh)
      .subscribe();

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      client.removeChannel(channel);
    };
  }, [router, storeId]);
}

/** One-line drop-in for Server Component pages (e.g. order tracking): renders nothing, just live-refreshes. */
export function StoreEventsRefresher({ storeId }: { storeId: string }) {
  useStoreEvents(storeId);
  return null;
}
