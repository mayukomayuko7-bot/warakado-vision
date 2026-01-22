
import React from 'react';
import { GOOGLE_FORM_LINKS } from '../constants';

const DesignWorks: React.FC = () => {
  const services = [
    { icon: 'fa-note-sticky', title: 'メニューPOP製作', desc: '店頭で目を引く、美味しさが伝わるデザイン。' },
    { icon: 'fa-flag', title: 'のぼり旗・ポスター', desc: '遠くからでも視認性の高い販促ツールのデザイン。' },
    { icon: 'fa-scroll', title: 'ターポリン・幕', desc: 'キッチンカーの顔となるオリジナル幕の製作。' },
    { icon: 'fa-scissors', title: 'カッティングシート', desc: '車両や店舗を彩るオリジナルロゴステッカー。' },
    { icon: 'fa-video', title: 'PR・ショート動画編集', desc: 'SNS時代に欠かせない、魅力的な動画プロモーション。' },
  ];

  return (
    <div className="animate-fade-in text-slate-900">
      <h2 className="text-3xl font-black mb-4 border-l-8 border-pink-500 pl-4">WARAKADO design works</h2>
      <p className="text-slate-800 mb-12 leading-relaxed font-medium">
        飲食店運営の経験を活かし、現場で「本当に使える」デザインをご提案します。
        看板、ステッカーから動画編集まで、ブランディングをトータルサポート。
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {services.map((s, idx) => (
          <div key={idx} className="flex items-start gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <div>
              <h3 className="font-black text-slate-900 mb-1 tracking-tight">{s.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-slate-900 rounded-3xl p-8 text-white overflow-hidden relative shadow-xl">
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-4 italic tracking-widest text-pink-500">CREATIVE POWER</h3>
          <p className="text-sm text-slate-300 mb-6 max-w-md font-bold">
            一部外部委託を含め、各分野のスペシャリストと連携。あなたのビジネスを視覚からアップデートします。
          </p>
          <a 
            href={GOOGLE_FORM_LINKS.designRequest}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-pink-600 text-white px-8 py-3 rounded-full font-black hover:bg-pink-700 transition-colors shadow-lg active:scale-95"
          >
            お問い合わせ
          </a>
        </div>
        <i className="fa-solid fa-wand-magic-sparkles absolute -right-10 -bottom-10 text-[12rem] opacity-10"></i>
      </div>
    </div>
  );
};

export default DesignWorks;
