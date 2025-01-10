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
};

export default function CreateRestaurant() {
  const { createRestaurant, updateRestaurant, restaurants } = useRestaurant();
  const router = useRouter();
  const params = useParams();
  const { city } = useCity();
  const { isAdmin } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<RestaurantForm>({
    name: '',
    imageUrl: '',
    cuisine: [],
    menu: [],
    socialMedia: {},
    delivery: {},
    priceRange: '$',
    features: {},
    paymentMethods: [PaymentMethod.Efectivo],
    location: {},
    hours: {},
    information: '',
    videoUrl: '',
    type: RestaurantType.Restaurant,
    isIncomplete: true
  });

  const [newMenuImage, setNewMenuImage] = useState({ imageUrl: '', order: 1 });
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');

  useEffect(() => {
    if (isAdmin === false) {
      router.push('/');
      return;
    }

    const fetchRestaurant = async () => {
      if (!params.id || !city) {
        setIsLoading(false);
        return;
      }

      try {
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
  }, [params.id, city, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const transformedFormData: Omit<
        Restaurant,
        'id' | 'isOpen' | 'isOpeningSoon' | 'rating' | 'voteCount'
      > = {
        ...formData,
        location: formData.location
          ? {
              ...formData.location,
              mapUrl: formData.location.mapUrl
                ? formData.location.mapUrl.includes('<iframe')
                  ? formData.location.mapUrl.split('src="')[1].split('"')[0]
                  : formData.location.mapUrl
                : undefined
            }
          : undefined,
        hours: Object.entries(formData.hours).map(([day, hours]) => ({
          day,
          open: hours.open,
          close: hours.close
        }))
      };

      let ok: boolean | undefined = undefined;

      if (params.id) {
        ok = await updateRestaurant(params.id as string, transformedFormData);
      } else {
        ok = await createRestaurant(transformedFormData);
      }

      if (ok) {
        router.push('/');
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
    setFormData((prev) => {
      const newMenu = [...prev.menu, newMenuImage].sort(
        (a, b) => a.order - b.order
      );
      setNewMenuImage({ imageUrl: '', order: newMenu.length + 1 });
      return { ...prev, menu: newMenu };
    });
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
    <ScrollArea className="h-[calc(100vh-4rem)] px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {params.id ? 'Actualizar Restaurante' : 'Crear Nuevo Restaurante'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!params.id && (
              <div className="mb-6">
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

            <form onSubmit={handleSubmit} className="space-y-8">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="basic">Información Básica</TabsTrigger>
                  <TabsTrigger value="menu">Menú</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                  <TabsTrigger value="hours">Horarios</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 mt-6">
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

                    <div>
                      <label
                        htmlFor="imageUrl"
                        className="block text-sm font-medium mb-1"
                      >
                        Imágen Principal{' '}
                        <span className="text-destructive">*</span>
                      </label>
                      <div className="flex flex-col gap-2">
                        {formData.imageUrl && (
                          <div className="relative w-32 h-32">
                            <Image
                              src={formData.imageUrl}
                              alt="Preview"
                              className="object-cover rounded"
                              fill
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          id="imageUrl"
                          name="imageUrl"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const formData = new FormData();
                                formData.append('file', file);

                                const response = await fetch('/api/upload', {
                                  method: 'POST',
                                  body: formData
                                });

                                if (response.ok) {
                                  const { url } = await response.json();
                                  setFormData((prev) => ({
                                    ...prev,
                                    imageUrl: url
                                  }));
                                }
                              } catch (error) {
                                console.error('Error uploading image:', error);
                              }
                            }
                          }}
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          required={!formData.imageUrl}
                        />
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
                                  : value === RestaurantType.DarkKitchen
                                  ? 'Cocina Fantasma'
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
                        onValueChange={(value: '$' | '$$' | '$$$' | '$$$$') => {
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
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">
                      Imágenes del Menú
                    </label>
                    <div className="grid gap-4">
                      {formData.menu.map((img, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          <div className="relative w-20 h-20 shrink-0">
                            <Image
                              src={img.imageUrl}
                              alt={`Menu image ${index + 1}`}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              type="url"
                              value={img.imageUrl}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              placeholder="URL de la Imágen"
                              readOnly
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              value={img.order}
                              className="w-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              readOnly
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  menu: prev.menu.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-4 p-4 border rounded-lg">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const formData = new FormData();
                                formData.append('file', file);

                                const response = await fetch('/api/upload', {
                                  method: 'POST',
                                  body: formData
                                });

                                if (response.ok) {
                                  const { url } = await response.json();
                                  setNewMenuImage((prev) => ({
                                    ...prev,
                                    imageUrl: url
                                  }));
                                }
                              } catch (error) {
                                console.error('Error uploading image:', error);
                              }
                            }
                          }}
                          className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <input
                          type="number"
                          value={newMenuImage.order}
                          className="w-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Orden"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
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
                      <CardTitle className="text-lg">Características</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: 'reservations', label: 'Reservaciones' },
                          { key: 'outdoorSeating', label: 'Sillas Exteriores' },
                          { key: 'wifi', label: 'WiFi' },
                          { key: 'hasAC', label: 'Aire Acondicionado' },
                          { key: 'hasParking', label: 'Estacionamiento' },
                          { key: 'kidsFriendly', label: 'Amigable para Niños' },
                          { key: 'freeDelivery', label: 'Envío Gratis' }
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-2">
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
                                ? 'default'
                                : 'outline'
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

                  {/* Location Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ubicación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label
                          htmlFor="address"
                          className="block text-sm font-medium mb-1"
                        >
                          Dirección
                        </label>
                        <input
                          type="text"
                          id="address"
                          placeholder="Dirección"
                          value={formData.location?.address || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              location: {
                                ...prev.location,
                                address: e.target.value
                              }
                            }))
                          }
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="mapUrl"
                          className="block text-sm font-medium mb-1"
                        >
                          URL del Mapa
                        </label>
                        <input
                          type="text"
                          id="mapUrl"
                          placeholder="URL del Mapa"
                          value={formData.location?.mapUrl || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              location: {
                                ...prev.location,
                                mapUrl: e.target.value
                              }
                            }))
                          }
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
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
              </Tabs>

              <div className="flex items-center gap-4 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isIncomplete"
                    name="isIncomplete"
                    checked={formData.isIncomplete || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isIncomplete: e.target.checked
                      }))
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="isIncomplete" className="text-sm font-medium">
                    Marcar como restaurante incompleto
                  </label>
                </div>
                <Button type="submit" className="ml-auto">
                  {params.id ? 'Actualizar Restaurante' : 'Crear Restaurante'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
