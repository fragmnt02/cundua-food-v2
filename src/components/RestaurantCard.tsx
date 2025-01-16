'use client';

import { Restaurant } from '@/types/restaurant';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFavorite } from '@/hooks/useFavorite';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useCity } from '@/hooks/useCity';

export const RestaurantCard = ({
  restaurant,
  distance
}: {
  restaurant: Restaurant;
  distance?: number;
}) => {
  const { isFavorite, toggleFavorite, isLoading } = useFavorite(restaurant.id);
  const { user } = useAuth();
  const { city } = useCity();

  return (
    <Card className="overflow-hidden group">
      <Link href={`/${city}/restaurant/${restaurant.id}`}>
        <CardHeader className="p-0">
          <div className="relative aspect-video">
            {restaurant.imageUrl && restaurant.imageUrl.trim() !== '' && (
              <Image
                src={restaurant.imageUrl}
                alt={restaurant.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform group-hover:scale-105"
                placeholder="blur"
                blurDataURL="/restaurant.svg"
              />
            )}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute top-2 right-2 z-10 bg-white/80 hover:bg-white/90',
                  isFavorite && 'text-red-500'
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite();
                }}
                disabled={isLoading}
              >
                <Heart className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{restaurant.name}</h3>
              {distance !== undefined && (
                <p className="text-sm text-muted-foreground">
                  {distance < 1
                    ? `${Math.round(distance * 1000)}m de distancia`
                    : `${distance.toFixed(1)}km de distancia`}
                </p>
              )}
            </div>
            <Badge variant={restaurant.isOpen ? 'default' : 'secondary'}>
              {restaurant.isOpen ? 'Abierto' : 'Cerrado'}
            </Badge>
          </div>
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
      </Link>
    </Card>
  );
};
