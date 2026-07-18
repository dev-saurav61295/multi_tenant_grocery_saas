import "server-only";
import { storeChannelName } from "@/lib/store-channel";

// Server-side publisher for realtime store events. Uses Supabase Realtime's
// HTTP broadcast endpoint directly (no SDK, no socket) so it works in
// short-lived Server Actions. The only Supabase coupling in the app is this
// file plus lib/use-store-events.ts — swap both to move providers.

export type StoreEvent = {
  event: "orders-changed";
  payload: { orderId: string };
};

let warnedMissingConfig = false;

/**
 * Broadcasts an event to every client subscribed to this store's channel.
 * Fire-and-forget: never throws, so a realtime outage can't fail an order
 * mutation. No-ops (with a one-time warning) when Supabase env is not set —
 * clients then fall back to polling, see lib/use-store-events.ts.
 */
export async function publishStoreEvent(storeId: string, event: StoreEvent): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    if (!warnedMissingConfig) {
      warnedMissingConfig = true;
      console.warn("Supabase realtime env is not set (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY) — realtime events disabled, dashboards fall back to polling.");
    }
    return;
  }

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            topic: storeChannelName(storeId),
            event: event.event,
            payload: event.payload,
            private: false,
          },
        ],
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      console.error(`Realtime broadcast failed: ${response.status} ${await response.text()}`);
    }
  } catch (error) {
    console.error("Realtime broadcast failed", error);
  }
}
