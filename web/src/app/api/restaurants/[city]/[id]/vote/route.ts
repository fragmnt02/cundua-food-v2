import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc
} from 'firebase/firestore';
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

    const { rating } = await request.json();
    const { city, id: restaurantId } = await params;

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    // Create or update vote
    const voteRef = doc(db, 'votes', `${userId}_${restaurantId}`);
    const now = new Date().toISOString();

    await setDoc(
      voteRef,
      {
        userId,
        restaurantId,
        rating,
        createdAt: now,
        updatedAt: now
      },
      { merge: true }
    );

    // Calculate new average rating
    const votesRef = collection(db, 'votes');
    const votesQuery = query(
      votesRef,
      where('restaurantId', '==', restaurantId)
    );
    const votesSnapshot = await getDocs(votesQuery);

    let totalRating = 0;
    let voteCount = 0;

    votesSnapshot.forEach((doc) => {
      const vote = doc.data();
      totalRating += vote.rating;
      voteCount++;
    });

    const averageRating = totalRating / voteCount;

    // Update restaurant rating
    const restaurantRef = doc(db, 'cities', city, 'restaurants', restaurantId);
    await updateDoc(restaurantRef, {
      rating: Number(averageRating.toFixed(1)),
      voteCount: voteCount
    });

    return NextResponse.json({
      success: true,
      averageRating: Number(averageRating.toFixed(1)),
      voteCount: voteCount
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Error processing vote' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ city: string; id: string }> }
): Promise<Response> {
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

    const { id: restaurantId } = await context.params;

    // Get user's vote
    const voteRef = doc(db, 'votes', `${userId}_${restaurantId}`);
    const voteDoc = await getDoc(voteRef);

    if (!voteDoc.exists()) {
      return NextResponse.json({ userRating: null });
    }

    return NextResponse.json({ userRating: voteDoc.data().rating });
  } catch (error) {
    console.error('Error getting vote:', error);
    return NextResponse.json({ error: 'Error getting vote' }, { status: 500 });
  }
}
