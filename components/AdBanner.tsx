
import React, { useEffect, useRef, useState } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ slot = 'default-slot', format = 'auto', className = '' }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!adRef.current || isInitialized) return;

    // ResizeObserverで要素の幅を監視
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // 幅が0より大きくなったらAdSenseを初期化
        if (entry.contentRect.width > 0) {
          try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setIsInitialized(true);
            observer.disconnect(); // 一度実行したら監視を止める
          } catch (e) {
            console.error('AdSense error:', e);
          }
        }
      }
    });

    observer.observe(adRef.current);

    return () => observer.disconnect();
  }, [isInitialized]);

  return (
    <div ref={adRef} className={`my-8 overflow-hidden text-center w-full min-w-[250px] ${className}`}>
      <p className="text-[10px] text-slate-500 font-black tracking-widest mb-2 uppercase">Sponsored</p>
      <div className="bg-transparent rounded-xl min-h-[100px] flex items-center justify-center w-full">
        {/* Actual Google AdSense Tag */}
        <ins className="adsbygoogle"
             style={{ display: 'block', minWidth: '250px', width: '100%' }}
             data-ad-client="ca-pub-2031354864666536"
             data-ad-slot={slot}
             data-ad-format={format}
             data-full-width-responsive="true"></ins>
      </div>
    </div>
  );
};

export default AdBanner;
