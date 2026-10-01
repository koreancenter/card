import React, { useState, useRef, useEffect } from 'react';
import { CardTheme } from '../types/card';
import { ChevronDown, Check } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: CardTheme;
  onSelectTheme: (theme: CardTheme) => void;
}

export const THEMES: { 
  id: CardTheme; 
  label: string; 
  shortLabel: string;
  previewClass: string;
  dotColor: string;
  accent: string;
  isCurated?: boolean;
}[] = [
  // 4 Curated Luxury Material Themes
  { id: 'sumi_ink', label: '수묵 인크 (Sumi Ink)', shortLabel: '수묵', previewClass: 'bg-[#0B0C10] border-[#33312B]', dotColor: '#0B0C10', accent: '#C5A880', isCurated: true },
  { id: 'warm_paper', label: '웜 페이퍼 (Fine Paper)', shortLabel: '웜 페이퍼', previewClass: 'bg-[#F8F4EB] border-[#D8D0C0]', dotColor: '#F8F4EB', accent: '#6B1D42', isCurated: true },
  { id: 'deep_forest', label: '딥 포레스트 (Emerald)', shortLabel: '에메랄드', previewClass: 'bg-[#0D1F18] border-[#1C362A]', dotColor: '#0D1F18', accent: '#C2A478', isCurated: true },
  { id: 'classic_navy', label: '클래식 네이비 (Midnight)', shortLabel: '네이비', previewClass: 'bg-[#0A1128] border-[#1E2C52]', dotColor: '#0A1128', accent: '#D0D9E8', isCurated: true },
  // Classic Archivist Options
  { id: 'obsidian', label: '옵시디언 블랙', shortLabel: '블랙', previewClass: 'bg-[#0c0c0d] border-neutral-700', dotColor: '#0c0c0d', accent: '#C5A880' },
  { id: 'sand', label: '샌드 캐시미어', shortLabel: '샌드', previewClass: 'bg-[#f6f3ec] border-[#dfd8cb]', dotColor: '#f6f3ec', accent: '#544b40' },
  { id: 'burgundy', label: '임페리얼 버건디', shortLabel: '버건디', previewClass: 'bg-[#15070b] border-rose-900/60', dotColor: '#15070b', accent: '#E6A5B8' },
  { id: 'titanium', label: '티타늄 그레이', shortLabel: '티타늄', previewClass: 'bg-[#18181b] border-zinc-600', dotColor: '#18181b', accent: '#A1A1AA' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Refined Luxury Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121318] hover:bg-[#181920] border border-white/10 text-neutral-200 transition-all text-xs font-medium cursor-pointer shadow-sm active:scale-95"
        title="명함 피니시 및 재질 테마 선택"
        aria-expanded={isOpen}
      >
        <span 
          className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20 shrink-0"
          style={{ backgroundColor: activeTheme.dotColor }}
        />
        <span className="text-[11px] font-sans tracking-tight text-neutral-300">
          {activeTheme.label}
        </span>
        <ChevronDown className={`w-3 h-3 text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Bespoke Palette Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-[#121318]/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 mb-1.5 border-b border-white/5 flex items-center justify-between">
            <p className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase">
              Curated Material Palettes
            </p>
          </div>
          
          <div className="space-y-0.5 max-h-72 overflow-y-auto no-scrollbar">
            <div className="px-2 py-1 text-[9px] text-neutral-400 font-semibold uppercase tracking-wider">
              프리미엄 럭셔리 팔레트
            </div>
            {THEMES.filter(t => t.isCurated).map((t) => {
              const isSelected = t.id === currentTheme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected 
                      ? 'bg-white/10 text-white font-medium' 
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className={`w-4 h-4 rounded-full border border-white/20 shadow-xs shrink-0 ${t.previewClass}`} 
                    />
                    <div className="leading-tight">
                      <span className="text-xs text-white block">{t.label}</span>
                      <span className="text-[9px] text-neutral-400 block" style={{ color: t.accent }}>
                        Accent • {t.accent}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C5A880]" />}
                </button>
              );
            })}

            <div className="px-2 pt-2.5 pb-1 text-[9px] text-neutral-400 font-semibold uppercase tracking-wider border-t border-white/5 mt-1">
              아카이브 클래식
            </div>
            {THEMES.filter(t => !t.isCurated).map((t) => {
              const isSelected = t.id === currentTheme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected 
                      ? 'bg-white/10 text-white font-medium' 
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className={`w-3.5 h-3.5 rounded-full border border-neutral-700/60 shadow-xs shrink-0 ${t.previewClass}`} 
                    />
                    <span className="text-xs text-neutral-300">{t.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-neutral-300" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
