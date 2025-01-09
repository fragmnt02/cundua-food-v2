import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restaurant Details | Cundua Food',
  description: 'Discover amazing restaurants in your city',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://cunduafood.com',
    siteName: 'Cundua Food'
  }
};

export default function RestaurantLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
