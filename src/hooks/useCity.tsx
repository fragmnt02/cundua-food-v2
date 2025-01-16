import { useGlobalCity } from '@/providers/CityProvider';
import { analytics } from '@/utils/analytics';

export function useCity() {
  const { city, updateCity } = useGlobalCity();

  const setCity = (newCity: string) => {
    updateCity(newCity);
    // Track city selection
    analytics.trackCitySelection(newCity);
  };

  return { city, setCity };
}
