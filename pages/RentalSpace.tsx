
import React from 'react';
import { GOOGLE_FORM_LINKS } from '../constants';

const RentalSpace: React.FC = () => {
  const items = [
    { name: 'キッチンカー (TOYOTA クイックデリバリーロング)', price: '20,000円/日' },
    { name: 'LPガスフライヤー 15L（ガス別）', price: '5,000円/日' },
    { name: '電気ホットスナックケース', price: '1,500円/日' },
    { name: '5.5升炊き LPG炊飯釜 (ガス別)', price: '3,000円/日' },
    { name: '電気保温ジャー 3升', price: '1,000円/日' },
    { name: 'LPガスサラマンダー (中・大型)（ガス別）', price: '5,000円/日' },
    { name: '大型鉄板焼きグリル（ガス別）', price: '20,000円/日' },
    { name: 'LPガス5口大型コンロ（ガス別）', price: '20,000円/日' },
    { name: '電気空冷式ビールサーバー (炭酸ガス込)', price: '2,000円〜6,000円/日' },
  ];

  return (
    <div className="animate-fade-in text-slate-900">
      <h2 className="text-3xl font-black mb-4 border-l-8 border-blue-500 pl-4">WARAKADO rental space</h2>
      <p className="text-slate-800 mb-8 leading-relaxed font-medium">
        これからキッチンカーを始めたい方、急な車両トラブルでお困りの方へ。
        TOYOTAクイックデリバリーのレンタルを承っております。また、各種厨房機器やイベント用アイテムのレンタルも可能です。
      </p>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <h3 className="font-bold text-blue-900 flex items-center gap-2">
            <i className="fa-solid fa-list-check"></i>
            レンタル価格一覧 (税別)
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {items.map((item, idx) => (
            <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
              <span className="font-bold text-slate-800">{item.name}</span>
              <span className="font-black text-blue-700">{item.price}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-600 text-white p-8 rounded-3xl flex flex-col items-center text-center shadow-lg">
        <i className="fa-solid fa-truck-ramp-box text-5xl mb-4"></i>
        <h3 className="text-xl font-bold mb-4">レンタル・出店サポートの依頼</h3>
        <p className="text-sm opacity-95 mb-6 max-w-md font-medium">
          車両の状態確認や空き状況、詳細な見積もりについては、下記フォームよりお気軽にお問い合わせください。
        </p>
        <a 
          href={GOOGLE_FORM_LINKS.rentalRequest}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-blue-700 px-8 py-3 rounded-full font-bold shadow-md hover:bg-blue-50 transition-colors"
        >
          レンタル依頼フォームへ
        </a>
      </div>
    </div>
  );
};

export default RentalSpace;
