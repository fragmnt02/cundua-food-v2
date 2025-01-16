import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';

interface Location {
  latitude: number;
  longitude: number;
}

export const useNearbyRestaurants = (restaurants: Restaurant[]) => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<
    (Restaurant & { distance: number })[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsLoading(false);
      },
      () => {
        setError('Unable to retrieve your location');
        setIsLoading(false);
      }
    );
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && restaurants.length > 0) {
      const restaurantsWithDistance = restaurants
        .filter((restaurant) => restaurant.location?.coordinates)
        .map((restaurant) => {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            restaurant.location!.coordinates!.latitude,
            restaurant.location!.coordinates!.longitude
          );
          return { ...restaurant, distance };
        })
        .sort((a, b) => a.distance - b.distance);

      setNearbyRestaurants(restaurantsWithDistance);
    }
  }, [userLocation, restaurants]);

  return {
    userLocation,
    nearbyRestaurants,
    isLoading,
    error,
    refreshLocation: getUserLocation
  };
};
