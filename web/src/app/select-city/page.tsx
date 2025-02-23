'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CITIES, CITY_USER_FRIENDLY_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui';
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SelectCity() {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const router = useRouter();

  const handleCitySelect = async (city: string) => {
    try {
      setLoading(city);
      setSelectedCity(city);
      // Save user's city preference if logged in
      try {
        await fetch('/api/user/city', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ city })
        });
      } catch {}

      // Navigate to the city-specific page
      router.push(`/${city}`);
    } catch (error) {
      console.error('Error navigating to city:', error);
      toast({
        variant: 'destructive',
        title: 'Error al seleccionar la ciudad',
        description:
          'No se pudo seleccionar la ciudad. Por favor, intenta de nuevo.',
        duration: 5000
      });
      setSelectedCity(null);
    } finally {
      setLoading(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, city: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCitySelect(city);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main
      className="h-[calc(100dvh-126px)] w-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4 sm:p-6"
      role="main"
    >
      <Card className="w-full max-w-2xl p-6 shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 mb-6"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            ¿Dónde quieres comer hoy?
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Selecciona tu ciudad para mostrarte los mejores restaurantes cerca
            de ti
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          role="radiogroup"
          aria-label="Selección de ciudad"
          tabIndex={0}
        >
          {CITIES.map((city) => (
            <motion.div key={city} variants={item}>
              <Button
                variant="outline"
                size="lg"
                className={`
                  w-full h-auto py-6 flex items-center justify-center gap-3 
                  relative group transition-all duration-200
                  ${
                    selectedCity === city
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }
                  ${loading === city ? 'animate-pulse' : ''}
                  focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                `}
                onClick={() => handleCitySelect(city)}
                onKeyDown={(e) => handleKeyDown(e, city)}
                disabled={loading !== null}
                role="radio"
                aria-checked={selectedCity === city}
                aria-label={`Seleccionar ${
                  CITY_USER_FRIENDLY_NAME[
                    city as keyof typeof CITY_USER_FRIENDLY_NAME
                  ]
                }`}
                aria-disabled={loading !== null}
                tabIndex={0}
              >
                <MapPin
                  className={`h-5 w-5 transition-colors duration-200
                    ${
                      selectedCity === city
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-primary'
                    }`}
                  aria-hidden="true"
                />
                <span className="text-lg font-medium">
                  {
                    CITY_USER_FRIENDLY_NAME[
                      city as keyof typeof CITY_USER_FRIENDLY_NAME
                    ]
                  }
                </span>
                {loading === city && (
                  <div className="absolute right-4 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </Card>
    </main>
  );
}
