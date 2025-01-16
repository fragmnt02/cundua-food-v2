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

        return {
          id: restaurantSnap.id,
          ...restaurantSnap.data()
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
