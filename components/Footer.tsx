import React from 'react';
import { PageId } from '../types';
import AdBanner from './AdBanner';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-black italic tracking-tighter mb-1 text-white">WARAKADO VISION</h2>
          <p className="text-sm text-slate-300 font-medium">一人一人の「笑顔の門」きっかけに</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-bold text-slate-300">
          <button onClick={() => onNavigate('home')} className="hover:text-orange-400 transition-colors">Home</button>
          <button onClick={() => onNavigate('food')} className="hover:text-orange-400 transition-colors">Food</button>
          <button onClick={() => onNavigate('rental')} className="hover:text-orange-400 transition-colors">Rental</button>
          <button onClick={() => onNavigate('tarot')} className="hover:text-orange-400 transition-colors">Tarot</button>
          <button onClick={() => onNavigate('design')} className="hover:text-orange-400 transition-colors">Design</button>
          <button onClick={() => onNavigate('music')} className="hover:text-orange-400 transition-colors">Music</button>
          <button onClick={() => onNavigate('nostalgia')} className="hover:text-orange-400 transition-colors">Nostalgia</button>
        </div>

        <div className="mb-12">
          <p className="text-sm font-bold text-white mb-4">キッチンカー出店情報はこちら</p>
          <div className="flex justify-center gap-8">
            <a 
              href="https://www.instagram.com/warakado_cafe_space/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors border-2 border-slate-700 group-hover:border-orange-400">
                <i className="fa-brands fa-instagram text-3xl"></i>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-white font-bold">cafe space</span>
            </a>
            <a 
              href="https://www.instagram.com/fuzoroino_ringo/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors border-2 border-slate-700 group-hover:border-orange-400">
                <i className="fa-brands fa-instagram text-3xl"></i>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-white font-bold">林檎あめたち</span>
            </a>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mb-8">
          <AdBanner slot="footer-ad" className="bg-slate-800/50 p-4 rounded-2xl" />
        </div>

        <p className="text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} WARAKADO VISION. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;