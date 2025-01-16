'use client';

import { Cuisine, PaymentMethod } from '@/types/restaurant';
import { useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurant } from '@/hooks/useRestaurant';
import { isClient } from '@/hooks/isClient';
import dynamic from 'next/dynamic';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { analytics } from '@/utils/analytics';

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
  loading: () => <FilterSectionSkeleton />
});

const FilterSectionSkeleton = () => (
  <div className="space-y-4 mb-6">
    <Skeleton className="h-10 w-full" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Skeleton className="h-8" />
      <Skeleton className="h-8" />
      <Skeleton className="h-8" />
      <Skeleton className="h-8" />
    </div>
  </div>
);

const RestaurantCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-48 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

interface Filters {
  searchQuery: string;
  cuisine: string;
  priceRange: string;
  features: Feature[];
  paymentMethods: PaymentMethod[];
  type: string;
  showOnlyOpen: boolean;
  sort: 'name' | 'rating';
}

const INITIAL_FILTERS: Filters = {
  searchQuery: '',
  cuisine: 'all',
  priceRange: 'all',
  features: [],
  paymentMethods: [],
  type: 'all',
  showOnlyOpen: false,
  sort: 'name'
};

export default function RestaurantList() {
  const { restaurants, loading } = useRestaurant();
  const [filters, setFilters] = useState<Filters>(() => {
    if (!isClient()) return INITIAL_FILTERS;

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
      type: localStorage.getItem('restaurantFilters.type') || 'all',
      showOnlyOpen:
        localStorage.getItem('restaurantFilters.showOnlyOpen') === 'true',
      sort:
        (localStorage.getItem('restaurantFilters.sort') as 'name' | 'rating') ||
        'name'
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
        const matchesOpenStatus = !filters.showOnlyOpen || restaurant.isOpen;

        return (
          matchesSearch &&
          matchesCuisine &&
          matchesType &&
          matchesPriceRange &&
          matchesFeatures &&
          matchesPaymentMethods &&
          matchesOpenStatus
        );
      })
      .sort((a, b) => {
        // First sort by open status
        if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
        if (a.isOpeningSoon !== b.isOpeningSoon)
          return a.isOpeningSoon ? -1 : 1;

        // Then sort by selected sort option
        if (filters.sort === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [restaurants, filters]);

  // Update filters and cache
  const updateFilters = useCallback(
    (key: keyof Filters, value: string | string[] | boolean) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      if (isClient()) {
        localStorage.setItem(
          `restaurantFilters.${key}`,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        );
      }
      // Track filter usage
      if (key !== 'searchQuery') {
        // Search is tracked separately
        analytics.trackFilterUse(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        );
      }
    },
    []
  );

  useEffect(() => {
    if (filters.searchQuery) {
      // Track search
      analytics.trackSearch(filters.searchQuery);
    }
  }, [filters.searchQuery]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Restaurantes</h1>

      {/* Lazy loaded filter section */}
      <Suspense fallback={<FilterSectionSkeleton />}>
        <FilterSection
          filters={filters}
          onFilterChange={updateFilters}
          features={FEATURES}
          featureLabels={FEATURE_LABELS}
        />
      </Suspense>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No se encontraron restaurantes
          </h2>
          <p className="text-gray-600">
            Intenta ajustar los filtros para ver más resultados
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </ScrollArea>
      )}
    </main>
  );
}
