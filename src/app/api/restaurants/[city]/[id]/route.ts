'use server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ city: string; id: string }> }
) {
  try {
    const body = await request.json();
    const { city, id } = await params;

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
