'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Restaurant } from '@/types/restaurant';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useFavorite } from '@/hooks/useFavorite';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamically import the modal component to reduce initial bundle size
const ImageModal = dynamic(() => import('@/components/ImageModal'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-96" />
});

export default function RestaurantPage() {
  const { getRestaurant } = useRestaurant();
  const params = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const {
    isFavorite,
    toggleFavorite,
    isLoading: isFavoriteLoading
  } = useFavorite(params.id as string);

  useEffect(() => {
    const fetchRestaurant = async () => {
      const data = await getRestaurant(params.id as string);
      if (data) {
        setRestaurant(data);
      }
    };
    fetchRestaurant();
  }, [getRestaurant, params.id]);

  useEffect(() => {
    // Update title and description dynamically
    if (restaurant) {
      // Update only the title tag
      document.title = `${restaurant.name} | Cundua Food`;
    }
  }, [restaurant]);

  if (!restaurant) {
    return (
      <div className="min-h-screen p-8">
        <Skeleton className="h-96 w-full mb-8" />
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-8 w-1/2 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-200">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'bg-white/80 hover:bg-white/90',
                isFavorite && 'text-red-500'
              )}
              onClick={toggleFavorite}
              disabled={isFavoriteLoading}
            >
              <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
            </Button>
          )}
          {isAdmin && (
            <Button
              onClick={() => router.push(`/admin/update/${params.id}`)}
              variant="default"
            >
              Editar Restaurante
            </Button>
          )}
        </div>
        {restaurant.imageUrl && restaurant.imageUrl.trim() !== '' && (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL="/restaurant.svg"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
          <h1 className="text-4xl font-bold text-white" tabIndex={0}>
            {restaurant.name}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2 overflow-x-auto pb-2">
            {restaurant.cuisine.map((cuisine) => (
              <Badge
                key={cuisine}
                variant="secondary"
                className="whitespace-nowrap"
              >
                {cuisine}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="flex w-full overflow-x-auto space-x-2 mb-8 h-auto p-1 sm:grid sm:grid-cols-5">
            <TabsTrigger value="info" className="flex-shrink-0 h-10">
              Información
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex-shrink-0 h-10">
              Horario
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex-shrink-0 h-10">
              Menú
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex-shrink-0 h-10">
              Contacto
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-shrink-0 h-10">
              Comentarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Información del restaurante</CardTitle>
              </CardHeader>
              <CardContent>
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">Menú</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {restaurant.menu.map(
                      (menuImage, index) =>
                        menuImage.imageUrl &&
                        menuImage.imageUrl.trim() !== '' && (
                          <div
                            key={index}
                            className="relative aspect-[3/4] cursor-pointer"
                            onClick={() => {
                              setSelectedImage(menuImage.imageUrl);
                              setScale(1);
                            }}
                          >
                            <Image
                              src={menuImage.imageUrl}
                              alt={`Menu ${index + 1}`}
                              fill
                              className="object-cover rounded-lg"
                              placeholder="blur"
                              blurDataURL="/restaurant.svg"
                            />
                          </div>
                        )
                    )}
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedImage && selectedImage.trim() !== '' && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
          scale={scale}
          onScaleChange={setScale}
        />
      )}
    </main>
  );
}
