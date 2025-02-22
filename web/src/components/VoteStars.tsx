import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteStarsProps {
  rating: number;
  voteCount: number;
  userRating: number | null;
  onVote: (rating: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function VoteStars({
  rating,
  voteCount,
  userRating,
  onVote,
  isLoading,
  className
}: VoteStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating ?? userRating ?? rating;

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      onMouseLeave={() => setHoverRating(null)}
    >
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !isLoading && onVote(star)}
            onMouseEnter={() => setHoverRating(star)}
            disabled={isLoading}
            className={cn(
              'p-0.5 transition-colors',
              isLoading
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer hover:text-yellow-400',
              star <= displayRating ? 'text-yellow-400' : 'text-gray-300'
            )}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {userRating
          ? '(Tu voto)'
          : `(${(rating ?? 0).toFixed(1)} - ${voteCount ?? 0} votos)`}
      </span>
    </div>
  );
}
