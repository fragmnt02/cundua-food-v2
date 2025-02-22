import { NextResponse } from 'next/server';
import { signInWithEmailAndPassword, getAuth, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { initAdmin } from '@/lib/firebase-admin';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Cookie options for security
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  // Set cookie expiry to 7 days
  maxAge: 7 * 24 * 60 * 60
};

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

    // Sign in user with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Please verify your email address.'
        },
        { status: 403 }
      );
    }

    // Get the ID token with a long expiration
    const idToken = await user.getIdToken(true);

    // Create session cookie using Firebase Admin
    const adminAuth = initAdmin();
    // Set session expiration to 7 days.
    const expiresIn = 60 * 60 * 24 * 7 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn
    });

    // Create the response with the cookie
    const response = NextResponse.json({
      message: 'Login successful'
    });

    // Set the secure HTTP-only cookie
    response.cookies.set('session', sessionCookie, COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to login' },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  try {
    await signOut(auth);

    const response = NextResponse.json({
      message: 'Logged out successfully'
    });

    response.cookies.delete('session');

    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
