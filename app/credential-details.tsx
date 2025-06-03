import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import React, { useEffect, useState } from 'react';
import { Alert, Clipboard, Dimensions, Image, Linking, Modal, Platform, SafeAreaView, ScrollView, Share, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './contexts/AuthContext';
import { Credential, CreditCardCredential, ImageCredential, LinkCredential, NoteCredential, PasswordCredential, WiFiCredential } from './utils/credentialTypes';
import { storage } from './utils/storage';

export default function CredentialDetails() {
  const { id } = useLocalSearchParams();
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Visibility toggles for sensitive fields
  const [showPassword, setShowPassword] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  useEffect(() => {
    if (!session) {
      router.replace('/sign-in');
      return;
    }
    loadCredential();
    preventScreenshots();
  }, [session, id]);

  const preventScreenshots = async () => {
    try {
      await ScreenCapture.preventScreenCaptureAsync();
    } catch (error) {
      console.error('Error preventing screenshots:', error);
    }
  };

  const loadCredential = async () => {
    try {
      const data = await storage.getCredential(id as string);
      console.log('Loaded credential in details:', data);
      if (data.type === 'image') {
        console.log('Image URL:', data.imageUrl);
      }
      setCredential(data);
    } catch (error) {
      console.error('Error loading credential:', error);
      Alert.alert('Error', 'Failed to load credential details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await Clipboard.setString(text);
      Alert.alert('Success', `${label} copied to clipboard`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleShare = async () => {
    if (!credential) return;

    try {
      let shareText = `${credential.title}\n\n`;
      
      switch (credential.type) {
        case 'password':
          shareText += `Username: ${credential.username || 'N/A'}\n`;
          shareText += `Email: ${credential.email || 'N/A'}\n`;
          shareText += `Password: ${credential.password}\n`;
          shareText += `Website: ${credential.website || 'N/A'}`;
          break;
        case 'creditCard':
          shareText += `Card Number: ${credential.cardNumber}\n`;
          shareText += `Cardholder: ${credential.cardholderName}\n`;
          shareText += `Expiry: ${credential.expiryDate}\n`;
          shareText += `CVV: ${credential.cvv}`;
          break;
        case 'note':
          shareText += credential.content;
          break;
        case 'wifi':
          shareText += `Network: ${credential.networkName}\n`;
          shareText += `Password: ${credential.password}\n`;
          shareText += `Security: ${credential.securityType}`;
          break;
      }

      await Share.share({
        message: shareText,
        title: credential.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share credential');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Credential',
      'Are you sure you want to delete this credential? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.deleteCredential(id as string);
              router.back();
            } catch (error) {
              console.error('Error deleting credential:', error);
              Alert.alert('Error', 'Failed to delete credential');
            }
          },
        },
      ]
    );
  };

  const handleDownload = async (url: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save images');
        return;
      }

      const filename = url.split('/').pop() || 'image.jpg';
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      // Download the file
      const downloadResult = await FileSystem.downloadAsync(url, fileUri);
      
      if (downloadResult.status === 200) {
        // Save to media library
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync('PassAI', asset, false);
        Alert.alert('Success', 'Image saved to gallery');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      Alert.alert('Error', 'Failed to download image');
    }
  };

  const renderPasswordDetails = (credential: PasswordCredential) => {
    return (
      <>
        {credential.username && (
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{credential.username}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopy(credential.username || '', 'Username')}
              >
                <Ionicons name="copy-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {credential.email && (
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{credential.email}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopy(credential.email || '', 'Email')}
              >
                <Ionicons name="copy-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{showPassword ? credential.password : '••••••••'}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopy(credential.password, 'Password')}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {credential.website && (
          <View style={styles.field}>
            <Text style={styles.label}>Website</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{credential.website}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopy(credential.website || '', 'Website')}
              >
                <Ionicons name="copy-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </>
    );
  };

  const renderCreditCardDetails = (credential: CreditCardCredential) => {
    return (
      <>
        <View style={styles.field}>
          <Text style={styles.label}>Card Number</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>
              {showCardNumber ? credential.cardNumber : `•••• •••• •••• ${credential.cardNumber.slice(-4)}`}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => setShowCardNumber((v) => !v)}
            >
              <Ionicons name={showCardNumber ? 'eye-off-outline' : 'eye-outline'} size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopy(credential.cardNumber, 'Card number')}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Cardholder Name</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{credential.cardholderName}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopy(credential.cardholderName, 'Cardholder name')}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Expiry Date</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{credential.expiryDate}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopy(credential.expiryDate, 'Expiry date')}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>CVV</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{showCVV ? credential.cvv : '•••'}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => setShowCVV((v) => !v)}
            >
              <Ionicons name={showCVV ? 'eye-off-outline' : 'eye-outline'} size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopy(credential.cvv, 'CVV')}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  const renderNoteDetails = (credential: NoteCredential) => {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>Content</Text>
        <View style={[styles.valueContainer, styles.noteContainer]}>
          <ScrollView style={styles.noteScrollView}>
            <Text style={[styles.value, styles.noteContent, { color: '#fff' }]}>
              {credential.content}
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopy(credential.content, 'Note content')}
          >
            <Ionicons name="copy-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderWiFiDetails = (credential: WiFiCredential) => {
    return (
      <>
        <View style={styles.field}>
          <Text style={styles.label}>Network Name</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{credential.networkName}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopy(credential.networkName, 'Network name')}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{showWifiPassword ? credential.password : '••••••••'}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => setShowWifiPassword((v) => !v)}
            >
              <Ionicons name={showWifiPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopy(credential.password, 'Password')}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Security Type</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{credential.securityType}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopy(credential.securityType, 'Security type')}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  const renderLinkDetails = (credential: LinkCredential) => {
    if (!credential.links) return null;
    return (
      <>
        {credential.links.map((link, index) => (
          <View key={index} style={styles.field}>
            <Text style={styles.label}>{link.name || `Link ${index + 1}`}</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{link.url}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopy(link.url, 'URL')}
              >
                <Ionicons name="copy-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => Linking.openURL(link.url)}
              >
                <Ionicons name="open-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </>
    );
  };

  const renderImageDetails = (credential: ImageCredential) => {
    return (
      <>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="image" size={32} color="#fff" />
            </View>
            <Text style={styles.title}>{credential.title}</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.imageContainer}>
              {isImageLoading && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading image...</Text>
                </View>
              )}
              {imageError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={32} color="#ff4444" />
                  <Text style={styles.errorText}>Failed to load image</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                      setImageError(false);
                      setIsImageLoading(true);
                    }}
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => setIsFullScreen(true)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ 
                      uri: credential.imageUrl,
                      cache: 'reload'
                    }}
                    style={styles.image}
                    resizeMode="contain"
                    onLoadStart={() => setIsImageLoading(true)}
                    onLoadEnd={() => setIsImageLoading(false)}
                    onError={(error) => {
                      console.error('Image loading error:', error.nativeEvent.error);
                      setImageError(true);
                      setIsImageLoading(false);
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.imageActions}>
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={() => handleDownload(credential.imageUrl)}
              >
                <Ionicons name="download-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Download</Text>
              </TouchableOpacity>
            </View>
            
            {credential.description && (
              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.value}>{credential.description}</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <Modal
          visible={isFullScreen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsFullScreen(false)}
        >
          <View style={styles.fullScreenContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsFullScreen(false)}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: credential.imageUrl }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </>
    );
  };

  const renderCredentialDetails = () => {
    if (!credential) return null;

    switch (credential.type) {
      case 'password':
        return renderPasswordDetails(credential);
      case 'creditCard':
        return renderCreditCardDetails(credential);
      case 'note':
        return renderNoteDetails(credential);
      case 'wifi':
        return renderWiFiDetails(credential);
      case 'link':
        return renderLinkDetails(credential);
      case 'image':
        return renderImageDetails(credential);
      default:
        return null;
    }
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
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Details</Text>
          <View style={styles.navActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
        {renderCredentialDetails()}
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
    paddingBottom: 80, // Add padding for bottom navigation
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
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  noteContainer: {
    minHeight: 100,
    maxHeight: 200,
  },
  noteScrollView: {
    flex: 1,
  },
  noteContent: {
    lineHeight: 24,
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
}); 