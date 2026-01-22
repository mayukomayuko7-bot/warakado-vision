import React from 'react';
import { GOOGLE_FORM_LINKS } from '../constants';
import { PageId, MemberInfo } from '../types';

interface TarotSpaceProps {
  onNavigate: (page: PageId) => void;
  member: MemberInfo | null;
}

const TarotSpace: React.FC<TarotSpaceProps> = ({ onNavigate, member }) => {
  return (
    <div className="animate-fade-in text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
        <i className="fa-solid fa-hat-wizard"></i>
      </div>
      <h2 className="text-3xl font-black mb-4 text-slate-900">WARAKADO tarot space</h2>
      <p className="text-slate-800 mb-12 leading-relaxed font-medium">
        タロット占い資格を保持するオーナー自らが鑑定を行います。<br/>
        会員登録をすると、専用タロットアプリが無料でご利用いただけます。
      </p>

      <div className="grid gap-6 mb-12">
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-10 rounded-[3rem] text-white shadow-xl border border-white/10">
          <h3 className="text-2xl font-black mb-4 flex items-center justify-center gap-3 text-white">
            <i className="fa-solid fa-mobile-screen-button text-orange-400"></i>
            会員限定タロットアプリ
          </h3>
          <p className="text-sm opacity-90 mb-8 font-bold leading-relaxed">
            WEB会員なら毎月3回まで無料、<br className="md:hidden"/>
            または1,000円/30回のクレジット付与のタロットプレミアムも！
          </p>
          
          {member ? (
            <button 
              onClick={() => onNavigate('member_tarot')}
              className="inline-block bg-orange-500 text-white px-10 py-4 rounded-full font-black text-sm hover:bg-orange-600 transition-all shadow-lg active:scale-95"
            >
              会員ページでアプリを使う
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => onNavigate('member')}
                className="inline-block bg-white text-purple-900 px-10 py-4 rounded-full font-black text-sm hover:bg-purple-50 transition-all shadow-lg active:scale-95"
              >
                会員登録（無料）をして占う
              </button>
              <p className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">Free trial 3 times / month</p>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-2 text-slate-900">本格個別鑑定・出店依頼</h3>
          <p className="text-purple-600 font-black text-2xl mb-4">¥1,000〜 <span className="text-sm font-bold text-slate-500">(税別)</span></p>
          <p className="text-sm text-slate-700 mb-6 font-medium">キッチンカーでの対面鑑定や、詳細なメール鑑定を承っております。</p>
          <a 
            href={GOOGLE_FORM_LINKS.tarotRequest}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg active:scale-95 mb-4"
          >
            鑑定・出店依頼フォーム
          </a>
          <p className="text-[10px] text-slate-400 font-bold italic">タロットリーディングマスター資格取得者</p>
        </div>
      </div>
    </div>
  );
};

export default TarotSpace;