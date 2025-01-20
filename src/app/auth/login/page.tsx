'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login } = useAuth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        await login(email, password);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [email, password, login]
  );

  const handleForgotPassword = useCallback(async () => {
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Error al enviar el correo de recuperación'
        );
      }

      setResetSent(true);
      setError('');
    } catch (err) {
      setError((err as Error).message);
      setResetSent(false);
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    []
  );

  return (
    <main className="flex-1 flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            ¿No tienes una cuenta?{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:text-primary/90 transition-colors"
              aria-label="Ir a la página de registro"
            >
              Regístrate
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetSent ? (
            <Alert
              variant="success"
              className="bg-green-50 border-green-500 text-green-700"
              role="status"
              aria-live="polite"
            >
              <AlertDescription>
                Se ha enviado un enlace de recuperación a tu correo electrónico
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <Alert variant="destructive" role="alert" aria-live="assertive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="correo@ejemplo.com"
                  className="w-full"
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full"
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>
              <Button
                type="button"
                variant="link"
                onClick={handleForgotPassword}
                className="px-0"
                disabled={loading}
                aria-label="Recuperar contraseña"
              >
                ¿Olvidaste tu contraseña?
              </Button>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                aria-label={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              >
                {loading && (
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
