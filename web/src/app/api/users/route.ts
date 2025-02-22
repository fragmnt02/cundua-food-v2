import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';
import { UserRole } from '@/lib/roles';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      );
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const userRecord = await auth.getUser(decodedClaims.uid);
    const role = (userRecord.customClaims?.role as UserRole) || UserRole.USER;

    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    // List all users
    const { users } = await auth.listUsers();

    // Get all user-restaurant relationships
    const userRestaurantsRef = collection(db, 'userRestaurants');
    const userRestaurantsSnapshot = await getDocs(userRestaurantsRef);
    const userRestaurants = new Map();

    userRestaurantsSnapshot.forEach((doc) => {
      const data = doc.data();
      userRestaurants.set(data.userId, data.restaurantId);
    });

    const formattedUsers = users.map((user) => ({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      role: (user.customClaims?.role as UserRole) || UserRole.USER,
      createdAt: user.metadata.creationTime,
      restaurantId: userRestaurants.get(user.uid)
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      { error: 'Failed to list users' },
      { status: 500 }
    );
  }
}
