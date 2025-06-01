import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from './contexts/AuthContext';
import { Credential } from './utils/credentialTypes';
import { storage } from './utils/storage';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!session) {
      router.replace('/sign-in');
      return;
    }
    loadCredentials();
  }, [session]);

  const loadCredentials = async () => {
    try {
      const data = await storage.getCredentials();
      setCredentials(data);
      setFilteredCredentials(data);
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  useEffect(() => {
    filterCredentials();
  }, [searchQuery, selectedType]);

  const filterCredentials = () => {
    let filtered = credentials;

    // Filter by type if selected
    if (selectedType) {
      filtered = filtered.filter(cred => cred.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cred => 
        cred.title.toLowerCase().includes(query) ||
        (cred.type === 'password' && (
          (cred.username?.toLowerCase().includes(query)) ||
          (cred.email?.toLowerCase().includes(query))
        )) ||
        (cred.type === 'creditCard' && cred.cardholderName?.toLowerCase().includes(query)) ||
        (cred.type === 'note' && cred.content?.toLowerCase().includes(query)) ||
        (cred.type === 'wifi' && cred.networkName?.toLowerCase().includes(query))
      );
    }

    setFilteredCredentials(filtered);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Search</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search credentials..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            <TouchableOpacity
              style={[styles.filterButton, !selectedType && styles.filterButtonActive]}
              onPress={() => setSelectedType(null)}
            >
              <Text style={[styles.filterButtonText, !selectedType && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {['password', 'creditCard', 'note', 'wifi'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.filterButton, selectedType === type && styles.filterButtonActive]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.filterButtonText, selectedType === type && styles.filterButtonTextActive]}>
                  {type === 'creditCard' ? 'Credit Card' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredCredentials}
          renderItem={renderCredential}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={64} color="#666" />
              <Text style={styles.emptyText}>No credentials found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try different search terms' : 'Start typing to search'}
              </Text>
            </View>
          }
        />
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
  navBar: {
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
  navTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  filterButtonTextActive: {
    fontWeight: '600',
  },
  list: {
    padding: 16,
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
}); 