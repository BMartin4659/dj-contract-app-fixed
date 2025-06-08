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
    // Set initial viewport height
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial values
    setVH();
    document.title = "Live City DJ Contract App";

    // Update on resize and orientation change
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure new dimensions are available
      setTimeout(setVH, 100);
    });

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.className}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body suppressHydrationWarning>
        {/* Background layer */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/bg.jpg')" }} />

        {/* App content */}
        <div id="__next" className="flex flex-col min-h-[100vh] min-h-[calc(var(--vh,1vh)*100)]">
          <ClientFormProvider>
            <DocumentHead />
            <HydrationSuppressor />
            <main className="flex-1 relative">
              {children}
            </main>
          </ClientFormProvider>
        </div>
      </body>
    </html>
  );
}
