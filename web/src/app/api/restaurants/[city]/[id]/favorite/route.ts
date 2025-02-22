import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ city: string; id: string }> }
) {
  try {
    // Validate user session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const userId = decodedClaims.uid;

    const { city, id: restaurantId } = await params;

    // Add to favorites
    const favoriteRef = doc(db, 'favorites', `${userId}_${restaurantId}`);
    const now = new Date().toISOString();

    await setDoc(favoriteRef, {
      userId,
      restaurantId,
      city,
      createdAt: now,
      updatedAt: now
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Error adding to favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ city: string; id: string }> }
) {
  try {
    // Validate user session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const userId = decodedClaims.uid;

    const { id: restaurantId } = await params;

    // Remove from favorites
    const favoriteRef = doc(db, 'favorites', `${userId}_${restaurantId}`);
    await deleteDoc(favoriteRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Error removing from favorites' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ city: string; id: string }> }
) {
  try {
    // Validate user session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const userId = decodedClaims.uid;

    const { id: restaurantId } = await params;

    // Check if restaurant is favorited
    const favoriteRef = doc(db, 'favorites', `${userId}_${restaurantId}`);
    const favoriteDoc = await getDoc(favoriteRef);

    return NextResponse.json({ isFavorite: favoriteDoc.exists() });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      { error: 'Error checking favorite status' },
      { status: 500 }
    );
  }
}
