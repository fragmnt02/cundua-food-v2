import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Tabascomiendo',
    default: 'Tabascomiendo - Descubre los mejores restaurantes en Tabasco'
  },
  description:
    'Encuentra los mejores restaurantes en Tabasco. Explora menús, reseñas, y calificaciones de usuarios. Descubre nuevos lugares para comer.',
  applicationName: 'Tabascomiendo',
  authors: [{ name: 'Tabascomiendo' }],
  creator: 'Tabascomiendo',
  publisher: 'Tabascomiendo',
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true
  },
  metadataBase: new URL('https://tabascomiendo.com'),
  openGraph: {
    type: 'website',
    siteName: 'Tabascomiendo',
    title: 'Tabascomiendo - Descubre los mejores restaurantes en Tabasco',
    description:
      'Encuentra los mejores restaurantes en Tabasco. Explora menús, reseñas, y calificaciones de usuarios.',
    locale: 'es_MX',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tabascomiendo - Descubre los mejores restaurantes en Tabasco'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabascomiendo',
    description: 'Encuentra los mejores restaurantes en Tabasco',
    creator: '@tabascomiendo',
    site: '@tabascomiendo',
    images: ['/og-image.jpg']
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' }
    ]
  },
  manifest: '/manifest.json'
};
