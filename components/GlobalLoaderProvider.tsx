"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Loader from "@/components/Loader";

interface GlobalLoaderContextType {
  showLoader: () => void;
  hideLoader: () => void;
  isLoading: boolean;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextType | undefined>(undefined);

export function useGlobalLoader() {
  const context = useContext(GlobalLoaderContext);
  if (context === undefined) {
    throw new Error("useGlobalLoader must be used within a GlobalLoaderProvider");
  }
  return context;
}

let silentRefreshActive = false;

/**
 * Opt-out for background data refreshes (e.g. realtime-triggered router.refresh())
 * that shouldn't block the screen with the full-page loader. Call immediately
 * before the refresh; the flag self-clears on the next tick, once the refresh's
 * underlying fetch has had a chance to dispatch.
 */
export function markSilentRefresh() {
  silentRefreshActive = true;
  setTimeout(() => {
    silentRefreshActive = false;
  }, 0);
}

function isPrefetchRequest(resource: RequestInfo | URL, init?: RequestInit): boolean {
  if (init?.headers) {
    const headers = new Headers(init.headers);
    if (
      headers.get("next-router-prefetch") ||
      headers.get("Purpose") === "prefetch" ||
      headers.get("purpose") === "prefetch" ||
      headers.get("x-middleware-prefetch")
    ) {
      return true;
    }
  }
  if (typeof resource === "object" && resource && "headers" in resource) {
    const headers = new Headers((resource as Request).headers);
    if (
      headers.get("next-router-prefetch") ||
      headers.get("Purpose") === "prefetch" ||
      headers.get("purpose") === "prefetch" ||
      headers.get("x-middleware-prefetch")
    ) {
      return true;
    }
  }
  return false;
}

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const activeRequests = useRef(0);
  const navPending = useRef(false);
  const pathname = usePathname();

  // Single source of truth for the overlay. Loader stays up while any tracked
  // request is in flight OR a navigation is pending (showLoader → until the
  // route actually changes). All setState is deferred out of the current call
  // stack: a fetch can be dispatched by React mid-render/insertion-effect, and
  // setState there is illegal ("useInsertionEffect must not schedule updates").
  // The hide waits a paint (double rAF) so new content is on screen first.
  const reconcile = useCallback(() => {
    if (activeRequests.current > 0 || navPending.current) {
      requestAnimationFrame(() => {
        if (activeRequests.current > 0 || navPending.current) {
          setIsLoading(true);
        }
      });
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (activeRequests.current === 0 && !navPending.current) {
          setIsLoading(false);
        }
      });
    });
  }, []);

  // Keep the loader up across an imminent navigation (login submit, a nav link
  // click). Crucially it stays up until the destination route COMMITS — the
  // pathname effect below — not merely until the triggering fetch ends. A
  // Server Action redirect's fetch settles seconds before the new page renders
  // (the navigation runs in a React transition; the old page stays mounted and
  // pathname stays put until the transition commits), so releasing on fetch-end
  // would flash the old page back. Nothing hides it on a timer.
  const showLoader = useCallback(() => {
    navPending.current = true;
    reconcile();
  }, [reconcile]);

  // Release a navigation intent that will NOT result in a route change — e.g. a
  // failed login returns an error instead of redirecting, so no pathname change
  // is coming and the loader must be let go explicitly. Does not touch the
  // request counter, so anything still fetching keeps the loader up.
  const hideLoader = useCallback(() => {
    navPending.current = false;
    reconcile();
  }, [reconcile]);

  // The destination route committed: the pending navigation is done. (Runs on
  // mount too, where navPending is false — a harmless no-op that also clears any
  // stray loader.)
  useEffect(() => {
    navPending.current = false;
    reconcile();
  }, [pathname, reconcile]);

  // Next.js's router is itself built on fetch — RSC navigation payloads, Server
  // Actions, and router.refresh() all go through window.fetch — so one fetch
  // interceptor with a shared counter covers every same-page data update.
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const [resource, init] = args;

      // Skip Next.js's background prefetch requests and refreshes explicitly
      // marked silent (see markSilentRefresh) — neither should block the screen.
      if (isPrefetchRequest(resource, init) || silentRefreshActive) {
        return originalFetch(...args);
      }

      activeRequests.current += 1;
      reconcile();

      try {
        return await originalFetch(...args);
      } finally {
        activeRequests.current = Math.max(0, activeRequests.current - 1);
        reconcile();
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [reconcile]);

  return (
    <GlobalLoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      {children}
      {isLoading && <Loader />}
    </GlobalLoaderContext.Provider>
  );
}
