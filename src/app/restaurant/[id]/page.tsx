'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaPhone,
  FaBiking,
  FaStar,
  FaStarHalf
} from 'react-icons/fa';
import { useRestaurant } from '@/hooks/useRestaurant';
import { Cuisine, Day, RestaurantType } from '@/types/restaurant';

// Dynamically import the modal component to reduce initial bundle size
const ImageModal = dynamic(() => import('@/components/ImageModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

// Constants moved outside component to prevent recreation
const restaurantTypeMap: { [key in RestaurantType]: string } = {
  [RestaurantType.Restaurant]: 'Restaurante',
  [RestaurantType.FoodTruck]: 'Food Truck',
  [RestaurantType.DarkKitchen]: 'Cocina Fantasma',
  [RestaurantType.FoodCourt]: 'Plaza de Comidas (Pasatiempo)',
  [RestaurantType.TakeAway]: 'Para Llevar'
};

const featureTranslations: { [key: string]: string } = {
  reservations: 'Reservaciones',
  outdoorSeating: 'Asientos al aire libre',
  wifi: 'WiFi',
  hasAC: 'Aire acondicionado',
  hasParking: 'Estacionamiento',
  kidsFriendly: 'Amigable para niños',
  freeDelivery: 'Envío gratis'
};

const days = [
  Day.Domingo,
  Day.Lunes,
  Day.Martes,
  Day.Miercoles,
  Day.Jueves,
  Day.Viernes,
  Day.Sabado
];

// Helper functions moved outside component
const getCurrentDayInSpanish = () => days[new Date().getDay()];

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
  }

  if (hasHalfStar) {
    stars.push(<FaStarHalf key="half-star" className="text-yellow-400" />);
  }

  const remainingStars = 5 - stars.length;
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />);
  }

  return stars;
};

export default function RestaurantPage() {
  const { getRestaurant } = useRestaurant();
  const params = useParams();
  const restaurant = getRestaurant(params.id as string);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('admin');
    setIsAdmin(adminStatus !== null);
  }, []);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-200">
        {isAdmin && (
          <button
            onClick={() => router.push(`/admin/update/${params.id}`)}
            className="absolute top-4 right-4 z-10 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Editar Restaurante
          </button>
        )}
        <Image
          src={restaurant.imageUrl}
          alt={restaurant.name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL="/restaurant.svg"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
          <h1 className="text-4xl font-bold text-white">{restaurant.name}</h1>
          <p className="text-xl text-white mt-2">
            {restaurant.cuisine.join(', ')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Information Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">
            Información del restaurante
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">Precio y tipo de comida</h3>
              <p>
                {restaurant.priceRange} •{' '}
                {restaurant.cuisine
                  .map((cuisine) => Cuisine[cuisine as keyof typeof Cuisine])
                  .join(', ')}
                • {restaurantTypeMap[restaurant.type]}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg">Calificación</h3>
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(restaurant.rating)}</div>
                <span className="text-gray-600">({restaurant.rating} / 5)</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg">Características</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {Object.entries(restaurant.features).map(
                  ([key, value]) =>
                    value && (
                      <li key={key} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {featureTranslations[key] || key}
                      </li>
                    )
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg">Métodos de pago</h3>
              <ul className="flex flex-wrap gap-2 mt-2">
                {restaurant.paymentMethods.map((method) => (
                  <li
                    key={method}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {method}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Hours Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Horario de operación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurant.hours.map((schedule) => {
              const isCurrentDay = schedule.day === getCurrentDayInSpanish();
              return (
                <div
                  key={schedule.day}
                  className={`flex justify-between p-2 rounded shadow ${
                    isCurrentDay
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-white'
                  }`}
                >
                  <span
                    className={`font-medium ${
                      isCurrentDay ? 'text-blue-700' : ''
                    }`}
                  >
                    {schedule.day}
                    {isCurrentDay && ' (Hoy)'}
                  </span>
                  <span className={isCurrentDay ? 'text-blue-700' : ''}>
                    {schedule.open} - {schedule.close}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Social Media and Delivery Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Redes Sociales</h2>
            <div className="flex gap-4">
              {restaurant.socialMedia?.instagram && (
                <a
                  href={restaurant.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  <FaInstagram className="text-xl" />
                  Instagram
                </a>
              )}
              {restaurant.socialMedia?.facebook && (
                <a
                  href={restaurant.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FaFacebook className="text-xl" />
                  Facebook
                </a>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">A Domicilio</h2>
            <div className="flex flex-wrap gap-4">
              {restaurant.delivery?.whatsapp && (
                <a
                  href={`https://wa.me/${restaurant.delivery.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FaWhatsapp className="text-xl" />
                  WhatsApp
                </a>
              )}
              {restaurant.delivery?.phone && (
                <a
                  href={`tel:${restaurant.delivery.phone}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <FaPhone className="text-xl" />
                  Teléfono
                </a>
              )}
              <a
                href={`https://wa.me/+5219141139222`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <FaBiking className="text-xl" />
                Rapidito
              </a>
              <a
                href={`https://wa.me/+5219141222478`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FaBiking className="text-xl" />
                Turbomoto
              </a>
            </div>
          </div>
        </section>

        {/* Location Section */}
        {restaurant?.location?.address && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ubicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-2">Dirección</h3>
                <p className="mb-4">{restaurant.location?.address}</p>
                <Suspense fallback={<div>Loading map...</div>}>
                  <iframe
                    width="100%"
                    height="450"
                    style={{ border: 0, margin: '1rem 0' }}
                    src={restaurant.location?.mapUrl}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </Suspense>
              </div>
            </div>
          </section>
        )}

        {/* Information Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Información adicional</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="prose max-w-none">
              {restaurant.information && <div>{restaurant.information}</div>}
              {!restaurant.information && (
                <p className="text-gray-500 italic">
                  No hay información adicional disponible.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Menu Section */}
        {restaurant.menu?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Menú</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurant.menu.map((menuItem, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(menuItem.imageUrl)}
                >
                  <div className="relative h-48">
                    <Image
                      src={menuItem.imageUrl}
                      alt={`Menu item ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Video Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Video</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            {restaurant.videoUrl ? (
              <div className="aspect-w-16 aspect-h-9">
                <Suspense fallback={<div>Loading video...</div>}>
                  <iframe
                    src={restaurant.videoUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                    loading="lazy"
                  ></iframe>
                </Suspense>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay video disponible.</p>
            )}
          </div>
        </section>

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            imageUrl={selectedImage}
            onClose={() => {
              setSelectedImage(null);
              setScale(1);
            }}
            scale={scale}
            onScaleChange={setScale}
          />
        )}
      </div>
    </main>
  );
}
