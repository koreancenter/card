import React, { useState } from 'react';
import { CardData, CardTheme, CardOrientation } from '../types/card';
import { Phone, Mail, Globe, MapPin, Check, Copy, ArrowUpRight } from 'lucide-react';

interface BusinessCardFrontProps {
  data: CardData;
  theme: CardTheme;
  orientation?: CardOrientation;
  isPrintPreview?: boolean;
}

export const BusinessCardFront: React.FC<BusinessCardFrontProps> = ({
  data,
  theme,
  orientation = 'landscape',
  isPrintPreview = false
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (e: React.MouseEvent, text: string, key: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const isPortrait = orientation === 'portrait';

  // Theme styling definitions
  const themeStyles = {
    obsidian: {
      cardBg: 'bg-[#0c0c0d]',
      border: 'border-neutral-800/70',
      textPrimary: 'text-neutral-100',
      textSecondary: 'text-neutral-400',
      textMuted: 'text-neutral-500',
      accentHairline: 'border-neutral-800/50',
      tagline: 'text-neutral-400',
      hoverHighlight: 'hover:bg-neutral-800/40',
      sheen: 'from-neutral-800/20 via-transparent to-transparent'
    },
    cotton: {
      cardBg: 'bg-[#fcfcfb]',
      border: 'border-neutral-200',
      textPrimary: 'text-neutral-900',
      textSecondary: 'text-neutral-600',
      textMuted: 'text-neutral-400',
      accentHairline: 'border-neutral-200/80',
      tagline: 'text-neutral-500',
      hoverHighlight: 'hover:bg-neutral-100/70',
      sheen: 'from-white/60 via-transparent to-transparent'
    },
    titanium: {
      cardBg: 'bg-[#18181b]',
      border: 'border-zinc-700/60',
      textPrimary: 'text-zinc-100',
      textSecondary: 'text-zinc-400',
      textMuted: 'text-zinc-500',
      accentHairline: 'border-zinc-800/60',
      tagline: 'text-zinc-400',
      hoverHighlight: 'hover:bg-zinc-800/50',
      sheen: 'from-zinc-700/20 via-transparent to-transparent'
    },
    navy: {
      cardBg: 'bg-[#080e1a]',
      border: 'border-slate-800/70',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-400',
      accentHairline: 'border-slate-800/60',
      tagline: 'text-sky-300/80',
      hoverHighlight: 'hover:bg-slate-800/40',
      sheen: 'from-blue-900/20 via-transparent to-transparent'
    },
    emerald: {
      cardBg: 'bg-[#08140e]',
      border: 'border-emerald-950/80 ring-1 ring-emerald-900/30',
      textPrimary: 'text-emerald-50',
      textSecondary: 'text-emerald-200/80',
      textMuted: 'text-emerald-400/60',
      accentHairline: 'border-emerald-900/40',
      tagline: 'text-amber-300/80',
      hoverHighlight: 'hover:bg-emerald-900/30',
      sheen: 'from-emerald-800/20 via-transparent to-transparent'
    },
    sand: {
      cardBg: 'bg-[#f8f6f0]',
      border: 'border-[#ded7cb] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.55),0_0_1px_1px_rgba(255,255,255,0.08)]',
      textPrimary: 'text-[#191614]',
      textSecondary: 'text-[#484037]',
      textMuted: 'text-[#6b6155]',
      accentHairline: 'border-[#ded6c9]',
      tagline: 'text-[#544b40]',
      hoverHighlight: 'hover:bg-[#eae3d5]',
      sheen: 'from-white/70 via-transparent to-transparent'
    },
    burgundy: {
      cardBg: 'bg-[#15070b]',
      border: 'border-rose-950/70 ring-1 ring-rose-900/20',
      textPrimary: 'text-rose-50',
      textSecondary: 'text-rose-200/80',
      textMuted: 'text-rose-400/60',
      accentHairline: 'border-rose-900/40',
      tagline: 'text-rose-300/80',
      hoverHighlight: 'hover:bg-rose-950/40',
      sheen: 'from-rose-900/20 via-transparent to-transparent'
    },
    slate: {
      cardBg: 'bg-[#10151f]',
      border: 'border-slate-800/70',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-400',
      accentHairline: 'border-slate-800/60',
      tagline: 'text-slate-400',
      hoverHighlight: 'hover:bg-slate-800/40',
      sheen: 'from-slate-700/20 via-transparent to-transparent'
    }
  }[theme];

  return (
    <div 
      className={`relative w-full h-full select-none flex flex-col justify-between ${
        isPortrait
          ? 'p-6 sm:p-7'
          : isPrintPreview
            ? 'p-3.5 sm:p-4'
            : 'p-3.5 sm:p-6 md:p-8'
      } ${themeStyles.cardBg} ${isPrintPreview ? 'border-0' : `border ${themeStyles.border} shadow-2xl`} transition-colors duration-300 font-sans`}
      style={{
        aspectRatio: isPortrait ? '5 / 8' : '9 / 5',
      }}
    >
      {/* Subtle fine-art tactile paper texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '16px 16px'
        }}
      />

      {/* Top Header: Foundation / Network Name */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-0.5">
          <p className={`text-[9px] sm:text-[10px] tracking-tight font-medium ${themeStyles.textSecondary}`}>
            {data.organizationKr}
          </p>
          <h2 className={`${isPortrait ? 'text-sm font-bold' : isPrintPreview ? 'text-xs' : 'text-xs sm:text-sm'} font-semibold tracking-tight ${themeStyles.textPrimary}`}>
            {data.organization}
          </h2>
          <p className={`text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase ${themeStyles.textMuted}`}>
            FOUNDATION
          </p>
        </div>
      </div>

      {/* Center Section: Name & Position */}
      <div className={`relative z-10 ${isPortrait ? 'my-auto py-4 space-y-2' : isPrintPreview ? 'my-auto py-1' : 'my-auto py-1.5'}`}>
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-baseline gap-2">
            <h1 className={`${isPortrait ? 'text-2xl sm:text-3xl' : isPrintPreview ? 'text-lg sm:text-xl' : 'text-lg sm:text-2xl md:text-[26px]'} font-bold tracking-tight ${themeStyles.textPrimary}`}>
              {data.name}
            </h1>
            <span className={`text-xs sm:text-sm font-medium ${themeStyles.textMuted}`}>
              {data.nameKr}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <p className={`${isPortrait ? 'text-sm font-semibold' : isPrintPreview ? 'text-xs' : 'text-xs sm:text-sm'} font-medium tracking-wide ${themeStyles.textSecondary}`}>
              {data.title}
            </p>
            <span className={`text-[10px] sm:text-xs ${themeStyles.textMuted}`}>
              / {data.titleKr}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Direct Contacts & Physical Address */}
      <div className={`relative z-10 ${
        isPortrait 
          ? 'pt-4 space-y-3 text-xs border-t'
          : isPrintPreview 
            ? 'pt-1.5 gap-2 text-[10px] border-t grid grid-cols-1 sm:grid-cols-2' 
            : 'pt-2 sm:pt-3 gap-2 sm:gap-3 text-[10px] sm:text-xs border-t grid grid-cols-1 sm:grid-cols-2'
      } ${themeStyles.accentHairline}`}>
        {/* Contact list (Vertical stacks cleanly, Landscape splits cleanly) */}
        <div className={`${isPortrait ? 'space-y-2' : 'space-y-1'}`}>
          {/* Phone */}
          <div className="flex items-center group/item">
            <a 
              href={`tel:${data.phoneRaw}`}
              title="전화 걸기 (Call)"
              className={`inline-flex items-center gap-1.5 font-mono tabular-nums font-medium ${themeStyles.textPrimary} hover:opacity-80 transition-opacity rounded px-1 -mx-1 py-0.5 ${themeStyles.hoverHighlight}`}
            >
              <Phone className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${themeStyles.textMuted}`} />
              <span>{data.phone}</span>
              {!isPrintPreview && (
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity text-emerald-500" />
              )}
            </a>
            {!isPrintPreview && (
              <button 
                onClick={(e) => copyToClipboard(e, data.phone, 'phone')}
                title="전화번호 복사"
                className="ml-1 p-1 rounded opacity-0 group-hover/item:opacity-100 hover:bg-neutral-500/20 transition-all text-neutral-400 cursor-pointer"
              >
                {copiedKey === 'phone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center group/item">
            <a 
              href={`mailto:${data.email}`}
              title="이메일 작성 (Send Email)"
              className={`inline-flex items-center gap-1.5 font-medium ${themeStyles.textPrimary} hover:opacity-80 transition-opacity rounded px-1 -mx-1 py-0.5 ${themeStyles.hoverHighlight}`}
            >
              <Mail className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${themeStyles.textMuted}`} />
              <span className="truncate">{data.email}</span>
              {!isPrintPreview && (
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity text-emerald-500" />
              )}
            </a>
            {!isPrintPreview && (
              <button 
                onClick={(e) => copyToClipboard(e, data.email, 'email')}
                title="이메일 주소 복사"
                className="ml-1 p-1 rounded opacity-0 group-hover/item:opacity-100 hover:bg-neutral-500/20 transition-all text-neutral-400 cursor-pointer"
              >
                {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Website */}
          <div className="flex items-center group/item">
            <a 
              href={data.website}
              target="_blank"
              rel="noopener noreferrer"
              title="공식 홈페이지 열기 (Open Website)"
              className={`inline-flex items-center gap-1.5 font-medium ${themeStyles.textPrimary} hover:opacity-80 transition-opacity rounded px-1 -mx-1 py-0.5 ${themeStyles.hoverHighlight}`}
            >
              <Globe className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${themeStyles.textMuted}`} />
              <span>{data.websiteDisplay}</span>
            </a>
          </div>
        </div>

        {/* Address */}
        <div className={`flex flex-col justify-end text-[9px] sm:text-[10px] leading-snug ${isPortrait ? 'pt-1 border-t border-neutral-800/40' : ''}`}>
          <div className="flex items-start gap-1">
            <MapPin className={`w-3 h-3 shrink-0 mt-0.5 ${themeStyles.textMuted}`} />
            <div>
              <p className={`${themeStyles.textPrimary} font-medium`}>
                {data.addressLines[0]}
              </p>
              <p className={`${themeStyles.textSecondary}`}>
                {data.addressLines[1]}
              </p>
              <p className="text-[8px] sm:text-[9px] mt-0.5 text-neutral-500 truncate">
                {data.addressKr}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
