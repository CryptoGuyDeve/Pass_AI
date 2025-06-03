import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FaceLock() {
  const [authenticating, setAuthenticating] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authenticate();
  }, []);

  const authenticate = async () => {
    setAuthenticating(true);
    setError('');
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock with Face/Touch ID',
        fallbackLabel: 'Enter Passcode',
        disableDeviceFallback: false,
      });
      if (result.success) {
        router.replace('/password-manager');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (e) {
      setError('Biometric authentication error.');
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="face-id" size={64} color="#fff" />
        </View>
        <Text style={styles.title}>Face Lock</Text>
        <Text style={styles.subtitle}>Authenticate to unlock your vault</Text>
        {authenticating && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 24 }} />}
        {error ? (
          <>
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={authenticate}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 16,
  },
  error: {
    color: '#ff4444',
    marginTop: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 