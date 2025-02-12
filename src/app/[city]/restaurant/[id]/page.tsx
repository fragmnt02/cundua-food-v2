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
  FaMapMarkerAlt,
  FaMotorcycle
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
import { analytics } from '@/utils/analytics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { DeliveryDialog } from '@/components/DeliveryDialog';

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
  const [showHours, setShowHours] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const { userRating, submitVote, isLoading } = useVote(params.id as string);
  const startTimeRef = useRef(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = useState(0);

  // Get initial tab from URL hash or default to 'info'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash || 'info';
    }
    return 'info';
  });

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['info', 'menu', 'comments'].includes(hash)) {
        setActiveTab(hash);
        // Add a small delay to ensure the content is rendered
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            const headerOffset = 120; // Height of sticky header + some padding
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Also handle initial hash on page load
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without triggering scroll
    const newUrl = `${window.location.pathname}#${value}`;
    window.history.pushState(null, '', newUrl);
    analytics.trackTabView(params.id as string, value);
  };

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
    <main className="min-h-screen bg-gray-50 mb-16" ref={scrollRef}>
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
          <div className="flex flex-col gap-2 mt-2 pb-2 ml-32 max-w-[calc(100%-8rem)]">
            <div className="flex flex-wrap items-center gap-2">
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
            <Button
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/20 whitespace-nowrap w-fit flex flex-col sm:flex-row mt-2"
              onClick={() => setShowHours(true)}
            >
              <span className="font-medium">
                {
                  restaurant.hours.find(
                    (h) => h.day === getCurrentDayInSpanish()
                  )?.open
                }{' '}
                -{' '}
                {
                  restaurant.hours.find(
                    (h) => h.day === getCurrentDayInSpanish()
                  )?.close
                }
              </span>
              <span className="ml-1 text-sm opacity-80">Ver horarios</span>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showHours} onOpenChange={setShowHours}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Horario de {restaurant.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 mt-4">
            {restaurant.hours.map((schedule) => {
              const isCurrentDay = schedule.day === getCurrentDayInSpanish();
              return (
                <div
                  key={schedule.day}
                  className={`flex justify-between p-3 rounded-lg ${
                    isCurrentDay
                      ? 'bg-primary/10 border border-primary'
                      : 'bg-muted'
                  }`}
                >
                  <span
                    className={`font-medium ${
                      isCurrentDay ? 'text-primary' : ''
                    }`}
                  >
                    {schedule.day}
                    {isCurrentDay && ' (Hoy)'}
                  </span>
                  <span className={isCurrentDay ? 'text-primary' : ''}>
                    {schedule.open} - {schedule.close}
                  </span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <DeliveryDialog open={showDelivery} handleOpenChange={setShowDelivery} />

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-8 overflow-x-hidden">
        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <div className="sticky top-16 bg-background z-30">
            <TabsList className="w-full flex overflow-x-auto no-scrollbar h-12 border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="info"
                className="flex-1 min-w-[100px] h-full rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary font-medium text-sm"
              >
                Información
              </TabsTrigger>
              <TabsTrigger
                value="menu"
                className="flex-1 min-w-[100px] h-full rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary font-medium text-sm"
              >
                Menú
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="flex-1 min-w-[100px] h-full rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary font-medium text-sm"
              >
                Comentarios
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="info" id="info">
            <Card>
              <CardHeader>
                <CardTitle>Información del restaurante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
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

                  <div>
                    <h3 className="font-semibold text-lg mb-4">
                      Contacto y redes sociales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-base font-medium mb-3">
                          Redes Sociales
                        </h4>
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
                        <h4 className="text-base font-medium mb-3 text-center">
                          A Domicilio
                        </h4>
                        <div className="flex flex-wrap gap-4 justify-center">
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
                                formatPhoneNumber(restaurant.delivery.phone)
                                  .clean
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
                          <Button
                            variant="default"
                            size="lg"
                            className="text-white"
                            onClick={() => setShowDelivery(true)}
                          >
                            <FaMotorcycle className="text-xl" />
                            Motomandados
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {restaurant?.location?.address && (
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                      <div className="p-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                          <FaMapMarkerAlt className="text-primary" />
                          Ubicación
                        </h3>
                        <div className="bg-muted/50 p-4 rounded-lg mb-4 hover:bg-muted/70 transition-colors">
                          <p className="text-muted-foreground leading-relaxed">
                            {restaurant.location?.address}
                          </p>
                        </div>
                        {restaurant.location?.mapUrl && (
                          <Button
                            size="lg"
                            onClick={() => {
                              window.open(
                                restaurant.location?.mapUrl,
                                '_blank'
                              );
                            }}
                            className="w-full flex items-center justify-center gap-2 py-6"
                          >
                            <FaMapMarkerAlt className="text-lg" />
                            Ver en Google Maps
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {restaurant.information && (
                    <div>
                      <h3 className="font-semibold text-lg">
                        Información adicional
                      </h3>
                      <div className="prose max-w-none mt-2">
                        {restaurant.information}
                      </div>
                    </div>
                  )}

                  {restaurant.videoUrl && (
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Video</h3>
                      <div className="aspect-w-16 aspect-h-9 bg-muted rounded-lg overflow-hidden">
                        <Suspense fallback={<div>Loading video...</div>}>
                          <iframe
                            src={restaurant.videoUrl}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                            loading="lazy"
                          />
                        </Suspense>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" id="menu">
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

          <TabsContent value="comments" id="comments">
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
