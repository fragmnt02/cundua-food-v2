'use client';

import { Cuisine, Restaurant } from '@/types/restaurant';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFavorite } from '@/hooks/useFavorite';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useCity } from '@/hooks/useCity';
import { useState } from 'react';

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
  const [imageError, setImageError] = useState(false);

  const coverImage =
    restaurant.coverImageUrl?.trim() || restaurant.imageUrl?.trim();
  const logoImage = restaurant.logoUrl?.trim() || restaurant.imageUrl?.trim();
  const fallbackImage = '/restaurant.svg';

  return (
    <Card
      className="overflow-hidden group transition-shadow duration-200 hover:shadow-lg"
      role="listitem"
      aria-label={`Restaurante ${restaurant.name}`}
    >
      <Link
        href={`/${city}/restaurant/${restaurant.id}`}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        aria-label={`Ver detalles de ${restaurant.name}`}
      >
        <CardHeader className="p-0">
          <div className="relative aspect-video bg-muted">
            {coverImage && (
              <Image
                src={imageError ? fallbackImage : coverImage}
                alt={`Portada de ${restaurant.name}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                placeholder="blur"
                blurDataURL={fallbackImage}
                priority={false}
                onError={() => setImageError(true)}
                loading="lazy"
              />
            )}
            {logoImage && (
              <div
                className="absolute left-4 -bottom-6 w-16 h-16 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden z-10 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                <Image
                  src={imageError ? fallbackImage : logoImage}
                  alt={`Logo de ${restaurant.name}`}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={fallbackImage}
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              </div>
            )}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute top-2 right-2 z-10 bg-white/80 hover:bg-white/90 transition-colors duration-200',
                  isFavorite && 'text-red-500 hover:text-red-600',
                  'focus:ring-2 focus:ring-primary focus:ring-offset-2'
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite();
                }}
                disabled={isLoading}
                aria-label={
                  isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
                }
                aria-pressed={isFavorite}
              >
                <Heart
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    isFavorite ? 'scale-110 fill-current' : 'scale-100'
                  )}
                />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-8 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg">{restaurant.name}</h3>
              {distance !== undefined && (
                <p
                  className="text-sm text-muted-foreground"
                  aria-label={`${
                    distance < 1
                      ? `${Math.round(distance * 1000)} metros`
                      : `${distance.toFixed(1)} kilómetros`
                  } de distancia`}
                >
                  {distance < 1
                    ? `${Math.round(distance * 1000)}m de distancia`
                    : `${distance.toFixed(1)}km de distancia`}
                </p>
              )}
            </div>
            <Badge
              variant={restaurant.isOpen ? 'default' : 'secondary'}
              className="transition-colors duration-200"
              aria-label={
                restaurant.isOpen
                  ? 'Restaurante abierto'
                  : 'Restaurante cerrado'
              }
            >
              {restaurant.isOpen ? 'Abierto' : 'Cerrado'}
            </Badge>
          </div>
          <p
            className="text-sm text-muted-foreground line-clamp-1"
            aria-label={`Tipos de cocina: ${restaurant.cuisine
              .map((c) => Cuisine[c])
              .join(', ')}`}
          >
            {restaurant.cuisine.map((c) => Cuisine[c]).join(', ')}
          </p>
          <div
            className="flex items-center gap-1"
            aria-label={`Calificación: ${(restaurant.rating ?? 0).toFixed(
              1
            )} de 5 estrellas, ${restaurant.voteCount ?? 0} votos`}
          >
            <Star
              className="w-4 h-4 fill-yellow-400 text-yellow-400"
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground">
              {(restaurant.rating ?? 0).toFixed(1)} ({restaurant.voteCount ?? 0}{' '}
              votos)
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
