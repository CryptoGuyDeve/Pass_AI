import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { Credential } from './credentialTypes';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  MASTER_PASSWORD: 'master_password',
};

export const storage = {
  // Credentials
  getCredentials: async (): Promise<Credential[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        category: item.category,
        ...item.data,
        favorite: item.favorite,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } catch (error) {
      console.error('Error getting credentials:', error);
      throw error;
    }
  },

  getCredential: async (id: string): Promise<Credential> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Credential not found');

      const credential: Credential = {
        id: data.id,
        type: data.type,
        title: data.title,
        category: data.category,
        favorite: data.favorite,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        ...(data.data || {}),
      };

      // For image credentials, get a signed URL
      if (credential.type === 'image' && credential.imageUrl) {
        try {
          // If the URL is already a full URL, extract the file path
          let filePath = credential.imageUrl;
          if (filePath.startsWith('http')) {
            const urlParts = filePath.split('/storage/v1/object/public/images/');
            if (urlParts.length > 1) {
              filePath = urlParts[1];
            }
          }

          // Get a signed URL that expires in 1 hour
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('images')
            .createSignedUrl(filePath, 3600);

          if (signedUrlError) {
            console.error('Error getting signed URL:', signedUrlError);
            throw signedUrlError;
          }

          if (!signedUrlData?.signedUrl) {
            throw new Error('Failed to get signed URL');
          }

          credential.imageUrl = signedUrlData.signedUrl;
          console.log('Image file path:', filePath);
          console.log('Signed URL:', credential.imageUrl);
        } catch (error) {
          console.error('Error processing image URL:', error);
          // If signed URL fails, try public URL as fallback
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(credential.imageUrl);
          credential.imageUrl = publicUrl;
          console.log('Fallback to public URL:', credential.imageUrl);
        }
      }

      return credential;
    } catch (error) {
      console.error('Error getting credential:', error);
      throw error;
    }
  },

  saveCredentials: async (credentials: Credential[]): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('credentials').upsert(
        credentials.map(cred => ({
          id: cred.id,
          user_id: user.id,
          type: cred.type,
          title: cred.title,
          category: cred.category,
          data: {
            ...cred,
            id: undefined,
            type: undefined,
            title: undefined,
            category: undefined,
            favorite: undefined,
            notes: undefined,
            createdAt: undefined,
            updatedAt: undefined,
          },
          favorite: cred.favorite,
          notes: cred.notes,
          created_at: cred.createdAt,
          updated_at: cred.updatedAt,
        }))
      );
      if (error) throw error;
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw error;
    }
  },

  uploadImage: async (uri: string): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate a unique filename
      const filename = uri.split('/').pop();
      const extension = filename?.split('.').pop() || 'jpg';
      const filePath = `${user.id}/${Date.now()}.${extension}`;

      // Convert URI to base64
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('Failed to convert image to base64'));
      });

      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, decode(base64Data), {
          contentType: `image/${extension}`,
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Return just the file path
      return filePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        throw new Error(`Image upload failed: ${error.message}`);
      }
      throw new Error('Failed to upload image to storage');
    }
  },

  pickImage: async (): Promise<string> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        throw new Error('Image picking was canceled');
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  },

  addCredential: async (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('credentials')
        .insert({
          user_id: user.id,
          type: credential.type,
          title: credential.title,
          category: credential.category,
          favorite: credential.favorite,
          notes: credential.notes,
          data: {
            ...(credential.type === 'password' && {
              username: credential.username,
              password: credential.password,
              url: credential.url,
            }),
            ...(credential.type === 'creditCard' && {
              cardNumber: credential.cardNumber,
              cardholderName: credential.cardholderName,
              expiryDate: credential.expiryDate,
              cvv: credential.cvv,
            }),
            ...(credential.type === 'wifi' && {
              networkName: credential.networkName,
              password: credential.password,
              securityType: credential.securityType,
            }),
            ...(credential.type === 'note' && {
              content: credential.content,
            }),
            ...(credential.type === 'link' && {
              links: credential.links,
            }),
            ...(credential.type === 'image' && {
              imageUrl: credential.imageUrl,
              description: credential.description,
            }),
          },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding credential:', error);
      throw error;
    }
  },

  updateCredential: async (id: string, updatedCredential: Credential): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('credentials')
        .update({
          type: updatedCredential.type,
          title: updatedCredential.title,
          category: updatedCredential.category,
          data: {
            ...updatedCredential,
            id: undefined,
            type: undefined,
            title: undefined,
            category: undefined,
            favorite: undefined,
            notes: undefined,
            createdAt: undefined,
            updatedAt: undefined,
          },
          favorite: updatedCredential.favorite,
          notes: updatedCredential.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating credential:', error);
      throw error;
    }
  },

  deleteCredential: async (id: string): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting credential:', error);
      throw error;
    }
  },

  // Onboarding
  isOnboardingComplete: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  setOnboardingComplete: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      throw error;
    }
  },

  // Master Password
  setMasterPassword: async (password: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MASTER_PASSWORD, password);
    } catch (error) {
      console.error('Error setting master password:', error);
      throw error;
    }
  },

  getMasterPassword: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.MASTER_PASSWORD);
    } catch (error) {
      console.error('Error getting master password:', error);
      return null;
    }
  },

  // Settings
  getSettings: async (): Promise<any> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('settings')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data?.settings || {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  },

  updateSettings: async (settings: any): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('users')
        .update({ settings })
        .eq('id', user.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  // Clear all data
  clearAll: async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ONBOARDING_COMPLETE,
        STORAGE_KEYS.MASTER_PASSWORD,
      ]);
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

export default storage; 