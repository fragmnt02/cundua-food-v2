'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    telephone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'telephone') {
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, '');

      // Format the phone number
      let formattedPhone = '';
      if (digits.length <= 3) {
        formattedPhone = digits;
      } else if (digits.length <= 6) {
        formattedPhone = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        formattedPhone = `${digits.slice(0, 3)}-${digits.slice(
          3,
          6
        )}-${digits.slice(6, 10)}`;
      }

      setFormData((prev) => ({
        ...prev,
        telephone: formattedPhone
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.dateOfBirth,
        formData.telephone
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mb-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-center">
            Crear una cuenta
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            ¿Ya tienes una cuenta?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary/90 transition-colors"
            >
              Inicia Sesión
            </Link>
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Pérez"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Fecha de nacimiento</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Teléfono</Label>
              <Input
                id="telephone"
                name="telephone"
                type="tel"
                required
                value={formData.telephone}
                onChange={handleChange}
                placeholder="999-999-9999"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                maxLength={12}
              />
              <p className="text-sm text-muted-foreground">
                Formato: 999-999-9999
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@ejemplo.com"
                aria-describedby="email-description"
              />
              <p
                id="email-description"
                className="text-sm text-muted-foreground"
              >
                Usaremos tu correo para iniciar sesión
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                aria-describedby="password-description"
              />
              <p
                id="password-description"
                className="text-sm text-muted-foreground"
              >
                Mínimo 6 caracteres
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
