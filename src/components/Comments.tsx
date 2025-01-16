import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analytics } from '@/utils/analytics';

interface CommentsProps {
  restaurantId: string;
}

export function Comments({ restaurantId }: CommentsProps) {
  const { comments, isLoading, error, addComment } = useComments(restaurantId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
      analytics.trackComment(restaurantId);
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Escribe tu comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar comentario'}
          </Button>
        </form>
      ) : (
        <Card className="p-4">
          <p className="text-center text-muted-foreground">
            Inicia sesión para dejar un comentario
          </p>
        </Card>
      )}

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {comments.length === 0 ? (
            <Card className="p-4">
              <p className="text-center text-muted-foreground">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </p>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{comment.userEmail}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
