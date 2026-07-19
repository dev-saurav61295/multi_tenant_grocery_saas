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
  const isNavigating = useRef(false);
  const pathname = usePathname();

  const showLoader = useCallback(() => {
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    activeRequests.current = 0;
    isNavigating.current = false;
    setIsLoading(false);
  }, []);

  // Automatically hide the loader when the route changes
  useEffect(() => {
    isNavigating.current = false;
    activeRequests.current = 0;
    setIsLoading(false);
  }, [pathname]);

  // Global interceptors for window.fetch, XHR, and anchor navigation clicks
  useEffect(() => {
    const originalFetch = window.fetch;
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    // Intercept fetch calls (API requests & Server Actions & RSC navigation data)
    window.fetch = async (...args) => {
      const [resource, init] = args;

      // Do not trigger global loader for Next.js background prefetch requests
      if (isPrefetchRequest(resource, init)) {
        return originalFetch(...args);
      }

      activeRequests.current += 1;
      setIsLoading(true);

      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        activeRequests.current = Math.max(0, activeRequests.current - 1);
        if (activeRequests.current === 0 && !isNavigating.current) {
          setIsLoading(false);
        }
      }
    };

    // Intercept XMLHttpRequest just in case any client scripts/axios use XHR
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (...args: any[]) {
      this.addEventListener("loadend", () => {
        activeRequests.current = Math.max(0, activeRequests.current - 1);
        if (activeRequests.current === 0 && !isNavigating.current) {
          setIsLoading(false);
        }
      });
      return originalOpen.apply(this, args as any);
    };

    XMLHttpRequest.prototype.send = function (...args: any[]) {
      activeRequests.current += 1;
      setIsLoading(true);
      return originalSend.apply(this, args as any);
    };

    // Intercept history transitions to reset loader cleanly on query/search params change
    window.history.pushState = function (...args: any[]) {
      const result = originalPushState.apply(this, args as any);
      isNavigating.current = false;
      activeRequests.current = 0;
      setIsLoading(false);
      return result;
    };

    window.history.replaceState = function (...args: any[]) {
      const result = originalReplaceState.apply(this, args as any);
      isNavigating.current = false;
      activeRequests.current = 0;
      setIsLoading(false);
      return result;
    };

    // Intercept anchor clicks (`<Link>` / `<a href>`) to immediately show loader on menu/navigation click
    const handleAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (
          targetUrl.origin === currentUrl.origin &&
          (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
        ) {
          isNavigating.current = true;
          setIsLoading(true);
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalOpen;
      XMLHttpRequest.prototype.send = originalSend;
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, []);

  return (
    <GlobalLoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      {children}
      {isLoading && <Loader />}
    </GlobalLoaderContext.Provider>
  );
}
