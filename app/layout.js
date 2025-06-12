'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import dynamic from "next/dynamic";
import { Inter } from 'next/font/google';
import ClientFormProvider from './components/ClientFormProvider';
import { useEffect } from 'react';
import ClientOnly from './components/ClientOnly';

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
      <body suppressHydrationWarning className="relative min-h-screen flex flex-col">
        <div id="__next" className="flex flex-col flex-1">
          <ClientOnly>
            <ClientFormProvider>
              <DocumentHead />
              <HydrationSuppressor />
              <main className="main-wrapper flex-1 relative z-10">
                {children}
              </main>
            </ClientFormProvider>
          </ClientOnly>
        </div>
      </body>
    </html>
  );
}
