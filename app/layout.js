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
    
    // Global Google Maps error suppression
    const suppressGoogleMapsErrors = () => {
      // Override window.alert to suppress Google Maps alerts
      const originalAlert = window.alert;
      window.alert = (message) => {
        if (typeof message === 'string' && 
            (message.includes('Google Maps') || 
             message.includes('maps.googleapis.com') ||
             message.includes('This page can\'t load Google Maps correctly') ||
             message.includes('Do you own this website?'))) {
          // Silently ignore Google Maps alerts
          console.log('Suppressed Google Maps alert:', message);
          return;
        }
        originalAlert(message);
      };

      // Override window.confirm for Google Maps
      const originalConfirm = window.confirm;
      window.confirm = (message) => {
        if (typeof message === 'string' && 
            (message.includes('Google Maps') || 
             message.includes('maps.googleapis.com') ||
             message.includes('Do you own this website?'))) {
          // Auto-dismiss Google Maps confirms
          console.log('Suppressed Google Maps confirm:', message);
          return false;
        }
        return originalConfirm(message);
      };

      // Override console.error to suppress Google Maps errors
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('Google Maps') || 
            message.includes('maps.googleapis.com') ||
            message.includes('InvalidKeyMapError') ||
            message.includes('ApiNotActivatedMapError') ||
            message.includes('QuotaExceededError')) {
          // Log but don't show error
          console.log('Suppressed Google Maps error:', message);
          return;
        }
        originalConsoleError.apply(console, args);
      };
    };

    // Apply error suppression
    suppressGoogleMapsErrors();
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
