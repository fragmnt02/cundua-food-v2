import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const auth = initAdmin();
    const decodedClaims = await auth.verifyIdToken(sessionCookie.value);

    return NextResponse.json({
      user: {
        email: decodedClaims.email
      }
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json({ user: null });
  }
}
