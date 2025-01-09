import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function generateMetadata({
  params
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const restaurantRef = doc(db, 'restaurants', params.id);
    const restaurantSnap = await getDoc(restaurantRef);
    const restaurant = restaurantSnap.data();

    if (!restaurant) {
      return {
        title: 'Restaurant Not Found - Tabascomiendo',
        description: 'The requested restaurant could not be found.'
      };
    }

    return {
      title: `${restaurant.name} - Tabascomiendo`,
      description: `${restaurant.name} - ${restaurant.cuisine.join(', ')}. ${
        restaurant.information || 'Restaurante en Tabasco, México.'
      }`,
      openGraph: {
        title: `${restaurant.name} - Tabascomiendo`,
        description: `${restaurant.name} - ${restaurant.cuisine.join(', ')}. ${
          restaurant.information || 'Restaurante en Tabasco, México.'
        }`,
        images: [
          {
            url: restaurant.imageUrl,
            width: 1200,
            height: 630,
            alt: restaurant.name
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${restaurant.name} - Tabascomiendo`,
        description: `${restaurant.name} - ${restaurant.cuisine.join(', ')}. ${
          restaurant.information || 'Restaurante en Tabasco, México.'
        }`,
        images: [restaurant.imageUrl]
      },
      alternates: {
        canonical: `https://tabascomiendo.com/restaurant/${params.id}`
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Restaurant - Tabascomiendo',
      description: 'Discover great restaurants in Tabasco, Mexico.'
    };
  }
}
