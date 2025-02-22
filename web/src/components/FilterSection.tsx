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
import { ChevronDown, ChevronUp, Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

type Feature = 'hasAC' | 'hasParking' | 'freeDelivery';

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

interface FilterSectionProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(
    key: K,
    value: FilterValue<K>
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
  const [isCuisineOpen, setIsCuisineOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const cuisineRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.cuisine.length > 0 ||
    filters.priceRange.length > 0 ||
    filters.features.length > 0 ||
    filters.paymentMethods.length > 0 ||
    filters.type.length > 0 ||
    filters.showOnlyOpen;

  const activeFilterCount = [
    filters.searchQuery !== '',
    ...filters.cuisine,
    filters.priceRange.length > 0,
    ...filters.features,
    ...filters.paymentMethods,
    filters.type.length > 0,
    filters.showOnlyOpen
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFilterChange('searchQuery', '');
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cuisineRef.current &&
        !cuisineRef.current.contains(event.target as Node)
      ) {
        setIsCuisineOpen(false);
      }
      if (
        paymentRef.current &&
        !paymentRef.current.contains(event.target as Node)
      ) {
        setIsPaymentOpen(false);
      }
      if (
        featuresRef.current &&
        !featuresRef.current.contains(event.target as Node)
      ) {
        setIsFeaturesOpen(false);
      }
      if (
        priceRef.current &&
        !priceRef.current.contains(event.target as Node)
      ) {
        setIsPriceOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleCuisineKeyDown = (
    event: React.KeyboardEvent,
    cuisine: string
  ) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        const newCuisines = filters.cuisine.includes(cuisine)
          ? filters.cuisine.filter((c) => c !== cuisine)
          : [...filters.cuisine, cuisine];
        onFilterChange('cuisine', newCuisines);
        break;
      case 'Escape':
        setIsCuisineOpen(false);
        break;
    }
  };

  // Handle keyboard navigation for payment methods
  const handlePaymentKeyDown = (
    event: React.KeyboardEvent,
    method: PaymentMethod
  ) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        const newMethods = filters.paymentMethods.includes(method)
          ? filters.paymentMethods.filter((m) => m !== method)
          : [...filters.paymentMethods, method];
        onFilterChange('paymentMethods', newMethods);
        break;
      case 'Escape':
        setIsPaymentOpen(false);
        break;
    }
  };

  // Handle keyboard navigation for features
  const handleFeaturesKeyDown = (
    event: React.KeyboardEvent,
    feature: Feature
  ) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        const newFeatures = filters.features.includes(feature)
          ? filters.features.filter((f) => f !== feature)
          : [...filters.features, feature];
        onFilterChange('features', newFeatures);
        break;
      case 'Escape':
        setIsFeaturesOpen(false);
        break;
    }
  };

  // Handle keyboard navigation for price range
  const handlePriceKeyDown = (event: React.KeyboardEvent, price: string) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        const newPrices = filters.priceRange.includes(price)
          ? filters.priceRange.filter((p) => p !== price)
          : [...filters.priceRange, price];
        onFilterChange('priceRange', newPrices);
        break;
      case 'Escape':
        setIsPriceOpen(false);
        break;
    }
  };

  // Handle keyboard navigation for restaurant type
  const handleTypeKeyDown = (event: React.KeyboardEvent, type: string) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        const newTypes = filters.type.includes(type)
          ? filters.type.filter((t) => t !== type)
          : [...filters.type, type];
        onFilterChange('type', newTypes);
        break;
      case 'Escape':
        setIsTypeOpen(false);
        break;
    }
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
            <div className="relative" role="search">
              <label
                id="search-label"
                className="text-sm font-medium block mb-2"
              >
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar restaurantes..."
                  className="w-full rounded-md border pl-9 p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={filters.searchQuery}
                  onChange={(e) =>
                    onFilterChange('searchQuery', e.target.value)
                  }
                  aria-labelledby="search-label"
                />
              </div>
            </div>

            {/* Cuisine Select */}
            <div
              className="relative"
              role="group"
              aria-labelledby="cuisine-label"
              ref={cuisineRef}
            >
              <label
                id="cuisine-label"
                className="text-sm font-medium block mb-2"
              >
                Tipos de cocina
              </label>
              <div className="relative">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isCuisineOpen}
                  aria-haspopup="listbox"
                  className="w-full justify-between"
                  onClick={() => setIsCuisineOpen(!isCuisineOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsCuisineOpen(!isCuisineOpen);
                    }
                  }}
                >
                  <span className="truncate">
                    {filters.cuisine.length === 0
                      ? 'Todas las cocinas'
                      : `${filters.cuisine.length} ${
                          filters.cuisine.length === 1
                            ? 'cocina seleccionada'
                            : 'cocinas seleccionadas'
                        }`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
                {isCuisineOpen && (
                  <div
                    className="absolute z-50 w-full mt-2 rounded-md border bg-popover p-2 shadow-md max-h-[300px] overflow-y-auto"
                    role="listbox"
                    aria-multiselectable="true"
                  >
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(Cuisine).map((cuisine) => (
                        <Button
                          key={cuisine}
                          variant={
                            filters.cuisine.includes(cuisine)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => {
                            const newCuisines = filters.cuisine.includes(
                              cuisine
                            )
                              ? filters.cuisine.filter((c) => c !== cuisine)
                              : [...filters.cuisine, cuisine];
                            onFilterChange('cuisine', newCuisines);
                          }}
                          onKeyDown={(e) => handleCuisineKeyDown(e, cuisine)}
                          role="option"
                          aria-selected={filters.cuisine.includes(cuisine)}
                          tabIndex={isCuisineOpen ? 0 : -1}
                          className={cn(
                            'transition-colors flex-1 min-w-[120px] focus:ring-2 focus:ring-ring focus:outline-none',
                            filters.cuisine.includes(cuisine) &&
                              'text-primary-foreground'
                          )}
                        >
                          <span className="truncate">
                            {Cuisine[cuisine as keyof typeof Cuisine]}
                          </span>
                          {filters.cuisine.includes(cuisine) && (
                            <Check
                              className="h-4 w-4 ml-2 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Restaurant Type Select */}
            <div
              className="relative"
              role="group"
              aria-labelledby="type-label"
              ref={typeRef}
            >
              <label id="type-label" className="text-sm font-medium block mb-2">
                Tipo de restaurante
              </label>
              <div className="relative">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isTypeOpen}
                  aria-haspopup="listbox"
                  className="w-full justify-between"
                  onClick={() => setIsTypeOpen(!isTypeOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsTypeOpen(!isTypeOpen);
                    }
                  }}
                >
                  <span className="truncate">
                    {filters.type.length === 0
                      ? 'Todos los tipos de restaurante'
                      : `${filters.type.length} ${
                          filters.type.length === 1
                            ? 'tipo seleccionado'
                            : 'tipos seleccionados'
                        }`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
                {isTypeOpen && (
                  <div
                    className="absolute z-50 w-full mt-2 rounded-md border bg-popover p-2 shadow-md max-h-[300px] overflow-y-auto"
                    role="listbox"
                    aria-multiselectable="true"
                  >
                    <div className="flex flex-wrap gap-2">
                      {Object.values(RestaurantType).map((type) => (
                        <Button
                          key={type}
                          variant={
                            filters.type.includes(type) ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => {
                            const newTypes = filters.type.includes(type)
                              ? filters.type.filter((t) => t !== type)
                              : [...filters.type, type];
                            onFilterChange('type', newTypes);
                          }}
                          onKeyDown={(e) => handleTypeKeyDown(e, type)}
                          role="option"
                          aria-selected={filters.type.includes(type)}
                          tabIndex={isTypeOpen ? 0 : -1}
                          className={cn(
                            'transition-colors flex-1 min-w-[120px] focus:ring-2 focus:ring-ring focus:outline-none',
                            filters.type.includes(type) &&
                              'text-primary-foreground'
                          )}
                        >
                          <span className="truncate">
                            {type === RestaurantType.Restaurant
                              ? 'Restaurante'
                              : type === RestaurantType.FoodTruck
                              ? 'Food Truck'
                              : type === RestaurantType.FoodCourt
                              ? 'Plaza de Comidas (Pasatiempo)'
                              : 'Para Llevar'}
                          </span>
                          {filters.type.includes(type) && (
                            <Check
                              className="h-4 w-4 ml-2 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Range Select */}
            <div
              className="relative"
              role="group"
              aria-labelledby="price-label"
              ref={priceRef}
            >
              <label
                id="price-label"
                className="text-sm font-medium block mb-2"
              >
                Rango de precios
              </label>
              <div className="relative">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isPriceOpen}
                  aria-haspopup="listbox"
                  className="w-full justify-between"
                  onClick={() => setIsPriceOpen(!isPriceOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsPriceOpen(!isPriceOpen);
                    }
                  }}
                >
                  <span className="truncate">
                    {filters.priceRange.length === 0
                      ? 'Todos los precios'
                      : `${filters.priceRange.length} ${
                          filters.priceRange.length === 1
                            ? 'precio seleccionado'
                            : 'precios seleccionados'
                        }`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
                {isPriceOpen && (
                  <div
                    className="absolute z-50 w-full mt-2 rounded-md border bg-popover p-2 shadow-md max-h-[300px] overflow-y-auto"
                    role="listbox"
                    aria-multiselectable="true"
                  >
                    <div className="flex flex-wrap gap-2">
                      {['$', '$$', '$$$', '$$$$'].map((price) => (
                        <Button
                          key={price}
                          variant={
                            filters.priceRange.includes(price)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => {
                            const newPrices = filters.priceRange.includes(price)
                              ? filters.priceRange.filter((p) => p !== price)
                              : [...filters.priceRange, price];
                            onFilterChange('priceRange', newPrices);
                          }}
                          onKeyDown={(e) => handlePriceKeyDown(e, price)}
                          role="option"
                          aria-selected={filters.priceRange.includes(price)}
                          tabIndex={isPriceOpen ? 0 : -1}
                          className={cn(
                            'transition-colors flex-1 min-w-[120px] focus:ring-2 focus:ring-ring focus:outline-none',
                            filters.priceRange.includes(price) &&
                              'text-primary-foreground'
                          )}
                        >
                          <span className="truncate">
                            {price === '$'
                              ? '$ (Menos de $100 MXN por persona)'
                              : price === '$$'
                              ? '$$ ($100-200 MXN por persona)'
                              : price === '$$$'
                              ? '$$$ ($200-600 MXN por persona)'
                              : '$$$$ (Más de $600 MXN por persona)'}
                          </span>
                          {filters.priceRange.includes(price) && (
                            <Check
                              className="h-4 w-4 ml-2 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features Section */}
            <div
              className="relative"
              role="group"
              aria-labelledby="features-label"
              ref={featuresRef}
            >
              <label
                id="features-label"
                className="text-sm font-medium block mb-2"
              >
                Características
              </label>
              <div className="relative">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isFeaturesOpen}
                  aria-haspopup="listbox"
                  className="w-full justify-between"
                  onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsFeaturesOpen(!isFeaturesOpen);
                    }
                  }}
                >
                  <span className="truncate">
                    {filters.features.length === 0
                      ? 'Todas las características'
                      : `${filters.features.length} ${
                          filters.features.length === 1
                            ? 'característica seleccionada'
                            : 'características seleccionadas'
                        }`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
                {isFeaturesOpen && (
                  <div
                    className="absolute z-50 w-full mt-2 rounded-md border bg-popover p-2 shadow-md max-h-[300px] overflow-y-auto"
                    role="listbox"
                    aria-multiselectable="true"
                  >
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={filters.showOnlyOpen ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          onFilterChange('showOnlyOpen', !filters.showOnlyOpen);
                        }}
                        role="option"
                        aria-selected={filters.showOnlyOpen}
                        tabIndex={isFeaturesOpen ? 0 : -1}
                        className={cn(
                          'transition-colors flex-1 min-w-[120px] focus:ring-2 focus:ring-ring focus:outline-none',
                          filters.showOnlyOpen && 'text-primary-foreground'
                        )}
                      >
                        <span className="truncate">Abierto Ahora</span>
                        {filters.showOnlyOpen && (
                          <Check
                            className="h-4 w-4 ml-2 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </Button>
                      {features.map((feature) => (
                        <Button
                          key={feature}
                          variant={
                            filters.features.includes(feature)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => {
                            const newFeatures = filters.features.includes(
                              feature
                            )
                              ? filters.features.filter((f) => f !== feature)
                              : [...filters.features, feature];
                            onFilterChange('features', newFeatures);
                          }}
                          onKeyDown={(e) => handleFeaturesKeyDown(e, feature)}
                          role="option"
                          aria-selected={filters.features.includes(feature)}
                          tabIndex={isFeaturesOpen ? 0 : -1}
                          className={cn(
                            'transition-colors flex-1 min-w-[120px] focus:ring-2 focus:ring-ring focus:outline-none',
                            filters.features.includes(feature) &&
                              'text-primary-foreground'
                          )}
                        >
                          <span className="truncate">
                            {featureLabels[feature]}
                          </span>
                          {filters.features.includes(feature) && (
                            <Check
                              className="h-4 w-4 ml-2 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods Section */}
            <div
              className="relative"
              role="group"
              aria-labelledby="payment-label"
              ref={paymentRef}
            >
              <label
                id="payment-label"
                className="text-sm font-medium block mb-2"
              >
                Métodos de pago
              </label>
              <div className="relative">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isPaymentOpen}
                  aria-haspopup="listbox"
                  className="w-full justify-between"
                  onClick={() => setIsPaymentOpen(!isPaymentOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsPaymentOpen(!isPaymentOpen);
                    }
                  }}
                >
                  <span className="truncate">
                    {filters.paymentMethods.length === 0
                      ? 'Todos los métodos de pago'
                      : `${filters.paymentMethods.length} ${
                          filters.paymentMethods.length === 1
                            ? 'método seleccionado'
                            : 'métodos seleccionados'
                        }`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
                {isPaymentOpen && (
                  <div
                    className="absolute z-50 w-full mt-2 rounded-md border bg-popover p-2 shadow-md max-h-[300px] overflow-y-auto"
                    role="listbox"
                    aria-multiselectable="true"
                  >
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
                            const newMethods = filters.paymentMethods.includes(
                              method
                            )
                              ? filters.paymentMethods.filter(
                                  (m) => m !== method
                                )
                              : [...filters.paymentMethods, method];
                            onFilterChange('paymentMethods', newMethods);
                          }}
                          onKeyDown={(e) => handlePaymentKeyDown(e, method)}
                          role="option"
                          aria-selected={filters.paymentMethods.includes(
                            method
                          )}
                          tabIndex={isPaymentOpen ? 0 : -1}
                          className={cn(
                            'transition-colors flex-1 min-w-[120px] focus:ring-2 focus:ring-ring focus:outline-none',
                            filters.paymentMethods.includes(method) &&
                              'text-primary-foreground'
                          )}
                        >
                          <span className="truncate">{method}</span>
                          {filters.paymentMethods.includes(method) && (
                            <Check
                              className="h-4 w-4 ml-2 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sort Select */}
            <div className="relative lg:col-span-3">
              <label id="sort-label" className="text-sm font-medium block mb-2">
                Ordenar por
              </label>
              <Select
                value={filters.sort}
                onValueChange={(value) =>
                  onFilterChange(
                    'sort',
                    value as 'name' | 'rating' | 'distance'
                  )
                }
              >
                <SelectTrigger aria-labelledby="sort-label">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distancia</SelectItem>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="rating">Calificación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
