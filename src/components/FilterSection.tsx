'use client';

import { Cuisine, PaymentMethod, RestaurantType } from '@/types/restaurant';

type Feature = 'hasAC' | 'hasParking' | 'freeDelivery';

interface Filters {
  searchQuery: string;
  cuisine: string;
  priceRange: string;
  features: Feature[];
  paymentMethods: PaymentMethod[];
  type: string;
}

interface FilterSectionProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string | string[]) => void;
  features: readonly Feature[];
  featureLabels: Record<Feature, string>;
}

export default function FilterSection({
  filters,
  onFilterChange,
  features,
  featureLabels
}: FilterSectionProps) {
  return (
    <details className="mb-6 w-full">
      <summary className="cursor-pointer p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
        Filtros y Búsqueda
      </summary>
      <div className="mt-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Buscar restaurantes..."
          className="p-2 border rounded"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange('searchQuery', e.target.value)}
        />

        <select
          value={filters.cuisine}
          onChange={(e) => onFilterChange('cuisine', e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">Todas las cocinas</option>
          {Object.keys(Cuisine).map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {Cuisine[cuisine as keyof typeof Cuisine]}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">Todos los tipos</option>
          {Object.values(RestaurantType).map((type) => (
            <option key={type} value={type}>
              {type === RestaurantType.Restaurant
                ? 'Restaurante'
                : type === RestaurantType.FoodTruck
                ? 'Food Truck'
                : type === RestaurantType.DarkKitchen
                ? 'Cocina Fantasma'
                : type === RestaurantType.FoodCourt
                ? 'Plaza de Comidas (Pasatiempo)'
                : 'Para Llevar'}
            </option>
          ))}
        </select>

        {/* Price Range Filter */}
        <select
          value={filters.priceRange}
          onChange={(e) => onFilterChange('priceRange', e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">Todos los precios</option>
          <option value="$">$ (Menos de $100 MXN por persona)</option>
          <option value="$$">$$ ($100-200 MXN por persona)</option>
          <option value="$$$">$$$ ($200-600 MXN por persona)</option>
          <option value="$$$$">$$$$ (Más de $600 MXN por persona)</option>
        </select>

        {/* Features Filter */}
        <div className="flex flex-wrap gap-2">
          {features.map((feature) => (
            <label key={feature} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={filters.features.includes(feature)}
                onChange={() => {
                  const newFeatures = filters.features.includes(feature)
                    ? filters.features.filter((f) => f !== feature)
                    : [...filters.features, feature];
                  onFilterChange('features', newFeatures);
                }}
                className="form-checkbox"
              />
              <span className="text-sm">{featureLabels[feature]}</span>
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
                checked={filters.paymentMethods.includes(method)}
                onChange={() => {
                  const newMethods = filters.paymentMethods.includes(method)
                    ? filters.paymentMethods.filter((m) => m !== method)
                    : [...filters.paymentMethods, method];
                  onFilterChange('paymentMethods', newMethods);
                }}
                className="form-checkbox"
              />
              <span className="text-sm">{method}</span>
            </label>
          ))}
        </div>
      </div>
    </details>
  );
}
