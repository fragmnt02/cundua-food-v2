'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useParams } from 'next/navigation';
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
import { Day, RestaurantType } from '@/types/restaurant';

export default function RestaurantPage() {
  const { getRestaurant } = useRestaurant();
  const params = useParams();
  const restaurant = getRestaurant(params.id as string);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  // Add this mapping near the top of the component, after the useState declarations
  const restaurantTypeMap: { [key in RestaurantType]: string } = {
    [RestaurantType.Restaurant]: 'Restaurante',
    [RestaurantType.FoodTruck]: 'Food Truck',
    [RestaurantType.DarkKitchen]: 'Cocina Fantasma',
    [RestaurantType.FoodCourt]: 'Plaza de Comidas (Pasatiempo)'
  };

  // Add function to get current day in Spanish
  const getCurrentDayInSpanish = () => {
    const days = [
      Day.Domingo,
      Day.Lunes,
      Day.Martes,
      Day.Miercoles,
      Day.Jueves,
      Day.Viernes,
      Day.Sabado
    ];
    return days[new Date().getDay()];
  };

  // Add this helper function
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

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-200">
        <Image
          src={restaurant.imageUrl}
          alt={restaurant.name}
          fill
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
                {restaurant.priceRange} • {restaurant.cuisine.join(', ')} •{' '}
                {restaurantTypeMap[restaurant.type]}
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
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^has/, '')
                          .trim()}
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
            <h2 className="text-2xl font-bold mb-4">Síguenos</h2>
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
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Ubicación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Dirección</h3>
              <p className="mb-4">{restaurant.location?.address}</p>
              <iframe
                width="100%"
                height="450"
                style={{ border: 0, margin: '1rem 0' }}
                src={restaurant.location?.mapUrl}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

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
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Video Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Video</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            {restaurant.videoUrl ? (
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={restaurant.videoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                ></iframe>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay video disponible.</p>
            )}
          </div>
        </section>

        {/* Add Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            onClick={() => {
              setSelectedImage(null);
              setScale(1);
            }}
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                className="absolute top-4 right-4 text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10"
                onClick={() => {
                  setSelectedImage(null);
                  setScale(1);
                }}
              >
                ×
              </button>
              <div className="flex gap-4 absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  className="bg-white px-4 py-2 rounded"
                  onClick={() => setScale((prev) => Math.min(prev + 0.5, 3))}
                >
                  +
                </button>
                <button
                  className="bg-white px-4 py-2 rounded"
                  onClick={() => setScale((prev) => Math.max(prev - 0.5, 1))}
                >
                  -
                </button>
              </div>
              <div className="overflow-auto max-h-[90vh] max-w-[90vw]">
                <Image
                  src={selectedImage}
                  alt="Menu fullscreen"
                  width={1000}
                  height={1000}
                  className="object-contain transition-transform duration-200"
                  style={{ transform: `scale(${scale})` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
