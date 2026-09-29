import React, { useState, useRef, useEffect } from 'react';
import { CardTheme } from '../types/card';
import { Palette, ChevronDown, Check } from 'lucide-react';

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
}[] = [
  { id: 'obsidian', label: '옵시디언 블랙', shortLabel: '블랙', previewClass: 'bg-[#0c0c0d] border-neutral-700', dotColor: '#0c0c0d' },
  { id: 'cotton', label: '코튼 화이트', shortLabel: '화이트', previewClass: 'bg-[#fcfcfb] border-neutral-300', dotColor: '#fcfcfb' },
  { id: 'sand', label: '샌드 캐시미어', shortLabel: '샌드', previewClass: 'bg-[#f6f3ec] border-[#dfd8cb]', dotColor: '#f6f3ec' },
  { id: 'navy', label: '미드나잇 네이비', shortLabel: '네이비', previewClass: 'bg-[#080e1a] border-blue-900/60', dotColor: '#080e1a' },
  { id: 'emerald', label: '포레스트 그린', shortLabel: '그린', previewClass: 'bg-[#08140e] border-emerald-800/60', dotColor: '#08140e' },
  { id: 'burgundy', label: '임페리얼 버건디', shortLabel: '버건디', previewClass: 'bg-[#15070b] border-rose-900/60', dotColor: '#15070b' },
  { id: 'titanium', label: '티타늄 그레이', shortLabel: '티타늄', previewClass: 'bg-[#18181b] border-zinc-600', dotColor: '#18181b' },
  { id: 'slate', label: '노르딕 슬레이트', shortLabel: '슬레이트', previewClass: 'bg-[#10151f] border-slate-700', dotColor: '#10151f' }
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800 text-neutral-200 transition-all text-xs font-medium cursor-pointer shadow-sm active:scale-95"
        title="명함 피니시(색상) 선택"
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
        <div className="absolute right-0 mt-2 w-56 p-1.5 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 mb-1 border-b border-neutral-800/80">
            <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              Paper & Finish
            </p>
          </div>
          <div className="space-y-0.5 max-h-64 overflow-y-auto no-scrollbar">
            {THEMES.map((t) => {
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
                      ? 'bg-neutral-800 text-white font-medium' 
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className={`w-3.5 h-3.5 rounded-full border border-neutral-700/60 shadow-xs shrink-0 ${t.previewClass}`} 
                    />
                    <span className="text-xs">{t.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-neutral-200" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
