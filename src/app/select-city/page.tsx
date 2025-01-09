'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CITIES, CITY_USER_FRIENDLY_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui';
import { Loader2, MapPin } from 'lucide-react';

export default function SelectCity() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCitySelect = async (city: string) => {
    try {
      setLoading(city);
      await fetch('/api/city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city })
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Error setting city:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'No se pudo seleccionar la ciudad. Por favor, intenta de nuevo.'
      });
    } finally {
      setLoading(null);
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-2xl p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            ¿Dónde quieres comer hoy?
          </h1>
          <p className="text-muted-foreground text-lg">
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
        >
          {CITIES.map((city) => (
            <motion.div key={city} variants={item}>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-auto py-6 flex items-center justify-center gap-3 relative group hover:border-primary/50 transition-colors"
                onClick={() => handleCitySelect(city)}
                disabled={loading !== null}
                role="radio"
                aria-checked={false}
                aria-label={`Seleccionar ${
                  CITY_USER_FRIENDLY_NAME[
                    city as keyof typeof CITY_USER_FRIENDLY_NAME
                  ]
                }`}
              >
                {loading === city ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-lg">
                      {
                        CITY_USER_FRIENDLY_NAME[
                          city as keyof typeof CITY_USER_FRIENDLY_NAME
                        ]
                      }
                    </span>
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </Card>
    </main>
  );
}
