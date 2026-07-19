"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
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

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  // Automatically hide the loader when the route changes
  useEffect(() => {
    hideLoader();
  }, [pathname, searchParams]);

  return (
    <GlobalLoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      {children}
      {isLoading && <Loader />}
    </GlobalLoaderContext.Provider>
  );
}
