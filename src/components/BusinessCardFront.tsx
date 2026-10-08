import React, { useState } from 'react';
import { CardData, CardTheme, CardOrientation, CardLayoutType, CardFeatures } from '../types/card';
import { resolveThemeStyles, generateMonogram } from '../constants/templates';
import { Phone, Mail, Globe, MapPin, Check, Copy, ArrowUpRight } from 'lucide-react';

interface BusinessCardFrontProps {
  data: CardData;
  theme?: CardTheme;
  layout_type?: CardLayoutType;
  card_features?: CardFeatures;
  orientation?: CardOrientation;
  isPrintPreview?: boolean;
  isPhotoCard?: boolean;
  photoUrl?: string;
  hideBorder?: boolean;
  html_front?: string;
}

export const BusinessCardFront: React.FC<BusinessCardFrontProps> = ({
  data,
  theme = 'sumi_ink',
  layout_type = 'editorial_minimal',
  card_features,
  orientation = 'landscape',
  isPrintPreview = false,
  isPhotoCard = false,
  photoUrl,
  hideBorder = false,
  html_front
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (e: React.MouseEvent, text: string, key: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const isVerticalAtelier = layout_type === 'vertical_atelier';
  const isPortrait = isVerticalAtelier || orientation === 'portrait';
  const themeStyles = resolveThemeStyles(theme);

  // Custom HTML / Tailwind Injection Face Rendering
  if (html_front) {
    return (
      <div 
        className={`relative w-full h-full select-none overflow-hidden rounded-2xl ${
          isPrintPreview || hideBorder ? 'border-0' : `border border-white/10 shadow-2xl`
        } bg-[#0A0B0E] transition-all duration-300`}
        style={{ aspectRatio: isPortrait ? '5 / 8' : '9 / 5' }}
        dangerouslySetInnerHTML={{ __html: html_front }}
      />
    );
  }

  // Authentic Physical Card Photo Face Rendering
  if (isPhotoCard && photoUrl) {
    return (
      <div 
        className={`relative w-full h-full select-none overflow-hidden rounded-2xl ${
          isPrintPreview || hideBorder ? 'border-0' : `border ${themeStyles.border} shadow-2xl`
        } bg-[#0A0B0E] transition-all duration-300`}
        style={{ aspectRatio: isPortrait ? '5 / 8' : '9 / 5' }}
      >
        {/* Authentic High-Resolution Cropped Physical Card Photo */}
        <img 
          src={photoUrl} 
          alt={data.name || '실물 명함 사진'} 
          className="w-full h-full object-cover rounded-2xl"
        />

        {/* Paper texture sheen */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '14px 14px'
          }}
        />

        {/* Top-Right Badge: Authentic Physical Archive */}
        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#C5A880] tracking-wider uppercase shadow-sm">
            PHOTO ARCHIVE
          </span>
        </div>

        {/* Subtle Bottom Utility Overlay: Quick Contact Floating Info */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-6 flex items-end justify-between text-white">
          <div className="min-w-0 pr-2">
            <h3 className="font-bold text-xs sm:text-sm tracking-tight text-white drop-shadow-sm truncate">
              {data.name}
            </h3>
            {data.organization && (
              <p className="text-[10px] text-neutral-300 drop-shadow-sm line-clamp-1">
                {data.organization}
              </p>
            )}
          </div>
          {data.phone && (
            <span className="text-[10px] sm:text-[11px] font-mono text-[#C5A880] drop-shadow-sm tabular-nums shrink-0 font-medium">
              {data.phone}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Field toggles with defaults
  const showEnName = card_features?.show_en_name !== false;
  const showSubOrg = card_features?.show_sub_org !== false;
  const showAddress = card_features?.show_address !== false;
  const customLogo = card_features?.custom_logo;
  const monogram = card_features?.monogram_text || generateMonogram(data.name, data.nameKr);

  // English address resolution without hardcoded placeholder defaults
  const rawAddressEn = (
    data.address_en ||
    data.details?.address_en ||
    (data as any).addressEn ||
    (data.addressLines && data.addressLines.length > 0 ? data.addressLines.join(', ') : '')
  ).trim();

  // Remove hardcoded default string "77 Cheongdam-ro, Gangnam-gu, Seoul 06015, Republic of Korea"
  const isHardcodedPlaceholder = 
    rawAddressEn.includes('77 Cheongdam-ro') && 
    (rawAddressEn.includes('06015') || rawAddressEn.includes('Republic of Korea'));
  const enAddress = isHardcodedPlaceholder ? '' : rawAddressEn;

  // Subtle paper texture overlay (Fine tactile art paper)
  const textureOverlay = (
    <div 
      className="absolute inset-0 pointer-events-none opacity-[0.032] mix-blend-overlay"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '14px 14px'
      }}
    />
  );

  // Top-right Logo: Only render if a custom logo image is explicitly uploaded (no awkward initial badges)
  const cornerMark = customLogo && layout_type !== 'monogram_executive' ? (
    <div className="shrink-0 flex items-center justify-center">
      <img 
        src={customLogo} 
        alt="Custom Logo" 
        className="h-6 w-auto max-w-[64px] object-contain rounded opacity-90" 
      />
    </div>
  ) : null;

  // =========================================================================
  // 1. MONOGRAM EXECUTIVE LAYOUT
  // =========================================================================
  if (layout_type === 'monogram_executive') {
    return (
      <div 
        className={`relative w-full h-full select-none flex flex-col justify-between ${
          isPortrait ? 'p-5 sm:p-7' : isPrintPreview ? 'p-3.5 sm:p-4' : 'p-4 sm:p-6 md:p-7'
        } ${themeStyles.cardBg} ${isPrintPreview || hideBorder ? 'border-0' : `border ${themeStyles.border}`} transition-colors duration-300 font-sans`}
        style={{ aspectRatio: isPortrait ? '5 / 8' : '9 / 5' }}
      >
        {textureOverlay}

        {/* Top Centered Monogram Seal */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-1 text-center space-y-1.5">
          {customLogo ? (
            <img 
              src={customLogo} 
              alt="Executive Logo" 
              className="h-9 sm:h-10 w-auto max-w-[120px] object-contain mb-1 opacity-95" 
            />
          ) : (
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center shadow-inner relative group"
              style={{ borderColor: `${themeStyles.accent}70`, backgroundColor: `${themeStyles.accent}12` }}
            >
              <span 
                className="font-serif text-xs sm:text-sm font-bold tracking-widest leading-none"
                style={{ color: themeStyles.accent }}
              >
                {monogram}
              </span>
            </div>
          )}

          <div className="space-y-0.5">
            <h2 className={`text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase leading-tight ${themeStyles.textSecondary}`}>
              {data.organizationKr || data.organization}
            </h2>
            {showSubOrg && data.organization && (
              <p className={`text-[8px] sm:text-[9px] tracking-[0.16em] uppercase leading-tight ${themeStyles.textMuted}`}>
                {data.organization}
              </p>
            )}
          </div>
        </div>

        {/* Center: Executive Name & Title in Classical Serif Balance */}
        <div className="relative z-10 my-auto py-1 text-center space-y-0.5">
          <div className="space-y-0.5">
            <h1 className={`${isPrintPreview ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-[25px]'} font-serif font-bold tracking-tight leading-tight ${themeStyles.textPrimary}`}>
              {data.name}
            </h1>
            {showEnName && data.nameKr && (
              <p className={`text-xs sm:text-sm font-medium tracking-wide leading-tight ${themeStyles.textMuted}`}>
                {data.nameKr}
              </p>
            )}
          </div>

          <div className="pt-0.5 flex items-center justify-center gap-1.5">
            <span className="w-4 h-px" style={{ backgroundColor: `${themeStyles.accent}50` }} />
            <p className={`text-[10px] sm:text-xs font-medium tracking-wider uppercase leading-tight ${themeStyles.textSecondary}`}>
              {data.title}
              {data.titleKr && <span className={`ml-1 text-[9px] ${themeStyles.textMuted}`}>/ {data.titleKr}</span>}
            </p>
            <span className="w-4 h-px" style={{ backgroundColor: `${themeStyles.accent}50` }} />
          </div>
        </div>

        {/* Bottom Contacts & Optional Address */}
        <div className={`relative z-10 pt-1.5 border-t ${themeStyles.accentHairline} text-center space-y-0.5`}>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[9px] sm:text-[10px] leading-tight">
            {data.phone && (
              <a 
                href={`tel:${data.phoneRaw}`} 
                className={`whitespace-nowrap flex items-center gap-1.5 text-xs tracking-tight font-mono ${themeStyles.textPrimary} hover:opacity-75`}
              >
                <Phone className={`w-3.5 h-3.5 shrink-0 ${themeStyles.textMuted}`} />
                <span>{data.phone}</span>
              </a>
            )}
            {data.email && (
              <>
                <span className={themeStyles.textMuted}>•</span>
                <a href={`mailto:${data.email}`} className={`whitespace-nowrap flex items-center gap-1 text-xs tracking-tight ${themeStyles.textPrimary} hover:opacity-75`}>
                  <Mail className={`w-3.5 h-3.5 shrink-0 ${themeStyles.textMuted}`} />
                  <span className="truncate max-w-[180px]">{data.email}</span>
                </a>
              </>
            )}
            {data.website && (
              <>
                <span className={themeStyles.textMuted}>•</span>
                <a href={data.website} target="_blank" rel="noopener noreferrer" className={`whitespace-nowrap flex items-center gap-1 text-xs tracking-tight ${themeStyles.textPrimary} hover:opacity-75`}>
                  <Globe className={`w-3.5 h-3.5 shrink-0 ${themeStyles.textMuted}`} />
                  <span className="truncate max-w-[150px]">{data.websiteDisplay}</span>
                </a>
              </>
            )}
          </div>

          {showAddress && (enAddress || data.addressKr) && (
            <div className="space-y-0.5 px-4 text-center">
              {enAddress && (
                <p className={`text-[8px] sm:text-[9px] ${themeStyles.textPrimary} truncate leading-tight`}>
                  {enAddress}
                </p>
              )}
              {data.addressKr && (
                <p className={`text-[8px] sm:text-[9px] ${themeStyles.textMuted} truncate leading-tight`}>
                  {data.addressKr}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. VERTICAL ATELIER LAYOUT (Vertical-oriented 5:8, architectural restraint)
  // =========================================================================
  if (layout_type === 'vertical_atelier') {
    return (
      <div 
        className={`relative w-full h-full select-none flex flex-col justify-between p-5 sm:p-7 ${themeStyles.cardBg} ${
          isPrintPreview || hideBorder ? 'border-0' : `border ${themeStyles.border}`
        } transition-colors duration-300 font-sans`}
        style={{ aspectRatio: '5 / 8' }}
      >
        {textureOverlay}

        {/* Header: Micro Atelier Branding */}
        <div className="relative z-10 flex items-start justify-between border-b pb-3" style={{ borderColor: `${themeStyles.accent}30` }}>
          <div>
            <p className="text-[8px] font-mono tracking-[0.25em] uppercase" style={{ color: themeStyles.accent }}>
              ATELIER ARCHIVE
            </p>
            <h2 className={`text-xs font-bold tracking-tight mt-0.5 ${themeStyles.textPrimary}`}>
              {data.organizationKr || data.organization}
            </h2>
            {showSubOrg && data.organization && (
              <p className={`text-[9px] tracking-wide ${themeStyles.textMuted}`}>
                {data.organization}
              </p>
            )}
          </div>
          {cornerMark}
        </div>

        {/* Body: Prominent Vertical Name & Title */}
        <div className="relative z-10 my-auto py-4 space-y-3">
          <div className="space-y-1">
            <h1 className={`text-2xl sm:text-3xl font-light tracking-tight ${themeStyles.textPrimary}`}>
              {data.name}
            </h1>
            {showEnName && data.nameKr && (
              <p className={`text-sm font-semibold tracking-normal ${themeStyles.textSecondary}`}>
                {data.nameKr}
              </p>
            )}
          </div>

          <div className="pt-2">
            <div className="w-6 h-px mb-2" style={{ backgroundColor: themeStyles.accent }} />
            <p className={`text-xs font-medium tracking-wide ${themeStyles.textPrimary}`}>
              {data.title}
            </p>
            {data.titleKr && (
              <p className={`text-[10px] ${themeStyles.textMuted}`}>
                {data.titleKr}
              </p>
            )}
          </div>
        </div>

        {/* Footer: Micro Metadata Rail */}
        <div className="relative z-10 border-t pt-3 space-y-2 text-[10px]" style={{ borderColor: `${themeStyles.accent}30` }}>
          <div className="space-y-1 font-mono text-[9px] sm:text-[10px]">
            {data.phone && (
              <div className="flex items-center justify-between whitespace-nowrap gap-2">
                <span className={`text-[8px] uppercase tracking-wider ${themeStyles.textMuted}`}>TEL</span>
                <a 
                  href={`tel:${data.phoneRaw}`} 
                  className={`whitespace-nowrap flex items-center gap-1.5 text-xs tracking-tight ${themeStyles.textPrimary} tabular-nums hover:underline font-mono`}
                >
                  <span>{data.phone}</span>
                </a>
              </div>
            )}
            {data.email && (
              <div className="flex items-center justify-between whitespace-nowrap gap-2">
                <span className={`text-[8px] uppercase tracking-wider ${themeStyles.textMuted}`}>MAIL</span>
                <a href={`mailto:${data.email}`} className={`${themeStyles.textPrimary} truncate max-w-[170px] hover:underline`}>
                  {data.email}
                </a>
              </div>
            )}
            {data.website && (
              <div className="flex items-center justify-between whitespace-nowrap gap-2">
                <span className={`text-[8px] uppercase tracking-wider ${themeStyles.textMuted}`}>WEB</span>
                <a href={data.website} target="_blank" rel="noopener noreferrer" className={`${themeStyles.textPrimary} hover:underline`}>
                  {data.websiteDisplay}
                </a>
              </div>
            )}
          </div>

          {showAddress && (enAddress || data.addressKr) && (
            <div className={`pt-1.5 border-t text-[8px] sm:text-[9px] ${themeStyles.textMuted} leading-tight space-y-0.5`} style={{ borderColor: `${themeStyles.accent}20` }}>
              {enAddress && <p className={`${themeStyles.textPrimary} truncate`}>{enAddress}</p>}
              {data.addressKr && <p className="truncate">{data.addressKr}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. SWISS TYPO BOLD LAYOUT (High-contrast grotesque, left-aligned stark grid)
  // =========================================================================
  if (layout_type === 'swiss_typo_bold') {
    return (
      <div 
        className={`relative w-full h-full select-none flex flex-col justify-between ${
          isPortrait ? 'p-5 sm:p-7' : isPrintPreview ? 'p-3 sm:p-4' : 'p-4 sm:p-6 md:p-7'
        } ${themeStyles.cardBg} ${isPrintPreview || hideBorder ? 'border-0' : `border ${themeStyles.border}`} transition-colors duration-300 font-sans`}
        style={{ aspectRatio: isPortrait ? '5 / 8' : '9 / 5' }}
      >
        {textureOverlay}

        {/* Top: Stark Clean Organization Grid */}
        <div className="relative z-10 flex items-start justify-between border-b pb-2 sm:pb-2.5" style={{ borderColor: `${themeStyles.accent}40` }}>
          <div>
            <h2 className={`text-xs sm:text-sm font-black tracking-tighter uppercase ${themeStyles.textPrimary}`}>
              {data.organization}
            </h2>
            {showSubOrg && data.organizationKr && (
              <p className={`text-[9px] sm:text-[10px] font-medium tracking-tight mt-0.5 ${themeStyles.textSecondary}`}>
                {data.organizationKr}
              </p>
            )}
          </div>
          {cornerMark}
        </div>

        {/* Center: Bold Name Presence */}
        <div className="relative z-10 my-auto py-2 space-y-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className={`${isPrintPreview ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-[28px]'} font-black tracking-tight uppercase ${themeStyles.textPrimary}`}>
              {data.name}
            </h1>
            {showEnName && data.nameKr && (
              <span className={`text-xs sm:text-sm font-bold ${themeStyles.textSecondary}`}>
                {data.nameKr}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5" style={{ backgroundColor: themeStyles.accent }} />
            <p className={`text-xs sm:text-sm font-bold tracking-tight uppercase ${themeStyles.textPrimary}`}>
              {data.title}
              {data.titleKr && <span className={`font-normal text-xs ml-1.5 ${themeStyles.textMuted}`}>/ {data.titleKr}</span>}
            </p>
          </div>
        </div>

        {/* Bottom: Swiss Metadata Grid with Fixed-width micro labels */}
        <div className={`relative z-10 pt-2 border-t ${themeStyles.accentHairline} grid ${isPortrait ? 'grid-cols-1 gap-1.5' : 'grid-cols-[auto_1fr] gap-2'} text-[9px] sm:text-[10px]`}>
          <div className="space-y-0.5 font-mono min-w-0 shrink-0">
            {data.phone && (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[8px] font-bold w-6 uppercase text-neutral-500">TEL</span>
                <a 
                  href={`tel:${data.phoneRaw}`} 
                  className={`whitespace-nowrap flex items-center gap-1.5 text-xs tracking-tight ${themeStyles.textPrimary} font-bold hover:underline`}
                >
                  <span>{data.phone}</span>
                </a>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[8px] font-bold w-6 uppercase text-neutral-500">MAIL</span>
                <a href={`mailto:${data.email}`} className={`${themeStyles.textPrimary} truncate max-w-[170px] hover:underline`}>
                  {data.email}
                </a>
              </div>
            )}
            {data.website && (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[8px] font-bold w-6 uppercase text-neutral-500">WEB</span>
                <a href={data.website} target="_blank" rel="noopener noreferrer" className={`${themeStyles.textPrimary} truncate max-w-[170px] hover:underline`}>
                  {data.websiteDisplay}
                </a>
              </div>
            )}
          </div>

          {showAddress && (enAddress || data.addressKr) && (
            <div className="flex flex-col justify-end text-[8px] sm:text-[9px] font-sans min-w-0 pl-1">
              <span className="text-[8px] font-mono font-bold uppercase text-neutral-500 mb-0.5">LOC</span>
              {enAddress && <p className={`${themeStyles.textPrimary} font-medium line-clamp-1`}>{enAddress}</p>}
              {data.addressKr && <p className={`${themeStyles.textMuted} line-clamp-1`}>{data.addressKr}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. WARM ORGANIC LAYOUT (Soft paper, expansive negative space, classical balance)
  // =========================================================================
  if (layout_type === 'warm_organic') {
    return (
      <div 
        className={`relative w-full h-full select-none flex flex-col justify-between ${
          isPortrait ? 'p-5 sm:p-7' : isPrintPreview ? 'p-3.5 sm:p-4' : 'p-4 sm:p-6 md:p-8'
        } ${themeStyles.cardBg} ${isPrintPreview || hideBorder ? 'border-0' : `border ${themeStyles.border}`} transition-colors duration-300 font-sans`}
        style={{ aspectRatio: isPortrait ? '5 / 8' : '9 / 5' }}
      >
        {textureOverlay}

        {/* Top: Delicate Heritage Seal & Organization */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-0.5">
            <h2 className={`text-xs sm:text-sm font-semibold tracking-wide ${themeStyles.textPrimary}`}>
              {data.organizationKr || data.organization}
            </h2>
            {showSubOrg && data.organization && (
              <p className={`text-[9px] sm:text-[10px] tracking-wider uppercase font-serif ${themeStyles.textMuted}`}>
                {data.organization}
              </p>
            )}
          </div>
          {cornerMark}
        </div>

        {/* Center: Expansive Negative Space & Poetic Typography */}
        <div className="relative z-10 my-auto py-2 space-y-1.5">
          <div className="flex items-baseline gap-2.5">
            <h1 className={`${isPrintPreview ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-[27px]'} font-serif font-normal tracking-wide ${themeStyles.textPrimary}`}>
              {data.name}
            </h1>
            {showEnName && data.nameKr && (
              <span className={`text-xs sm:text-sm font-medium ${themeStyles.textMuted}`}>
                {data.nameKr}
              </span>
            )}
          </div>

          <p className={`text-xs sm:text-sm tracking-wide font-sans ${themeStyles.textSecondary}`}>
            {data.title}
            {data.titleKr && <span className={`text-[11px] ml-1.5 ${themeStyles.textMuted}`}>/ {data.titleKr}</span>}
          </p>
        </div>

        {/* Bottom: Calm Contact Row */}
        <div className={`relative z-10 pt-2.5 border-t ${themeStyles.accentHairline} flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-[9px] sm:text-[10px]`}>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <a 
                href={`tel:${data.phoneRaw}`} 
                className={`whitespace-nowrap flex items-center gap-1.5 text-xs tracking-tight ${themeStyles.textPrimary} font-mono hover:opacity-80`}
              >
                <span>{data.phone}</span>
              </a>
              <span className={themeStyles.textMuted}>•</span>
              <a href={`mailto:${data.email}`} className={`${themeStyles.textPrimary} hover:opacity-80 truncate max-w-[160px]`}>
                {data.email}
              </a>
            </div>
            {data.website && (
              <a href={data.website} target="_blank" rel="noopener noreferrer" className={`block ${themeStyles.textSecondary} hover:opacity-80 truncate max-w-[200px]`}>
                {data.websiteDisplay}
              </a>
            )}
          </div>

          {showAddress && (enAddress || data.addressKr) && (
            <div className={`text-right text-[8px] sm:text-[9px] ${themeStyles.textMuted} space-y-0.5 shrink-0`}>
              {enAddress && <p className={`${themeStyles.textPrimary} truncate`}>{enAddress}</p>}
              {data.addressKr && <p className="truncate">{data.addressKr}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. EDITORIAL MINIMAL (DEFAULT) (Asymmetric 2-column, duality, structured grid)
  // =========================================================================
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
      {textureOverlay}

      {/* Top Header: Foundation / Network Name */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-0.5 min-w-0 pr-2">
          <p className={`text-[9px] sm:text-[10px] tracking-tight font-medium leading-tight ${themeStyles.textSecondary} truncate`}>
            {data.organizationKr}
          </p>
          <h2 className={`${isPortrait ? 'text-xs sm:text-sm font-bold' : isPrintPreview ? 'text-[11px]' : 'text-[11px] sm:text-xs md:text-sm'} font-semibold tracking-tight leading-tight ${themeStyles.textPrimary} truncate`}>
            {data.organization}
          </h2>
          {showSubOrg && data.subOrg && (
            <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase leading-tight truncate" style={{ color: themeStyles.accent }}>
              {data.subOrg}
            </p>
          )}
        </div>
        {cornerMark}
      </div>

      {/* Center Section: Name & Position */}
      <div className={`relative z-10 ${isPortrait ? 'my-auto py-1.5 space-y-0.5' : isPrintPreview ? 'my-auto py-0.5' : 'my-auto py-1 space-y-0.5'}`}>
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h1 className={`${isPortrait ? 'text-xl sm:text-2xl md:text-3xl' : isPrintPreview ? 'text-base sm:text-lg' : 'text-lg sm:text-xl md:text-2xl'} font-bold tracking-tight leading-tight ${themeStyles.textPrimary} truncate max-w-full`}>
              {data.name}
            </h1>
            {showEnName && data.nameKr && (
              <span className={`text-[11px] sm:text-xs md:text-sm font-medium leading-tight ${themeStyles.textMuted} truncate`}>
                {data.nameKr}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <p className={`${isPortrait ? 'text-xs sm:text-sm font-semibold' : isPrintPreview ? 'text-[11px]' : 'text-[11px] sm:text-xs md:text-sm'} font-medium tracking-wide leading-tight ${themeStyles.textSecondary} truncate`}>
              {data.title}
            </p>
            {data.titleKr && (
              <span className={`text-[10px] sm:text-xs leading-tight ${themeStyles.textMuted} truncate`}>
                / {data.titleKr}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Direct Contacts & Physical Address */}
      <div className={`relative z-10 ${
        isPortrait 
          ? 'pt-2 space-y-1 text-xs border-t'
          : isPrintPreview 
            ? 'pt-1.5 gap-2 text-[10px] border-t grid grid-cols-[auto_1fr]' 
            : 'pt-2 gap-3 text-[10px] sm:text-xs border-t grid grid-cols-[auto_1fr]'
      } ${themeStyles.accentHairline}`}>
        {/* Contact list */}
        <div className="space-y-0.5 sm:space-y-1 min-w-0 shrink-0">
          {/* Phone */}
          {data.phone && (
            <div className="flex items-center group/item whitespace-nowrap">
              <a 
                href={`tel:${data.phoneRaw}`}
                title="전화 걸기 (Call)"
                className={`whitespace-nowrap flex items-center gap-1.5 text-xs tracking-tight font-mono tabular-nums font-medium ${themeStyles.textPrimary} hover:opacity-80 transition-opacity rounded px-1 -mx-1 py-0.5 ${themeStyles.hoverHighlight}`}
              >
                <Phone className={`w-3.5 h-3.5 shrink-0 ${themeStyles.textMuted}`} />
                <span className="whitespace-nowrap">{data.phone}</span>
                {!isPrintPreview && (
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" style={{ color: themeStyles.accent }} />
                )}
              </a>
              {!isPrintPreview && (
                <button 
                  onClick={(e) => copyToClipboard(e, data.phone, 'phone')}
                  title="전화번호 복사"
                  className="ml-1 p-1 rounded opacity-0 group-hover/item:opacity-100 hover:bg-neutral-500/20 transition-all text-neutral-400 cursor-pointer shrink-0"
                >
                  {copiedKey === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          )}

          {/* Email */}
          {data.email && (
            <div className="flex items-center group/item whitespace-nowrap min-w-0">
              <a 
                href={`mailto:${data.email}`}
                title="이메일 작성 (Send Email)"
                className={`whitespace-nowrap flex items-center gap-1.5 text-xs tracking-tight font-medium ${themeStyles.textPrimary} hover:opacity-80 transition-opacity rounded px-1 -mx-1 py-0.5 max-w-[210px] sm:max-w-[260px] ${themeStyles.hoverHighlight}`}
              >
                <Mail className={`w-3.5 h-3.5 shrink-0 ${themeStyles.textMuted}`} />
                <span className="truncate">{data.email}</span>
                {!isPrintPreview && (
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" style={{ color: themeStyles.accent }} />
                )}
              </a>
              {!isPrintPreview && (
                <button 
                  onClick={(e) => copyToClipboard(e, data.email, 'email')}
                  title="이메일 주소 복사"
                  className="ml-1 p-1 rounded opacity-0 group-hover/item:opacity-100 hover:bg-neutral-500/20 transition-all text-neutral-400 cursor-pointer shrink-0"
                >
                  {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          )}

          {/* Website */}
          {data.website && (
            <div className="flex items-center group/item whitespace-nowrap min-w-0">
              <a 
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                title="공식 홈페이지 열기 (Open Website)"
                className={`whitespace-nowrap flex items-center gap-1.5 text-xs tracking-tight font-medium ${themeStyles.textPrimary} hover:opacity-80 transition-opacity rounded px-1 -mx-1 py-0.5 max-w-[210px] sm:max-w-[260px] ${themeStyles.hoverHighlight}`}
              >
                <Globe className={`w-3.5 h-3.5 shrink-0 ${themeStyles.textMuted}`} />
                <span className="truncate">{data.websiteDisplay}</span>
              </a>
            </div>
          )}
        </div>

        {/* Address */}
        {showAddress && (enAddress || data.addressKr) && (
          <div className={`flex flex-col justify-end text-[8px] sm:text-[9px] leading-snug min-w-0 ${isPortrait ? 'pt-1 border-t border-neutral-800/40' : 'text-right sm:text-left pl-2'}`}>
            <div className="flex items-start gap-1 min-w-0">
              <MapPin className={`w-3 h-3 shrink-0 mt-0.5 ${themeStyles.textMuted}`} />
              <div className="min-w-0 flex-1">
                {enAddress && (
                  <p className={`${themeStyles.textPrimary} font-medium line-clamp-1`}>
                    {enAddress}
                  </p>
                )}
                {data.addressKr && (
                  <p className={`${enAddress ? 'text-neutral-500 text-[8px] sm:text-[9px] mt-0.5 line-clamp-1' : `${themeStyles.textPrimary} font-medium line-clamp-1`}`}>
                    {data.addressKr}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
