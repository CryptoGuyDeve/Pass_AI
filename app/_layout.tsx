import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { storage } from './utils/storage';

function RootLayout() {
  const { session } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        if (session) {
          router.replace('/password-manager');
          return;
        }

        // If not logged in, check if onboarding is complete
        const isOnboardingComplete = await storage.isOnboardingComplete();
        if (!isOnboardingComplete) {
          router.replace('/onboarding');
        } else {
          router.replace('/sign-in');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/sign-in');
      }
    };

    checkAuth();
  }, [session]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000' },
      }}
    >
      <Stack.Screen
        name="onboarding"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="sign-in"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="password-manager"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="add-credential"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="credential-details"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}
