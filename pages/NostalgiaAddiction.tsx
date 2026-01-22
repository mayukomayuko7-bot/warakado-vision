import React from 'react';

const NostalgiaAddiction: React.FC = () => {
  return (
    <div className="animate-fade-in text-slate-900">
      <div className="relative h-64 md:h-80 bg-slate-950 rounded-[3rem] overflow-hidden mb-12 shadow-2xl">
        <img src="https://picsum.photos/seed/nostalgia/1200/800" className="w-full h-full object-cover opacity-60" alt="Nostalgic Addiction" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/30">
          <div className="px-3 py-1 bg-amber-600 text-white text-[10px] font-black rounded-full mb-4 tracking-widest uppercase shadow-md">
            New Business Division
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            nostalgic addiction
          </h2>
          <p className="text-white font-bold max-w-md text-sm md:text-base drop-shadow-md">
            移動式エンターテインメントの新たな地平。<br className="hidden md:block"/>古着と駄菓子で「あの日」の感動を。
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-12">
        <section className="text-center">
          <h3 className="text-2xl font-black mb-6 text-slate-900 italic underline decoration-amber-500 decoration-4 underline-offset-8">キッチンカー第2の活用法</h3>
          <p className="text-slate-800 leading-relaxed mb-8 font-medium">
            飽和状態のキッチンカー業界に、WARAKADOが投じる一石。
            それは単なる「飲食店」の枠を超えた、エンターテインメント空間の移動です。
            大好きな古着や駄菓子を積み込み、ノスタルジックな世界観を丸ごと必要な場所へ届けます。
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-inner border border-amber-100">
              <i className="fa-solid fa-shirt text-3xl text-amber-800"></i>
            </div>
            <h4 className="font-black text-slate-900 text-lg mb-2 tracking-wider">VINTAGE CLOTHING</h4>
            <p className="text-sm text-amber-900 font-bold italic">こだわり抜いた古着との出会い</p>
          </div>
          <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-inner border border-amber-100">
              <i className="fa-solid fa-cookie text-3xl text-amber-800"></i>
            </div>
            <h4 className="font-black text-slate-900 text-lg mb-2 tracking-wider">RETRO CANDY</h4>
            <p className="text-sm text-amber-900 font-bold italic">童心に帰る駄菓子体験</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-10 rounded-[3rem] text-center shadow-xl border border-white/10">
          <h3 className="text-xl font-black mb-6 tracking-widest text-amber-500 uppercase italic">OUR IDEAL VISION</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-bold italic">
            「必要な一人一人に、笑顔の入り口（門）を届ける」<br />
            WARAKADOが見つめる未来（VISION）が、この一台に凝縮されています。
          </p>
        </div>

        <div className="text-center pt-4 pb-8">
          <div className="inline-block text-[10px] text-slate-400 font-bold leading-relaxed">
            <p>古物商許可</p>
            <p>北海道公安委員会許可</p>
            <p>第134080001500号</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NostalgiaAddiction;