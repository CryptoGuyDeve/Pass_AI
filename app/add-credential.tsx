import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AddImageCredential from './components/AddImageCredential';
import LinkForm from './components/LinkForm';
import { useAuth } from './contexts/AuthContext';
import { Credential } from './utils/credentialTypes';
import { storage } from './utils/storage';

type CredentialType = 'password' | 'creditCard' | 'note' | 'wifi' | 'link' | 'image';

interface CredentialForm {
  type: CredentialType;
  title: string;
  username?: string;
  email?: string;
  password?: string;
  url?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  content?: string;
  ssid?: string;
  networkPassword?: string;
  category?: string;
  links: { name: string; url: string }[];
}

export default function AddCredential() {
  const [form, setForm] = useState<CredentialForm>({
    type: 'password',
    title: '',
    links: [],
  });
  const { session } = useAuth();

  useEffect(() => {
    if (!session) {
      router.replace('/sign-in');
    }
  }, [session]);

  const handleSave = async () => {
    if (!form.title) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      const credential: Credential = {
        id: Date.now().toString(),
        type: form.type,
        title: form.title,
        category: form.category as CredentialCategory || 'other',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favorite: false,
        ...(form.type === 'password' && {
          username: form.username,
          email: form.email,
          password: form.password || '',
          website: form.url,
        }),
        ...(form.type === 'creditCard' && {
          cardNumber: form.cardNumber || '',
          cardholderName: form.cardHolder || '',
          expiryDate: form.expiryDate || '',
          cvv: form.cvv || '',
          cardType: 'visa', // You might want to detect this based on card number
        }),
        ...(form.type === 'note' && {
          content: form.content || '',
        }),
        ...(form.type === 'wifi' && {
          networkName: form.ssid || '',
          password: form.networkPassword || '',
          securityType: 'WPA2', // You might want to make this configurable
        }),
        ...(form.type === 'link' && {
          links: form.links,
        }),
      };
      console.log('Saving credential:', credential); // Debug log
      await storage.addCredential(credential);
      router.back();
    } catch (error) {
      console.error('Error saving credential:', error);
      Alert.alert('Error', 'Failed to save credential');
    }
  };

  const renderTypeSelector = () => (
    <View style={styles.typeSelector}>
      <Text style={styles.label}>Type</Text>
      <View style={styles.typeButtons}>
        {(['password', 'creditCard', 'note', 'wifi', 'link', 'image'] as CredentialType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, form.type === type && styles.typeButtonActive]}
            onPress={() => setForm({ ...form, type })}
          >
            <Ionicons
              name={getTypeIcon(type)}
              size={24}
              color={form.type === type ? '#000' : '#fff'}
            />
            <Text style={[styles.typeButtonText, form.type === type && styles.typeButtonTextActive]}>
              {type === 'creditCard' ? 'Credit Card' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getTypeIcon = (type: CredentialType) => {
    switch (type) {
      case 'password':
        return 'key';
      case 'creditCard':
        return 'card';
      case 'note':
        return 'document-text';
      case 'wifi':
        return 'wifi';
      case 'link':
        return 'link';
      case 'image':
        return 'image';
      default:
        return 'lock-closed';
    }
  };

  const renderPasswordFields = () => (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={form.username}
          onChangeText={(text) => setForm({ ...form, username: text })}
          placeholder="Enter username"
          placeholderTextColor="#666"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
          placeholder="Enter password"
          secureTextEntry
          placeholderTextColor="#666"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>URL</Text>
        <TextInput
          style={styles.input}
          value={form.url}
          onChangeText={(text) => setForm({ ...form, url: text })}
          placeholder="Enter website URL"
          keyboardType="url"
          autoCapitalize="none"
          placeholderTextColor="#666"
        />
      </View>
    </>
  );

  const renderCreditCardFields = () => (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={form.cardNumber}
          onChangeText={(text) => setForm({ ...form, cardNumber: text })}
          placeholder="Enter card number"
          keyboardType="numeric"
          maxLength={16}
          placeholderTextColor="#666"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Card Holder</Text>
        <TextInput
          style={styles.input}
          value={form.cardHolder}
          onChangeText={(text) => setForm({ ...form, cardHolder: text })}
          placeholder="Enter card holder name"
          placeholderTextColor="#666"
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Expiry Date</Text>
          <TextInput
            style={styles.input}
            value={form.expiryDate}
            onChangeText={(text) => setForm({ ...form, expiryDate: text })}
            placeholder="MM/YY"
            maxLength={5}
            placeholderTextColor="#666"
          />
        </View>
        <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={styles.input}
            value={form.cvv}
            onChangeText={(text) => setForm({ ...form, cvv: text })}
            placeholder="Enter CVV"
            keyboardType="numeric"
            maxLength={3}
            secureTextEntry
            placeholderTextColor="#666"
          />
        </View>
      </View>
    </>
  );

  const renderNoteFields = () => (
    <View style={styles.field}>
      <Text style={styles.label}>Note</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={form.content}
        onChangeText={(text) => setForm({ ...form, content: text })}
        placeholder="Enter your note"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor="#666"
      />
    </View>
  );

  const renderWifiFields = () => (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Network Name (SSID)</Text>
        <TextInput
          style={styles.input}
          value={form.ssid}
          onChangeText={(text) => setForm({ ...form, ssid: text })}
          placeholder="Enter network name"
          placeholderTextColor="#666"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={form.networkPassword}
          onChangeText={(text) => setForm({ ...form, networkPassword: text })}
          placeholder="Enter network password"
          secureTextEntry
          placeholderTextColor="#666"
        />
      </View>
    </>
  );

  const renderLinkForm = () => {
    if (form.type !== 'link') return null;
    return (
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Links</Text>
        <LinkForm onLinksChange={(links) => setForm({ ...form, links })} />
      </View>
    );
  };

  const renderFields = () => {
    switch (form.type) {
      case 'password':
        return renderPasswordFields();
      case 'creditCard':
        return renderCreditCardFields();
      case 'note':
        return renderNoteFields();
      case 'wifi':
        return renderWifiFields();
      case 'link':
        return renderLinkForm();
      case 'image':
        return <AddImageCredential />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <View style={styles.container}>
          <View style={styles.navBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Add Credential</Text>
          </View>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.field}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
                placeholder="Enter title"
                placeholderTextColor="#666"
              />
            </View>
            {renderTypeSelector()}
            {renderFields()}
            <View style={styles.spacer} />
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
    paddingBottom: 100, // Add extra padding at bottom for footer
  },
  field: {
    marginBottom: 24,
  },
  label: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  picker: {
    backgroundColor: '#111',
    borderRadius: 8,
    color: '#fff',
  },
  pickerItem: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
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
  cancelButton: {
    flex: 1,
    padding: 16,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginLeft: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  typeSelector: {
    marginBottom: 24,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
  },
  typeButtonActive: {
    backgroundColor: '#fff',
  },
  typeButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  spacer: {
    height: 20, // Add some space at the bottom of the scroll content
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
}); 