import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CredentialFormProps {
  onSubmit: (email: string, password: string, title: string, username: string) => void;
}

export function CredentialForm({ onSubmit }: CredentialFormProps) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (email && password && title) {
      onSubmit(email, password, title, username);
      setTitle('');
      setUsername('');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Add New Credential</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Title (e.g., Gmail, Facebook)"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Username (optional)"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save Credentials</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  formContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#1a1a1a',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 13,
  },
  button: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CredentialForm; 