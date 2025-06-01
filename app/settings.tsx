import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './contexts/AuthContext';
import { getSettings, updateSettings } from './utils/storage';

interface Settings {
  biometricAuth: boolean;
  autoLock: boolean;
  autoLockTime: number;
  darkMode: boolean;
  notifications: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    biometricAuth: false,
    autoLock: false,
    autoLockTime: 5,
    darkMode: true,
    notifications: true,
  });
  const { session, signOut } = useAuth();

  useEffect(() => {
    if (!session) {
      router.replace('/sign-in');
      return;
    }
    loadSettings();
  }, [session]);

  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    }
  };

  const handleSettingChange = async (key: keyof Settings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      await updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings');
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

  const renderSettingItem = (
    title: string,
    icon: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Ionicons name={icon as any} size={24} color="#fff" style={styles.settingIcon} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#333', true: '#fff' }}
        thumbColor={value ? '#000' : '#fff'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          {renderSettingItem(
            'Biometric Authentication',
            'finger-print',
            settings.biometricAuth,
            (value) => handleSettingChange('biometricAuth', value)
          )}
          {renderSettingItem(
            'Auto-Lock',
            'lock-closed',
            settings.autoLock,
            (value) => handleSettingChange('autoLock', value)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingItem(
            'Dark Mode',
            'moon',
            settings.darkMode,
            (value) => handleSettingChange('darkMode', value)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderSettingItem(
            'Enable Notifications',
            'notifications',
            settings.notifications,
            (value) => handleSettingChange('notifications', value)
          )}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={24} color="#ff4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
    backgroundColor: '#111',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  signOutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 