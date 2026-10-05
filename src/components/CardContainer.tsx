import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CardData, CardTheme, CardOrientation, CardLayoutType, CardFeatures } from '../types/card';
import { BusinessCardFront } from './BusinessCardFront';
import { BusinessCardBack } from './BusinessCardBack';
import { ActionButtons } from './ActionButtons';

interface CardContainerProps {
  data: CardData;
  theme: CardTheme;
  layout_type?: CardLayoutType;
  card_features?: CardFeatures;
  isFlipped: boolean;
  onFlip: () => void;
  onOpenEdit?: () => void;
  onOpenShare: () => void;
  isPhotoCard?: boolean;
  photoUrl?: string;
  backPhotoUrl?: string;
  html_front?: string;
  html_back?: string;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  data,
  theme,
  layout_type = 'editorial_minimal',
  card_features,
  isFlipped,
  onFlip,
  onOpenEdit,
  onOpenShare,
  isPhotoCard = false,
  photoUrl,
  backPhotoUrl,
  html_front,
  html_back,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [orientation, setOrientation] = useState<CardOrientation>(() => 
    layout_type === 'vertical_atelier' ? 'portrait' : 'landscape'
  );

  // Sync orientation if layout changes to vertical atelier
  useEffect(() => {
    if (layout_type === 'vertical_atelier') {
      setOrientation('portrait');
    }
  }, [layout_type]);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);

  // Subtle tactile haptic vibration feedback for mobile devices (Vibration API)
  const triggerHapticFeedback = () => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(5);
      } catch {
        // Silently ignore if restricted by device or browser policy
      }
    }
  };

  const handleCardFlip = () => {
    triggerHapticFeedback();
    onFlip();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      handleCardFlip();
    }
    touchStartX.current = null;
  };

  const isVerticalAtelier = layout_type === 'vertical_atelier';
  const isPortrait = isVerticalAtelier || orientation === 'portrait';

  return (
    <motion.div 
      layout
      transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
      className={`w-full ${isPortrait ? 'max-w-[340px] sm:max-w-[370px]' : 'max-w-[560px]'} mx-auto select-none flex flex-col items-center`}
    >
      {/* 3D Tactile Card Canvas - Framer Motion flip with layout animation */}
      <motion.div 
        layout
        className="w-full [perspective:1400px] relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          ref={cardRef}
          layout
          onClick={handleCardFlip}
          animate={{ 
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{
            rotateY: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
            layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
          }}
          whileHover={{ scale: 1.012 }}
          whileTap={{ scale: 0.988 }}
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
          }}
          className="relative w-full cursor-pointer group shadow-[0_24px_64px_rgba(0,0,0,0.6)] rounded-2xl transition-shadow duration-300 hover:shadow-[0_32px_80px_rgba(0,0,0,0.75)]"
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
              layout_type={layout_type}
              card_features={card_features}
              orientation={orientation}
              isPhotoCard={isPhotoCard}
              photoUrl={photoUrl}
              html_front={html_front}
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
              layout_type={layout_type}
              orientation={orientation}
              backPhotoUrl={backPhotoUrl}
              html_back={html_back}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Actions: Centered beneath Card */}
      <motion.div layout className="w-full mt-4 px-1 flex justify-center">
        <ActionButtons
          data={data}
          onOpenEdit={onOpenEdit}
          onOpenShare={onOpenShare}
          isPhotoCard={isPhotoCard}
          orientation={orientation}
          onToggleOrientation={!isVerticalAtelier ? () => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait') : undefined}
        />
      </motion.div>
    </motion.div>
  );
};
