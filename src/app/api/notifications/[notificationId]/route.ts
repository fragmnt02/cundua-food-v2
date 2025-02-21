import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export async function DELETE(
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

    // Get the notification
    const notificationRef = doc(db, 'notifications', notificationId);
    const notificationDoc = await getDoc(notificationRef);

    if (!notificationDoc.exists()) {
      return new NextResponse('Notification not found', { status: 404 });
    }

    // Delete the notification
    await deleteDoc(notificationRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
