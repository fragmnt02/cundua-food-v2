import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Cundua Food',
  description:
    'Inicia sesión en Cundua Food para acceder a tu cuenta y disfrutar de la mejor comida.',
  openGraph: {
    title: 'Iniciar Sesión | Cundua Food',
    description:
      'Inicia sesión en Cundua Food para acceder a tu cuenta y disfrutar de la mejor comida.'
  }
};

export default function LoginLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
