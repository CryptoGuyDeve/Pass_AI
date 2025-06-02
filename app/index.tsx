import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './contexts/AuthContext';
import { Credential } from './utils/credentialTypes';
import { storage } from './utils/storage';

export default function PasswordManager() {
  const { session } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.replace('/sign-in');
      return;
    }
    loadCredentials();
  }, [session]);

  const loadCredentials = async () => {
    try {
      const data = await storage.getAllCredentials();
      setCredentials(data);
    } catch (error) {
      console.error('Error loading credentials:', error);
      Alert.alert('Error', 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const renderCredentialItem = (credential: Credential) => (
    <TouchableOpacity
      key={credential.id}
      style={styles.credentialItem}
      onPress={() => router.push(`/credential-details?id=${credential.id}`)}
    >
      <View style={styles.credentialIcon}>
        <Ionicons name={getCredentialIcon(credential.type)} size={24} color="#fff" />
      </View>
      <View style={styles.credentialInfo}>
        <Text style={styles.credentialTitle}>{credential.title}</Text>
        <Text style={styles.credentialSubtitle}>
          {credential.type === 'password' && credential.username}
          {credential.type === 'creditCard' && credential.cardholderName}
          {credential.type === 'wifi' && credential.networkName}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case 'password':
        return 'key';
      case 'creditCard':
        return 'card';
      case 'note':
        return 'document-text';
      case 'wifi':
        return 'wifi';
      default:
        return 'lock-closed';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Password Manager</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-credential')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.credentialsList}>
          {credentials.map(renderCredentialItem)}
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  credentialsList: {
    flex: 1,
    padding: 16,
  },
  credentialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  credentialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  credentialInfo: {
    flex: 1,
  },
  credentialTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  credentialSubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
