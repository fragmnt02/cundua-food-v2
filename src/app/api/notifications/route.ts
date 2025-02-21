import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  and
} from 'firebase/firestore';
import { UserRole } from '@/lib/roles';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    const url = new URL(req.url);
    const city = url.searchParams.get('city');

    if (!sessionCookie?.value) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const userRecord = await auth.getUser(decodedClaims.uid);
    const userRole = userRecord.customClaims?.role || UserRole.USER;

    const notificationsRef = collection(db, 'notifications');
    let userQuery;
    let roleQuery;

    if (userRole === UserRole.ADMIN) {
      // Admins see all notifications
      userQuery = query(
        notificationsRef,
        where('userId', '==', userRecord.uid),
        orderBy('createdAt', 'desc')
      );

      roleQuery = query(
        notificationsRef,
        where('targetRoles', 'array-contains', userRole),
        orderBy('createdAt', 'desc')
      );
    } else if (!city) {
      // Si el usuario no tiene ciudad asignada, no ve notificaciones
      return NextResponse.json([]);
    } else {
      // Non-admin users see:
      // 1. Notifications specifically for them
      // 2. Role-based notifications for their city
      userQuery = query(
        notificationsRef,
        where('userId', '==', userRecord.uid),
        orderBy('createdAt', 'desc')
      );

      roleQuery = query(
        notificationsRef,
        and(
          where('targetRoles', 'array-contains', userRole),
          where('city', '==', city),
          where('userId', '==', null) // Solo notificaciones generales del rol
        ),
        orderBy('createdAt', 'desc')
      );
    }

    const [userSnapshot, roleSnapshot] = await Promise.all([
      getDocs(userQuery),
      getDocs(roleQuery)
    ]);

    // Combine and deduplicate notifications
    const notificationsMap = new Map();

    userSnapshot.docs.forEach((doc) => {
      notificationsMap.set(doc.id, {
        id: doc.id,
        ...doc.data()
      });
    });

    roleSnapshot.docs.forEach((doc) => {
      if (!notificationsMap.has(doc.id)) {
        notificationsMap.set(doc.id, {
          id: doc.id,
          ...doc.data()
        });
      }
    });

    // Convert to array and sort by createdAt
    const notifications = Array.from(notificationsMap.values()).sort(
      (a, b) => b.createdAt.seconds - a.createdAt.seconds
    );

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const userRecord = await auth.getUser(decodedClaims.uid);

    if (
      !userRecord.customClaims?.role ||
      userRecord.customClaims.role !== UserRole.ADMIN
    ) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { title, message, type, priority, targetRoles, city } = body;

    if (!title || !message || !targetRoles || !targetRoles.length || !city) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const notificationsRef = collection(db, 'notifications');
    const notification = await addDoc(notificationsRef, {
      title,
      message,
      type: type || 'INFO',
      priority: priority || 'MEDIUM',
      targetRoles,
      userId: decodedClaims.uid,
      isRead: false,
      createdAt: serverTimestamp(),
      city,
      metadata: {}
    });

    return NextResponse.json({ id: notification.id });
  } catch (error) {
    console.error('[NOTIFICATIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
