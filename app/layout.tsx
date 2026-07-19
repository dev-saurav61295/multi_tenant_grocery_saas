import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GlobalLoaderProvider } from "@/components/GlobalLoaderProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bhagwandas Traders",
  description: "Localized grocery ordering and operations platform for Bhagwandas Traders.",
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
        <GlobalLoaderProvider>{children}</GlobalLoaderProvider>
      </body>
    </html>
  );
}
