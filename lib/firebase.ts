import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

/**
 * 環境変数を安全に取得するためのユーティリティ
 */
const getSafeEnv = (key: string): string | undefined => {
  try {
    // 1. import.meta.env から検索 (Vite環境)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      if ((import.meta as any).env[key]) return (import.meta as any).env[key];
    }
    
    // 2. process.env から検索 (Vercel/Node/Shim環境)
    if (typeof process !== 'undefined' && process.env) {
      if ((process.env as any)[key]) return (process.env as any)[key];
      // プレフィックスなしでも検索
      const noPrefixKey = key.replace('VITE_FIREBASE_', 'FIREBASE_').replace('VITE_', '');
      if ((process.env as any)[noPrefixKey]) return (process.env as any)[noPrefixKey];
    }

    // 3. window から検索 (手動注入などの場合)
    if (typeof window !== 'undefined' && (window as any)[key]) {
      return (window as any)[key];
    }
  } catch (e) {
    console.warn(`Environment variable ${key} could not be retrieved:`, e);
  }
  return undefined;
};

/**
 * .env ファイルから提供された情報をデフォルト値として設定
 * これにより、環境変数が正しく注入されない実行環境でも動作を保証します。
 */
const DEFAULT_CONFIG = {
  apiKey: "AIzaSyCq55pL6-xU04nljQ1VqSKBH5Pl29hVZIU",
  authDomain: "warakado-app.firebaseapp.com",
  projectId: "warakado-app",
  storageBucket: "warakado-app.firebasestorage.app",
  messagingSenderId: "244889377786",
  appId: "1:244889377786:web:756ad6884e955d0cae2243"
};

// 設定値の取得（環境変数を優先し、存在しない場合はデフォルト値を使用）
const apiKey = getSafeEnv("VITE_FIREBASE_API_KEY") || DEFAULT_CONFIG.apiKey;
const projectId = getSafeEnv("VITE_FIREBASE_PROJECT_ID") || DEFAULT_CONFIG.projectId;

/**
 * Firebaseが有効に設定されているかどうかの判定
 */
export const isFirebaseConfigured = !!(
  apiKey && 
  apiKey !== "" && 
  apiKey !== "YOUR_API_KEY" && 
  !apiKey.includes("your-")
);

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: getSafeEnv("VITE_FIREBASE_AUTH_DOMAIN") || DEFAULT_CONFIG.authDomain,
  projectId: projectId,
  storageBucket: getSafeEnv("VITE_FIREBASE_STORAGE_BUCKET") || DEFAULT_CONFIG.storageBucket,
  messagingSenderId: getSafeEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") || DEFAULT_CONFIG.messagingSenderId,
  appId: getSafeEnv("VITE_FIREBASE_APP_ID") || DEFAULT_CONFIG.appId
};

// Firebaseの初期化
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.error("Firebase initialization error:", e);
  // エラー回避のための最小限の初期化
  app = initializeApp({ apiKey: "none", projectId: "none" });
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);