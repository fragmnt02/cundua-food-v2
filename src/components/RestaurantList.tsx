'use client';

import { Cuisine, PaymentMethod } from '@/types/restaurant';
import { useState, useMemo, useCallback, Suspense } from 'react';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurant } from '@/hooks/useRestaurant';
import { isClient } from '@/hooks/isClient';
import dynamic from 'next/dynamic';

// Constants moved outside component to prevent recreation
const FEATURES = ['hasAC', 'hasParking', 'freeDelivery'] as const;
type Feature = (typeof FEATURES)[number];

const FEATURE_LABELS: Record<Feature, string> = {
  hasAC: 'Aire acondicionado',
  hasParking: 'Estacionamiento',
  freeDelivery: 'Envío gratis'
};

// Lazy load the filter section for better initial load
const FilterSection = dynamic(() => import('./FilterSection'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse h-12 bg-gray-200 rounded w-full" />
  )
});

interface Filters {
  searchQuery: string;
  cuisine: string;
  priceRange: string;
  features: Feature[];
  paymentMethods: PaymentMethod[];
  type: string;
}

export default function RestaurantList() {
  const { restaurants, loading } = useRestaurant();
  const [filters, setFilters] = useState<Filters>(() => {
    if (!isClient())
      return {
        searchQuery: '',
        cuisine: 'all',
        priceRange: 'all',
        features: [],
        paymentMethods: [],
        type: 'all'
      };

    return {
      searchQuery: localStorage.getItem('restaurantFilters.searchQuery') || '',
      cuisine: localStorage.getItem('restaurantFilters.cuisine') || 'all',
      priceRange: localStorage.getItem('restaurantFilters.priceRange') || 'all',
      features: JSON.parse(
        localStorage.getItem('restaurantFilters.features') || '[]'
      ),
      paymentMethods: JSON.parse(
        localStorage.getItem('restaurantFilters.paymentMethods') || '[]'
      ),
      type: localStorage.getItem('restaurantFilters.type') || 'all'
    };
  });

  // Memoized filter function
  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];

    return restaurants
      .filter((restaurant) => {
        const matchesSearch = restaurant.name
          .toLowerCase()
          ?.includes(filters.searchQuery.toLowerCase());
        const matchesCuisine =
          filters.cuisine === 'all' ||
          restaurant.cuisine?.includes(filters.cuisine as keyof typeof Cuisine);
        const matchesType =
          filters.type === 'all' || restaurant.type === filters.type;
        const matchesPriceRange =
          filters.priceRange === 'all' ||
          restaurant.priceRange === filters.priceRange;
        const matchesFeatures =
          filters.features.length === 0 ||
          filters.features.every(
            (feature) =>
              restaurant.features[feature as keyof typeof restaurant.features]
          );
        const matchesPaymentMethods =
          filters.paymentMethods.length === 0 ||
          filters.paymentMethods.every((method) =>
            restaurant.paymentMethods?.includes(method)
          );

        return (
          matchesSearch &&
          matchesCuisine &&
          matchesType &&
          matchesPriceRange &&
          matchesFeatures &&
          matchesPaymentMethods
        );
      })
      .sort((a, b) => {
        if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
        if (a.isOpeningSoon !== b.isOpeningSoon)
          return a.isOpeningSoon ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [restaurants, filters]);

  // Update filters and cache
  const updateFilters = useCallback(
    (key: keyof Filters, value: string | string[]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      if (isClient()) {
        localStorage.setItem(
          `restaurantFilters.${key}`,
          typeof value === 'object' ? JSON.stringify(value) : value
        );
      }
    },
    []
  );

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">Restaurantes</h1>

      {/* Lazy loaded filter section */}
      <Suspense
        fallback={
          <div className="animate-pulse h-12 bg-gray-200 rounded w-full" />
        }
      >
        <FilterSection
          filters={filters}
          onFilterChange={updateFilters}
          features={FEATURES}
          featureLabels={FEATURE_LABELS}
        />
      </Suspense>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        /* Restaurant Grid with virtualization for large lists */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </main>
  );
}
