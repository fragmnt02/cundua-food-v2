import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Selecciona tu ciudad | Tabascomiendo',
  description:
    'Elige tu ubicación para ver los restaurantes disponibles en tu área'
};

export default function SelectCityLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
