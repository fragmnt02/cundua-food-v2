import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';
import { UserRole } from '@/lib/roles';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const userRecord = await auth.getUser(decodedClaims.uid);
    const role = (userRecord.customClaims?.role as UserRole) || UserRole.USER;

    let restaurantId = null;
    if (role === UserRole.CLIENT) {
      const restaurantRef = doc(db, 'userRestaurants', userRecord.uid);
      const restaurantDoc = await getDoc(restaurantRef);
      if (restaurantDoc.exists()) {
        restaurantId = restaurantDoc.data().restaurantId;
      }
    }

    return NextResponse.json({
      user: {
        email: decodedClaims.email,
        role,
        firstName: userRecord.customClaims?.firstName,
        lastName: userRecord.customClaims?.lastName,
        dateOfBirth: userRecord.customClaims?.dateOfBirth,
        telephone: userRecord.customClaims?.telephone,
        restaurantId
      }
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json({ user: null });
  }
}
