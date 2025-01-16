import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';

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

    // Get user's city preference
    const userCityRef = doc(db, 'userCities', userId);
    const userCityDoc = await getDoc(userCityRef);

    if (!userCityDoc.exists()) {
      return NextResponse.json({ city: null });
    }

    return NextResponse.json({ city: userCityDoc.data().city });
  } catch (error) {
    console.error('Error getting user city:', error);
    return NextResponse.json(
      { error: 'Error getting user city' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { city } = await request.json();

    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }

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

    // Save user's city preference
    const userCityRef = doc(db, 'userCities', userId);
    const now = new Date().toISOString();

    await setDoc(userCityRef, {
      userId,
      city,
      updatedAt: now
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving user city:', error);
    return NextResponse.json(
      { error: 'Error saving user city' },
      { status: 500 }
    );
  }
}
