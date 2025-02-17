'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Restaurant, Cuisine, PaymentMethod } from '@/types/restaurant';
import { RestaurantCard } from './RestaurantCard';
import { useNearbyRestaurants } from '@/hooks/useNearbyRestaurants';
import FilterSection from './FilterSection';
import { useRouter, useSearchParams } from 'next/navigation';
import { analytics } from '@/utils/analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';

// Constants moved outside component to prevent recreation
const FEATURES = ['hasAC', 'hasParking', 'freeDelivery'] as const;
type Feature = (typeof FEATURES)[number];

const FEATURE_LABELS: Record<Feature, string> = {
  hasAC: 'Aire acondicionado',
  hasParking: 'Estacionamiento',
  freeDelivery: 'Envío gratis'
};

interface Filters {
  searchQuery: string;
  cuisine: string[];
  priceRange: string[];
  features: Feature[];
  paymentMethods: PaymentMethod[];
  type: string[];
  showOnlyOpen: boolean;
  sort: 'name' | 'rating' | 'distance';
}

type FilterValue<K extends keyof Filters> = Filters[K];

const RestaurantListSkeleton = () => (
  <div className="space-y-4 mb-6">
    <Skeleton className="h-10 w-full" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Skeleton className="h-8" />
      <Skeleton className="h-8" />
      <Skeleton className="h-8" />
      <Skeleton className="h-8" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const RestaurantList = ({
  restaurants,
  loading
}: {
  restaurants: Restaurant[];
  loading?: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    nearbyRestaurants,
    isLoading: isLoadingLocation,
    error: locationError,
    refreshLocation
  } = useNearbyRestaurants(restaurants);

  // Initialize filters from URL query parameters
  const [filters, setFilters] = useState<Filters>(() => ({
    searchQuery: searchParams.get('q') || '',
    cuisine: searchParams.get('cuisine')?.split(',').filter(Boolean) || [],
    priceRange: searchParams.get('price')?.split(',').filter(Boolean) || [],
    features: (searchParams.get('features')?.split(',').filter(Boolean) ||
      []) as Feature[],
    paymentMethods: (searchParams.get('payment')?.split(',').filter(Boolean) ||
      []) as PaymentMethod[],
    type: searchParams.get('type')?.split(',').filter(Boolean) || [],
    showOnlyOpen: searchParams.get('open') === 'true',
    sort:
      (searchParams.get('sort') as 'name' | 'rating' | 'distance') || 'distance'
  }));

  // Track search analytics
  useEffect(() => {
    if (filters.searchQuery) {
      analytics.trackSearch(filters.searchQuery);
    }
  }, [filters.searchQuery]);

  // Update filters function with explicit typing
  const updateFilters = useCallback(
    <K extends keyof Filters>(key: K, value: FilterValue<K>) => {
      const newFilters = { ...filters };

      // Special case for clearing all filters
      if (key === 'searchQuery' && value === '') {
        setFilters({
          searchQuery: '',
          cuisine: [],
          priceRange: [],
          features: [],
          paymentMethods: [],
          type: [],
          showOnlyOpen: false,
          sort: 'distance'
        });
        router.push(window.location.pathname, { scroll: false });
        return;
      }

      // Type-safe assignment
      newFilters[key] = value;
      setFilters(newFilters);

      // Create new URLSearchParams object
      const newParams = new URLSearchParams();

      // Only add non-default values to URL
      if (newFilters.searchQuery) newParams.set('q', newFilters.searchQuery);
      if (newFilters.cuisine.length > 0)
        newParams.set('cuisine', newFilters.cuisine.join(','));
      if (newFilters.priceRange.length > 0)
        newParams.set('price', newFilters.priceRange.join(','));
      if (newFilters.features.length > 0)
        newParams.set('features', newFilters.features.join(','));
      if (newFilters.paymentMethods.length > 0)
        newParams.set('payment', newFilters.paymentMethods.join(','));
      if (newFilters.type.length > 0)
        newParams.set('type', newFilters.type.join(','));
      if (newFilters.showOnlyOpen) newParams.set('open', 'true');
      if (newFilters.sort !== 'distance')
        newParams.set('sort', newFilters.sort);

      // Update URL without refresh
      const query = newParams.toString();
      router.push(window.location.pathname + (query ? `?${query}` : ''), {
        scroll: false
      });

      // Track analytics for filter usage
      if (key !== 'searchQuery') {
        analytics.trackFilterUse(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        );
      }
    },
    [router, filters]
  );

  const filteredAndSortedRestaurants = useMemo(() => {
    let result = restaurants;

    // Apply filters
    result = result.filter((restaurant) => {
      const matchesSearch = restaurant.name
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase());
      const matchesCuisine =
        filters.cuisine.length === 0 ||
        filters.cuisine.some((cuisine) =>
          restaurant.cuisine?.includes(cuisine as keyof typeof Cuisine)
        );
      const matchesType =
        filters.type.length === 0 || filters.type.includes(restaurant.type);
      const matchesPriceRange =
        filters.priceRange.length === 0 ||
        filters.priceRange.includes(restaurant.priceRange);
      const matchesFeatures =
        filters.features.length === 0 ||
        filters.features.every(
          (feature) =>
            restaurant.features[feature as keyof typeof restaurant.features]
        );
      const matchesPaymentMethods =
        filters.paymentMethods.length === 0 ||
        filters.paymentMethods.some((method) =>
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
    });

    // Apply sorting
    if (filters.sort === 'distance' && nearbyRestaurants.length > 0) {
      const distanceMap = new Map(
        nearbyRestaurants.map((r) => [r.id, r.distance])
      );
      return result
        .map((r) => ({
          ...r,
          distance: distanceMap.get(r.id)
        }))
        .sort((a, b) => {
          // First sort by open status
          if (a.isOpen !== b.isOpen) {
            return b.isOpen ? 1 : -1;
          }
          // Then sort by distance
          if (a.distance === undefined && b.distance === undefined) return 0;
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
    }

    return result.sort((a, b) => {
      // First sort by open status
      if (a.isOpen !== b.isOpen) {
        return b.isOpen ? 1 : -1;
      }
      // Then apply the selected sort criteria within each group (open and closed)
      switch (filters.sort) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [restaurants, nearbyRestaurants, filters]);

  return (
    <main
      className="container mx-auto px-4 py-8 pt-0"
      role="main"
      aria-label="Lista de restaurantes"
    >
      <h1 className="text-3xl font-bold mb-8" id="restaurant-list-title">
        Restaurantes
      </h1>

      {loading ? (
        <RestaurantListSkeleton />
      ) : (
        <>
          <FilterSection
            filters={filters}
            onFilterChange={updateFilters}
            features={FEATURES}
            featureLabels={FEATURE_LABELS}
            aria-labelledby="restaurant-list-title"
          />

          {isLoadingLocation && (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Obteniendo ubicación...</span>
            </div>
          )}

          {locationError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>
                {locationError ===
                'Geolocation is not supported by your browser'
                  ? 'Tu navegador no soporta geolocalización'
                  : 'No se pudo obtener tu ubicación'}
                <button
                  onClick={refreshLocation}
                  className="ml-2 underline"
                  aria-label="Intentar obtener ubicación nuevamente"
                >
                  Intentar de nuevo
                </button>
              </AlertDescription>
            </Alert>
          )}

          {filteredAndSortedRestaurants.length === 0 ? (
            <div className="text-center py-12" role="status" aria-live="polite">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron restaurantes
              </h2>
              <p className="text-gray-600">
                Intenta ajustar los filtros para ver más resultados
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1"
              role="list"
              aria-label="Restaurantes encontrados"
            >
              {filteredAndSortedRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  distance={
                    'distance' in restaurant &&
                    typeof restaurant.distance === 'number'
                      ? restaurant.distance
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
};
