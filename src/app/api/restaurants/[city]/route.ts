'use server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
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

    if (role === UserRole.CLIENT) {
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

      const [openHour, openMinutes] = todaySchedule.open.split(':').map(Number);
      const [closeHour, closeMinutes] = todaySchedule.close
        .split(':')
        .map(Number);

      const currentTimeInMinutes = currentHour * 60 + currentMinutes;
      const openTimeInMinutes = openHour * 60 + openMinutes;
      const closeTimeInMinutes = closeHour * 60 + closeMinutes;

      const isOpen =
        currentTimeInMinutes >= openTimeInMinutes &&
        currentTimeInMinutes < closeTimeInMinutes;
      const isOpeningSoon =
        !isOpen &&
        openTimeInMinutes - currentTimeInMinutes > 0 &&
        openTimeInMinutes - currentTimeInMinutes <= 10;

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
