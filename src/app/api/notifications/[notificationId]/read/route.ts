import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const { notificationId } = await params;

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);

    // Get the notification
    const notificationRef = doc(db, 'notifications', notificationId);
    const notificationDoc = await getDoc(notificationRef);

    if (!notificationDoc.exists()) {
      return new NextResponse('Notification not found', { status: 404 });
    }

    const notification = notificationDoc.data();

    // Check if the user has access to this notification
    if (notification.userId !== decodedClaims.uid) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update the notification
    await updateDoc(notificationRef, {
      isRead: true
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATION_READ]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
