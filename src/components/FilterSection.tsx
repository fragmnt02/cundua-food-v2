'use client';

import { Cuisine, PaymentMethod, RestaurantType } from '@/types/restaurant';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type Feature = 'hasAC' | 'hasParking' | 'freeDelivery';

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

interface FilterSectionProps {
  filters: Filters;
  onFilterChange: (
    key: keyof Filters,
    value: string | string[] | boolean
  ) => void;
  features: readonly Feature[];
  featureLabels: Record<Feature, string>;
}

export default function FilterSection({
  filters,
  onFilterChange,
  features,
  featureLabels
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.cuisine !== 'all' ||
    filters.priceRange !== 'all' ||
    filters.features.length > 0 ||
    filters.paymentMethods.length > 0 ||
    filters.type !== 'all' ||
    filters.showOnlyOpen;

  const activeFilterCount = [
    filters.searchQuery !== '',
    filters.cuisine !== 'all',
    filters.priceRange !== 'all',
    ...filters.features,
    ...filters.paymentMethods,
    filters.type !== 'all',
    filters.showOnlyOpen
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFilterChange('searchQuery', '');
    onFilterChange('cuisine', 'all');
    onFilterChange('priceRange', 'all');
    onFilterChange('features', []);
    onFilterChange('paymentMethods', []);
    onFilterChange('type', 'all');
    onFilterChange('showOnlyOpen', false);
  };

  return (
    <Card className="mb-6 w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-transparent p-0 data-[state=open]:bg-transparent"
              >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Filtros y Búsqueda
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </h2>
              </Button>
            </CollapsibleTrigger>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>

        <CollapsibleContent className="px-4 pb-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar restaurantes..."
                className="w-full rounded-md border pl-9 p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                value={filters.searchQuery}
                onChange={(e) => onFilterChange('searchQuery', e.target.value)}
                aria-label="Buscar restaurantes"
              />
            </div>

            {/* Cuisine Select */}
            <Select
              value={filters.cuisine}
              onValueChange={(value) => onFilterChange('cuisine', value)}
            >
              <SelectTrigger aria-label="Seleccionar tipo de cocina">
                <SelectValue placeholder="Todas las cocinas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las cocinas</SelectItem>
                {Object.keys(Cuisine).map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {Cuisine[cuisine as keyof typeof Cuisine]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Restaurant Type Select */}
            <Select
              value={filters.type}
              onValueChange={(value) => onFilterChange('type', value)}
            >
              <SelectTrigger aria-label="Seleccionar tipo de restaurante">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.values(RestaurantType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === RestaurantType.Restaurant
                      ? 'Restaurante'
                      : type === RestaurantType.FoodTruck
                      ? 'Food Truck'
                      : type === RestaurantType.DarkKitchen
                      ? 'Cocina Fantasma'
                      : type === RestaurantType.FoodCourt
                      ? 'Plaza de Comidas (Pasatiempo)'
                      : 'Para Llevar'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Select */}
            <Select
              value={filters.priceRange}
              onValueChange={(value) => onFilterChange('priceRange', value)}
            >
              <SelectTrigger aria-label="Seleccionar rango de precios">
                <SelectValue placeholder="Todos los precios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los precios</SelectItem>
                <SelectItem value="$">
                  $ (Menos de $100 MXN por persona)
                </SelectItem>
                <SelectItem value="$$">
                  $$ ($100-200 MXN por persona)
                </SelectItem>
                <SelectItem value="$$$">
                  $$$ ($200-600 MXN por persona)
                </SelectItem>
                <SelectItem value="$$$$">
                  $$$$ (Más de $600 MXN por persona)
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Select */}
            <Select
              value={filters.sort}
              onValueChange={(value) => onFilterChange('sort', value)}
            >
              <SelectTrigger aria-label="Ordenar por">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="rating">Calificación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Features Section */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Características</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.showOnlyOpen ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  onFilterChange('showOnlyOpen', !filters.showOnlyOpen);
                }}
                aria-pressed={filters.showOnlyOpen}
                className={cn(
                  'transition-colors',
                  filters.showOnlyOpen && 'text-primary-foreground'
                )}
              >
                Solo abiertos
              </Button>
              {features.map((feature) => (
                <Button
                  key={feature}
                  variant={
                    filters.features.includes(feature) ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => {
                    const newFeatures = filters.features.includes(feature)
                      ? filters.features.filter((f) => f !== feature)
                      : [...filters.features, feature];
                    onFilterChange('features', newFeatures);
                  }}
                  aria-pressed={filters.features.includes(feature)}
                  className={cn(
                    'transition-colors',
                    filters.features.includes(feature) &&
                      'text-primary-foreground'
                  )}
                >
                  {featureLabels[feature]}
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Métodos de pago</h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(PaymentMethod).map((method) => (
                <Button
                  key={method}
                  variant={
                    filters.paymentMethods.includes(method)
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => {
                    const newMethods = filters.paymentMethods.includes(method)
                      ? filters.paymentMethods.filter((m) => m !== method)
                      : [...filters.paymentMethods, method];
                    onFilterChange('paymentMethods', newMethods);
                  }}
                  aria-pressed={filters.paymentMethods.includes(method)}
                  className={cn(
                    'transition-colors',
                    filters.paymentMethods.includes(method) &&
                      'text-primary-foreground'
                  )}
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
