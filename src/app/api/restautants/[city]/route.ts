'use server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ city: string }> }
) {
  try {
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
    }));

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Error fetching restaurants' },
      { status: 500 }
    );
  }
}
