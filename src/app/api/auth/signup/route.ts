import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { UserRole } from '@/lib/roles';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const ADMIN_EMAILS = [
  'pakoconvans@gmail.com',
  'mimisqui98@gmail.com',
  'tabascomiendo@gmail.com'
];

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
    const adminAuth = initAdmin();

    // Create user with default USER role
    const userRecord = await adminAuth.createUser({
      email,
      password,
      emailVerified: false // Explicitly set email as unverified
    });

    // Set custom claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: ADMIN_EMAILS.includes(email) ? UserRole.ADMIN : UserRole.USER
    });

    // Sign in the user to send verification email

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Wait for 2 seconds before sending verification email
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Send verification email
    await sendEmailVerification(userCredential.user);

    return NextResponse.json({
      message:
        'Usuario creado exitosamente. Por favor revisa tu correo electrónico para la verificación.',
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
