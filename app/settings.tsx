import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from './contexts/AuthContext';

export default function Settings() {
  const { signOut } = useAuth();
  const [appPassword, setAppPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [hasAppPassword, setHasAppPassword] = useState(false);
  const [faceLockEnabled, setFaceLockEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    checkAppPassword();
    checkFaceLock();
    checkBiometricSupport();
  }, []);

  const checkAppPassword = async () => {
    try {
      const storedPassword = await SecureStore.getItemAsync('appPassword');
      setHasAppPassword(!!storedPassword);
    } catch (error) {
      console.error('Error checking app password:', error);
    }
  };

  const checkFaceLock = async () => {
    try {
      const enabled = await SecureStore.getItemAsync('faceLockEnabled');
      setFaceLockEnabled(enabled === 'true');
    } catch (error) {
      console.error('Error checking face lock:', error);
    }
  };

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setBiometricSupported(compatible);
    } catch (error) {
      setBiometricSupported(false);
    }
  };

  const handleFaceLockToggle = async (value: boolean) => {
    if (value) {
      // Prompt for biometric enrollment
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert('No Face/Touch ID', 'No biometrics are enrolled on this device. Please set up Face ID or biometrics in your device settings.');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Enable Face Lock' });
      if (result.success) {
        await SecureStore.setItemAsync('faceLockEnabled', 'true');
        setFaceLockEnabled(true);
        Alert.alert('Success', 'Face Lock enabled!');
      } else {
        Alert.alert('Failed', 'Face Lock not enabled.');
      }
    } else {
      await SecureStore.setItemAsync('faceLockEnabled', 'false');
      setFaceLockEnabled(false);
      Alert.alert('Face Lock disabled');
    }
  };

  const handleSetAppPassword = async () => {
    if (appPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (appPassword.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters long');
      return;
    }

    try {
      await SecureStore.setItemAsync('appPassword', appPassword);
      setHasAppPassword(true);
      setIsSettingPassword(false);
      setAppPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'App password has been set');
    } catch (error) {
      console.error('Error setting app password:', error);
      Alert.alert('Error', 'Failed to set app password');
    }
  };

  const handleRemoveAppPassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter current password');
      return;
    }

    try {
      const storedPassword = await SecureStore.getItemAsync('appPassword');
      if (currentPassword !== storedPassword) {
        Alert.alert('Error', 'Incorrect password');
        return;
      }

      await SecureStore.deleteItemAsync('appPassword');
      setHasAppPassword(false);
      setCurrentPassword('');
      Alert.alert('Success', 'App password has been removed');
    } catch (error) {
      console.error('Error removing app password:', error);
      Alert.alert('Error', 'Failed to remove app password');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Security</Text>
            <View style={styles.faceLockRow}>
              <Ionicons name="face-id" size={24} color="#fff" style={{ marginRight: 12 }} />
              <Text style={styles.label}>Face Lock</Text>
              <View style={{ flex: 1 }} />
              <Switch
                value={faceLockEnabled}
                onValueChange={handleFaceLockToggle}
                disabled={!biometricSupported}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor={faceLockEnabled ? '#fff' : '#fff'}
              />
            </View>
            {!biometricSupported && (
              <Text style={{ color: '#ff4444', marginTop: 8 }}>
                Face/biometric authentication not supported on this device.
              </Text>
            )}
            {!hasAppPassword ? (
              <View style={styles.passwordContainer}>
                <Text style={styles.label}>Set App Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor="#666"
                  value={appPassword}
                  onChangeText={setAppPassword}
                  secureTextEntry
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#666"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSetAppPassword}
                >
                  <Text style={styles.buttonText}>Set Password</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.passwordContainer}>
                <Text style={styles.label}>Remove App Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor="#666"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  style={[styles.button, styles.removeButton]}
                  onPress={handleRemoveAppPassword}
                >
                  <Text style={styles.buttonText}>Remove Password</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out" size={24} color="#ff4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  passwordContainer: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    marginTop: 'auto',
  },
  signOutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  faceLockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
  },
}); 