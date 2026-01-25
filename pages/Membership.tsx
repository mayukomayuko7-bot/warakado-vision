import React, { useState, useEffect, useRef } from 'react';
import { MemberInfo, PageId, RecipePost, TarotKey, PointRequest } from '../types';
import { GoogleGenAI } from "@google/genai";
import { db, storage, auth, isFirebaseConfigured } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, orderBy, where, getDocs, updateDoc, doc, increment, runTransaction } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { STAFF_PASS } from '../constants';

interface MembershipProps {
  member: MemberInfo | null;
  onRegister: (info: Partial<MemberInfo>) => void;
  onLogin: (nickname: string, email: string) => Promise<boolean>;
  onLogout: () => void;
  onUpdatePoints: (points: number) => void;
  onUpdateMember: (member: MemberInfo) => void;
  onNavigate: (page: PageId) => void;
  initialTab?: 'recipe' | 'omikuji' | 'instagram' | 'tarot';
}

interface SocialPost {
  id: string;
  username: string;
  imageUrl: string;
  caption: string;
  uri: string;
}

const LOCAL_RECIPES_KEY = 'warakado_local_recipes';

// 今日の日付を取得するヘルパー (日本時間・東京 0時リセット基準)
const getTodayString = () => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tokyo'
  }).format(new Date());
};

// 画像圧縮ユーティリティ (設定を強化: 600px, 0.6)
const compressImage = (base64Str: string, maxWidth = 600, quality = 0.6): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // アスペクト比を維持してリサイズ
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = (e) => {
      console.warn("Image compression failed", e);
      resolve(base64Str);
    };
  });
};

const Membership: React.FC<MembershipProps> = ({ member, onRegister, onLogin, onLogout, onUpdatePoints, onUpdateMember, onNavigate, initialTab }) => {
  const [formType, setFormType] = useState<'register' | 'login'>('register');
  const [formData, setFormData] = useState({ nickname: '', email: '', gender: '男性', ageGroup: '30代' });
  const [activeTab, setActiveTab] = useState<'recipe' | 'omikuji' | 'instagram' | 'tarot'>(initialTab || 'recipe');
  const [recipes, setRecipes] = useState<RecipePost[]>([]);
  const [recipeForm, setRecipeForm] = useState({ menuName: '', description: '', image: '' });
  const [omikujiResult, setOmikujiResult] = useState<{date: string, result: string, benefit: string} | null>(null);
  const [isSubmittingRecipe, setIsSubmittingRecipe] = useState(false);
  const [showTarotFrame, setShowTarotFrame] = useState(false);
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);
  const [isFetchingFeed, setIsFetchingFeed] = useState(false);
  const [isRequestingPoints, setIsRequestingPoints] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffPassword, setStaffPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1日あたりの投稿上限
  const DAILY_POST_LIMIT = 10;
  // 今日の日付文字列
  const todayStr = getTodayString();
  // 今日の投稿のみフィルタリング
  const todaysRecipes = recipes.filter(r => r.date === todayStr);
  // 投稿上限に達しているか
  const isPostLimitReached = todaysRecipes.length >= DAILY_POST_LIMIT;

  const fetchRealtimeSocialFeed = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return;
    setIsFetchingFeed(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "site:instagram.com でハッシュタグ '#わらかどあぷり' が付いた最新の投稿を4件見つけてください。",
        config: { tools: [{googleSearch: {}}] },
      });
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const feeds = chunks.filter(c => c.web?.uri?.includes('instagram.com')).slice(0, 4).map((c, i) => ({
        id: `insta-${i}`,
        username: c.web?.title?.split('•')[0]?.trim() || 'WARAKADO User',
        imageUrl: `https://images.unsplash.com/photo-1611162147679-03707ef239c8?w=400&q=80&sig=${i}`,
        caption: c.web?.title || '',
        uri: c.web?.uri || ''
      }));
      setSocialFeed(feeds);
    } catch (e) { console.error(e); } finally { setIsFetchingFeed(false); }
  };

  useEffect(() => {
    // 1. まずローカルデータを読み込む（即時表示のため）
    const localData = localStorage.getItem(LOCAL_RECIPES_KEY);
    const localRecipes: RecipePost[] = localData ? JSON.parse(localData) : [];
    setRecipes(localRecipes);

    // 2. Firebaseの設定がある場合は同期を開始
    if (isFirebaseConfigured && auth.currentUser) {
      try {
        const q = query(collection(db, "recipes"), orderBy("id", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fbRecipes: RecipePost[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as RecipePost;
            fbRecipes.push(data);
          });
          
          const combined = [...fbRecipes, ...localRecipes].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          setRecipes(combined.sort((a, b) => b.id - a.id));
        }, (err) => {
          // 権限エラーなどはwarnにとどめる
        });
        return () => unsubscribe();
      } catch (err) {
        console.warn("Firestore query setup failed:", err);
      }
    }
  }, []);

  useEffect(() => {
    // おみくじ結果を復元
    const savedOmikuji = localStorage.getItem(`warakado_omikuji_${member?.email}`);
    if (savedOmikuji) {
      setOmikujiResult(JSON.parse(savedOmikuji));
    }
  }, [member?.email]);

  useEffect(() => {
    if (activeTab === 'instagram' && socialFeed.length === 0) fetchRealtimeSocialFeed();
  }, [activeTab]);

  const handleDrawOmikuji = () => {
    const rand = Math.random();
    let result = "";
    let benefit = "";

    // 確率設定
    if (rand < 0.10) { // 大吉 10%
      result = "大吉";
      benefit = "本日100円引きクーポン";
    } else if (rand < 0.25) { // 吉 15%
      result = "吉";
      benefit = "本日50円引きクーポン";
    } else if (rand < 0.45) { // 中吉 20%
      result = "中吉";
      benefit = "本日30円引きクーポン";
    } else if (rand < 0.80) { // 末吉 35%
      result = "末吉";
      benefit = "本日10円引きクーポン";
    } else { // はずれ 20%
      result = "はずれ";
      benefit = "残念！また明日引いてね";
    }

    const newResult = { date: todayStr, result, benefit };
    setOmikujiResult(newResult);
    localStorage.setItem(`warakado_omikuji_${member?.email}`, JSON.stringify(newResult));
  };

  const handlePointRequest = async () => {
    if (!member) return;
    setIsRequestingPoints(true);
    try {
      if (isFirebaseConfigured && auth.currentUser) {
        await addDoc(collection(db, "point_requests"), {
          memberEmail: member.email,
          nickname: member.nickname,
          type: 'instagram',
          status: 'pending',
          requestedAt: new Date().toISOString()
        } as Omit<PointRequest, 'id'>);
        alert('申請を受け付けました！オーナーの承認後に1ポイントが付与されます。');
      } else {
        alert('オフラインモードのため、現在ポイント申請はできません。');
      }
    } catch (e) {
      alert('申請中にエラーが発生しました。');
    } finally {
      setIsRequestingPoints(false);
    }
  };

  const handleUseTarot = () => {
    if (!member) return;
    if (member.tarotCredits > 0 || member.tarotUsesCount < 3) {
      const updated = { ...member };
      if (member.tarotCredits > 0) { updated.tarotCredits -= 1; }
      else { updated.tarotUsesCount += 1; }
      onUpdateMember(updated);
      setShowTarotFrame(true);
    } else { alert('今月の無料枠が終了しました。クレジットを購入して占いを続けましょう！'); }
  };

  const handleVerifyKey = async () => {
    if (!member || !inputKey) return;
    setIsVerifyingKey(true);
    try {
      if (isFirebaseConfigured && auth.currentUser) {
        const q = query(
          collection(db, "tarot_keys"), 
          where("key", "==", inputKey.trim().toUpperCase()), 
          where("email", "==", member.email), 
          where("isUsed", "==", false)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const keyDoc = snap.docs[0];
          const keyData = keyDoc.data() as TarotKey;
          const updatedMember = { 
            ...member, 
            tarotCredits: (member.tarotCredits || 0) + keyData.credits,
            isSubscribed: true 
          };
          onUpdateMember(updatedMember);
          await updateDoc(keyDoc.ref, { isUsed: true });
          alert(`${keyData.credits}クレジットを追加しました！プレミアム鑑定をお楽しみください。`);
          setInputKey('');
        } else {
          alert('無効なキーです。メールアドレスが正しいか、入力間違いがないかご確認ください。');
        }
      } else {
        alert('オフラインモードのため、キーの照合ができません。');
      }
    } catch (e) {
      alert('照合中にエラーが発生しました。');
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const generatePaymentKey = async () => {
    if (!member) return;
    const key = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (isFirebaseConfigured && auth.currentUser) {
      try {
        await addDoc(collection(db, "tarot_keys"), {
          key: key,
          email: member.email,
          credits: 30,
          isUsed: false,
          issuedAt: new Date().toISOString()
        });
        window.open("https://warakado-vision.square.site/", "_blank");
      } catch (e) {
        alert('キーの発行に失敗しました。');
      }
    } else {
      alert('オフラインモードのため、購入キーの発行ができません。');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        setRecipeForm(prev => ({ ...prev, image: reader.result as string })); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = async (recipeId: number) => {
    setRecipes(prev => prev.map(r => {
      if (r.id === recipeId) {
        return { ...r, likes: (r.likes || 0) + 1 };
      }
      return r;
    }));

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        const q = query(collection(db, "recipes"), where("id", "==", recipeId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docRef = snapshot.docs[0].ref;
          await updateDoc(docRef, { likes: increment(1) });
        }
      } catch (e) {
        console.error("Like update failed:", e);
      }
    }
  };

  const handleStaffPointGrant = () => {
    if (staffPassword === STAFF_PASS) {
      if (member) {
        onUpdatePoints(member.points + 1);
        alert('1ポイントを付与しました！');
        setShowStaffModal(false);
        setStaffPassword('');
      }
    } else {
      alert('パスワードが違います');
    }
  };

  const submitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    
    if (isPostLimitReached) {
      alert('本日の投稿受付は終了しました。また明日投稿してね♪');
      return;
    }
    
    setIsSubmittingRecipe(true);
    
    try {
      let finalImageUrl = recipeForm.image;
      
      if (finalImageUrl && finalImageUrl.startsWith('data:')) {
        try {
          finalImageUrl = await compressImage(finalImageUrl, 600, 0.6);
        } catch (compressErr) {
          console.warn("Image compression failed, using original", compressErr);
        }
      }

      if (!finalImageUrl) {
        finalImageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
      }
      
      if (isFirebaseConfigured && auth.currentUser && finalImageUrl.startsWith('data:')) {
        try {
          const safeFileName = `recipes/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
          const storageRef = ref(storage, safeFileName);
          
          await uploadString(storageRef, finalImageUrl, 'data_url', {
             contentType: 'image/jpeg',
          });
          finalImageUrl = await getDownloadURL(storageRef);
        } catch (imageErr: any) {
          console.warn("Storage upload failed (using Base64 fallback):", imageErr.message);
        }
      }

      const newRecipe: RecipePost = {
        id: Date.now(),
        author: member.nickname,
        menuName: recipeForm.menuName,
        description: recipeForm.description,
        image: finalImageUrl,
        date: todayStr,
        likes: 0
      };

      if (isFirebaseConfigured && auth.currentUser) {
        try {
          if (finalImageUrl.length < 1000000) { 
             await addDoc(collection(db, "recipes"), newRecipe);
          } else {
             console.warn("Compressed image still too large for Firestore, skipping cloud save.");
          }
        } catch (dbErr) {
          console.warn("Firestore save failed (running in offline/local mode):", dbErr);
        }
      }

      try {
        const localData = localStorage.getItem(LOCAL_RECIPES_KEY);
        let localRecipes: RecipePost[] = localData ? JSON.parse(localData) : [];
        if (localRecipes.length > 30) localRecipes = localRecipes.slice(0, 30);
        localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify([newRecipe, ...localRecipes]));
      } catch (localErr) {
        console.error("Local storage error:", localErr);
      }

      setRecipes(prev => [newRecipe, ...prev].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).sort((a,b) => b.id - a.id));
      setRecipeForm({ menuName: '', description: '', image: '' });
      alert('レシピを投稿しました！');
    } catch (e) {
      console.error("Fatal Submit Error:", e);
      alert('投稿処理が完了しました（一部保存制限あり）');
      setRecipeForm({ menuName: '', description: '', image: '' });
    } finally {
      setIsSubmittingRecipe(false);
    }
  };

  if (!member) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
        <div className="flex border-b">
          <button onClick={() => setFormType('register')} className={`flex-1 py-5 font-black text-sm transition-all ${formType === 'register' ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-600' : 'text-slate-400'}`}>新規会員登録</button>
          <button onClick={() => setFormType('login')} className={`flex-1 py-5 font-black text-sm transition-all ${formType === 'login' ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-600' : 'text-slate-400'}`}>ログイン</button>
        </div>
        <div className="p-8">
          <form onSubmit={async (e) => { e.preventDefault(); if(formType === 'register') onRegister(formData); else await onLogin(formData.nickname, formData.email); }} className="space-y-4">
            <input type="text" placeholder="ニックネーム" required value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 font-bold outline-none focus:border-orange-300 transition-all" />
            <input type="email" placeholder="メールアドレス" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 font-bold outline-none focus:border-orange-300 transition-all" />
            {formType === 'register' && (
              <div className="flex gap-4">
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 font-bold outline-none appearance-none cursor-pointer">
                  <option>男性</option><option>女性</option><option>その他</option><option>回答しない</option>
                </select>
                <select value={formData.ageGroup} onChange={e => setFormData({...formData, ageGroup: e.target.value})} className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 font-bold outline-none appearance-none cursor-pointer">
                  <option>10代</option><option>20代</option><option>30代</option><option>40代</option><option>50代</option><option>60代以上</option>
                </select>
              </div>
            )}
            <button type="submit" className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-orange-700 transition-colors active:scale-95">
              {formType === 'register' ? '無料で会員登録して開始' : 'ログインして開始'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pointProgress = Math.min((member.points / 10) * 100, 100);

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 animate-fade-in">
      {/* デジタル会員証 */}
      <div className="bg-warakado-gradient rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border border-white/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-black italic text-lg tracking-tighter drop-shadow-sm">WARAKADO VISION</h3>
            <span className="font-mono text-[10px] font-black bg-white/20 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">{member.serialNumber}</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-3xl font-black mb-1 drop-shadow-md">{member.nickname} <span className="text-sm font-bold opacity-80">様</span></p>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-white/10">Standard Member</span>
              </div>
            </div>
            
            <div className="text-right bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-inner min-w-[140px]">
              <div className="flex items-center justify-end gap-2 mb-1">
                <i className="fa-solid fa-star text-yellow-400 text-xs animate-pulse"></i>
                <p className="text-xs font-black uppercase tracking-tighter opacity-80">Points</p>
              </div>
              <p className="text-4xl font-black mb-1 leading-none">
                {member.points}<span className="text-sm ml-1 font-bold">pt</span>
              </p>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mb-1">
                <div 
                  className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-1000" 
                  style={{ width: `${pointProgress}%` }}
                ></div>
              </div>
              <p className="text-[9px] font-black text-yellow-200 drop-shadow-sm">10ポイントでグッズ交換！</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <button onClick={onLogout} className="bg-white/10 px-4 py-2 rounded-full text-[10px] font-black border border-white/20 hover:bg-white/30 transition-all active:scale-95 backdrop-blur-sm">LOGOUT</button>
            {member.points >= 10 && (
              <span className="bg-yellow-400 text-orange-900 px-3 py-1 rounded-full text-[9px] font-black animate-bounce shadow-lg">交換可能です！</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center px-4">
        <button
          onClick={() => setShowStaffModal(true)}
          className="text-[10px] font-bold text-slate-400 border border-slate-300 rounded-full px-6 py-2 hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-store"></i>
          店舗スタッフ用：ポイント付与
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-center text-xs font-black text-slate-400 tracking-[0.2em]">WEB会員限定コンテンツ</p>
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-200">
          <div className="flex border-b bg-slate-50">
            {[
              { id: 'recipe', icon: 'fa-utensils', label: 'レシピ' },
              { id: 'tarot', icon: 'fa-magic', label: 'タロット' },
              { id: 'omikuji', icon: 'fa-box-open', label: 'おみくじ' },
              { id: 'instagram', icon: 'fa-instagram', label: 'SNS' }
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex-1 py-5 flex flex-col items-center gap-1 transition-all ${activeTab === t.id ? 'text-orange-600 bg-white border-b-2 border-orange-600' : 'text-slate-400'}`}>
                <i className={`fa-solid ${t.icon} text-lg`}></i>
                <span className="text-[10px] font-black tracking-tighter uppercase">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'recipe' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 rounded-[2.5rem] text-white shadow-lg text-center relative overflow-hidden group">
                  <h3 className="text-xl md:text-2xl font-black mb-3 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-fire-burner animate-bounce"></i>
                    アレンジレシピ大募集！
                  </h3>
                  <div className="text-xs font-bold opacity-95 leading-relaxed px-2 space-y-1">
                    <p>キッチンカーまたはオンラインショップにて販売中の</p>
                    <p>冷凍肉巻きおにぎり、冷凍豚すき丼の素を購入して</p>
                    <p>みんなのUMATCH！(you match)をシェアしよう！</p>
                    <p className="pt-1 text-yellow-200">いいね！が多い作品はキッチンカーでの限定メニューに採用いたします！</p>
                  </div>
                  <div className="mt-4 flex justify-between items-end">
                      <span className="text-[10px] font-black bg-black/20 px-2 py-1 rounded">本日: {todaysRecipes.length}/{DAILY_POST_LIMIT} 件</span>
                  </div>
                  <i className="fa-solid fa-utensils absolute -left-4 -bottom-4 text-8xl opacity-20 rotate-12"></i>
                </div>

                <form onSubmit={submitRecipe} className="space-y-4 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                  <input type="text" placeholder="メニュー名" required disabled={isPostLimitReached} value={recipeForm.menuName} onChange={e => setRecipeForm({...recipeForm, menuName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold focus:border-orange-400 outline-none transition-all disabled:opacity-50" />
                  <div onClick={() => !isPostLimitReached && fileInputRef.current?.click()} className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${recipeForm.image ? 'border-orange-400 bg-white' : 'border-slate-300 bg-slate-100 hover:border-orange-300'} ${isPostLimitReached ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {recipeForm.image ? <img src={recipeForm.image} alt="Preview" className="w-full h-full object-cover" /> : <><i className="fa-solid fa-camera text-3xl text-slate-400 mb-2"></i><span className="text-[10px] font-black text-slate-400 uppercase">写真をアップロード</span></>}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" disabled={isPostLimitReached} />
                  <textarea placeholder="作り方やこだわり、隠し味などを入力..." required disabled={isPostLimitReached} value={recipeForm.description} onChange={e => setRecipeForm({...recipeForm, description: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold h-32 focus:border-orange-400 outline-none transition-all resize-none disabled:opacity-50" />
                  <button 
                    type="submit" 
                    disabled={isSubmittingRecipe || isPostLimitReached} 
                    className={`w-full py-4 rounded-2xl font-black shadow-md active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 ${isPostLimitReached ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-orange-600 text-white'}`}
                  >
                    {isSubmittingRecipe ? <><i className="fa-solid fa-circle-notch animate-spin mr-2"></i>送信中...</> : isPostLimitReached ? 'また明日投稿してね♪' : 'レシピを投稿する'}
                  </button>
                </form>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Today's Recipes</h4>
                  {todaysRecipes.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-bold italic">本日の投稿はまだありません。<br/>最初の投稿をお待ちしています！</p>
                      <p className="text-[10px] text-slate-300 mt-2">※レシピは毎日0時にリセットされます</p>
                    </div>
                  ) : (
                    todaysRecipes.map(r => (
                      <div key={r.id} className="flex flex-col gap-3 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all animate-fade-in">
                        <div className="flex gap-4">
                          <img src={r.image} className="w-20 h-20 rounded-2xl object-cover bg-slate-100 flex-shrink-0 shadow-inner" alt="" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{r.menuName}</p>
                            <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase">by {r.author}</p>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{r.description}</p>
                          </div>
                        </div>
                        <div className="flex justify-end pt-2 border-t border-slate-50">
                            <button 
                              onClick={() => handleLike(r.id)}
                              className="flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-1.5 rounded-full text-xs font-black hover:bg-pink-100 transition-colors active:scale-95 group"
                            >
                                <i className="fa-solid fa-heart group-hover:scale-125 transition-transform duration-300"></i>
                                <span>UMATCH! {r.likes || 0}</span>
                            </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tarot' && (
              <div className="text-center py-6 animate-fade-in flex flex-col items-center justify-center min-h-[450px]">
                {showTarotFrame ? (
                  <div className="w-full h-full space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">WARAKADO TAROT APP</span>
                      <button onClick={() => setShowTarotFrame(false)} className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-md">終了</button>
                    </div>
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-indigo-900 aspect-[9/16] bg-slate-900 max-h-[600px] mx-auto">
                      <iframe src="https://warakado-tarot-space-581971413306.us-west1.run.app" className="w-full h-full" allow="camera; microphone" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 w-full max-w-sm px-2">
                    <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto shadow-inner border border-indigo-100 rotate-3 transition-transform hover:rotate-6">
                      <i className="fa-solid fa-wand-sparkles"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-1">会員限定タロット</h3>
                      <div className="text-[10px] text-slate-500 font-bold space-y-0.5">
                        <p>※タロットアプリでの個人情報収集はございませんのでお気軽にご利用ください。</p>
                        <p>※お手持ちのスマートフォンの環境により動作しない場合がございますので<br/>先ずは無料クレジットにて動作確認後、クレジットの購入をお願いします。</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                      <button onClick={handleUseTarot} className="w-full bg-indigo-900 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-xl active:scale-95 transition-all">
                        <i className="fa-solid fa-hat-wizard mr-3"></i>占いを開始
                      </button>
                      
                      <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-[2.5rem] border-2 border-indigo-100 shadow-sm text-left relative overflow-hidden">
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Premium Plan</h4>
                        <p className="text-sm font-black text-slate-900">プレミアムクレジット購入</p>
                        
                        <div className="bg-white/70 p-4 rounded-2xl border border-indigo-100 mb-5 space-y-3 shadow-inner">
                          <div className="flex gap-2">
                            <i className="fa-solid fa-circle-exclamation text-indigo-600 mt-1 text-[10px]"></i>
                            <p className="text-[9px] text-indigo-900 font-bold leading-tight">Square購入時に、本アプリと同じメールアドレスをご使用ください。決済完了後購入キーが送られてきます。</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <button 
                            onClick={generatePaymentKey}
                            className="w-full bg-white text-indigo-900 py-4 rounded-2xl font-black text-sm text-center border-2 border-indigo-900 shadow-sm hover:bg-indigo-900 hover:text-white transition-all active:scale-95"
                          >
                            1,000円/30回クレジットを購入
                          </button>

                          <div className="pt-4 border-t border-indigo-100">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">ログインキーをお持ちの方</p>
                            <div className="flex gap-2 items-center">
                              <button 
                                onClick={handleVerifyKey}
                                disabled={isVerifyingKey || !inputKey}
                                className="flex-shrink-0 bg-indigo-600 text-white px-5 py-3 rounded-xl text-[11px] font-black shadow-md active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
                              >
                                {isVerifyingKey ? '確認中' : '有効化'}
                              </button>
                              <input 
                                type="text" 
                                placeholder="キーを入力" 
                                value={inputKey}
                                onChange={e => setInputKey(e.target.value)}
                                className="flex-1 min-w-0 bg-white border-2 border-indigo-100 rounded-xl px-3 py-3 text-xs font-black outline-none focus:border-indigo-400 transition-all uppercase tracking-widest"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-10 mt-6 pt-6 border-t border-slate-100">
                      <div className="text-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Free Uses</p><p className="text-xl font-black text-slate-900">{3 - member.tarotUsesCount}/3</p></div>
                      <div className="text-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Credits</p><p className="text-xl font-black text-indigo-600">{member.tarotCredits}pt</p></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'omikuji' && (
              <div className="text-center py-10 animate-fade-in flex flex-col items-center justify-center min-h-[450px]">
                {omikujiResult && omikujiResult.date === todayStr ? (
                  <div className="bg-white p-10 rounded-[3rem] border-4 border-orange-500 shadow-2xl scale-110">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Today's Fortune</p>
                    <h4 className="text-7xl font-black text-orange-600 mb-4 tracking-tighter">{omikujiResult.result}</h4>
                    <div className="bg-orange-50 text-orange-700 py-4 px-6 rounded-2xl font-black text-sm border border-orange-100">特典: {omikujiResult.benefit}</div>
                    <p className="text-[10px] text-slate-400 mt-6 italic">毎日東京時間0時にリセットされます</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 space-y-1">
                      <p className="text-sm font-bold text-slate-500">本日使えるクーポンが当たるかも！？</p>
                      <p className="text-lg font-black text-orange-500">運だめしおみくじ毎日開催中！</p>
                    </div>
                    <button 
                      onClick={handleDrawOmikuji} 
                      className="w-56 h-56 bg-orange-600 text-white rounded-[4rem] font-black text-3xl shadow-2xl border-4 border-orange-400 active:scale-90 hover:rotate-6 transition-all flex items-center justify-center"
                    >
                      運試し！
                    </button>
                  </>
                )}
              </div>
            )}

            {activeTab === 'instagram' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center shadow-sm relative overflow-hidden">
                  <i className="fa-brands fa-instagram text-4xl text-pink-600 mb-4"></i>
                  <h4 className="text-xl font-black text-slate-900">インスタグラム #わらかどあぷり</h4>
                  <p className="text-xs text-slate-500 font-bold mb-4 italic px-6 leading-relaxed">ハッシュタグをつけて投稿しよう！</p>
                  <div className="flex flex-col gap-3 max-w-[240px] mx-auto">
                    <a href="https://www.instagram.com/explore/tags/%E3%82%8F%E3%82%89%E3%81%8B%E3%81%A9%E3%81%82%E3%81%B7%E3%82%8A/" target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-black shadow-lg">Instagramを開く</a>
                    <button onClick={handlePointRequest} disabled={isRequestingPoints} className="bg-orange-600 text-white px-6 py-3 rounded-full text-xs font-black shadow-lg disabled:opacity-50">{isRequestingPoints ? '申請中...' : 'ポイント申請する'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-white/20 text-center animate-scale-in">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl mx-auto mb-4">
              <i className="fa-solid fa-store"></i>
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">STAFF CONFIRMATION</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">ポイント付与のパスワードを入力</p>
            
            <input 
              type="password"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-center text-xl font-mono tracking-widest outline-none focus:border-orange-400 transition-all mb-4"
              placeholder="••••••••"
              value={staffPassword}
              onChange={(e) => setStaffPassword(e.target.value)}
              autoFocus
            />
            
            <div className="flex gap-3">
              <button onClick={() => { setShowStaffModal(false); setStaffPassword(''); }} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-black text-xs hover:bg-slate-200 transition-colors">キャンセル</button>
              <button onClick={handleStaffPointGrant} className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-transform">付与する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
