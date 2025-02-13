import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';
import { Day, Restaurant } from '@/types/restaurant';

export async function GET() {
  try {
    // Validate user session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const userId = decodedClaims.uid;

    // Get all favorites for the user
    const favoritesRef = collection(db, 'favorites');
    const favoritesQuery = query(favoritesRef, where('userId', '==', userId));
    const favoritesSnapshot = await getDocs(favoritesQuery);

    // Get restaurant details for each favorite
    const favorites = await Promise.all(
      favoritesSnapshot.docs.map(async (favoriteDoc) => {
        const { restaurantId, city } = favoriteDoc.data();
        const restaurantRef = doc(
          db,
          'cities',
          city,
          'restaurants',
          restaurantId
        );
        const restaurantSnap = await getDoc(restaurantRef);

        if (!restaurantSnap.exists()) return null;

        const restaurant = {
          id: restaurantSnap.id,
          ...restaurantSnap.data()
        } as Restaurant;

        // Add isOpen and isOpeningSoon status based on current Mexico City time
        const mexicoCityTime = new Date().toLocaleString('en-US', {
          timeZone: 'America/Mexico_City'
        });
        const currentTime = new Date(mexicoCityTime);
        const currentHour = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const currentDay = currentTime.getDay();

        const daysMap = {
          0: Day.Domingo,
          1: Day.Lunes,
          2: Day.Martes,
          3: Day.Miercoles,
          4: Day.Jueves,
          5: Day.Viernes,
          6: Day.Sabado
        };

        const todaySchedule = restaurant.hours.find(
          (schedule) =>
            schedule.day === daysMap[currentDay as keyof typeof daysMap]
        );

        if (!todaySchedule) {
          return { ...restaurant, isOpen: false, isOpeningSoon: false };
        }

        const currentTimeInMinutes = currentHour * 60 + currentMinutes;

        // Check if the restaurant is currently open in any of its time slots
        const isOpen = todaySchedule.slots.some((slot) => {
          const [openHour, openMinutes] = slot.open.split(':').map(Number);
          const [closeHour, closeMinutes] = slot.close.split(':').map(Number);

          const openTimeInMinutes = openHour * 60 + openMinutes;
          const closeTimeInMinutes = closeHour * 60 + closeMinutes;

          return (
            currentTimeInMinutes >= openTimeInMinutes &&
            currentTimeInMinutes < closeTimeInMinutes
          );
        });

        // Check if the restaurant will open soon in any of its upcoming slots
        const isOpeningSoon =
          !isOpen &&
          todaySchedule.slots.some((slot) => {
            const [openHour, openMinutes] = slot.open.split(':').map(Number);
            const openTimeInMinutes = openHour * 60 + openMinutes;
            const timeUntilOpen = openTimeInMinutes - currentTimeInMinutes;

            return timeUntilOpen > 0 && timeUntilOpen <= 60; // Changed to 60 minutes notice
          });

        return {
          ...restaurant,
          isOpen,
          isOpeningSoon
        };
      })
    );

    // Filter out any null values (restaurants that no longer exist)
    const validFavorites = favorites.filter(
      (restaurant) => restaurant !== null
    );

    return NextResponse.json(validFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Error fetching favorites' },
      { status: 500 }
    );
  }
}
