import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Detalles del restaurante | Tabascomiendo',
  description: 'Descubre los mejores restaurantes en tu ciudad',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://catalogo.tabacomiendo.com',
    siteName: 'Tabascomiendo'
  }
};

export default function RestaurantLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
