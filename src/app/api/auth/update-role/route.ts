import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      );
    }

    const auth = initAdmin();

    // Verify the session cookie and get user claims
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);

    // Check if the requester is an admin
    if (!decodedClaims.admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    // Get request body
    const { userId, newRole } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Set custom claims for the target user
    await auth.setCustomUserClaims(userId, { [newRole]: true });

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
