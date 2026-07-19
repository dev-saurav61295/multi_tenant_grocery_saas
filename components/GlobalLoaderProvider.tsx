"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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

function RouteChangeListener({ hideLoader }: { hideLoader: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    hideLoader();
  }, [pathname, searchParams, hideLoader]);

  return null;
}

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  return (
    <GlobalLoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      <Suspense fallback={null}>
        <RouteChangeListener hideLoader={hideLoader} />
      </Suspense>
      {children}
      {isLoading && <Loader />}
    </GlobalLoaderContext.Provider>
  );
}
