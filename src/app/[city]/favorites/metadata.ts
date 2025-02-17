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
    title: `Mis Restaurantes Favoritos en ${cityName} | Tabascomiendo`,
    description: `Tu lista personalizada de restaurantes favoritos en ${cityName}. Guarda y organiza tus lugares preferidos para comer.`,
    openGraph: {
      title: `Mis Restaurantes Favoritos en ${cityName} | Tabascomiendo`,
      description: `Tu lista personalizada de restaurantes favoritos en ${cityName}. Guarda y organiza tus lugares preferidos para comer.`,
      type: 'website',
      locale: 'es_MX',
      siteName: 'Tabascomiendo'
    },
    twitter: {
      card: 'summary_large_image',
      title: `Mis Restaurantes Favoritos en ${cityName} | Tabascomiendo`,
      description: `Tu lista personalizada de restaurantes favoritos en ${cityName}.`
    }
  };
}
