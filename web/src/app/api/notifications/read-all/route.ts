import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

export async function PUT() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const userRecord = await auth.getUser(decodedClaims.uid);
    const userRole = userRecord.customClaims?.role || 'USER';

    // Get all unread notifications for the user
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('OR', 'array-contains-any', [
        { userId: decodedClaims.uid },
        { targetRoles: userRole }
      ]),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);

    // Use batch write to update all notifications
    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATIONS_READ_ALL]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
