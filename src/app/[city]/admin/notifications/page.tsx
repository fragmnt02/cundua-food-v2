'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/lib/roles';
import { useCity } from '@/hooks/useCity';
import { useAuth } from '@/hooks/useAuth';

export default function AdminNotificationsPage() {
  const { isAdmin } = useAdmin();
  const { city } = useCity();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([
    UserRole.ADMIN
  ]);

  const roles: { value: UserRole; label: string }[] = [
    { value: UserRole.ADMIN, label: 'Administradores' },
    { value: UserRole.CLIENT, label: 'Clientes' },
    { value: UserRole.USER, label: 'Usuarios' }
  ];

  useEffect(() => {
    if (isAdmin === false) {
      router.push(`/${city}`);
      return;
    }
  }, [isAdmin, city, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos.',
        variant: 'destructive'
      });
      return;
    }

    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'No se pudo verificar tu sesión.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type: 'INFO',
          priority: 'MEDIUM',
          targetRoles: selectedRoles,
          userId: user.email,
          city,
          isRead: false,
          createdAt: new Date().toISOString(),
          metadata: {}
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar la notificación');
      }

      toast({
        title: 'Notificación enviada',
        description: 'La notificación se ha enviado correctamente.'
      });

      // Limpiar el formulario
      setTitle('');
      setMessage('');
      setSelectedRoles([UserRole.ADMIN]);
    } catch {
      toast({
        title: 'Error',
        description: 'Hubo un error al enviar la notificación.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAdmin || !user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la notificación"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Mensaje
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe el mensaje de la notificación"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enviar a</label>
              <div className="flex flex-wrap gap-2">
                {roles.map(({ value, label }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={
                      selectedRoles.includes(value) ? 'default' : 'outline'
                    }
                    onClick={() => {
                      setSelectedRoles((prev) =>
                        prev.includes(value)
                          ? prev.filter((r) => r !== value)
                          : [...prev, value]
                      );
                    }}
                    className={
                      selectedRoles.includes(value)
                        ? 'bg-[#ffb400] hover:bg-[#ffb400]/90'
                        : ''
                    }
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#ffb400] hover:bg-[#ffb400]/90"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Notificación'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
