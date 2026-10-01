import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StoredCard } from '../types/card';
import { BusinessCardFront } from './BusinessCardFront';
import { BusinessCardBack } from './BusinessCardBack';
import { ActionButtons } from './ActionButtons';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw 
} from 'lucide-react';

interface MyCardsCarouselProps {
  cards: StoredCard[];
  activeCardId: string;
  onSelectCard: (id: string) => void;
  onCreateNewCard: () => void;
  onOpenEdit?: (card: StoredCard) => void;
  onOpenShare: (card: StoredCard) => void;
}

export const MyCardsCarousel: React.FC<MyCardsCarouselProps> = ({
  cards,
  activeCardId,
  onSelectCard,
  onCreateNewCard,
  onOpenEdit,
  onOpenShare,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Total slides = real cards + 1 ghost card for adding new card
  const totalSlides = cards.length + 1;
  const ghostIndex = cards.length;

  const initialIndex = Math.max(0, cards.findIndex(c => c.id === activeCardId));
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex >= 0 ? initialIndex : 0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // If no personal cards exist, immediately present the centered "새 명함 만들기" ghost card
  if (cards.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8 px-4 animate-in fade-in duration-300">
        <div className="w-full max-w-[460px] sm:max-w-[500px] md:max-w-[540px]">
          <div 
            onClick={onCreateNewCard}
            className="w-full rounded-3xl border-2 border-dashed border-[#C5A880]/40 hover:border-[#C5A880] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 flex flex-col items-center justify-center p-8 sm:p-14 text-center group shadow-2xl cursor-pointer active:scale-[0.99]"
            style={{ aspectRatio: '9 / 5' }}
          >
            <div className="w-16 h-16 rounded-full border border-[#C5A880]/50 group-hover:border-[#C5A880] flex items-center justify-center text-[#C5A880] bg-[#C5A880]/15 group-hover:bg-[#C5A880]/25 group-hover:scale-110 transition-all duration-300 mb-4 shadow-lg">
              <Plus className="w-8 h-8 text-[#C5A880]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-[#C5A880] transition-colors">
              새 명함 만들기
            </h3>
            <p className="text-xs text-neutral-400 mt-2 max-w-[280px] leading-relaxed">
              등록된 내 명함이 없습니다. 첫 번째 럭셔리 디지털 명함을 만들어 보세요.
            </p>
            <span className="mt-5 px-5 py-2.5 rounded-xl bg-[#C5A880] text-black text-xs font-bold tracking-tight shadow-md group-hover:bg-[#d6b991] transition-all">
              지금 첫 명함 생성하기
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Sync currentIndex when activeCardId changes externally
  useEffect(() => {
    const idx = cards.findIndex(c => c.id === activeCardId);
    if (idx >= 0 && idx !== currentIndex) {
      setCurrentIndex(idx);
      setIsFlipped(false);
    }
  }, [activeCardId, cards]);

  const goToSlide = useCallback((newIndex: number) => {
    const bounded = Math.max(0, Math.min(newIndex, totalSlides - 1));
    setCurrentIndex(bounded);
    setIsFlipped(false);
    setDragOffset(0);

    if (bounded < cards.length) {
      onSelectCard(cards[bounded].id);
    }
  }, [totalSlides, cards, onSelectCard]);

  // Touch and Drag handling
  const startXRef = useRef<number | null>(null);
  const currentXRef = useRef<number | null>(null);
  const isMovedRef = useRef<boolean>(false);

  const handlePointerDown = (clientX: number) => {
    startXRef.current = clientX;
    currentXRef.current = clientX;
    isMovedRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (clientX: number) => {
    if (startXRef.current === null) return;
    const diff = clientX - startXRef.current;
    if (Math.abs(diff) > 4) {
      isMovedRef.current = true;
    }
    // Add resistance at bounds
    if ((currentIndex === 0 && diff > 0) || (currentIndex === totalSlides - 1 && diff < 0)) {
      setDragOffset(diff * 0.3);
    } else {
      setDragOffset(diff);
    }
  };

  const handlePointerUp = () => {
    if (startXRef.current === null) return;
    const diff = dragOffset;
    const threshold = 45; // pixels to trigger slide transition

    if (diff < -threshold && currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    } else if (diff > threshold && currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else {
      setDragOffset(0);
    }

    startXRef.current = null;
    currentXRef.current = null;
    setIsDragging(false);
  };

  // Keyboard navigation (ArrowLeft, ArrowRight, Space for flip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToSlide(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToSlide(currentIndex + 1);
      } else if (e.code === 'Space' && currentIndex < cards.length) {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length, goToSlide]);

  const activeCard = currentIndex < cards.length ? cards[currentIndex] : null;

  return (
    <div className="w-full flex flex-col items-center select-none overflow-hidden py-2 sm:py-4">
      {/* 1. Carousel Viewport Container */}
      <div 
        ref={containerRef}
        className="w-full max-w-5xl relative flex items-center justify-center min-h-[220px] sm:min-h-[290px] md:min-h-[330px] px-2 sm:px-4"
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        onTouchEnd={handlePointerUp}
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => isDragging && handlePointerMove(e.clientX)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
      >
        {/* Left Arrow (Desktop) */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(currentIndex - 1);
            }}
            className="hidden sm:flex absolute left-2 md:left-6 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-xl"
            title="이전 명함 보기"
            aria-label="이전 명함"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Arrow (Desktop) */}
        {currentIndex < totalSlides - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(currentIndex + 1);
            }}
            className="hidden sm:flex absolute right-2 md:right-6 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-xl"
            title="다음 명함 보기"
            aria-label="다음 명함"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Cards Deck Track */}
        <div 
          ref={trackRef}
          className="flex items-center transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(${-currentIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            width: '100%',
          }}
        >
          {/* Card Slides */}
          {cards.map((card, idx) => {
            const isCenter = idx === currentIndex;
            const isFlippedCard = isCenter && isFlipped;

            return (
              <div
                key={card.id}
                className="w-full shrink-0 flex items-center justify-center px-3 sm:px-8 transition-all duration-300"
                style={{
                  transform: isCenter ? 'scale(1)' : 'scale(0.92)',
                  opacity: isCenter ? 1 : 0.38,
                  transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease',
                  cursor: isCenter ? 'pointer' : 'pointer',
                  zIndex: isCenter ? 20 : 10,
                }}
                onClick={(e) => {
                  if (isMovedRef.current) return;
                  if (!isCenter) {
                    goToSlide(idx);
                  } else {
                    setIsFlipped(prev => !prev);
                  }
                }}
              >
                <div className="w-full max-w-[460px] sm:max-w-[500px] md:max-w-[540px] [perspective:1400px]">
                  {/* 3D Flip Card */}
                  <div
                    style={{
                      transform: `rotateY(${isFlippedCard ? 180 : 0}deg)`,
                      transformStyle: 'preserve-3d',
                      WebkitTransformStyle: 'preserve-3d',
                      transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className={`relative w-full rounded-2xl group transition-shadow duration-300 ${
                      isCenter 
                        ? 'shadow-[0_24px_64px_rgba(0,0,0,0.6)] hover:shadow-[0_32px_80px_rgba(0,0,0,0.75)]' 
                        : 'shadow-lg'
                    }`}
                  >
                    {/* Top-Right Discreet Flip Trigger Badge on Active Card */}
                    {isCenter && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFlipped(prev => !prev);
                        }}
                        className="absolute top-3 right-3 z-30 opacity-40 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/80 cursor-pointer hover:scale-105 active:scale-95"
                        title="앞·뒷면 뒤집기 (클릭)"
                      >
                        <RefreshCw className="w-3 h-3 text-[#C5A880]" />
                      </div>
                    )}

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
                        data={card.data} 
                        theme={card.theme} 
                        layout_type={card.layout_type}
                        card_features={card.card_features}
                        orientation={card.layout_type === 'vertical_atelier' ? 'portrait' : 'landscape'}
                        isPhotoCard={card.isPhotoCard}
                        photoUrl={card.scannedImage}
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
                        data={card.data} 
                        theme={card.theme} 
                        layout_type={card.layout_type}
                        orientation={card.layout_type === 'vertical_atelier' ? 'portrait' : 'landscape'}
                        backPhotoUrl={card.scannedImageBack}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Final Ghost Slide: "Add New Card" Slot */}
          <div
            className="w-full shrink-0 flex items-center justify-center px-3 sm:px-8 transition-all duration-300"
            style={{
              transform: currentIndex === ghostIndex ? 'scale(1)' : 'scale(0.92)',
              opacity: currentIndex === ghostIndex ? 1 : 0.38,
              transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease',
              cursor: 'pointer',
              zIndex: currentIndex === ghostIndex ? 20 : 10,
            }}
            onClick={() => {
              if (isMovedRef.current) return;
              if (currentIndex !== ghostIndex) {
                goToSlide(ghostIndex);
              } else {
                onCreateNewCard();
              }
            }}
          >
            <div className="w-full max-w-[460px] sm:max-w-[500px] md:max-w-[540px]">
              <div 
                className="w-full rounded-2xl border-2 border-dashed border-[#C5A880]/30 hover:border-[#C5A880]/70 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center justify-center p-8 sm:p-12 text-center group shadow-xl active:scale-[0.99]"
                style={{ aspectRatio: '9 / 5' }}
              >
                <div className="w-14 h-14 rounded-full border border-[#C5A880]/40 group-hover:border-[#C5A880] flex items-center justify-center text-[#C5A880] bg-[#C5A880]/10 group-hover:bg-[#C5A880]/20 group-hover:scale-110 transition-all duration-300 mb-3 shadow-inner">
                  <Plus className="w-7 h-7 text-[#C5A880]" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight group-hover:text-[#C5A880] transition-colors">
                  새 명함 만들기
                </h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-[240px] leading-relaxed">
                  새로운 직함이나 소속 단체 명함을 추가합니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bottom Actions Bar (Centered beneath Card) */}
      <div className="w-full flex justify-center px-4 mt-3 sm:mt-4 min-h-[38px]">
        {activeCard && (
          <ActionButtons
            data={activeCard.data}
            onOpenEdit={() => onOpenEdit && onOpenEdit(activeCard)}
            onOpenShare={() => onOpenShare(activeCard)}
            isPhotoCard={activeCard.isPhotoCard}
          />
        )}
      </div>
    </div>
  );
};
