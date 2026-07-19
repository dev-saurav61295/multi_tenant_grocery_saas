"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi, Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaProvider() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBackOnlineToast, setShowBackOnlineToast] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallDismissed, setIsInstallDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA: Service Worker registered successfully:", registration.scope);
          })
          .catch((err) => {
            console.error("PWA: Service Worker registration failed:", err);
          });
      });
    }

    // 2. Network Status Monitoring
    const handleOnline = () => {
      setIsOffline(false);
      setShowBackOnlineToast(true);
      const timer = setTimeout(() => setShowBackOnlineToast(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowBackOnlineToast(false);
    };

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    // 3. Capture Install Prompt (beforeinstallprompt)
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("PWA: User accepted the install prompt");
    } else {
      console.log("PWA: User dismissed the install prompt");
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Offline Alert Banner */}
      {isOffline ? (
        <div className="fixed top-0 inset-x-0 z-[120] bg-red-600 px-4 py-2 text-center text-xs md:text-sm font-bold text-white shadow-lg flex items-center justify-center gap-2 animate-slide-down">
          <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
          <span>You are currently offline. Showing cached content where available.</span>
        </div>
      ) : null}

      {/* Back Online Toast */}
      {showBackOnlineToast ? (
        <div className="fixed top-4 right-4 z-[120] rounded-xl bg-brand-green px-4 py-3 text-white shadow-card flex items-center gap-3 animate-fade-in border border-brand-green-bright/30">
          <div className="rounded-full bg-white/20 p-1">
            <Wifi className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold">Back Online!</p>
            <p className="text-[11px] text-white/85">Your connection has been restored.</p>
          </div>
          <button
            onClick={() => setShowBackOnlineToast(false)}
            className="ml-2 rounded-full p-1 hover:bg-white/10"
            aria-label="Close alert"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* PWA Install Prompt Card */}
      {deferredPrompt && !isInstallDismissed ? (
        <div className="fixed bottom-6 right-6 z-[110] w-full max-w-sm rounded-2xl border border-brand-border bg-white p-5 shadow-2xl animate-slide-up mx-4 md:mx-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-green text-white shadow-md">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-ink">Install Bhagwandas App</h3>
                <p className="mt-0.5 text-xs text-brand-muted">
                  Add to your home screen for fast offline access and app notifications.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsInstallDismissed(true)}
              className="rounded-full p-1 text-brand-muted hover:bg-brand-panel-soft hover:text-brand-ink transition"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsInstallDismissed(true)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-muted hover:bg-brand-panel-soft transition"
            >
              Not Now
            </button>
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Install
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
