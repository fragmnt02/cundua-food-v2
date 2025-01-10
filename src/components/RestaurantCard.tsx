'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Restaurant } from '@/types/restaurant';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState(restaurant.imageUrl);

  const getStatusColor = (isOpen: boolean, isOpeningSoon: boolean) => {
    if (isOpen) return 'bg-green-100 text-green-800 hover:bg-green-200';
    if (isOpeningSoon)
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    return 'bg-red-100 text-red-800 hover:bg-red-200';
  };

  const getStatusText = (isOpen: boolean, isOpeningSoon: boolean) => {
    if (isOpen) return 'Abierto';
    if (isOpeningSoon) return 'Abre Pronto';
    return 'Cerrado';
  };

  return (
    <Card
      onClick={() => router.push(`/restaurant/${restaurant.id}`)}
      className="cursor-pointer transition-all hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      tabIndex={0}
      role="link"
      aria-label={`Ver detalles de ${restaurant.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/restaurant/${restaurant.id}`);
        }
      }}
    >
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        <Image
          src={imageSrc || '/restaurant.svg'}
          alt={`Fotografía de ${restaurant.name}`}
          fill
          priority={false}
          className="object-cover transition-transform hover:scale-105"
          onError={() => setImageSrc('/restaurant.svg')}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold line-clamp-1">
              {restaurant.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {restaurant.priceRange}
              </span>
              <div
                className="flex items-center gap-1"
                aria-label={`Calificación ${restaurant.rating} de 5 estrellas`}
              >
                <Star
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">
                  {restaurant.rating.toFixed(1)} ({restaurant.voteCount || 0}
                  {restaurant.voteCount === 1 ? ' voto' : ' votos'})
                </span>
              </div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              'ml-auto whitespace-nowrap',
              getStatusColor(restaurant.isOpen, restaurant.isOpeningSoon)
            )}
          >
            {getStatusText(restaurant.isOpen, restaurant.isOpeningSoon)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {restaurant.isIncomplete && (
          <Badge
            variant="outline"
            className="mb-2 bg-orange-100 text-orange-800 hover:bg-orange-200"
          >
            Incompleto
          </Badge>
        )}
        <p className="text-sm text-muted-foreground line-clamp-1">
          {restaurant.cuisine.join(', ')}
        </p>
      </CardContent>
    </Card>
  );
};
