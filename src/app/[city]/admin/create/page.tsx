'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  PaymentMethod,
  Cuisine,
  Restaurant,
  Day,
  RestaurantType
} from '@/types/restaurant';
import { useCity } from '@/hooks/useCity';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useAdmin } from '@/hooks/useAdmin';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClient } from '@/hooks/useClient';
import { Badge } from '@/components/ui/badge';

type RestaurantForm = Omit<
  Restaurant,
  'id' | 'isOpen' | 'isOpeningSoon' | 'hours' | 'rating' | 'voteCount'
> & {
  hours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  information?: string;
  videoUrl?: string;
  type: RestaurantType;
  isIncomplete?: boolean;
  logoUrl: string;
  coverImageUrl: string;
};

export default function CreateRestaurant() {
  const { createRestaurant, updateRestaurant, restaurants } = useRestaurant();
  const router = useRouter();
  const params = useParams();
  const { city } = useCity();
  const { isAdmin } = useAdmin();
  const { isClient, assignedRestaurantId } = useClient();
  const [isLoading, setIsLoading] = useState(true);
  const isEditMode = Boolean(params.id);
  const [formData, setFormData] = useState<RestaurantForm>({
    name: '',
    logoUrl: '',
    coverImageUrl: '',
    cuisine: [],
    menu: [],
    socialMedia: {},
    delivery: {},
    priceRange: '$',
    features: {
      reservations: false,
      outdoorSeating: false,
      wifi: false,
      hasAC: false,
      hasParking: false,
      kidsFriendly: false,
      freeDelivery: false
    },
    paymentMethods: [],
    location: {
      address: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      },
      mapUrl: ''
    },
    hours: Object.values(Day).reduce(
      (acc, day) => ({
        ...acc,
        [day]: { open: '', close: '' }
      }),
      {}
    ),
    type: RestaurantType.Restaurant,
    isIncomplete: true
  });

  const [newMenuImage, setNewMenuImage] = useState({ imageUrl: '', order: 1 });
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);

  console.log(formData);

  useEffect(() => {
    if (isAdmin === false && isClient === false) {
      router.push(`/${city}`);
      return;
    }

    if (isEditMode && isClient) {
      if (
        params.id &&
        assignedRestaurantId &&
        params.id !== assignedRestaurantId
      ) {
        router.push(`/${city}`);
        return;
      }
    } else if (isClient) {
      // is creating
      if (assignedRestaurantId) {
        router.push(`/${city}`);
        return;
      }
    }

    const fetchRestaurant = async () => {
      try {
        if (!params.id || !city) {
          setIsLoading(false);
          return;
        }
        const response = await fetch(`/api/restaurants/${city}/${params.id}`);
        if (response.ok) {
          const restaurant = await response.json();

          const hoursObject = restaurant.hours.reduce(
            (acc: RestaurantForm['hours'], curr: Restaurant['hours'][0]) => {
              acc[curr.day] = {
                open: curr.open,
                close: curr.close
              };
              return acc;
            },
            {}
          );

          setFormData({
            ...restaurant,
            hours: hoursObject
          });
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      }
      setIsLoading(false);
    };

    fetchRestaurant();
  }, [
    params.id,
    city,
    isAdmin,
    router,
    assignedRestaurantId,
    isClient,
    isEditMode
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const transformedFormData: Omit<
        Restaurant,
        'id' | 'isOpen' | 'isOpeningSoon' | 'rating' | 'voteCount'
      > = {
        ...formData,
        hours: Object.entries(formData.hours).map(([day, hours]) => ({
          day,
          open: hours.open,
          close: hours.close
        }))
      };

      let ok: boolean | undefined = undefined;
      let id = params.id;

      if (params.id) {
        ok = await updateRestaurant(params.id as string, transformedFormData);
      } else {
        const res = await createRestaurant(transformedFormData);
        ok = res?.ok;
        id = res?.id;
      }

      if (ok) {
        router.push(`/${city}/restaurant/${id}`);
      }
    } catch (error) {
      console.error('Error saving restaurant:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature as keyof typeof prev.features]
      }
    }));
  };

  const handleMenuImageAdd = useCallback(() => {
    if (newMenuImage.imageUrl) {
      setFormData((prev) => {
        const newMenu = [...prev.menu, newMenuImage].sort(
          (a, b) => a.order - b.order
        );
        setNewMenuImage({ imageUrl: '', order: newMenu.length + 1 });
        return { ...prev, menu: newMenu };
      });
    }
  }, [newMenuImage]);

  useEffect(() => {
    if (newMenuImage.imageUrl) {
      handleMenuImageAdd();
    }
  }, [newMenuImage, handleMenuImageAdd]);

  const handleRestaurantSelect = useCallback(
    (restaurantId: string) => {
      const selectedRestaurant = restaurants?.find(
        (r) => r.id === restaurantId
      );
      if (selectedRestaurant) {
        const hoursObject = selectedRestaurant.hours.reduce(
          (acc: RestaurantForm['hours'], curr: Restaurant['hours'][0]) => {
            acc[curr.day] = {
              open: curr.open,
              close: curr.close
            };
            return acc;
          },
          {}
        );

        setFormData({
          ...selectedRestaurant,
          hours: hoursObject,
          isIncomplete: true,
          id: undefined
        } as RestaurantForm);
        setSelectedRestaurantId(restaurantId);
      }
    },
    [restaurants]
  );

  const daysOfWeek = [
    Day.Lunes,
    Day.Martes,
    Day.Miercoles,
    Day.Jueves,
    Day.Viernes,
    Day.Sabado,
    Day.Domingo
  ];

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          latitude:
            name === 'latitude'
              ? parseFloat(value) || 0
              : prev.location?.coordinates?.latitude || 0,
          longitude:
            name === 'longitude'
              ? parseFloat(value) || 0
              : prev.location?.coordinates?.longitude || 0
        }
      }
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }
        }));
      },
      () => {
        alert('Unable to retrieve your location');
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="px-1 sm:px-6 py-4 sm:py-8 mb-20 !block">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="w-full overflow-hidden">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle>
              {isEditMode
                ? 'Actualizar Restaurante'
                : 'Crear Nuevo Restaurante'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 relative">
            {!isEditMode && isAdmin && (
              <div className="mb-6 px-3 sm:px-6">
                <label className="block text-sm font-medium mb-1">
                  Copiar datos de un restaurante existente
                </label>
                <Select
                  value={selectedRestaurantId}
                  onValueChange={handleRestaurantSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar restaurante..." />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants
                      ?.sort((a, b) => a.name.localeCompare(b.name))
                      .map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="basic" className="w-full">
                <div className="sticky top-0 z-10 min-[460px]:w-[460px] bg-card border-b px-3 sm:px-6 pb-2 mx-auto border-none">
                  <TabsList className="flex overflow-x-auto rounded-lg bg-muted p-1 no-scrollbar max-w-full">
                    <TabsTrigger
                      value="basic"
                      data-tab="basic"
                      className="rounded-md px-2 sm:px-3 py-1.5 whitespace-nowrap text-xs sm:text-sm"
                    >
                      Información
                    </TabsTrigger>
                    <TabsTrigger
                      value="menu"
                      data-tab="menu"
                      className="rounded-md px-2 sm:px-3 py-1.5 whitespace-nowrap text-xs sm:text-sm"
                    >
                      Menú
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      data-tab="details"
                      className="rounded-md px-2 sm:px-3 py-1.5 whitespace-nowrap text-xs sm:text-sm"
                    >
                      Detalles
                    </TabsTrigger>
                    <TabsTrigger
                      value="hours"
                      data-tab="hours"
                      className="rounded-md px-2 sm:px-3 py-1.5 whitespace-nowrap text-xs sm:text-sm"
                    >
                      Horarios
                    </TabsTrigger>
                    <TabsTrigger
                      value="location"
                      data-tab="location"
                      className="rounded-md px-2 sm:px-3 py-1.5 whitespace-nowrap text-xs sm:text-sm"
                    >
                      Ubicación
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="px-3 sm:px-6 space-y-6">
                  <TabsContent value="basic" className="mt-4 space-y-6">
                    {/* Basic Info Section */}
                    <div className="grid gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium mb-1"
                        >
                          Nombre del Restaurante{' '}
                          <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          required
                        />
                      </div>

                      {/* Image Upload Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo Upload */}
                        <div>
                          <label
                            htmlFor="logoUrl"
                            className="block text-sm font-medium mb-1"
                          >
                            Logo del Restaurante{' '}
                            <span className="text-destructive">*</span>
                          </label>
                          <div className="flex flex-col gap-2">
                            {formData.logoUrl &&
                              formData.logoUrl.trim() !== '' && (
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                                  <Image
                                    src={formData.logoUrl}
                                    alt="Logo Preview"
                                    className="object-cover"
                                    fill
                                  />
                                </div>
                              )}
                            <input
                              type="file"
                              id="logoUrl"
                              name="logoUrl"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const formData = new FormData();
                                    formData.append('file', file);

                                    const response = await fetch(
                                      '/api/upload',
                                      {
                                        method: 'POST',
                                        body: formData
                                      }
                                    );

                                    if (response.ok) {
                                      const { url } = await response.json();
                                      setFormData((prev) => ({
                                        ...prev,
                                        logoUrl: url
                                      }));
                                    }
                                  } catch (error) {
                                    console.error(
                                      'Error uploading logo:',
                                      error
                                    );
                                  }
                                }
                              }}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              required={!formData.logoUrl}
                            />
                            <p className="text-sm text-muted-foreground">
                              Sube el logo o ícono del restaurante. Recomendado:
                              400x400px
                            </p>
                          </div>
                        </div>

                        {/* Cover Image Upload */}
                        <div>
                          <label
                            htmlFor="coverImageUrl"
                            className="block text-sm font-medium mb-1"
                          >
                            Imagen de Portada{' '}
                            <span className="text-destructive">*</span>
                          </label>
                          <div className="flex flex-col gap-2">
                            {formData.coverImageUrl &&
                              formData.coverImageUrl.trim() !== '' && (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                                  <Image
                                    src={formData.coverImageUrl}
                                    alt="Cover Preview"
                                    className="object-cover"
                                    fill
                                  />
                                </div>
                              )}
                            <input
                              type="file"
                              id="coverImageUrl"
                              name="coverImageUrl"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const formData = new FormData();
                                    formData.append('file', file);

                                    const response = await fetch(
                                      '/api/upload',
                                      {
                                        method: 'POST',
                                        body: formData
                                      }
                                    );

                                    if (response.ok) {
                                      const { url } = await response.json();
                                      setFormData((prev) => ({
                                        ...prev,
                                        coverImageUrl: url
                                      }));
                                    }
                                  } catch (error) {
                                    console.error(
                                      'Error uploading cover image:',
                                      error
                                    );
                                  }
                                }
                              }}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              required={!formData.coverImageUrl}
                            />
                            <p className="text-sm text-muted-foreground">
                              Sube una imagen de portada atractiva. Recomendado:
                              1920x1080px
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tipos de Cocina{' '}
                          <span className="text-destructive">*</span>
                        </label>
                        <Select
                          value={formData.cuisine[0]}
                          onValueChange={(value) => {
                            setFormData((prev) => ({
                              ...prev,
                              cuisine: [value as keyof typeof Cuisine]
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo de cocina" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(Cuisine).map((type) => (
                              <SelectItem key={type} value={type}>
                                {Cuisine[type as keyof typeof Cuisine]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tipo de Establecimiento{' '}
                          <span className="text-destructive">*</span>
                        </label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => {
                            setFormData((prev) => ({
                              ...prev,
                              type: value as RestaurantType
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(RestaurantType).map(
                              ([key, value]) => (
                                <SelectItem key={key} value={value}>
                                  {value === RestaurantType.Restaurant
                                    ? 'Restaurante'
                                    : value === RestaurantType.FoodTruck
                                    ? 'Food Truck'
                                    : value === RestaurantType.FoodCourt
                                    ? 'Plaza de Comidas (Pasatiempo)'
                                    : 'Para Llevar'}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Rango de Precios{' '}
                          <span className="text-destructive">*</span>
                        </label>
                        <Select
                          value={formData.priceRange}
                          onValueChange={(
                            value: '$' | '$$' | '$$$' | '$$$$'
                          ) => {
                            setFormData((prev) => ({
                              ...prev,
                              priceRange: value
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rango de precios" />
                          </SelectTrigger>
                          <SelectContent>
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
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="menu" className="space-y-6 mt-6">
                    {/* Menu Images Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Imágenes del Menú
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Sube las imágenes de tu menú. Puedes reordenarlas
                          arrastrándolas.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Image Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {formData.menu.map((menuImage, index) => (
                            <div
                              key={index}
                              draggable
                              onDragStart={() => setDraggedIndex(index)}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (
                                  draggedIndex !== null &&
                                  draggedIndex !== index
                                ) {
                                  const newMenu = [...formData.menu];
                                  const draggedItem = newMenu[draggedIndex];
                                  newMenu.splice(draggedIndex, 1);
                                  newMenu.splice(index, 0, draggedItem);
                                  // Update order numbers
                                  const updatedMenu = newMenu.map(
                                    (item, idx) => ({
                                      ...item,
                                      order: idx + 1
                                    })
                                  );
                                  setFormData((prev) => ({
                                    ...prev,
                                    menu: updatedMenu
                                  }));
                                }
                                setDraggedIndex(null);
                              }}
                              className="group relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all cursor-move"
                            >
                              {menuImage.imageUrl &&
                                menuImage.imageUrl.trim() !== '' && (
                                  <>
                                    <Image
                                      src={menuImage.imageUrl}
                                      alt={`Menu ${index + 1}`}
                                      className="object-cover transition-transform group-hover:scale-105"
                                      fill
                                      onClick={() =>
                                        setSelectedImage(menuImage.imageUrl)
                                      }
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        className="text-white"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedImage(menuImage.imageUrl);
                                        }}
                                      >
                                        Ver
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFormData((prev) => ({
                                            ...prev,
                                            menu: prev.menu.filter(
                                              (_, i) => i !== index
                                            )
                                          }));
                                        }}
                                      >
                                        Eliminar
                                      </Button>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="absolute top-2 left-2 bg-black/60 text-white"
                                    >
                                      {index + 1}
                                    </Badge>
                                  </>
                                )}
                            </div>
                          ))}

                          {/* Upload Button */}
                          <div className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-all">
                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer group">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg
                                  className="w-8 h-8 mb-3 text-muted-foreground group-hover:text-primary transition-colors"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 4v16m8-8H4"
                                  ></path>
                                </svg>
                                <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                                  Agregar imagen
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const formData = new FormData();
                                      formData.append('file', file);

                                      const response = await fetch(
                                        '/api/upload',
                                        {
                                          method: 'POST',
                                          body: formData
                                        }
                                      );

                                      if (response.ok) {
                                        const { url } = await response.json();
                                        setNewMenuImage((prev) => ({
                                          ...prev,
                                          imageUrl: url
                                        }));
                                      }
                                    } catch (error) {
                                      console.error(
                                        'Error uploading image:',
                                        error
                                      );
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Image Preview Modal */}
                        {selectedImage && (
                          <div
                            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
                            onClick={() => setSelectedImage(null)}
                          >
                            <div
                              className="relative"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="absolute top-4 right-4 text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10"
                                onClick={() => setSelectedImage(null)}
                              >
                                ×
                              </button>
                              <div className="flex gap-4 absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    setImageScale((prev) =>
                                      Math.min(prev + 0.5, 3)
                                    )
                                  }
                                >
                                  +
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    setImageScale((prev) =>
                                      Math.max(prev - 0.5, 1)
                                    )
                                  }
                                >
                                  -
                                </Button>
                              </div>
                              <div className="overflow-auto max-h-[90vh] max-w-[90vw]">
                                <Image
                                  src={selectedImage}
                                  alt="Menu fullscreen"
                                  width={1000}
                                  height={1000}
                                  className="object-contain transition-transform duration-200"
                                  style={{ transform: `scale(${imageScale})` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-6 mt-6">
                    {/* Social Media Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Social Media</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label
                            htmlFor="instagram"
                            className="block text-sm font-medium mb-1"
                          >
                            Instagram
                          </label>
                          <input
                            type="url"
                            id="instagram"
                            placeholder="URL de Instagram"
                            value={formData.socialMedia?.instagram || ''}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                socialMedia: {
                                  ...prev.socialMedia,
                                  instagram: e.target.value
                                }
                              }))
                            }
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="facebook"
                            className="block text-sm font-medium mb-1"
                          >
                            Facebook
                          </label>
                          <input
                            type="url"
                            id="facebook"
                            placeholder="URL de Facebook"
                            value={formData.socialMedia?.facebook || ''}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                socialMedia: {
                                  ...prev.socialMedia,
                                  facebook: e.target.value
                                }
                              }))
                            }
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Información de Contacto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label
                            htmlFor="whatsapp"
                            className="block text-sm font-medium mb-1"
                          >
                            WhatsApp
                          </label>
                          <input
                            type="tel"
                            id="whatsapp"
                            placeholder="WhatsApp"
                            value={formData.delivery?.whatsapp || ''}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                delivery: {
                                  ...prev.delivery,
                                  whatsapp: e.target.value
                                }
                              }))
                            }
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium mb-1"
                          >
                            Teléfono
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            placeholder="Teléfono"
                            value={formData.delivery?.phone || ''}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                delivery: {
                                  ...prev.delivery,
                                  phone: e.target.value
                                }
                              }))
                            }
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Features Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Características
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { key: 'reservations', label: 'Reservaciones' },
                            {
                              key: 'outdoorSeating',
                              label: 'Sillas Exteriores'
                            },
                            { key: 'wifi', label: 'WiFi' },
                            { key: 'hasAC', label: 'Aire Acondicionado' },
                            { key: 'hasParking', label: 'Estacionamiento' },
                            {
                              key: 'kidsFriendly',
                              label: 'Amigable para Niños'
                            },
                            { key: 'freeDelivery', label: 'Envío Gratis' }
                          ].map(({ key, label }) => (
                            <label
                              key={key}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  formData.features[
                                    key as keyof typeof formData.features
                                  ] || false
                                }
                                onChange={() => handleFeatureChange(key)}
                                className="h-4 w-4 rounded border-input"
                              />
                              <span className="text-sm">{label}</span>
                            </label>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Methods Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Métodos de Pago{' '}
                          <span className="text-destructive">*</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {Object.values(PaymentMethod).map((method) => (
                            <Button
                              key={method}
                              type="button"
                              variant={
                                formData.paymentMethods.includes(method)
                                  ? 'outline'
                                  : 'default'
                              }
                              size="sm"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  paymentMethods: prev.paymentMethods.includes(
                                    method
                                  )
                                    ? prev.paymentMethods.filter(
                                        (m) => m !== method
                                      )
                                    : [...prev.paymentMethods, method]
                                }));
                              }}
                            >
                              {method}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="hours" className="space-y-6 mt-6">
                    {/* Operating Hours Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Horarios de Operación
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {daysOfWeek.map((day, index) => (
                            <div
                              key={day}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                            >
                              <span className="w-24 capitalize font-medium">
                                {day}
                              </span>
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="time"
                                  value={
                                    formData.hours[
                                      day as keyof typeof formData.hours
                                    ]?.open || ''
                                  }
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      hours: {
                                        ...prev.hours,
                                        [day]: {
                                          ...prev.hours[
                                            day as keyof typeof formData.hours
                                          ],
                                          open: e.target.value
                                        }
                                      }
                                    }))
                                  }
                                  className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <span className="text-muted-foreground">a</span>
                                <input
                                  type="time"
                                  value={
                                    formData.hours[
                                      day as keyof typeof formData.hours
                                    ]?.close || ''
                                  }
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      hours: {
                                        ...prev.hours,
                                        [day]: {
                                          ...prev.hours[
                                            day as keyof typeof formData.hours
                                          ],
                                          close: e.target.value
                                        }
                                      }
                                    }))
                                  }
                                  className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                              </div>
                              {index === 0 && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    const firstDay = daysOfWeek[0];
                                    const firstDayHours =
                                      formData.hours[firstDay];
                                    if (
                                      firstDayHours?.open &&
                                      firstDayHours?.close
                                    ) {
                                      const updatedHours = daysOfWeek.reduce(
                                        (acc, currentDay) => ({
                                          ...acc,
                                          [currentDay]: {
                                            open: firstDayHours.open,
                                            close: firstDayHours.close
                                          }
                                        }),
                                        {}
                                      );
                                      setFormData((prev) => ({
                                        ...prev,
                                        hours: updatedHours
                                      }));
                                    }
                                  }}
                                >
                                  Copiar a Todos
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">Ubicación</h3>
                        <div className="rounded-lg border p-4 space-y-4">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Por favor, ingresa la dirección o URL de Google
                              Maps del restaurante. Esto nos ayudará a mostrar
                              la ubicación correctamente.
                            </p>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label
                                  htmlFor="address"
                                  className="text-sm font-medium"
                                >
                                  Dirección
                                </label>
                                <input
                                  type="text"
                                  id="address"
                                  name="address"
                                  value={formData.location?.address || ''}
                                  onChange={handleChange}
                                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                  placeholder="Ej: Av. Principal #123, Colonia Centro"
                                />
                              </div>

                              <div className="space-y-2">
                                <label
                                  htmlFor="mapUrl"
                                  className="text-sm font-medium"
                                >
                                  URL de Google Maps
                                </label>
                                <input
                                  type="text"
                                  id="mapUrl"
                                  name="mapUrl"
                                  value={formData.location?.mapUrl || ''}
                                  onChange={handleChange}
                                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                  placeholder="https://maps.google.com/..."
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 border-t pt-4">
                            <div className="flex flex-col items-center">
                              <h4 className="text-sm font-medium mb-2 w-full">
                                Coordenadas
                              </h4>
                              <p className="text-sm text-muted-foreground mb-4 w-full">
                                Las coordenadas nos ayudan a ubicar el
                                restaurante con precisión en el mapa.
                              </p>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={getCurrentLocation}
                                className="flex items-center justify-center gap-2 w-fit animate-pulse"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                  />
                                </svg>
                                Usar ubicación actual
                              </Button>
                            </div>

                            <details className="group">
                              <summary className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:text-muted-foreground">
                                <span>
                                  Ingresar coordenadas manualmente (Avanzado)
                                </span>
                                <svg
                                  className="w-4 h-4 transition-transform group-open:rotate-180"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                  />
                                </svg>
                              </summary>
                              <div className="pt-4 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  Solo usa esta opción si necesitas especificar
                                  las coordenadas exactas manualmente.
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label
                                      htmlFor="latitude"
                                      className="text-sm font-medium"
                                    >
                                      Latitud
                                    </label>
                                    <input
                                      type="number"
                                      id="latitude"
                                      name="latitude"
                                      value={
                                        formData.location?.coordinates?.latitude
                                      }
                                      onChange={handleLocationChange}
                                      step="any"
                                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label
                                      htmlFor="longitude"
                                      className="text-sm font-medium"
                                    >
                                      Longitud
                                    </label>
                                    <input
                                      type="number"
                                      id="longitude"
                                      name="longitude"
                                      value={
                                        formData.location?.coordinates
                                          ?.longitude
                                      }
                                      onChange={handleLocationChange}
                                      step="any"
                                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                  </div>
                                </div>
                              </div>
                            </details>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>

                <div className="flex items-center gap-4 pt-6 mx-6">
                  <Button type="submit" className="ml-auto">
                    {isEditMode
                      ? 'Actualizar Restaurante'
                      : 'Crear Restaurante'}
                  </Button>
                </div>
              </Tabs>
            </form>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
