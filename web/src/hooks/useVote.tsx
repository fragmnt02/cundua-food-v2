import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useCity } from './useCity';

export function useVote(restaurantId: string) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { city } = useCity();

  useEffect(() => {
    const fetchUserRating = async () => {
      if (!user || !city) return;

      try {
        const response = await fetch(
          `/api/restaurants/${city}/${restaurantId}/vote`
        );
        if (!response.ok) throw new Error('Failed to fetch user rating');

        const data = await response.json();
        setUserRating(data.userRating);
      } catch (error) {
        console.error('Error fetching user rating:', error);
      }
    };

    fetchUserRating();
  }, [user, restaurantId, city]);

  const submitVote = async (rating: number) => {
    if (!user) {
      toast({
        title: 'Inicia sesión para votar',
        description:
          'Necesitas iniciar sesión para calificar este restaurante.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/restaurants/${city}/${restaurantId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rating })
        }
      );

      if (!response.ok) throw new Error('Failed to submit vote');

      const data = await response.json();
      setUserRating(rating);

      toast({
        title: '¡Gracias por tu voto!',
        description: 'Tu calificación ha sido registrada exitosamente.'
      });

      return data.averageRating;
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: 'Error al votar',
        description:
          'No se pudo registrar tu calificación. Por favor intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userRating,
    submitVote,
    isLoading
  };
}
