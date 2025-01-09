import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';
import { UserRole } from '@/lib/roles';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const userRecord = await auth.getUser(decodedClaims.uid);
    const role = (userRecord.customClaims?.role as UserRole) || UserRole.USER;

    return NextResponse.json({
      user: {
        email: decodedClaims.email,
        role
      }
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json({ user: null });
  }
}
