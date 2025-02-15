'use client';

import localFont from 'next/font/local';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { analytics } from '@/utils/analytics';
import { CookieConsent } from '@/components/CookieConsent';
import { FavoritesProvider } from '@/providers/FavoritesProvider';
import { CityProvider } from '@/providers/CityProvider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
});

function Analytics() {
  'use client';

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + searchParams.toString();
    analytics.pageview(url);
  }, [pathname, searchParams]);

  return null;
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-G61FZTS9F4"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G61FZTS9F4', {
              'consent_mode_enabled': true
            });
            gtag('consent', 'default', {
              'analytics_storage': 'denied'
            });
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <AuthProvider>
          <CityProvider>
            <FavoritesProvider>
              <Header />
              <main className="min-h-[calc(100vh-64px)] pb-20">{children}</main>
              <Footer />
              <Toaster />
              <CookieConsent />
            </FavoritesProvider>
          </CityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
