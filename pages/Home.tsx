
import React, { useState } from 'react';
import { PageId } from '../types';
import { MENU_ITEMS, STAFF_PASS } from '../constants';
import AdBanner from '../components/AdBanner';

interface HomeProps {
  onNavigate: (page: PageId) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === STAFF_PASS) {
      onNavigate('admin');
      setShowAdminLogin(false);
      setPassword('');
    } else {
      setError('パスワードが正しくありません');
    }
  };

  return (
    <div className="animate-fade-in">
      <section className="text-center mb-12">
        <div className="inline-block px-4 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold mb-4">
          MOBILE ENTERTAINMENT VISION
        </div>
        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight text-slate-900">
          WARAKADO VISION<br />
          <span className="text-orange-500">OFFICIAL WEB SITE</span>
        </h2>
        <p className="text-slate-800 max-w-2xl mx-auto leading-relaxed font-medium">
          WARAKADO VISIONは、キッチンカーを起点とした「移動式エンターテインメント」を追求しています。
          食、癒やし、音楽、ノスタルジー。私たちは一人一人の笑顔のきっかけを創り出すことを使命としています。
        </p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-slate-100 hover:border-orange-200 text-center overflow-hidden"
          >
            <div className={`w-14 h-14 ${item.color} text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <h3 className="font-bold text-slate-900 break-words text-sm md:text-base">{item.title}</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-bold group-hover:text-orange-600 transition-colors">VIEW MORE</p>
          </button>
        ))}
      </div>

      <AdBanner slot="home-middle-ad" className="max-w-xl mx-auto" />

      <div className="bg-warakado-gradient rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-lg mt-8 mb-20">
        <div className="flex-1">
          <h3 className="text-2xl font-black mb-2">笑う門には福来る</h3>
          <p className="text-sm font-medium opacity-95 leading-relaxed mb-4">
            「WARAKADO」の由来は私たちの座右の銘。キッチンカーというエンターテインメントを通じて、
            北海道から全国へ、ニーズに沿った「福」を運びます。
          </p>
          <button 
            onClick={() => onNavigate('member')}
            className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold text-sm shadow-md hover:bg-orange-50 transition-colors"
          >
            会員登録で特典をゲット！
          </button>
        </div>
        <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
          <i className="fa-solid fa-face-smile text-7xl"></i>
        </div>
      </div>

      {/* 管理者ログインボタンセクション */}
      <section className="pt-20 pb-10 border-t border-slate-200">
        <div className="max-w-xs mx-auto text-center">
          <button 
            onClick={() => setShowAdminLogin(true)}
            className="text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto"
          >
            <i className="fa-solid fa-lock"></i>
            Administrator Access
          </button>
        </div>
      </section>

      {/* 管理者ログインモーダル */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-white/20 text-center animate-scale-in">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-xl mx-auto mb-4">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2 italic">ADMIN LOGIN</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">管理者用パスワードを入力してください</p>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="password" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-center text-xl font-mono tracking-widest outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                placeholder="••••••••"
                autoFocus
              />
              {error && <p className="text-[10px] text-red-500 font-black">{error}</p>}
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setPassword('');
                    setError('');
                  }}
                  className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-black text-xs hover:bg-slate-200 transition-colors"
                >
                  キャンセル
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-transform"
                >
                  ログイン
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
