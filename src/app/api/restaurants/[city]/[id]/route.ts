'use server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';
import { UserRole } from '@/lib/roles';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ city: string; id: string }> }
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

    const { city, id } = await params;

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const userRecord = await auth.getUser(decodedClaims.uid);
    const role = (userRecord.customClaims?.role as UserRole) || UserRole.USER;

    const assignedRestaurantRef = doc(db, 'userRestaurants', userRecord.uid);
    const assignedRestaurantDoc = await getDoc(assignedRestaurantRef);
    const assignedRestaurantId =
      assignedRestaurantDoc.data()?.restaurantId ?? null;

    const shouldUpdate =
      role === UserRole.ADMIN ||
      (role === UserRole.CLIENT && assignedRestaurantId === id);

    if (!shouldUpdate) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Update the restaurant in Firestore
    const restaurantRef = doc(db, 'cities', city, 'restaurants', id);
    await updateDoc(restaurantRef, {
      ...body,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json(
      { error: 'Error updating restaurant' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ city: string; id: string }> }
) {
  try {
    const { city, id } = await params;
    const restaurantRef = doc(db, 'cities', city, 'restaurants', id);
    const snapshot = await getDoc(restaurantRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    const restaurant = {
      id: snapshot.id,
      ...snapshot.data()
    };

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json(
      { error: 'Error fetching restaurant' },
      { status: 500 }
    );
  }
}
