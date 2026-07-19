"use client";

import { useEffect, useRef, useState } from "react";
import { BellRing, X } from "lucide-react";
import { useStoreEvents } from "@/lib/use-store-events";
import type { StoreEventKind, StoreEventPayload } from "@/lib/store-channel";

const TOAST_DISMISS_MS = 6_000;

type StoreNotificationsProps = {
  storeId: string;
  /** Which event kinds this surface cares about, and the toast text for each. Unlisted kinds still refresh the page, silently. */
  messages: Partial<Record<StoreEventKind, (displayId: string) => string>>;
  /** Play a short chime with each toast (default true). Browsers block audio until the user has interacted with the page once. */
  sound?: boolean;
};

type Toast = { id: number; text: string };

let nextToastId = 1;

function chime() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1174, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.45);
    oscillator.onended = () => void ctx.close();
  } catch {
    // Audio blocked (no user gesture yet) or unsupported — the toast still shows.
  }
}

/**
 * Live toast notifications for a store's order events. Also owns the page's
 * realtime subscription (auto-refresh included via useStoreEvents), so mount
 * this INSTEAD of calling useStoreEvents directly, never alongside it.
 */
export function StoreNotifications({ storeId, messages, sound = true }: StoreNotificationsProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  function dismiss(id: number) {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  useStoreEvents(storeId, (event: StoreEventPayload) => {
    const buildText = messages[event.kind];
    if (!buildText) {
      return;
    }

    const toast: Toast = { id: nextToastId++, text: buildText(event.displayId) };
    setToasts((current) => [...current, toast]);
    timersRef.current.set(toast.id, setTimeout(() => dismiss(toast.id), TOAST_DISMISS_MS));

    if (sound) {
      chime();
    }
  });

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div aria-live="polite" role="status" className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 rounded-xl border border-brand-border/60 bg-white p-4 shadow-focus"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green-bright text-brand-green">
            <BellRing className="h-4 w-4" />
          </span>
          <p className="flex-1 text-sm font-semibold text-brand-ink">{toast.text}</p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="rounded p-1 text-brand-muted hover:text-brand-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
