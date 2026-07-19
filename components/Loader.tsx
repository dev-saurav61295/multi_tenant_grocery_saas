"use client";

import React, { useState, useEffect } from "react";
import { MdStorefront, MdLock } from "react-icons/md";

const statuses = [
  "Verifying secure connection to Bhagwandas Traders...",
  "Encrypting administrative session data...",
  "Synchronizing inventory global states...",
  "Fetching latest merchant analytics...",
  "Finalizing dashboard components...",
];

export default function Loader() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setStatusIndex((prev) => (prev + 1) % statuses.length);
        setFade(false);
      }, 300);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] h-screen w-full flex flex-col items-center justify-center px-4 font-sans text-[#161d17] antialiased overflow-hidden"
      style={{ background: 'radial-gradient(circle at center, #ffffff 0%, #f8fbf8 100%)' }}
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#006d37 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      {/* Central Brand Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo Icon Container */}
        <div className="mb-10 animate-soft-pulse">
          <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-[2rem] bg-white shadow-[0px_10px_30px_rgba(0,109,55,0.08)]">
            <MdStorefront className="text-[#006d37] text-[48px] md:text-[64px]" />
            {/* Decorative floating ring */}
            <div
              className="absolute inset-0 border-2 border-[#2ecc71]/20 rounded-[2rem] animate-ping opacity-20"
              style={{ animationDuration: "3s" }}
            ></div>
          </div>
        </div>

        {/* Brand Identity */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#161d17]">
            Bhagwandas Traders
          </h1>
          <p className="text-xs font-bold text-[#6c7b6d] uppercase tracking-[0.2em]">
            Premium Admin Ecosystem
          </p>
        </div>

        {/* Custom Indeterminate Progress Section */}
        <div className="w-64 space-y-4 mt-6">
          <div className="relative h-1.5 w-full bg-[#dce5da] rounded-full overflow-hidden">
            <div className="absolute top-0 bottom-0 bg-[#2ecc71] progress-bar-moving rounded-full"></div>
          </div>
          <p className="text-sm font-semibold text-[#3d4a3e] animate-pulse">
            Loading Dashboard...
          </p>
        </div>
      </div>

      {/* Footer / Status Message */}
      <footer className="absolute bottom-12 w-full text-center px-4">
        <div className="flex items-center justify-center gap-2">
          <MdLock className="text-[#006d37] text-[18px]" />
          <p
            className={`text-sm text-[#6c7b6d] transition-opacity duration-300 ${
              fade ? "opacity-0" : "opacity-100"
            }`}
          >
            {statuses[statusIndex]}
          </p>
        </div>

        {/* Connection Pulse Dots */}
        <div className="flex justify-center gap-1 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2ecc71] opacity-40"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#2ecc71] opacity-70"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#2ecc71]"></div>
        </div>
      </footer>
    </div>
  );
}
