import { Metadata } from 'next';
import { CITY_USER_FRIENDLY_NAME } from '@/lib/constants';

export async function generateMetadata({
  params
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const cityName =
    CITY_USER_FRIENDLY_NAME[city as keyof typeof CITY_USER_FRIENDLY_NAME];

  return {
    title: `Restaurantes en ${cityName} | Tabascomiendo`,
    description: `Descubre los mejores restaurantes en ${cityName}. Filtra por tipo de cocina, precio, y características especiales. Encuentra restaurantes abiertos cerca de ti.`,
    keywords: `restaurantes, ${cityName}, Tabasco, comida, gastronomía, México, restaurantes abiertos, delivery`,
    openGraph: {
      title: `Restaurantes en ${cityName} | Tabascomiendo`,
      description: `Descubre los mejores restaurantes en ${cityName}. Filtra por tipo de cocina, precio, y características especiales. Encuentra restaurantes abiertos cerca de ti.`,
      type: 'website',
      locale: 'es_MX',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Tabascomiendo - Descubre los mejores restaurantes en ${cityName}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Restaurantes en ${cityName} | Tabascomiendo`,
      description: `Descubre los mejores restaurantes en ${cityName}. Filtra por tipo de cocina, precio, y características especiales.`,
      images: ['/og-image.jpg']
    },
    alternates: {
      canonical: `https://tabascomiendo.com/${city}`
    }
  };
}
