// frontend/src/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import AppHeader from "@/components/app-header";
import AppFooterNav from "@/components/app-footer-nav";
import AppFooter from "@/components/app-footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amigo eStore",
  description: "Multivendor eCommerce Amigo eStore",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Amigo eStore" />
        <link rel="apple-touch-icon" href="/images/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/images/icon-512.png" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-100`}>
        <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
          <AppHeader />
          <main className="flex-grow">{children}</main>
          <div className="md:hidden">
            <AppFooterNav />
          </div>
          <AppFooter />
        </Suspense>
      </body>
    </html>
  );
}