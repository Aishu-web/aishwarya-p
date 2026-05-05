export type Role = 'farmer' | 'expert' | 'admin';
export type Language = 'en' | 'kn' | 'hi' | 'te';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: Role;
  preferredLanguage: Language;
  district?: string;
  favoriteCrops: string[];
}

export interface LocalizedString {
  en: string;
  kn: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  url?: string;
  category: 'government' | 'market' | 'weather' | 'general';
}

export interface Tip {
  id: string;
  title: LocalizedString;
  content: LocalizedString;
  imageUrl: string;
  category: 'Paddy' | 'Areca nut' | 'Coconut' | 'Tomato' | 'Pest Control' | 'Fertilizer' | 'Weather';
  verified: boolean;
  authorId: string;
  usefulCount?: number;
  reportCount?: number;
  createdAt: any;
}

export interface TipFeedback {
  userId: string;
  type: 'useful' | 'inaccurate';
  reason?: string;
  createdAt: any;
}

export interface SuccessStory {
  id: string;
  farmerName: string;
  location: string;
  story: LocalizedString;
  imageUrl: string;
  crop: string;
  createdAt: any;
}

export interface ExpertAsk {
  id: string;
  userId: string;
  message: string;
  photoUrl?: string;
  status: 'pending' | 'answered';
  response?: string;
  detailedProtocol?: string;
  translation?: string;
  confidenceScore?: number;
  rating?: number; // Added rating (1-5)
  createdAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface MarketPrice {
  crop: string;
  mandi: string;
  price: number;
  prevPrice?: number;
  unit: string;
  date: string;
}
