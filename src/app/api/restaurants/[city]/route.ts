'use server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, setDoc, doc } from 'firebase/firestore';
import { Day, Restaurant } from '@/types/restaurant';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';
import { UserRole } from '@/lib/roles';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ city: string }> }
) {
  try {
    // Validate admin role
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
    const userRecord = await auth.getUser(decodedClaims.uid);
    const role = (userRecord.customClaims?.role as UserRole) || UserRole.USER;

    if (role === UserRole.USER) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { city } = await params;

    // Add the restaurant to Firestore
    const restaurantsRef = collection(db, 'cities', city, 'restaurants');
    const docRef = await addDoc(restaurantsRef, {
      ...body,
      createdAt: new Date().toISOString()
    });

    if (role === UserRole.CLIENT) {
      // Add restaurant-user relationship
      const userRestaurantRef = doc(db, 'userRestaurants', userRecord.uid);
      await setDoc(userRestaurantRef, {
        userId: userRecord.uid,
        restaurantId: docRef.id,
        role: UserRole.CLIENT,
        updatedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json(
      { error: 'Error creating restaurant' },
      { status: 500 }
    );
  }
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ city: string }> }
) {
  try {
    const { city } = await params;
    const restaurantsRef = collection(db, 'cities', city, 'restaurants');
    const snapshot = await getDocs(restaurantsRef);

    const restaurants = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Restaurant[];

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

    const restaurantsWithStatus = restaurants.map((restaurant) => {
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
    });

    return NextResponse.json(restaurantsWithStatus);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Error fetching restaurants' },
      { status: 500 }
    );
  }
}
