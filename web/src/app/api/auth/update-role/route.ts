import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { UserRole } from '@/lib/roles';

export async function PUT(request: Request) {
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

    // Verify the session cookie and get user claims
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);

    // Check if the requester is an admin
    if (decodedClaims.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    // Get request body
    const { userId, newRole, restaurantIds } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current user data to check previous role
    const userRecord = await auth.getUser(userId);
    const currentRole =
      (userRecord.customClaims?.role as UserRole) || UserRole.USER;

    // Set custom claims for the target user
    await auth.setCustomUserClaims(userId, {
      ...userRecord.customClaims,
      role: newRole
    });

    // Handle restaurant assignments
    if (newRole === UserRole.CLIENT) {
      // Add restaurant-user relationship
      const userRestaurantRef = doc(db, 'userRestaurants', userId);
      await setDoc(userRestaurantRef, {
        userId,
        restaurantIds: restaurantIds || [],
        role: newRole,
        updatedAt: new Date().toISOString()
      });
    } else if (currentRole === UserRole.CLIENT && newRole !== UserRole.CLIENT) {
      // If user was previously a client and is changing to a different role, remove restaurant assignment
      const userRestaurantRef = doc(db, 'userRestaurants', userId);
      await deleteDoc(userRestaurantRef);
    }

    // If just updating restaurants for existing client
    if (currentRole === UserRole.CLIENT && newRole === UserRole.CLIENT) {
      const userRestaurantRef = doc(db, 'userRestaurants', userId);
      await setDoc(userRestaurantRef, {
        userId,
        restaurantIds: restaurantIds || [],
        role: newRole,
        updatedAt: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { message: 'User role updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
