import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CardData, CardTheme, CardOrientation } from '../types/card';

interface BusinessCardBackProps {
  data: CardData;
  theme: CardTheme;
  orientation?: CardOrientation;
  isPrintPreview?: boolean;
}

export const BusinessCardBack: React.FC<BusinessCardBackProps> = ({
  data,
  theme,
  orientation = 'landscape',
  isPrintPreview = false
}) => {
  const [qrSvg, setQrSvg] = useState<string>('');

  const isLight = theme === 'cotton' || theme === 'sand';
  const isPortrait = orientation === 'portrait';

  useEffect(() => {
    // Official production domain for digital business card
    const targetUrl = data.website || 'https://mrpark.koreancenter.net';
    QRCode.toString(targetUrl, {
      type: 'svg',
      margin: 0,
      color: {
        dark: isLight ? (theme === 'sand' ? '#27231f' : '#171717') : '#f5f5f5',
        light: '#00000000'
      },
      errorCorrectionLevel: 'M'
    })
      .then((svgString) => {
        setQrSvg(svgString);
      })
      .catch((err) => {
        console.error('Error generating QR', err);
      });
  }, [theme, isLight, data.website]);

  const themeStyles = {
    obsidian: {
      cardBg: 'bg-[#0c0c0d]',
      border: 'border-neutral-800/70',
      textPrimary: 'text-neutral-100',
      textSecondary: 'text-neutral-400',
      textMuted: 'text-neutral-500',
      tagline: 'text-neutral-300',
      hairline: 'border-neutral-800/60',
      qrBg: 'bg-neutral-900/80'
    },
    cotton: {
      cardBg: 'bg-[#fcfcfb]',
      border: 'border-neutral-200',
      textPrimary: 'text-neutral-900',
      textSecondary: 'text-neutral-600',
      textMuted: 'text-neutral-400',
      tagline: 'text-neutral-700',
      hairline: 'border-neutral-200/80',
      qrBg: 'bg-neutral-100/80'
    },
    titanium: {
      cardBg: 'bg-[#18181b]',
      border: 'border-zinc-700/60',
      textPrimary: 'text-zinc-100',
      textSecondary: 'text-zinc-400',
      textMuted: 'text-zinc-500',
      tagline: 'text-zinc-300',
      hairline: 'border-zinc-800/60',
      qrBg: 'bg-zinc-900/80'
    },
    navy: {
      cardBg: 'bg-[#080e1a]',
      border: 'border-slate-800/70',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-400',
      tagline: 'text-sky-300',
      hairline: 'border-slate-800/60',
      qrBg: 'bg-slate-900/80'
    },
    emerald: {
      cardBg: 'bg-[#08140e]',
      border: 'border-emerald-950/80 ring-1 ring-emerald-900/30',
      textPrimary: 'text-emerald-50',
      textSecondary: 'text-emerald-200/80',
      textMuted: 'text-emerald-400/60',
      tagline: 'text-amber-200/90',
      hairline: 'border-emerald-900/40',
      qrBg: 'bg-emerald-950/80'
    },
    sand: {
      cardBg: 'bg-[#f8f6f0]',
      border: 'border-[#ded7cb] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.55),0_0_1px_1px_rgba(255,255,255,0.08)]',
      textPrimary: 'text-[#191614]',
      textSecondary: 'text-[#484037]',
      textMuted: 'text-[#6b6155]',
      tagline: 'text-[#544b40]',
      hairline: 'border-[#ded6c9]',
      qrBg: 'bg-white'
    },
    burgundy: {
      cardBg: 'bg-[#15070b]',
      border: 'border-rose-950/70 ring-1 ring-rose-900/20',
      textPrimary: 'text-rose-50',
      textSecondary: 'text-rose-200/80',
      textMuted: 'text-rose-400/60',
      tagline: 'text-rose-200/90',
      hairline: 'border-rose-900/40',
      qrBg: 'bg-rose-950/80'
    },
    slate: {
      cardBg: 'bg-[#10151f]',
      border: 'border-slate-800/70',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-400',
      tagline: 'text-slate-300',
      hairline: 'border-slate-800/60',
      qrBg: 'bg-slate-900/80'
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
      {/* Subtle paper grain texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '16px 16px'
        }}
      />

      {/* Center National Brand Statement */}
      <div className={`relative z-10 ${isPortrait ? 'my-auto py-6' : 'my-auto'} text-center flex flex-col items-center justify-center space-y-2 sm:space-y-3`}>
        <div className="space-y-1 sm:space-y-1.5">
          <h2 className={`${
            isPortrait 
              ? 'text-xl sm:text-2xl'
              : isPrintPreview 
                ? 'text-base sm:text-lg' 
                : 'text-base sm:text-2xl md:text-[26px]'
          } font-bold tracking-tight ${themeStyles.textPrimary} break-keep whitespace-normal`}>
            대한민국이 브랜드입니다.
          </h2>
          <p className={`${
            isPortrait
              ? 'text-xs sm:text-sm tracking-[0.24em]'
              : isPrintPreview 
                ? 'text-[10px] sm:text-xs tracking-[0.2em]' 
                : 'text-[10px] sm:text-sm md:text-[14px] tracking-[0.22em]'
          } font-bold uppercase ${themeStyles.tagline}`}>
            KOREA IS THE BRAND.
          </p>
        </div>

        <div className="pt-0.5">
          <p className={`${
            isPortrait
              ? 'text-xs tracking-[0.16em]'
              : isPrintPreview 
                ? 'text-[9px] sm:text-[10px] tracking-[0.14em]' 
                : 'text-[9px] sm:text-[11px] md:text-xs tracking-[0.16em]'
          } font-semibold uppercase ${themeStyles.textSecondary} break-keep`}>
            Korean Studies Expert | Koreanist
          </p>
        </div>
      </div>

      {/* Bottom Area: Portrait has centered QR block; Landscape has row */}
      {isPortrait ? (
        <div className={`relative z-10 pt-4 border-t ${themeStyles.hairline} flex flex-col items-center justify-center text-center space-y-2.5`}>
          <a
            href={data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group/qr hover:opacity-90 transition-opacity"
            title={`${data.websiteDisplay} 바로가기`}
            onClick={(e) => e.stopPropagation()}
          >
            {qrSvg && (
              <div 
                className={`w-16 h-16 sm:w-20 sm:h-20 p-1.5 rounded-xl ${themeStyles.qrBg} border ${themeStyles.hairline} flex items-center justify-center shrink-0 shadow-md group-hover/qr:ring-1 group-hover/qr:ring-white/20 transition-all [&>svg]:w-full [&>svg]:h-full mb-1.5`}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
                title="디지털 명함 바로가기 QR 코드"
              />
            )}
            <p className={`font-mono text-[9px] ${themeStyles.textMuted}`}>SCAN TO CONNECT</p>
            <p className={`font-medium text-xs ${themeStyles.textSecondary} group-hover/qr:underline underline-offset-2`}>
              {data.websiteDisplay}
            </p>
          </a>

          <p className={`text-[10px] ${themeStyles.textMuted}`}>
            HQ · Bucheon-si, Republic of Korea
          </p>
        </div>
      ) : (
        /* Landscape bottom bar */
        <div className={`relative z-10 ${
          isPrintPreview ? 'pt-1.5 text-[9px]' : 'pt-2 sm:pt-3 text-[9px] sm:text-[11px]'
        } border-t ${themeStyles.hairline} flex items-center justify-between`}>
          <a 
            href={data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group/qr hover:opacity-90 transition-opacity"
            title={`${data.websiteDisplay} 바로가기`}
            onClick={(e) => e.stopPropagation()}
          >
            {qrSvg && (
              <div 
                className={`${
                  isPrintPreview ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-6 h-6 sm:w-8 sm:h-8'
                } p-0.5 sm:p-1 rounded ${themeStyles.qrBg} border ${themeStyles.hairline} flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full`}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
                title="디지털 명함 바로가기 QR 코드"
              />
            )}
            <div className="text-left leading-tight">
              <p className={`font-mono text-[8px] sm:text-[9px] ${themeStyles.textMuted}`}>SCAN TO CONNECT</p>
              <p className={`font-medium ${themeStyles.textSecondary} group-hover/qr:underline underline-offset-2`}>
                {data.websiteDisplay}
              </p>
            </div>
          </a>

          <div className="text-right">
            <p className={`font-mono text-[8px] sm:text-[9px] ${themeStyles.textMuted}`}>HQ</p>
            <p className={`${isPrintPreview ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[11px]'} ${themeStyles.textSecondary}`}>
              Bucheon-si, Republic of Korea
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
