import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Credential {
  id: string;
  title: string;
  username: string;
  email: string;
  password: string;
}

interface CredentialListProps {
  credentials: Credential[];
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
}

export const CredentialList: React.FC<CredentialListProps> = ({ credentials, onDelete, onCopy }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }: { item: Credential }) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.credentialItem}>
        <TouchableOpacity
          style={styles.credentialHeader}
          onPress={() => toggleExpand(item.id)}
        >
          <View style={styles.credentialInfo}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {item.username && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Username:</Text>
                <View style={styles.detailValue}>
                  <Text style={styles.detailText}>{item.username}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => onCopy(item.username)}
                  >
                    <Ionicons name="copy-outline" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Password:</Text>
              <View style={styles.detailValue}>
                <Text style={styles.detailText}>••••••••</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => onCopy(item.password)}
                >
                  <Ionicons name="copy-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={credentials}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    padding: 16,
  },
  credentialItem: {
    backgroundColor: '#111',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  credentialHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  credentialInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
    color: '#fff',
  },
  copyButton: {
    padding: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 