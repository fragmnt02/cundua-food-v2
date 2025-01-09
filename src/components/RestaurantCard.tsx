'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Restaurant } from '@/types/restaurant';

export const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState(restaurant.imageUrl);

  return (
    <div
      key={restaurant.id}
      className="border rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => router.push(`/restaurant/${restaurant.id}`)}
    >
      <div className="relative h-48 bg-gray-200">
        <Image
          src={imageSrc || '/restaurant.svg'}
          alt={restaurant.name || 'Restaurant image'}
          fill
          priority
          className="object-cover"
          onError={() => setImageSrc('/restaurant.svg')}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{restaurant.name}</h2>
              {restaurant.isIncomplete && (
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">
                  Incompleto
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{restaurant.priceRange}</span>
              <span className="text-yellow-500">★</span>
              <span className="text-gray-700">
                {restaurant.rating.toFixed(1)}
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded text-sm ${
              restaurant.isOpen
                ? 'bg-green-100 text-green-800'
                : restaurant.isOpeningSoon
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {restaurant.isOpen
              ? 'Abierto'
              : restaurant.isOpeningSoon
              ? 'Abre Pronto'
              : 'Cerrado'}
          </span>
        </div>
        <p className="text-gray-600">{restaurant.cuisine.join(', ')}</p>
      </div>
    </div>
  );
};
