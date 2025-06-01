import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './contexts/AuthContext';
import { Credential } from './utils/credentialTypes';
import { storage } from './utils/storage';

export default function PasswordManager() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const { session, signOut } = useAuth();

  useEffect(() => {
    if (!session) {
      router.replace('/sign-in');
      return;
    }
  }, [session]);

  useFocusEffect(
    React.useCallback(() => {
      if (session) {
        loadCredentials();
      }
    }, [session])
  );

  const loadCredentials = async () => {
    try {
      const data = await storage.getCredentials();
      setCredentials(data);
    } catch (error) {
      console.error('Error loading credentials:', error);
      Alert.alert('Error', 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredential = () => {
    router.push('/add-credential');
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

  const renderCredential = ({ item }: { item: Credential }) => {
    const getSubtitle = () => {
      switch (item.type) {
        case 'password':
          return item.username || item.email || 'Password';
        case 'creditCard':
          return item.cardholderName || 'Credit Card';
        case 'note':
          return item.content ? item.content.substring(0, 50) + (item.content.length > 50 ? '...' : '') : 'Note';
        case 'wifi':
          return item.networkName || 'WiFi Network';
        default:
          return '';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.credentialItem}
        onPress={() => router.push(`/credential-details?id=${item.id}`)}
      >
        <View style={styles.credentialIcon}>
          <Ionicons name={getCredentialIcon(item.type)} size={24} color="#fff" />
        </View>
        <View style={styles.credentialInfo}>
          <Text style={styles.credentialTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.credentialSubtitle} numberOfLines={1}>
            {getSubtitle()}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.headerTitle}>PassAI</Text>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(
                'Menu',
                'Select an option',
                [
                  {
                    text: 'Search',
                    onPress: () => router.push('/search'),
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ]
              );
            }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={credentials}
          renderItem={renderCredential}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="lock-closed" size={64} color="#666" />
              <Text style={styles.emptyText}>No credentials yet</Text>
              <Text style={styles.emptySubtext}>Add your first credential to get started</Text>
            </View>
          }
        />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out" size={24} color="#fff" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={handleAddCredential}>
            <Ionicons name="add" size={32} color="#000" />
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
    paddingBottom: 80,
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
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  list: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  credentialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
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
    marginRight: 8,
  },
  credentialTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  credentialSubtitle: {
    color: '#999',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#000',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    marginBottom: Platform.OS === 'ios' ? 0 : 56,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 