import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';

    if (!isLoading) {
      if (!user && !inAuthGroup) {
        // Redirect to the sign-in page if not signed in
        router.replace('/auth/login');
      } else if (user && inAuthGroup) {
        // Redirect away from the sign-in page when signed in
        router.replace('/');
      }
    }
  }, [user, segments, isLoading]);
}

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth/login"
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name="auth/signup"
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
