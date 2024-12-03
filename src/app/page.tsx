'use client';

import { Cuisine, PaymentMethod } from '@/types/restaurant';
import { useState, useMemo, useCallback } from 'react';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurant } from '@/hooks/useRestaurant';
import { isClient } from '@/hooks/isClient';

export default function Home() {
  const { restaurants } = useRestaurant();
  const [searchQuery, setSearchQuery] = useState(() => {
    if (isClient()) {
      return localStorage.getItem('restaurantFilters.searchQuery') || '';
    }
    return '';
  });
  const [selectedCuisine, setSelectedCuisine] = useState(() => {
    if (isClient()) {
      return localStorage.getItem('restaurantFilters.cuisine') || 'all';
    }
    return 'all';
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState(() => {
    if (isClient()) {
      return localStorage.getItem('restaurantFilters.priceRange') || 'all';
    }
    return 'all';
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => {
    if (isClient()) {
      try {
        return JSON.parse(
          localStorage.getItem('restaurantFilters.features') || '[]'
        );
      } catch {
        return [];
      }
    }
  });
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    string[]
  >(() => {
    if (isClient()) {
      try {
        return JSON.parse(
          localStorage.getItem('restaurantFilters.paymentMethods') || '[]'
        );
      } catch {
        return [];
      }
    }
  });

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    return (restaurants ?? [])
      .filter(
        (restaurant) =>
          restaurant.name.toLowerCase()?.includes(searchQuery.toLowerCase()) &&
          (selectedCuisine === 'all' ||
            restaurant.cuisine?.includes(selectedCuisine as Cuisine)) &&
          (selectedPriceRange === 'all' ||
            restaurant.priceRange === selectedPriceRange) &&
          (selectedFeatures.length === 0 ||
            selectedFeatures.every(
              (feature) =>
                restaurant.features[feature as keyof typeof restaurant.features]
            )) &&
          (selectedPaymentMethods.length === 0 ||
            selectedPaymentMethods.every((method) =>
              restaurant.paymentMethods?.includes(method as PaymentMethod)
            ))
      )
      .sort((a, b) => {
        if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
        if (a.isOpeningSoon !== b.isOpeningSoon)
          return a.isOpeningSoon ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [
    restaurants,
    searchQuery,
    selectedCuisine,
    selectedPriceRange,
    selectedFeatures,
    selectedPaymentMethods
  ]);

  // Cache the filter updates
  const updateCache = useCallback((key: string, value: string | string[]) => {
    if (isClient()) {
      localStorage.setItem(
        `restaurantFilters.${key}`,
        typeof value === 'object' ? JSON.stringify(value) : value
      );
    }
  }, []);

  // Update the existing setter functions to include caching
  const handleSearchQuery = (value: string) => {
    setSearchQuery(value);
    updateCache('searchQuery', value);
  };

  const handleCuisineChange = (value: string) => {
    setSelectedCuisine(value);
    updateCache('cuisine', value);
  };

  const handlePriceRangeChange = (value: string) => {
    setSelectedPriceRange(value);
    updateCache('priceRange', value);
  };

  const handleFeatureChange = (feature: string) => {
    setSelectedFeatures((prev) => {
      const newFeatures = prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature];
      updateCache('features', newFeatures);
      return newFeatures;
    });
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethods((prev) => {
      const newMethods = prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method];
      updateCache('paymentMethods', newMethods);
      return newMethods;
    });
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">Restaurantes</h1>

      {/* Search and Filter Section */}
      <details className="mb-6 w-full">
        <summary className="cursor-pointer p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Filtros y Búsqueda
        </summary>
        <div className="mt-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar restaurantes..."
            className="p-2 border rounded"
            value={searchQuery}
            onChange={(e) => handleSearchQuery(e.target.value)}
          />

          <select
            value={selectedCuisine}
            onChange={(e) => handleCuisineChange(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">Todas las cocinas</option>
            {Object.values(Cuisine).map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>

          {/* Price Range Filter */}
          <select
            value={selectedPriceRange}
            onChange={(e) => handlePriceRangeChange(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">Todos los precios</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>

          {/* Features Filter */}
          <div className="flex flex-wrap gap-2">
            {['hasAC', 'hasParking', 'freeDelivery'].map((feature) => (
              <label key={feature} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedFeatures?.includes(feature)}
                  onChange={() => handleFeatureChange(feature)}
                  className="form-checkbox"
                />
                <span className="text-sm">
                  {feature === 'hasAC'
                    ? 'Aire acondicionado'
                    : feature === 'hasParking'
                    ? 'Estacionamiento'
                    : feature === 'freeDelivery'
                    ? 'Envío gratis'
                    : feature}
                </span>
              </label>
            ))}
          </div>

          {/* Payment Methods Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium">Métodos de pago:</span>
            {Object.values(PaymentMethod).map((method) => (
              <label key={method} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedPaymentMethods?.includes(method)}
                  onChange={() => handlePaymentMethodChange(method)}
                  className="form-checkbox"
                />
                <span className="text-sm">{method}</span>
              </label>
            ))}
          </div>
        </div>
      </details>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </main>
  );
}
