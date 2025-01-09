import { Metadata } from 'next';
import RestaurantList from '@/components/RestaurantList';

export const metadata: Metadata = {
  title: 'Restaurantes en Tabasco | Tabascomiendo',
  description:
    'Descubre los mejores restaurantes en Tabasco. Filtra por tipo de cocina, precio, y características especiales.',
  keywords: 'restaurantes, Tabasco, comida, gastronomía, México',
  openGraph: {
    title: 'Restaurantes en Tabasco | Tabascomiendo',
    description:
      'Descubre los mejores restaurantes en Tabasco. Filtra por tipo de cocina, precio, y características especiales.',
    type: 'website',
    locale: 'es_MX'
  }
};

export default function HomePage() {
  return <RestaurantList />;
}
