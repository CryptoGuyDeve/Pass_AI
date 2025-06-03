import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Link {
  name: string;
  url: string;
}

interface LinkFormProps {
  onLinksChange: (links: Link[]) => void;
}

export default function LinkForm({ onLinksChange }: LinkFormProps) {
  const [links, setLinks] = useState<Link[]>([{ name: '', url: '' }]);

  const addLinkField = () => {
    setLinks([...links, { name: '', url: '' }]);
  };

  const removeLinkField = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    onLinksChange(newLinks);
  };

  const updateLink = (index: number, field: keyof Link, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
    onLinksChange(newLinks);
  };

  return (
    <View style={styles.container}>
      {links.map((link, index) => (
        <View key={index} style={styles.linkContainer}>
          <View style={styles.linkHeader}>
            <Text style={styles.linkTitle}>Link {index + 1}</Text>
            {index > 0 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeLinkField(index)}
              >
                <Ionicons name="close-circle" size={24} color="#ff4444" />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#666"
            value={link.name}
            onChangeText={(value) => updateLink(index, 'name', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="URL"
            placeholderTextColor="#666"
            value={link.url}
            onChangeText={(value) => updateLink(index, 'url', value)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addLinkField}>
        <Ionicons name="add-circle" size={24} color="#007AFF" />
        <Text style={styles.addButtonText}>Add Another Link</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  linkContainer: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#111',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 