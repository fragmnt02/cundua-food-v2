import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';
import { Comment } from '@/types/restaurant';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ city: string; id: string }> }
) {
  try {
    const { id: restaurantId } = await params;

    // Get comments for the restaurant
    const commentsRef = collection(db, 'comments');
    const commentsQuery = query(
      commentsRef,
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    );
    const commentsSnapshot = await getDocs(commentsQuery);

    const comments = commentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Error fetching comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ city: string; id: string }> }
) {
  try {
    const { id: restaurantId } = await params;

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
    const userEmail = decodedClaims.email;
    const userRecord = await auth.getUser(userId);
    const firstName = userRecord.customClaims?.firstName || '';
    const lastName = userRecord.customClaims?.lastName || '';

    const { content } = await request.json();

    // Validate content
    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Create comment
    const now = new Date().toISOString();
    const commentRef = doc(collection(db, 'comments'));
    const comment: Comment = {
      id: commentRef.id,
      userId,
      userEmail: userEmail || '',
      firstName,
      lastName,
      restaurantId,
      content: content.trim(),
      createdAt: now,
      updatedAt: now
    };

    await setDoc(commentRef, comment);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Error creating comment' },
      { status: 500 }
    );
  }
}
