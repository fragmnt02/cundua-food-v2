import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CITIES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

interface CityContextType {
  city: string;
  loading: boolean;
  updateCity: (newCity: string) => void;
}

const CityContext = createContext<CityContextType | null>(null);

export function CityProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const prevUserRef = useRef(user);

  // Get city from URL path
  const getCurrentCity = useCallback(() => {
    const pathParts = pathname.split('/');
    const cityFromPath = pathParts[1]; // First segment after /
    return CITIES.includes(cityFromPath) ? cityFromPath : '';
  }, [pathname]);

  const [city, setCity] = useState<string>(getCurrentCity());

  // Check for user's last selected city only when user logs in
  useEffect(() => {
    const checkUserCity = async () => {
      try {
        const response = await fetch('/api/user/city');
        if (response.ok) {
          const { city: lastSelectedCity } = await response.json();
          if (lastSelectedCity && !getCurrentCity()) {
            router.push(`/${lastSelectedCity}`);
          }
        }
      } catch (error) {
        console.error('Error checking user city:', error);
      }
    };

    // Only run when user transitions from logged out to logged in
    const prevUser = prevUserRef.current;
    if (user && !prevUser) {
      checkUserCity();
    }
    prevUserRef.current = user;
  }, [user, getCurrentCity, router]);

  // Redirect to city selection if no valid city in URL
  useEffect(() => {
    const currentCity = getCurrentCity();

    setCity(currentCity);
    setLoading(false);
  }, [pathname, router, getCurrentCity]);

  const updateCity = useCallback(
    (newCity: string) => {
      if (!CITIES.includes(newCity)) {
        console.error('Invalid city selected');
        return;
      }

      // Convert current path to new city path
      const pathParts = pathname.split('/');
      if (pathParts[1] && CITIES.includes(pathParts[1])) {
        // Replace existing city in path
        pathParts[1] = newCity;
      } else {
        // Add new city to path
        pathParts.splice(1, 0, newCity);
      }

      const newPath = pathParts.join('/') || `/${newCity}`;
      router.push(newPath);
    },
    [pathname, router]
  );

  const value = {
    city,
    loading,
    updateCity
  };

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useGlobalCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useGlobalCity must be used within a CityProvider');
  }
  return context;
}
