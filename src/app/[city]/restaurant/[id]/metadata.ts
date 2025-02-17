import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Restaurant } from '@/types/restaurant';

export async function generateMetadata({
  params
}: {
  params: { id: string; city: string };
}): Promise<Metadata> {
  const { id, city } = params;
  try {
    const restaurantRef = doc(db, 'restaurants', id);
    const restaurantSnap = await getDoc(restaurantRef);
    const restaurant = restaurantSnap.data() as Restaurant;

    if (!restaurant) {
      return {
        title: 'Restaurante No Encontrado | tabascomiendo',
        description: 'El restaurante solicitado no pudo ser encontrado.',
        robots: {
          index: false,
          follow: true
        }
      };
    }

    // Construir características para la descripción
    const caracteristicas = [
      restaurant.features.wifi ? 'WiFi' : '',
      restaurant.features.hasParking ? 'Estacionamiento' : '',
      restaurant.features.hasAC ? 'Aire Acondicionado' : '',
      restaurant.features.reservations ? 'Reservaciones' : '',
      restaurant.features.outdoorSeating ? 'Asientos al aire libre' : '',
      restaurant.features.kidsFriendly ? 'Amigable para niños' : ''
    ]
      .filter(Boolean)
      .join(' • ');

    const title = `${restaurant.name} | Restaurante en ${city} | tabascomiendo`;
    const description = `${restaurant.name} - ${restaurant.cuisine.join(
      ', '
    )}. ${
      restaurant.information || `El mejor restaurante en ${city}, México.`
    } ${restaurant.priceRange}${
      caracteristicas ? ` • ${caracteristicas}` : ''
    }`.trim();

    // Imagen principal asegurada
    const mainImage =
      restaurant.coverImageUrl || restaurant.imageUrl || '/restaurant.svg';

    // Palabras clave en español
    const keywords = [
      restaurant.name,
      ...restaurant.cuisine,
      city,
      'restaurante',
      'comida',
      'gastronomía',
      'cocina',
      'menú',
      restaurant.type,
      restaurant.priceRange,
      ...Object.entries(restaurant.features)
        .filter(([, value]) => value)
        .map(([key]) => {
          const keywordMap: { [key: string]: string } = {
            wifi: 'WiFi',
            hasParking: 'estacionamiento',
            hasAC: 'aire acondicionado',
            reservations: 'reservaciones',
            outdoorSeating: 'terraza',
            kidsFriendly: 'familiar'
          };
          return keywordMap[key] || key;
        })
    ];

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'es_MX',
        url: `https://catalogo.tabacomiendo.com/${city}/restaurant/${id}`,
        siteName: 'Tabascomiendo',
        images: [
          {
            url: mainImage,
            width: 1200,
            height: 630,
            alt: `${restaurant.name} - Restaurante en ${city}`
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [{ url: mainImage }],
        site: '@tabascomiendo'
      },
      alternates: {
        canonical: `https://catalogo.tabacomiendo.com/${city}/restaurant/${id}`
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large'
        }
      },
      authors: [{ name: 'Tabascomiendo' }],
      category: 'Restaurantes',
      other: {
        'og:price:currency': 'MXN',
        'og:price:standard_amount': restaurant.priceRange,
        'business:contact_data:street_address':
          restaurant.location?.address || '',
        'business:contact_data:locality': city,
        'business:contact_data:region': 'México',
        'business:contact_data:country_name': 'México',
        'place:location:latitude':
          restaurant.location?.coordinates?.latitude || '',
        'place:location:longitude':
          restaurant.location?.coordinates?.longitude || '',
        'restaurant:cuisine': restaurant.cuisine.join(', '),
        'restaurant:price_range': restaurant.priceRange
      }
    };
  } catch (error) {
    console.error('Error generando metadatos:', error);
    return {
      title: 'Restaurantes | Tabascomiendo',
      description: 'Descubre los mejores restaurantes en tu ciudad.',
      robots: {
        index: false,
        follow: true
      }
    };
  }
}
