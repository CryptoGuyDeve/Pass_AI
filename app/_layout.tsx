import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function RootLayout() {
  const { session } = useAuth();
  const [hasAppPassword, setHasAppPassword] = useState<boolean | null>(null);
  const [faceLockEnabled, setFaceLockEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    checkSecuritySettings();
  }, []);

  const checkSecuritySettings = async () => {
    try {
      const storedPassword = await SecureStore.getItemAsync('appPassword');
      setHasAppPassword(!!storedPassword);
      const faceLock = await SecureStore.getItemAsync('faceLockEnabled');
      setFaceLockEnabled(faceLock === 'true');
    } catch (error) {
      console.error('Error checking security settings:', error);
      setHasAppPassword(false);
      setFaceLockEnabled(false);
    }
  };

  if (hasAppPassword === null || faceLockEnabled === null) {
    return null; // Loading state
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="sign-in" />
      ) : faceLockEnabled ? (
        <Stack.Screen name="face-lock" />
      ) : hasAppPassword ? (
        <Stack.Screen name="app-password" />
      ) : (
        <Stack.Screen name="password-manager" />
      )}
      <Stack.Screen name="add-credential" />
      <Stack.Screen name="credential-details" />
      <Stack.Screen name="settings" />
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
