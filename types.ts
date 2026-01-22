
export type PageId = 'home' | 'food' | 'rental' | 'tarot' | 'design' | 'music' | 'nostalgia' | 'member' | 'member_tarot' | 'admin';

export interface MemberInfo {
  nickname: string;
  email: string;
  gender: string;
  ageGroup: string;
  serialNumber: string;
  points: number;
  isSubscribed: boolean; // タロット会員（購入経験あり）かどうか
  tarotUsesCount: number; // タロット使用回数（無料枠用）
  tarotCredits: number; // タロット残りクレジット（購入分）
  tarotMemberSince?: string; // タロット会員登録日
  registeredAt?: string;
}

export interface PointRequest {
  id: string;
  memberEmail: string;
  nickname: string;
  type: 'instagram';
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface TarotRequest {
  id: string;
  memberEmail: string;
  nickname: string;
  status: 'pending' | 'completed';
  requestedAt: string;
}

export interface TarotKey {
  key: string;
  email: string;
  credits: number;
  isUsed: boolean;
  issuedAt: string;
}

export interface RecipePost {
  id: number;
  author: string;
  menuName: string;
  description: string;
  image: string;
  date: string;
  likes?: number;
}

export interface MenuItem {
  id: PageId;
  title: string;
  icon: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}