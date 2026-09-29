import React, { useState, useRef, useEffect } from 'react';
import { CardData, CardTheme, CardOrientation } from '../types/card';
import { BusinessCardFront } from './BusinessCardFront';
import { BusinessCardBack } from './BusinessCardBack';
import { ActionButtons } from './ActionButtons';
import { RefreshCw, Smartphone, Monitor } from 'lucide-react';

interface CardContainerProps {
  data: CardData;
  theme: CardTheme;
  isFlipped: boolean;
  onFlip: () => void;
  onOpenEdit?: () => void;
  onOpenShare: () => void;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  data,
  theme,
  isFlipped,
  onFlip,
  onOpenEdit,
  onOpenShare,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [orientation, setOrientation] = useState<CardOrientation>('landscape');

  // Automatically default to portrait on mobile screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setOrientation('portrait');
    }
  }, []);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      onFlip();
    }
    touchStartX.current = null;
  };

  const isPortrait = orientation === 'portrait';

  return (
    <div className={`w-full ${isPortrait ? 'max-w-[340px] sm:max-w-[360px]' : 'max-w-[560px]'} mx-auto select-none flex flex-col items-center transition-all duration-300`}>
      {/* Discreet Utility Bar Above Card: Orientation Toggle & Flip */}
      <div className="flex items-center justify-end w-full px-1 mb-2.5">
        <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-[#121318]/70 border border-white/5 text-neutral-400 text-xs">
          {/* Orientation Toggle (Landscape / Portrait) */}
          <button
            onClick={() => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
            className="p-1.5 rounded-full hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title={isPortrait ? '가로형 명함 보기' : '세로형 명함 보기'}
            aria-label="명함 방향 전환"
          >
            {isPortrait ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          </button>

          <span className="w-px h-3 bg-white/10" />

          {/* Discreet Flip Trigger */}
          <button
            onClick={onFlip}
            className="flex items-center gap-1 px-2 py-1 rounded-full hover:text-white hover:bg-white/5 transition-all cursor-pointer text-[11px]"
            title="앞·뒷면 뒤집기 (스페이스바)"
            aria-label="앞·뒷면 뒤집기"
          >
            <RefreshCw className="w-3 h-3 text-[#C5A880]" />
            <span className="text-[10px] text-neutral-400">{isFlipped ? '앞면' : '뒷면'}</span>
          </button>
        </div>
      </div>

      {/* 3D Tactile Card Canvas (Clean Matte, No Mouse Glare Follower) */}
      <div 
        className="w-full [perspective:1400px] relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={cardRef}
          onClick={onFlip}
          style={{
            transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative w-full cursor-pointer group shadow-[0_24px_64px_rgba(0,0,0,0.6)] rounded-2xl transition-shadow duration-300 hover:shadow-[0_32px_80px_rgba(0,0,0,0.75)]"
        >
          {/* Discreet Flip Indicator Badge on Top-Right Corner */}
          <div 
            className="absolute top-3 right-3 z-30 opacity-40 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 pointer-events-none"
            title="클릭하여 뒤집기"
          >
            <RefreshCw className="w-3 h-3 text-[#C5A880]" />
          </div>

          {/* Front Face */}
          <div 
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
            }}
            className="w-full h-full rounded-2xl overflow-hidden ring-1 ring-white/10"
          >
            <BusinessCardFront 
              data={data} 
              theme={theme} 
              orientation={orientation}
            />
          </div>

          {/* Back Face */}
          <div 
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
            }}
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden ring-1 ring-white/10"
          >
            <BusinessCardBack 
              data={data} 
              theme={theme} 
              orientation={orientation}
            />
          </div>
        </div>
      </div>

      {/* Bottom Actions: Centered beneath Card */}
      <div className="w-full mt-4 px-1 flex justify-center">
        <ActionButtons
          data={data}
          onOpenEdit={onOpenEdit}
          onOpenShare={onOpenShare}
        />
      </div>
    </div>
  );
};
