'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Suspense, useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaPhone,
  FaBiking
} from 'react-icons/fa';
import { Restaurant, RestaurantType, Day, Cuisine } from '@/types/restaurant';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useAdmin } from '@/hooks/useAdmin';
import { useVote } from '@/hooks/useVote';
import { VoteStars } from '@/components/VoteStars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analytics } from '@/utils/analytics';

// Dynamically import the modal component to reduce initial bundle size
const ImageModal = dynamic(() => import('@/components/ImageModal'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-96" />
});

const Comments = dynamic(
  () => import('@/components/Comments').then((mod) => mod.Comments),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }
);

// Constants moved outside component to prevent recreation
const restaurantTypeMap: { [key in RestaurantType]: string } = {
  [RestaurantType.Restaurant]: 'Restaurante',
  [RestaurantType.FoodTruck]: 'Food Truck',
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

const formatPhoneNumber = (
  phone: string
): { formatted: string; clean: string } => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format for display - assuming Mexican format (10 digits)
  // This will handle different formats gracefully
  const match = cleaned.match(/^(\d{2,3})(\d{3})(\d{4})$/);

  if (match) {
    return {
      formatted: `(${match[1]}) ${match[2]}-${match[3]}`,
      clean: cleaned
    };
  }

  // If the number doesn't match expected format, return original
  return {
    formatted: phone,
    clean: cleaned
  };
};

export default function RestaurantPage() {
  const { getRestaurant } = useRestaurant();
  const params = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const { userRating, submitVote, isLoading } = useVote(params.id as string);
  const startTimeRef = useRef(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const fetchRestaurant = async () => {
      const data = await getRestaurant(params.id as string);
      if (data) {
        setRestaurant(data);
        // Track restaurant view
        analytics.trackRestaurantView(data.id, data.name);
      }
    };
    fetchRestaurant();
  }, [getRestaurant, params.id]);

  useEffect(() => {
    // Update title and description dynamically
    if (restaurant) {
      // Update only the title tag
      document.title = `${restaurant.name} | Cundua Food`;
    }
  }, [restaurant]);

  const handleVote = async (rating: number) => {
    const newAverageRating = await submitVote(rating);
    if (newAverageRating) {
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              rating: newAverageRating
            }
          : null
      );
    }
  };

  // Track time spent when component unmounts
  useEffect(() => {
    const startTime = startTimeRef.current;
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      analytics.trackTimeSpent(params.id as string, timeSpent);
    };
  }, [params.id]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;

      const element = scrollRef.current;
      const scrollTop = window.scrollY;
      const scrollHeight = element.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.min(
        Math.round((scrollTop / scrollHeight) * 100),
        100
      );

      if (scrollPercentage > maxScroll) {
        setMaxScroll(scrollPercentage);
        analytics.trackScrollDepth(params.id as string, scrollPercentage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [params.id, maxScroll]);

  if (!restaurant) {
    return (
      <div className="min-h-screen p-8">
        <Skeleton className="h-96 w-full mb-8" />
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-8 w-1/2 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50" ref={scrollRef}>
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-200">
        {isAdmin && (
          <Button
            onClick={() =>
              router.push(`/${params.city}/admin/update/${params.id}`)
            }
            className="absolute top-4 right-4 z-10"
            variant="default"
          >
            Editar Restaurante
          </Button>
        )}
        {/* Cover image - use coverImageUrl if available, otherwise fallback to legacy imageUrl */}
        <Image
          src={
            restaurant.coverImageUrl?.trim() ||
            restaurant.imageUrl?.trim() ||
            '/restaurant.svg'
          }
          alt={`${restaurant.name} cover`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL="/restaurant.svg"
        />
        {/* Logo overlay - use logoUrl if available, otherwise fallback to legacy imageUrl */}
        <div className="absolute left-8 -bottom-12 w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden z-20">
          <Image
            src={
              restaurant.logoUrl?.trim() ||
              restaurant.imageUrl?.trim() ||
              '/restaurant.svg'
            }
            alt={`${restaurant.name} logo`}
            fill
            className="object-cover"
            placeholder="blur"
            blurDataURL="/restaurant.svg"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
          <h1 className="text-4xl font-bold text-white ml-32" tabIndex={0}>
            {restaurant.name}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2 overflow-x-auto pb-2 ml-32">
            {restaurant.cuisine.map((cuisine) => (
              <Badge
                key={cuisine}
                variant="secondary"
                className="whitespace-nowrap"
              >
                {cuisine}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <Tabs
          defaultValue="info"
          className="w-full"
          onValueChange={(value) =>
            analytics.trackTabView(params.id as string, value)
          }
        >
          <TabsList className="flex w-full overflow-x-auto space-x-2 mb-8 h-auto p-1 sm:grid sm:grid-cols-5">
            <TabsTrigger value="info" className="flex-shrink-0 h-10">
              Información
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex-shrink-0 h-10">
              Horario
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex-shrink-0 h-10">
              Menú
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex-shrink-0 h-10">
              Contacto
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-shrink-0 h-10">
              Comentarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Información del restaurante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Precio y tipo de comida
                    </h3>
                    <p>
                      {restaurant.priceRange} •{' '}
                      {restaurant.cuisine
                        .map(
                          (cuisine) => Cuisine[cuisine as keyof typeof Cuisine]
                        )
                        .join(', ')}
                      • {restaurantTypeMap[restaurant.type]}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">Calificación</h3>
                    {restaurant && (
                      <VoteStars
                        rating={restaurant.rating}
                        voteCount={restaurant.voteCount}
                        userRating={userRating}
                        onVote={handleVote}
                        isLoading={isLoading}
                      />
                    )}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Horario de operación</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurant.hours.map((schedule) => {
                      const isCurrentDay =
                        schedule.day === getCurrentDayInSpanish();
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
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <CardTitle>Menú</CardTitle>
              </CardHeader>
              <CardContent>
                {restaurant.menu?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurant.menu.map((menuItem, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => {
                          setSelectedImage(menuItem.imageUrl);
                          analytics.trackMenuImageView(params.id as string);
                        }}
                      >
                        <div className="relative h-48">
                          <Image
                            src={menuItem.imageUrl}
                            alt={`Menu item ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover rounded-t-lg"
                            loading="lazy"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No hay menú disponible.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contacto y redes sociales</CardTitle>
              </CardHeader>
              <CardContent>
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
                          onClick={() =>
                            analytics.trackSocialMediaClick(
                              params.id as string,
                              'instagram'
                            )
                          }
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
                          onClick={() =>
                            analytics.trackSocialMediaClick(
                              params.id as string,
                              'facebook'
                            )
                          }
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
                          href={`https://wa.me/+521${
                            formatPhoneNumber(restaurant.delivery.whatsapp)
                              .clean
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          onClick={() =>
                            analytics.trackDeliveryClick(
                              params.id as string,
                              'whatsapp'
                            )
                          }
                        >
                          <FaWhatsapp className="text-xl" />
                          WhatsApp
                        </a>
                      )}
                      {restaurant.delivery?.phone && (
                        <a
                          href={`tel:${
                            formatPhoneNumber(restaurant.delivery.phone).clean
                          }`}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                          onClick={() =>
                            analytics.trackDeliveryClick(
                              params.id as string,
                              'phone'
                            )
                          }
                        >
                          <FaPhone className="text-xl" />
                          {
                            formatPhoneNumber(restaurant.delivery.phone)
                              .formatted
                          }
                        </a>
                      )}
                      <a
                        href={`https://wa.me/+5219141139222`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        onClick={() =>
                          analytics.trackDeliveryClick(
                            params.id as string,
                            'rapidito'
                          )
                        }
                      >
                        <FaBiking className="text-xl" />
                        Rapidito
                      </a>
                      <a
                        href={`https://wa.me/+5219141222478`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        onClick={() =>
                          analytics.trackDeliveryClick(
                            params.id as string,
                            'turbomoto'
                          )
                        }
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
                        <h3 className="font-semibold text-lg mb-2">
                          Dirección
                        </h3>
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
                  <h2 className="text-2xl font-bold mb-4">
                    Información adicional
                  </h2>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="prose max-w-none">
                      {restaurant.information && (
                        <div>{restaurant.information}</div>
                      )}
                      {!restaurant.information && (
                        <p className="text-gray-500 italic">
                          No hay información adicional disponible.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

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
                      <p className="text-gray-500 italic">
                        No hay video disponible.
                      </p>
                    )}
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Comentarios</CardTitle>
              </CardHeader>
              <CardContent>
                <Comments restaurantId={params.id as string} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
