import { useEffect, useState, useCallback } from 'react';
import { Comment } from '@/types/restaurant';
import { useCity } from './useCity';

export function useComments(restaurantId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { city } = useCity();

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `/api/restaurants/${city}/${restaurantId}/comments`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [city, restaurantId]);

  useEffect(() => {
    if (!city) return;
    fetchComments();
  }, [fetchComments, city]);

  const addComment = async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `/api/restaurants/${city}/${restaurantId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add comment');
      }

      const newComment = await response.json();
      setComments((prev) => [newComment, ...prev]);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    comments,
    isLoading,
    error,
    fetchComments,
    addComment
  };
}
