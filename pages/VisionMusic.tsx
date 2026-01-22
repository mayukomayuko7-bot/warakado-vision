
import React from 'react';
import { GOOGLE_FORM_LINKS } from '../constants';

const VisionMusic: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="flex-1">
          <h2 className="text-3xl font-black mb-4 border-l-8 border-red-500 pl-4 text-slate-900">WARAKADO VISION MUSIC (WMVM)</h2>
          <p className="text-slate-800 leading-relaxed mb-6 font-medium">
            全道で活躍するキッチンカーのイメージソングを制作。音楽もまた、食と共に届けるエンターテインメントの形です。
          </p>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
            <h4 className="font-bold text-red-600 mb-1">所属アーティスト</h4>
            <p className="text-sm text-slate-900 font-bold">千田 源生 (Gensei Chida)</p>
            <p className="text-xs text-slate-600 mt-2 italic font-bold">
              AIソングライターとして、オリジナル2曲、キッチンカーテーマソング4曲をリリース。
            </p>
          </div>
        </div>
        
        {/* Album Art Section */}
        <a 
          href={GOOGLE_FORM_LINKS.hardTrackKitchenYoutube}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-64 aspect-square bg-slate-900 rounded-3xl shadow-2xl overflow-hidden relative group block cursor-pointer border border-slate-800"
        >
          <img 
            src="https://static.wixstatic.com/media/1f0d29_d022f6a271f143ad8c930fce28290358~mv2.png/v1/fill/w_560,h_560,al_c,lg_1,q_85,enc_auto/1f0d29_d022f6a271f143ad8c930fce28290358~mv2.png" 
            alt="HARD TRACK KITCHEN Vol.1 Album Art" 
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
            <i className="fa-brands fa-youtube text-6xl text-red-600 mb-2 drop-shadow-lg bg-white rounded-full p-1"></i>
            <span className="text-white font-black text-sm tracking-tighter drop-shadow-md">
              YouTubeで聴く
            </span>
          </div>
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
            <i className="fa-solid fa-guitar text-red-500"></i>
            PAPLICA
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed mb-6 font-medium">
            千田源生がプロデュースする架空POWER METAL BAND。
            キッチンカーのイメージソングを全編ハードロックに仕上げたコンピレーションアルバム「HARD TRACK KITCHEN Vol.1」が全世界で絶賛配信中。
          </p>
          <a 
            href={GOOGLE_FORM_LINKS.paplicaDistribution}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all inline-flex"
          >
            配信プラットフォームを確認 <i className="fa-solid fa-arrow-right-long"></i>
          </a>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
            <i className="fa-solid fa-music text-red-500"></i>
            テーマソング制作
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed mb-6 font-medium">
            「帯広林檎飴専門店ふぞろいの林檎あめたち。」の『林檎恋譜(りんごこいうた)』のように、貴店のブランドを象徴する一曲をプロデュースします。
          </p>
          <a 
            href={GOOGLE_FORM_LINKS.themeSongRequest}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-sm inline-block hover:bg-slate-800 transition-colors shadow-md"
          >
            制作の相談をする
          </a>
        </div>
      </div>
    </div>
  );
};

export default VisionMusic;
