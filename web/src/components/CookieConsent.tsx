import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

type CookiePreferences = {
  analytics: boolean;
  necessary: boolean;
};

const COOKIE_PREFERENCES_KEY = 'cookie-preferences';
const AUTO_ACCEPT_DELAY = 10000; // 10 seconds of activity before auto-accepting

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user has already set preferences
    const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!preferences) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = useCallback(
    (isAutoAccept = false) => {
      const preferences: CookiePreferences = {
        analytics: true,
        necessary: true
      };
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
      setShowBanner(false);
      // Enable analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted'
      });

      if (isAutoAccept) {
        toast({
          title: 'Cookies Aceptadas',
          description:
            'Has continuado navegando, por lo que hemos habilitado todas las cookies para mejorar tu experiencia.',
          duration: 5000
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!showBanner) return;

    const handleUserActivity = () => {
      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer
      timerRef.current = setTimeout(() => {
        acceptAll(true);
      }, AUTO_ACCEPT_DELAY);
    };

    // Track user activity
    const events = ['mousemove', 'click', 'scroll', 'keypress'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initial timer
    handleUserActivity();

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [showBanner, acceptAll]);

  const acceptNecessary = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const preferences: CookiePreferences = {
      analytics: false,
      necessary: true
    };
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setShowBanner(false);
    // Disable analytics
    window.gtag?.('consent', 'update', {
      analytics_storage: 'denied'
    });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <p>
            Utilizamos cookies para mejorar tu experiencia y analizar el uso del
            sitio. Las cookies necesarias son esenciales para el funcionamiento
            del sitio. Si continúas navegando, aceptarás automáticamente todas
            las cookies.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={acceptNecessary}
            className="whitespace-nowrap"
          >
            Solo Necesarias
          </Button>
          <Button
            onClick={() => acceptAll(false)}
            className="whitespace-nowrap bg-[#ffb400] hover:bg-[#ffb400]/90"
          >
            Aceptar Todas
          </Button>
        </div>
      </div>
    </div>
  );
}
