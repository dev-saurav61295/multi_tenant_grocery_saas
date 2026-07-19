import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GlobalLoaderProvider } from "@/components/GlobalLoaderProvider";
import { PwaProvider } from "@/components/pwa-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#006d37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Bhagwandas Traders",
  description: "Localized grocery ordering and operations platform for Bhagwandas Traders.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bhagwandas",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/favicon-32x32.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GlobalLoaderProvider>
          <PwaProvider />
          {children}
        </GlobalLoaderProvider>
      </body>
    </html>
  );
}
