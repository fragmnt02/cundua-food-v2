import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Initialize Firebase Admin
    const auth = initAdmin();

    // Create user
    const userRecord = await auth.createUser({
      email,
      password
    });

    return NextResponse.json({
      message: 'User created successfully',
      uid: userRecord.uid
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
