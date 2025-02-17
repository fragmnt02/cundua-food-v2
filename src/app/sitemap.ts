import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { CITIES } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URLs
  const baseUrls = [
    {
      url: 'https://tabascomiendo.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1
    },
    ...CITIES.map((city) => ({
      url: `https://tabascomiendo.com/${city}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    })),
    {
      url: 'https://tabascomiendo.com/auth/login',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5
    },
    {
      url: 'https://tabascomiendo.com/auth/signup',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5
    }
  ];

  // Get all restaurants for each city
  const restaurantUrls: MetadataRoute.Sitemap = [];

  for (const city of CITIES) {
    const restaurantsRef = collection(db, 'cities', city, 'restaurants');
    const snapshot = await getDocs(restaurantsRef);

    snapshot.docs.forEach((doc) => {
      restaurantUrls.push({
        url: `https://tabascomiendo.com/${city}/restaurant/${doc.id}`,
        lastModified: new Date(doc.data().updatedAt || doc.data().createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8
      });
    });
  }

  return [...baseUrls, ...restaurantUrls];
}
