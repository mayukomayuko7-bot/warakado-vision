
import React from 'react';
import { GOOGLE_FORM_LINKS } from '../constants';

const FoodBusiness: React.FC = () => {
  const products = [
    { 
      id: 'onigiri', 
      name: '手造り肉巻きおにぎり棒 (2本入)', 
      price: 1080, 
      description: '大樹町源ファームのホエー豚を使用。秘伝の甘辛ダレでじっくり焼き上げ、香ばしい胡麻を散らしました。レタスに巻いて食べるのがWARAKADO流！年間2,000本提供の絶対的エース商品です。',
      image: 'https://static.wixstatic.com/media/1f0d29_e5b0b9963d02469dbe9e02e3ee8a2501~mv2.jpg/v1/fill/w_740,h_508,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/1f0d29_e5b0b9963d02469dbe9e02e3ee8a2501~mv2.jpg'
    },
    { 
      id: 'butasuki', 
      name: '豚すき丼の素 (2食分)', 
      price: 864, 
      description: '源ファームホエー豚を甘じょっぱく煮立てた、キッチンカーの味をご家庭で。温めるだけで専門店の味。',
      image: 'https://static.wixstatic.com/media/1f0d29_17f57a7010b645a5a9601342c0fb74d2~mv2.jpg/v1/fill/w_740,h_416,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/1f0d29_17f57a7010b645a5a9601342c0fb74d2~mv2.jpg'
    }
  ];

  return (
    <div className="animate-fade-in space-y-12 text-slate-900">
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
          <h2 className="text-3xl font-black">WARAKADO food business</h2>
        </div>
        <p className="text-slate-800 mb-8 leading-relaxed font-medium">
          「1台のキッチンカーで3種類の専門店業態」という斬新なスタイルで、地元メディアにも多数紹介。
          食をエンターテインメントとして全国へお届けします。
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="text-orange-500 mb-4"><i className="fa-solid fa-burger text-4xl"></i></div>
            <h3 className="text-xl font-bold mb-2">WARAKADO cafe space</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">道内初のキッチンカーRICE BURGER専門店。お米の美味しさを新感覚で提案します。</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="text-orange-500 mb-4"><i className="fa-solid fa-bowl-rice text-4xl"></i></div>
            <h3 className="text-xl font-bold mb-2">Don cafe WARAYA</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              伝説の「卵かけご飯」を筆頭に、源ファームホエー豚の「帯広豚丼」、池田町産のねばりすたー等を使用した「とろろ飯」、極上の「豚すき丼」の4種を展開。
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="text-orange-500 mb-4"><i className="fa-solid fa-candy-cane text-4xl"></i></div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">帯広林檎飴専門店ふぞろいの林檎あめたち。</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              オリジナルテーマソング「林檎恋譜」と共に全道各地へ。大人も子供も夢中になる、こだわりの林檎飴。
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href={GOOGLE_FORM_LINKS.kitchenCarRequest}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-orange-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-orange-700 hover:-translate-y-1 transition-all"
          >
            <i className="fa-solid fa-calendar-check mr-2"></i>キッチンカー出店依頼はこちら
          </a>
        </div>
      </section>

      <section className="bg-slate-100 -mx-4 px-4 py-12 md:rounded-[4rem] rounded-[2rem]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black mb-2 text-slate-900">冷凍食品オンライン販売</h2>
            <p className="text-sm text-slate-600 font-bold uppercase tracking-wider">WARAKADO OFFICIAL SHOP</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm overflow-hidden flex flex-col group border border-slate-100 hover:border-orange-200 transition-all duration-300">
                <div className="aspect-video bg-slate-200 rounded-2xl mb-4 flex items-center justify-center overflow-hidden shadow-inner">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" 
                  />
                </div>
                <h3 className="font-bold text-lg mb-1 text-slate-900">{p.name}</h3>
                <p className="text-2xl font-black text-orange-600 mb-2">¥{p.price.toLocaleString()}<span className="text-sm text-slate-500 font-bold ml-1"> (税込)</span></p>
                <p className="text-sm text-slate-700 mb-6 flex-grow leading-relaxed font-medium">{p.description}</p>
                
                <div className="mt-auto">
                  <a 
                    href="https://warakado-vision.square.site/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                  >
                    <i className="fa-solid fa-cart-shopping text-lg"></i>
                    公式オンラインショップで購入
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white/60 border border-white p-6 rounded-2xl text-center">
            <p className="text-sm text-slate-700 font-medium mb-4">
              公式オンラインショップ（Square）にて各種クレジットカード決済等がご利用いただけます。
            </p>
            <a 
                href="https://warakado-vision.square.site/"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 font-black text-xs border-b border-orange-600 pb-0.5 hover:text-orange-700"
            >
                ショップページを開く
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FoodBusiness;
