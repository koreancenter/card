import React, { useState, useRef, useEffect } from 'react';
import { StoredCard } from '../types/card';
import { 
  Briefcase, 
  ChevronDown, 
  Plus, 
  Star, 
  Check, 
  Copy, 
  Trash2, 
  Globe,
  ExternalLink
} from 'lucide-react';

interface MyCardSwitcherProps {
  myCards: StoredCard[];
  activeCardId: string;
  onSelectCard: (id: string) => void;
  onCreateNewCard: () => void;
  onDuplicateCard: (card: StoredCard) => void;
  onSetDefaultCard: (id: string) => void;
  onDeleteCard?: (id: string) => void;
}

export const MyCardSwitcher: React.FC<MyCardSwitcherProps> = ({
  myCards,
  activeCardId,
  onSelectCard,
  onCreateNewCard,
  onDuplicateCard,
  onSetDefaultCard,
  onDeleteCard
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCard = myCards.find(c => c.id === activeCardId) || myCards[0];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  if (!activeCard) return null;

  const themeColors: Record<string, string> = {
    sand: '#f8f6f0',
    cotton: '#fcfcfb',
    obsidian: '#0c0c0d',
    titanium: '#27272a',
    navy: '#0f172a',
    emerald: '#064e3b',
    burgundy: '#4c0519',
    slate: '#1e293b'
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 z-30" ref={dropdownRef}>
      {/* Active Profile Pill Selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-medium transition-all shadow-md active:scale-98 cursor-pointer group"
        title="내 다른 명함으로 전환하거나 새 명함 추가"
        aria-expanded={isOpen}
      >
        <span 
          className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20 shrink-0"
          style={{ backgroundColor: themeColors[activeCard.theme] || '#f8f6f0' }}
        />
        <div className="flex items-center gap-1.5 max-w-[200px] sm:max-w-[260px] truncate">
          <span className="font-semibold text-white truncate">
            {activeCard.data.organizationKr || activeCard.data.organization}
          </span>
          <span className="text-neutral-400 text-[11px] truncate hidden xs:inline">
            · {activeCard.data.titleKr || activeCard.data.title}
          </span>
        </div>
        {activeCard.isDefault && (
          <span title="기본 대표 명함" className="text-amber-400">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Quick "+ New Card" shortcut button */}
      <button
        onClick={onCreateNewCard}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs transition-all cursor-pointer shadow-md active:scale-95"
        title="새로운 직함 / 단체 명함 만들기"
      >
        <Plus className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline text-[11px] font-medium">새 명함</span>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[310px] sm:w-[360px] rounded-2xl bg-neutral-900/95 border border-neutral-800 shadow-2xl backdrop-blur-xl p-2 animate-in fade-in zoom-in-95 duration-150 z-50 text-neutral-200">
          <div className="px-3 py-2 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-semibold text-white">내 프로필 명함 목록</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              {myCards.length}개 보유
            </span>
          </div>

          {/* Cards List */}
          <div className="py-1 max-h-[260px] overflow-y-auto space-y-1">
            {myCards.map((card) => {
              const isSelected = card.id === activeCard.id;
              const displayDomain = card.data.websiteDisplay || card.data.website?.replace(/^https?:\/\//, '') || '도메인 미설정';

              return (
                <div
                  key={card.id}
                  onClick={() => {
                    onSelectCard(card.id);
                    setIsOpen(false);
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-800/90 text-white border border-neutral-700/60 shadow-sm'
                      : 'hover:bg-neutral-800/50 text-neutral-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20 shrink-0 mt-1"
                      style={{ backgroundColor: themeColors[card.theme] || '#f8f6f0' }}
                    />
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold truncate leading-tight text-white">
                          {card.data.organizationKr || card.data.organization}
                        </p>
                        {card.isDefault && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                            대표
                          </span>
                        )}
                        {card.customDomain && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono" title="개인 도메인 연결됨">
                            도메인
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {card.data.titleKr || card.data.title}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 group-hover:text-neutral-300">
                        <Globe className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{displayDomain}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions on right */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Make default button */}
                    <button
                      onClick={() => onSetDefaultCard(card.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        card.isDefault 
                          ? 'text-amber-400' 
                          : 'text-neutral-600 hover:text-amber-300 hover:bg-neutral-700/50 opacity-0 group-hover:opacity-100'
                      }`}
                      title={card.isDefault ? '대표 명함' : '이 명함을 기본 대표 명함으로 지정'}
                    >
                      <Star className={`w-3.5 h-3.5 ${card.isDefault ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* Delete secondary card if more than 1 */}
                    {myCards.length > 1 && onDeleteCard && !card.isDefault && (
                      <button
                        onClick={() => {
                          if (confirm(`'${card.data.organizationKr || card.data.organization}' 명함을 삭제하시겠습니까?`)) {
                            onDeleteCard(card.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-neutral-700/50 opacity-0 group-hover:opacity-100 transition-colors cursor-pointer"
                        title="이 명함 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Selected check */}
                    {isSelected && (
                      <span className="p-1 text-emerald-400 ml-1">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Creation Options */}
          <div className="pt-2 mt-1 border-t border-neutral-800/80 flex flex-col gap-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateNewCard();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>새 내 명함 만들기</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onDuplicateCard(activeCard);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200 text-[11px] transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>현재 명함 정보 복제하여 새로 만들기 (추천)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
