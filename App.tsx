import React, { useState, useEffect, useCallback } from 'react';
import { PageId, MemberInfo } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import FoodBusiness from './pages/FoodBusiness';
import RentalSpace from './pages/RentalSpace';
import TarotSpace from './pages/TarotSpace';
import DesignWorks from './pages/DesignWorks';
import VisionMusic from './pages/VisionMusic';
import NostalgiaAddiction from './pages/NostalgiaAddiction';
import Membership from './pages/Membership';
import AdminDashboard from './pages/AdminDashboard';
import { db, auth, isFirebaseConfigured } from './lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const LOCAL_MEMBERS_KEY = 'warakado_local_members';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper to get members from local storage
  const getLocalMembers = useCallback((): MemberInfo[] => {
    const data = localStorage.getItem(LOCAL_MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  }, []);

  // Helper to save member to local storage
  const saveLocalMember = useCallback((newMember: MemberInfo) => {
    const members = getLocalMembers();
    const index = members.findIndex(m => m.email === newMember.email);
    if (index >= 0) {
      members[index] = newMember;
    } else {
      members.push(newMember);
    }
    localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(members));
  }, [getLocalMembers]);

  // Unified fetch member logic
  const findMember = useCallback(async (email: string): Promise<MemberInfo | null> => {
    // Normalize email for search
    const searchEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        const q = query(collection(db, "members"), where("email", "==", searchEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as MemberInfo;
          // Sync to local for offline/fallback
          saveLocalMember(data);
          return data;
        }
      } catch (error) {
        console.warn("Firebase fetch failed (likely permission or offline), using local data.");
      }
    }
    
    const localMembers = getLocalMembers();
    return localMembers.find(m => m.email === searchEmail) || null;
  }, [saveLocalMember, getLocalMembers]);

  useEffect(() => {
    // Firebase匿名認証（Storage権限対策）
    const initAuth = async () => {
      if (isFirebaseConfigured) {
        try {
          await signInAnonymously(auth);
          console.log("Firebase anonymous auth success");
        } catch (e: any) {
          if (e.code === 'auth/configuration-not-found' || e.code === 'auth/admin-restricted-operation') {
             console.warn("Firebase Anonymous Auth is DISABLED in Console. App running in Local/Offline mode.");
          } else {
             console.warn("Firebase auth warning:", e.message);
          }
        }
      }
    };
    initAuth();

    const restoreSession = async () => {
      const savedEmail = localStorage.getItem('warakado_session_email');
      if (savedEmail) {
        setLoading(true);
        try {
          // 少し待ってから検索（Auth初期化待ち）
          await new Promise(resolve => setTimeout(resolve, 500));
          const memberData = await findMember(savedEmail);
          if (memberData) setMember(memberData);
        } catch (error) {
          console.error("Session restore failed:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    restoreSession();
  }, [findMember]);

  const handlePageChange = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateMemberInDB = async (updatedMember: MemberInfo) => {
    setMember(updatedMember);
    saveLocalMember(updatedMember); // Always update local

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        const q = query(collection(db, "members"), where("email", "==", updatedMember.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, { ...updatedMember });
        }
      } catch (e) {
        // Silently fail for local-only mode
      }
    }
  };

  const handleRegister = async (info: Partial<MemberInfo>) => {
    if (!info.email) return;
    setLoading(true);
    
    try {
      // Normalize inputs
      const normalizedEmail = info.email.trim().toLowerCase();
      const normalizedNickname = (info.nickname || 'ゲスト').trim();

      const existing = await findMember(normalizedEmail);
      if (existing) {
        alert('このメールアドレスは既に登録されています。ログインしてください。');
        setLoading(false);
        return;
      }

      const newMember: MemberInfo = {
        nickname: normalizedNickname,
        email: normalizedEmail,
        gender: info.gender || '未設定',
        ageGroup: info.ageGroup || '未設定',
        serialNumber: `WK-${Math.floor(1000 + Math.random() * 9000)}`,
        points: 0,
        isSubscribed: false,
        tarotUsesCount: 0,
        tarotCredits: 0,
        registeredAt: new Date().toISOString(),
      };

      if (isFirebaseConfigured && auth.currentUser) {
        try {
          await addDoc(collection(db, "members"), newMember);
        } catch (e) {
          console.warn("Firebase registration skipped (offline mode).");
        }
      }
      
      saveLocalMember(newMember);
      setMember(newMember);
      localStorage.setItem('warakado_session_email', newMember.email);
      setCurrentPage('member');
    } catch (e) {
      console.error("Registration failed:", e);
      alert("登録中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (nickname: string, email: string) => {
    setLoading(true);
    try {
      // Normalize inputs
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedNickname = nickname.trim();

      const found = await findMember(normalizedEmail);
      
      if (found && found.nickname === normalizedNickname) {
        setMember(found);
        localStorage.setItem('warakado_session_email', found.email);
        setLoading(false);
        return true;
      } else {
        alert('会員情報が見つかりません。メールアドレスとニックネームが正しいか確認してください。');
        setLoading(false);
        return false;
      }
    } catch (e) {
      console.error("Login failed:", e);
      alert("ログイン処理中にエラーが発生しました。");
      setLoading(false);
      return false;
    }
  };

  const handleLogout = () => {
    setMember(null);
    localStorage.removeItem('warakado_session_email');
    setCurrentPage('home');
  };

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-sm font-black text-slate-500 animate-pulse">読み込み中...</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'home': return <Home onNavigate={handlePageChange} />;
      case 'food': return <FoodBusiness />;
      case 'rental': return <RentalSpace />;
      case 'tarot': return <TarotSpace onNavigate={handlePageChange} member={member} />;
      case 'design': return <DesignWorks />;
      case 'music': return <VisionMusic />;
      case 'nostalgia': return <NostalgiaAddiction />;
      case 'member': return (
        <Membership 
          member={member} 
          onRegister={handleRegister} 
          onLogin={handleLogin}
          onLogout={handleLogout}
          onUpdatePoints={(p) => member && updateMemberInDB({...member, points: p})}
          onUpdateMember={updateMemberInDB}
          onNavigate={handlePageChange} 
        />
      );
      case 'member_tarot': return (
        <Membership 
          member={member} 
          onRegister={handleRegister} 
          onLogin={handleLogin}
          onLogout={handleLogout}
          onUpdatePoints={(p) => member && updateMemberInDB({...member, points: p})}
          onUpdateMember={updateMemberInDB}
          onNavigate={handlePageChange}
          initialTab="tarot"
        />
      );
      case 'admin': return <AdminDashboard onNavigate={handlePageChange} />;
      default: return <Home onNavigate={handlePageChange} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header onNavigate={handlePageChange} member={member} currentPage={currentPage} />
      <main className="container mx-auto max-w-4xl px-4 py-12 flex-grow">
        {renderPage()}
      </main>
      <Footer onNavigate={handlePageChange} />
    </div>
  );
};

export default App;