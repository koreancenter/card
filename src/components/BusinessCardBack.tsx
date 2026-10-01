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
}

export const BusinessCardBack: React.FC<BusinessCardBackProps> = ({
  data,
  theme = 'sumi_ink',
  layout_type = 'editorial_minimal',
  orientation = 'landscape',
  isPrintPreview = false,
  backPhotoUrl
}) => {
  const [qrSvg, setQrSvg] = useState<string>('');

  const themeStyles = resolveThemeStyles(theme);
  const isLight = themeStyles.isLight;
  const isVerticalAtelier = layout_type === 'vertical_atelier';
  const isPortrait = isVerticalAtelier || orientation === 'portrait';

  // If back photo is provided, render authentic back photo
  if (backPhotoUrl) {
    return (
      <div 
        className={`relative w-full h-full select-none overflow-hidden rounded-2xl ${
          isPrintPreview ? 'border-0' : `border ${themeStyles.border} shadow-2xl`
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
    const targetUrl = data.website || 'https://mrpark.koreancenter.net';
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
          ? 'p-6 sm:p-7'
          : isPrintPreview
            ? 'p-3.5 sm:p-4'
            : 'p-3.5 sm:p-6 md:p-8'
      } ${themeStyles.cardBg} ${isPrintPreview ? 'border-0' : `border ${themeStyles.border} shadow-2xl`} transition-colors duration-300 font-sans`}
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
          <p 
            className={`${
              isPortrait
                ? 'text-xs sm:text-sm tracking-[0.24em]'
                : isPrintPreview 
                  ? 'text-[10px] sm:text-xs tracking-[0.2em]' 
                  : 'text-[10px] sm:text-sm md:text-[14px] tracking-[0.22em]'
            } font-bold uppercase`}
            style={{ color: themeStyles.accent }}
          >
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
        <div className={`relative z-10 pt-4 border-t ${themeStyles.accentHairline} flex flex-col items-center justify-center text-center space-y-2.5`}>
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
                className={`w-16 h-16 sm:w-20 sm:h-20 p-1.5 rounded-xl ${themeStyles.qrBg} border ${themeStyles.accentHairline} flex items-center justify-center shrink-0 shadow-md group-hover/qr:ring-1 group-hover/qr:ring-white/20 transition-all [&>svg]:w-full [&>svg]:h-full mb-1.5`}
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
        } border-t ${themeStyles.accentHairline} flex items-center justify-between`}>
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
                } p-0.5 sm:p-1 rounded ${themeStyles.qrBg} border ${themeStyles.accentHairline} flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full`}
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
