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
import Image from 'next/image';

type RestaurantForm = Omit<
  Restaurant,
  'id' | 'isOpen' | 'isOpeningSoon' | 'hours'
> & {
  hours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  information?: string;
  rating: number;
  videoUrl?: string;
  type: string;
};

export default function CreateRestaurant() {
  const { createRestaurant, updateRestaurant } = useRestaurant();
  const router = useRouter();
  const params = useParams();
  const { city } = useCity();
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
    paymentMethods: [],
    location: {},
    hours: {},
    information: '',
    rating: 0,
    videoUrl: '',
    type: RestaurantType.Restaurant
  });

  const [newMenuImage, setNewMenuImage] = useState({ imageUrl: '', order: 1 });

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!params.id) {
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
  }, [params.id, city]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const transformedFormData: Omit<
        Restaurant,
        'id' | 'isOpen' | 'isOpeningSoon'
      > = {
        ...formData,
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
    return <div className="text-center p-6">Cargando...</div>;
  }

  console.log(formData);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {params.id ? 'Actualizar Restaurante' : 'Crear Nuevo Restaurante'}
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Los campos marcados con * son obligatorios
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre del Restaurante <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Main Image */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
            Imágen Principal <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {formData.imageUrl && (
              <Image
                src={formData.imageUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded"
              />
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
              className="w-full p-2 border rounded"
              required={!formData.imageUrl}
            />
          </div>
        </div>

        {/* Cuisine Types */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tipos de Cocina <span className="text-red-500">*</span>
          </label>
          <select
            multiple
            value={formData.cuisine}
            onChange={(e) => {
              const values = Array.from(
                e.target.selectedOptions,
                (option) => option.value as keyof typeof Cuisine
              );
              setFormData((prev) => ({ ...prev, cuisine: values }));
            }}
            className="w-full p-2 border rounded"
            required
          >
            {Object.keys(Cuisine).map((type) => (
              <option key={type} value={type}>
                {Cuisine[type as keyof typeof Cuisine]}
              </option>
            ))}
          </select>
        </div>

        {/* Menu Images */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Imágenes del Menú
          </label>
          <div className="space-y-2">
            {formData.menu.map((img, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={img.imageUrl}
                  className="w-full p-2 border rounded"
                  placeholder="URL de la Imágen"
                  readOnly
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={img.order}
                    className="w-20 p-2 border rounded"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        menu: prev.menu.filter((_, i) => i !== index)
                      }));
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded whitespace-nowrap"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row gap-2">
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
                className="w-full p-2 border rounded"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newMenuImage.order}
                  onChange={(e) =>
                    setNewMenuImage((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value)
                    }))
                  }
                  className="w-20 p-2 border rounded"
                  placeholder="Orden"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-2">
          <h3 className="font-medium">Social Media</h3>
          <input
            type="url"
            placeholder="URL de Instagram"
            value={formData.socialMedia?.instagram || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                socialMedia: { ...prev.socialMedia, instagram: e.target.value }
              }))
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="url"
            placeholder="URL de Facebook"
            value={formData.socialMedia?.facebook || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                socialMedia: { ...prev.socialMedia, facebook: e.target.value }
              }))
            }
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <h3 className="font-medium">Información de Contacto</h3>
          <input
            type="tel"
            placeholder="WhatsApp"
            value={formData.delivery?.whatsapp || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                delivery: { ...prev.delivery, whatsapp: e.target.value }
              }))
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={formData.delivery?.phone || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                delivery: { ...prev.delivery, phone: e.target.value }
              }))
            }
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Restaurant Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo de Establecimiento <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={handleChange}
            name="type"
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Seleccionar tipo</option>
            {Object.entries(RestaurantType).map(([key, value]) => (
              <option key={key} value={value}>
                {value === RestaurantType.Restaurant
                  ? 'Restaurante'
                  : value === RestaurantType.FoodTruck
                  ? 'Food Truck'
                  : value === RestaurantType.DarkKitchen
                  ? 'Cocina Fantasma'
                  : value === RestaurantType.FoodCourt
                  ? 'Plaza de Comidas (Pasatiempo)'
                  : 'Para Llevar'}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Rango de Precioss <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.priceRange}
            onChange={handleChange}
            name="priceRange"
            className="w-full p-2 border rounded"
            required
          >
            <option value="$">$ (Menos de $100 MXN por persona)</option>
            <option value="$$">$$ ($150-300 MXN por persona)</option>
            <option value="$$$">$$$ ($300-600 MXN por persona)</option>
            <option value="$$$$">$$$$ (Más de $600 MXN por persona)</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Calificación (0-5) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.1"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Features */}
        <div>
          <h3 className="font-medium mb-2">Features</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'reservations', label: 'Reservaciones' },
              { key: 'outdoorSeating', label: 'Sillas Exteriores' },
              { key: 'wifi', label: 'WiFi' },
              { key: 'hasAC', label: 'Aire Acondicionado' },
              { key: 'hasParking', label: 'Estacionamiento' },
              { key: 'kidsFriendly', label: 'Amigable para Niños' },
              { key: 'freeDelivery', label: 'Envío Gratis' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={
                    formData.features[key as keyof typeof formData.features] ||
                    false
                  }
                  onChange={() => handleFeatureChange(key)}
                  className="rounded"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Métodos de Pago <span className="text-red-500">*</span>
          </label>
          <select
            multiple
            value={formData.paymentMethods}
            onChange={(e) => {
              const values = Array.from(
                e.target.selectedOptions,
                (option) => option.value as keyof typeof PaymentMethod
              );
              setFormData((prev) => ({ ...prev, paymentMethods: values }));
            }}
            className="w-full p-2 border rounded"
            required
          >
            {Object.keys(PaymentMethod).map((method) => (
              <option key={method} value={method}>
                {PaymentMethod[method as keyof typeof PaymentMethod]}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <h3 className="font-medium">Ubicación</h3>
          <input
            type="text"
            placeholder="Dirección"
            value={formData.location?.address || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                location: { ...prev.location, address: e.target.value }
              }))
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="url"
            placeholder="URL del Mapa"
            value={formData.location?.mapUrl || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                location: { ...prev.location, mapUrl: e.target.value }
              }))
            }
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Additional Information */}
        <div className="space-y-2">
          <h3 className="font-medium">Información Adicional</h3>
          <textarea
            placeholder="Escribe información adicional sobre el restaurante..."
            value={formData.information || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                information: e.target.value
              }))
            }
            className="w-full p-2 border rounded min-h-[100px]"
          />
        </div>

        {/* Operating Hours */}
        <div className="space-y-4">
          <h3 className="font-medium">Horarios de Operación</h3>
          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
            >
              <span className="w-24 capitalize font-medium">{day}</span>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={
                    formData.hours[day as keyof typeof formData.hours]?.open ||
                    ''
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hours: {
                        ...prev.hours,
                        [day]: {
                          ...prev.hours[day as keyof typeof formData.hours],
                          open: e.target.value
                        }
                      }
                    }))
                  }
                  className="p-2 border rounded flex-1 min-w-0"
                />
                <span className="text-gray-500">a</span>
                <input
                  type="time"
                  value={
                    formData.hours[day as keyof typeof formData.hours]?.close ||
                    ''
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hours: {
                        ...prev.hours,
                        [day]: {
                          ...prev.hours[day as keyof typeof formData.hours],
                          close: e.target.value
                        }
                      }
                    }))
                  }
                  className="p-2 border rounded flex-1 min-w-0"
                />
              </div>
              {index === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const firstDay = daysOfWeek[0];
                    const firstDayHours = formData.hours[firstDay];
                    if (firstDayHours?.open && firstDayHours?.close) {
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
                  className="w-full sm:w-auto px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  Copiar a Todos
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Video URL */}
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium mb-1">
            URL del Video de Tabascomiendo{' '}
          </label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {params.id ? 'Actualizar Restaurante' : 'Crear Restaurante'}
        </button>
      </form>
    </div>
  );
}
