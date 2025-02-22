import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Restaurantes en Tabasco | Tabascomiendo',
  description:
    'Descubre los mejores restaurantes en Tabasco. Filtra por tipo de cocina, precio, y características especiales. Encuentra restaurantes abiertos cerca de ti.',
  keywords:
    'restaurantes, Tabasco, comida, gastronomía, México, restaurantes abiertos, delivery',
  openGraph: {
    title: 'Restaurantes en Tabasco | Tabascomiendo',
    description:
      'Descubre los mejores restaurantes en Tabasco. Filtra por tipo de cocina, precio, y características especiales. Encuentra restaurantes abiertos cerca de ti.',
    type: 'website',
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
    title: 'Restaurantes en Tabasco | Tabascomiendo',
    description:
      'Descubre los mejores restaurantes en Tabasco. Filtra por tipo de cocina, precio, y características especiales.',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: 'https://tabascomiendo.com'
  }
};

export default function HomePage() {
  redirect('/select-city');
}
