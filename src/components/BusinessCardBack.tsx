import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CardData, CardTheme, CardOrientation, CardLayoutType } from '../types/card';
import { resolveThemeStyles } from '../constants/templates';

interface BusinessCardBackProps {
  data: CardData;
  theme?: CardTheme;
  layout_type?: CardLayoutType;
  orientation?: CardOrientation;
  isPrintPreview?: boolean;
  backPhotoUrl?: string;
  hideBorder?: boolean;
  html_back?: string;
}

export const BusinessCardBack: React.FC<BusinessCardBackProps> = ({
  data,
  theme = 'sumi_ink',
  layout_type = 'editorial_minimal',
  orientation = 'landscape',
  isPrintPreview = false,
  backPhotoUrl,
  hideBorder = false,
  html_back
}) => {
  const [qrSvg, setQrSvg] = useState<string>('');

  const themeStyles = resolveThemeStyles(theme);
  const isLight = themeStyles.isLight;
  const isVerticalAtelier = layout_type === 'vertical_atelier';
  const isPortrait = isVerticalAtelier || orientation === 'portrait';

  // Custom HTML / Tailwind Injection Back Face Rendering
  if (html_back) {
    return (
      <div 
        className={`relative w-full h-full select-none overflow-hidden rounded-2xl ${
          isPrintPreview || hideBorder ? 'border-0' : `border border-white/10 shadow-2xl`
        } bg-[#0A0B0E] transition-all duration-300`}
        style={{ aspectRatio: isPortrait ? '5 / 8' : '9 / 5' }}
        dangerouslySetInnerHTML={{ __html: html_back }}
      />
    );
  }

  // If back photo is provided, render authentic back photo
  if (backPhotoUrl) {
    return (
      <div 
        className={`relative w-full h-full select-none overflow-hidden rounded-2xl ${
          isPrintPreview || hideBorder ? 'border-0' : `border ${themeStyles.border} shadow-2xl`
        } bg-[#0A0B0E] transition-all duration-300`}
        style={{ aspectRatio: isPortrait ? '5 / 8' : '9 / 5' }}
      >
        <img 
          src={backPhotoUrl} 
          alt="실물 명함 뒷면" 
          className="w-full h-full object-cover rounded-2xl"
        />
        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#C5A880] tracking-wider uppercase shadow-sm">
            BACK PHOTO
          </span>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Target domain for digital business card
    const targetUrl = data.website || 'https://card.goguma.app/master';
    QRCode.toString(targetUrl, {
      type: 'svg',
      margin: 0,
      color: {
        dark: isLight ? '#1F2023' : '#F8F4EB',
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

  return (
    <div 
      className={`relative w-full h-full select-none flex flex-col justify-between ${
        isPortrait
          ? 'p-5 sm:p-7'
          : isPrintPreview
            ? 'p-3.5 sm:p-4'
            : 'p-3.5 sm:p-6 md:p-8'
      } ${themeStyles.cardBg} ${isPrintPreview || hideBorder ? 'border-0' : `border ${themeStyles.border} shadow-2xl`} transition-colors duration-300 font-sans`}
      style={{
        aspectRatio: isPortrait ? '5 / 8' : '9 / 5',
      }}
    >
      {/* Subtle fine art paper grain texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.032] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '14px 14px'
        }}
      />

      {/* Center Statement */}
      <div className={`relative z-10 ${isPortrait ? 'my-auto py-3' : 'my-auto py-2'} text-center flex flex-col items-center justify-center space-y-1.5`}>
        <div className="space-y-0.5 sm:space-y-1">
          <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white break-keep whitespace-normal">
            {data.backTitle || '고구마 AI 스튜디오'}
          </h2>
          <p 
            className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C5A880]"
          >
            {data.backSubtitle || 'GOGUMA AI STUDIO'}
          </p>
        </div>

        {data.backTagline && (
          <div className="pt-0.5">
            <p className={`text-[9px] sm:text-[10px] font-semibold uppercase ${themeStyles.textSecondary} tracking-wider break-keep`}>
              {data.backTagline}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Area: Portrait has centered QR block; Landscape has row */}
      {isPortrait ? (
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-2 pt-3 border-t border-white/10 mt-auto w-full">
          <a
            href={data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group/qr hover:opacity-90 transition-opacity justify-center cursor-pointer"
            title={`${data.websiteDisplay} 바로가기`}
            onClick={(e) => e.stopPropagation()}
          >
            {qrSvg && (
              <div 
                className="w-11 h-11 p-1 rounded-lg bg-white/95 border border-white/10 flex items-center justify-center shrink-0 shadow-md [&>svg]:w-full [&>svg]:h-full mb-1"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
                title="디지털 명함 바로가기 QR 코드"
              />
            )}
            <p className={`font-mono text-[8px] ${themeStyles.textMuted}`}>SCAN TO CONNECT</p>
            <p className={`font-medium text-[10px] sm:text-[11px] ${themeStyles.textSecondary} group-hover/qr:underline underline-offset-2 truncate max-w-[200px]`}>
              {data.websiteDisplay}
            </p>
          </a>

          {(data.address_en || data.backHqAddress || data.addressKr) && (
            <p className={`text-[8px] sm:text-[9px] ${themeStyles.textMuted} truncate max-w-[220px]`}>
              HQ · {data.address_en || data.backHqAddress || data.addressKr}
            </p>
          )}
        </div>
      ) : (
        /* Landscape bottom bar */
        <div className="relative z-10 flex items-end justify-between w-full pt-3 border-t border-white/10 mt-auto">
          <a 
            href={data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group/qr hover:opacity-90 transition-opacity min-w-0 pr-2 cursor-pointer"
            title={`${data.websiteDisplay} 바로가기`}
            onClick={(e) => e.stopPropagation()}
          >
            {qrSvg && (
              <div 
                className="w-9 h-9 p-0.5 rounded-lg bg-white/95 border border-white/10 flex items-center justify-center shrink-0 shadow-sm [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
                title="디지털 명함 바로가기 QR 코드"
              />
            )}
            <div className="text-left leading-tight min-w-0">
              <p className={`font-mono text-[8px] ${themeStyles.textMuted}`}>SCAN TO CONNECT</p>
              <p className={`font-medium text-[10px] sm:text-[11px] ${themeStyles.textSecondary} group-hover/qr:underline underline-offset-2 truncate max-w-[150px] sm:max-w-[200px]`}>
                {data.websiteDisplay}
              </p>
            </div>
          </a>

          {(data.address_en || data.backHqAddress || data.addressKr) && (
            <div className="text-right shrink-0">
              <p className={`font-mono text-[8px] ${themeStyles.textMuted}`}>HQ</p>
              <p className={`text-[8px] sm:text-[9px] ${themeStyles.textSecondary} truncate max-w-[150px] sm:max-w-[180px]`}>
                {data.address_en || data.backHqAddress || data.addressKr}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
