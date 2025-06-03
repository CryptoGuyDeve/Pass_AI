export interface BaseCredential {
  id: string;
  title: string;
  category: CredentialCategory;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  notes?: string;
}

export interface PasswordCredential extends BaseCredential {
  type: 'password';
  username?: string;
  email?: string;
  password: string;
  website?: string;
}

export interface CreditCardCredential extends BaseCredential {
  type: 'creditCard';
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  cardType: string;
}

export interface NoteCredential extends BaseCredential {
  type: 'note';
  content: string;
}

export interface WiFiCredential extends BaseCredential {
  type: 'wifi';
  networkName: string;
  password: string;
  securityType: string;
}

export interface LinkCredential extends BaseCredential {
  type: 'link';
  links: {
    name: string;
    url: string;
  }[];
}

export interface ImageCredential extends BaseCredential {
  type: 'image';
  imageUrl: string;
  description?: string;
}

export type CredentialCategory = 'social' | 'work' | 'personal' | 'financial' | 'other';

export type Credential = PasswordCredential | CreditCardCredential | NoteCredential | WiFiCredential | LinkCredential | ImageCredential;

export const generatePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const maskCreditCard = (cardNumber: string): string => {
  return `•••• •••• •••• ${cardNumber.slice(-4)}`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

export const categoryIcons: Record<CredentialCategory, string> = {
  social: 'people',
  work: 'briefcase',
  personal: 'person',
  financial: 'card',
  other: 'apps',
};

export const categoryColors: Record<CredentialCategory, string> = {
  social: '#4CAF50',
  work: '#2196F3',
  personal: '#9C27B0',
  financial: '#FF9800',
  other: '#607D8B',
};

const credentialTypes = {
  generatePassword,
  maskCreditCard,
  formatDate,
  categoryIcons,
  categoryColors,
};

export default credentialTypes; 