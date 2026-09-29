import React, { useState, useRef, useEffect } from 'react';
import { CardData, CardTheme, CardOrientation } from '../types/card';
import { BusinessCardFront } from './BusinessCardFront';
import { BusinessCardBack } from './BusinessCardBack';
import { ActionButtons } from './ActionButtons';
import { Smartphone, Monitor, CreditCard, QrCode } from 'lucide-react';

interface CardContainerProps {
  data: CardData;
  theme: CardTheme;
  isFlipped: boolean;
  onFlip: () => void;
  onOpenQr: () => void;
  onOpenPrint: () => void;
  onShare: () => void;
  onSelectTheme: (theme: CardTheme) => void;
  onOpenEdit?: () => void;
  onOpenExport?: () => void;
}

const SWATCHES: { id: CardTheme; label: string; color: string; border?: string }[] = [
  { id: 'sand', label: '소프트 아이보리 (Soft Ivory)', color: '#f8f6f0', border: 'border border-amber-900/30 shadow-sm' },
  { id: 'cotton', label: '코튼 화이트 (Cotton White)', color: '#fcfcfb', border: 'border border-neutral-300' },
  { id: 'obsidian', label: '옵시디언 블랙 (Obsidian Black)', color: '#0c0c0d', border: 'border border-neutral-700' },
  { id: 'navy', label: '미드나잇 네이비 (Midnight Navy)', color: '#080e1a', border: 'border border-blue-900/60' },
  { id: 'emerald', label: '포레스트 그린 (Forest Emerald)', color: '#08140e', border: 'border border-emerald-800/60' },
  { id: 'burgundy', label: '임페리얼 버건디 (Imperial Burgundy)', color: '#15070b', border: 'border border-rose-900/60' },
];

export const CardContainer: React.FC<CardContainerProps> = ({
  data,
  theme,
  isFlipped,
  onFlip,
  onOpenQr,
  onOpenPrint,
  onShare,
  onSelectTheme,
  onOpenEdit,
  onOpenExport
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  // Orientation: Portrait (스마트폰 세로형) or Landscape (정통 가로형)
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

  // Subtle interactive 3D perspective tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;
    
    setRotateX(-normY * 8);
    setRotateY(normX * 8);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.14
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  const isPortrait = orientation === 'portrait';

  return (
    <div className={`w-full ${isPortrait ? 'max-w-[340px] sm:max-w-[360px]' : 'max-w-[560px]'} mx-auto select-none flex flex-col items-center transition-all duration-300`}>
      {/* Top Controls: Left Swatches & Right Viewport Controls */}
      <div className="flex items-center justify-between w-full px-1 mb-2.5">
        {/* Left: Tactile Material Swatches */}
        <div className="flex items-center gap-2" role="group" aria-label="명함 재질 선택">
          {SWATCHES.map((swatch) => {
            const isSelected = theme === swatch.id;
            return (
              <button
                key={swatch.id}
                onClick={() => onSelectTheme(swatch.id)}
                className={`relative w-3.5 h-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0c] scale-110 opacity-100 z-10' 
                    : 'opacity-45 hover:opacity-100 hover:scale-110'
                } ${swatch.border || 'border border-white/20'}`}
                style={{ backgroundColor: swatch.color }}
                title={`${swatch.label} 재질 적용`}
                aria-label={swatch.label}
              />
            );
          })}
        </div>

        {/* Right: Viewport Controls (2 Toggle Buttons) */}
        <div className="inline-flex items-center gap-1 text-neutral-400">
          {/* Toggle 1: Front / Back Flip */}
          <button
            onClick={onFlip}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer active:scale-95"
            title={isFlipped ? '명함 앞면으로 회전 (Front)' : '명함 뒷면으로 회전 (Back)'}
            aria-label={isFlipped ? '명함 앞면으로 회전' : '명함 뒷면으로 회전'}
          >
            {isFlipped ? (
              <CreditCard className="w-4 h-4" />
            ) : (
              <QrCode className="w-4 h-4" />
            )}
          </button>

          {/* Micro Hairline Divider */}
          <span className="w-px h-3.5 bg-neutral-800" />

          {/* Toggle 2: Orientation (Portrait / Landscape) */}
          <button
            onClick={() => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer active:scale-95"
            title={isPortrait ? '가로형 명함 보기 (Landscape)' : '세로형 명함 보기 (Portrait)'}
            aria-label={isPortrait ? '가로형 명함 보기' : '세로형 명함 보기'}
          >
            {isPortrait ? (
              <Monitor className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 3D Tactile Card Canvas */}
      <div 
        className="w-full [perspective:1400px] relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={cardRef}
          onClick={onFlip}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY + (isFlipped ? 180 : 0)}deg)`,
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative w-full cursor-pointer group shadow-[0_24px_64px_rgba(0,0,0,0.55)] rounded-2xl transition-shadow duration-300 hover:shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
          title="카드를 클릭하여 앞·뒷면 뒤집기"
        >
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

          {/* Dynamic Tactile Light Glare Sheen Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.opacity}) 0%, transparent 60%)`,
              zIndex: 30,
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          />
        </div>
      </div>

      {/* Bottom Actions: Borderless, Floating Pure Icons at the Card's Bottom Center (Balanced Dock) */}
      <div className="w-full mt-3 px-1 flex justify-center">
        <ActionButtons
          data={data}
          onOpenQr={onOpenQr}
          onOpenPrint={onOpenPrint}
          onShare={onShare}
          onOpenEdit={onOpenEdit}
          onOpenExport={onOpenExport}
        />
      </div>
    </div>
  );
};
