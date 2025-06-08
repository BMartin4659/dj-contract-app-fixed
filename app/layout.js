'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import dynamic from "next/dynamic";
import { Inter } from 'next/font/google';
import ClientFormProvider from './components/ClientFormProvider';
import { useEffect } from 'react';

const HydrationSuppressor = dynamic(() => import('./components/HydrationSuppressor'), { ssr: false });
const DocumentHead = dynamic(() => import('./components/DocumentHead'), { ssr: false });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  useEffect(() => {
    document.title = "Live City DJ Contract App";
  }, []);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.className}`}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col">
        {/* Background layer */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/bg.jpg')" }} />

        {/* App content */}
        <div id="__next" className="flex flex-col min-h-screen">
          <ClientFormProvider>
            <DocumentHead />
            <HydrationSuppressor />
            <main className="flex-1">
              {children}
            </main>
          </ClientFormProvider>
        </div>
      </body>
    </html>
  );
}
