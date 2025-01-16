'use client';

import { useEffect, useState } from 'react';
import { Restaurant } from '@/types/restaurant';
import { useAuth } from '@/hooks/useAuth';
import { useCity } from '@/hooks/useCity';
import { RestaurantCard } from '@/components/RestaurantCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { city } = useCity();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !city) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/favorites`);
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, city]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mis Favoritos</h1>
        <p className="text-center text-gray-600">
          Inicia sesión para ver tus restaurantes favoritos
        </p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mis Favoritos</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes restaurantes favoritos
          </h2>
          <p className="text-gray-600">
            Marca restaurantes como favoritos para verlos aquí
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
            {favorites.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </ScrollArea>
      )}
    </main>
  );
}
