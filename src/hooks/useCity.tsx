import { useGlobalCity } from '@/providers/CityProvider';

export function useCity() {
  return useGlobalCity();
}
