import { CardData, CardTheme, StoredCard } from '../types/card';
import { sanitizeCardHtml } from './sanitizer';

export const CARD_DATA: CardData = {
  organization: 'GOGUMA AI STUDIO',
  organizationKr: '고구마 AI 스튜디오',
  name: 'PARK, GIHONG',
  nameKr: '박 기 홍',
  title: 'Principal Master',
  titleKr: '대표 마스터',
  phone: '+82 10-1234-5678',
  phoneRaw: '+821012345678',
  whatsappUrl: 'https://wa.me/821012345678',
  email: 'master@goguma.app',
  website: 'https://card.goguma.app/master',
  websiteDisplay: 'card.goguma.app/master',
  addressLines: [],
  address_en: '',
  addressKr: '서울특별시 강남구 테헤란로 152',
  googleMapsUrl: 'https://maps.google.com/?q=Gangnam+Seoul',
  naverMapsUrl: 'https://map.naver.com',
  backTitle: '고구마 AI 스튜디오',
  backSubtitle: 'GOGUMA AI STUDIO',
  backTagline: 'AI EXPERT GROUP',
  backHqAddress: 'Gangnam-gu, Seoul, Republic of Korea'
};

export const APP_BASE_DOMAIN = 'card.goguma.app';
export const APP_BASE_URL = `https://${APP_BASE_DOMAIN}`;

export interface VCardOptions {
  includeRevision?: boolean;
}

export interface HtmlExportOptions {
  includeQr?: boolean;
  theme?: CardTheme;
}

export interface CardJsonEnvelope {
  schemaVersion: '1.0';
  exportedAt: string;
  card: StoredCard;
}

/**
 * Universal Card Serializer & Formatter
 * Unifies fragmented parsing, domain resolutions, vCard 3.0 generation,
 * standalone portable HTML bundle compilation, and secure JSON exports.
 */
export class CardSerializer {
  /**
   * Domain Normalization & Sanitization
   */
  static normalizeDomain(domain: string): string {
    return domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '');
  }

  /**
   * Generates canonical public URL for sharing
   */
  static getShareUrl(card: StoredCard): string {
    if (card.customDomain && card.customDomain.trim()) {
      const cleanDomain = this.normalizeDomain(card.customDomain);
      return `https://${cleanDomain}`;
    }
    const slug = card.slug || card.id;

    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      if (host.includes('.run.app') || host === 'localhost' || host.includes('127.0.0.1')) {
        return `${window.location.origin}/?card=${slug}`;
      }
    }

    return `${APP_BASE_URL}/${slug}`;
  }

  /**
   * Clean display-friendly domain URL
   */
  static getDisplayUrl(card: StoredCard): string {
    if (card.customDomain && card.customDomain.trim()) {
      return this.normalizeDomain(card.customDomain);
    }
    const slug = card.slug || card.id;
    return `${APP_BASE_DOMAIN}/${slug}`;
  }

  /**
   * Extracts slug or identifier from the current browser URL
   */
  static getRouteSlug(): string | null {
    if (typeof window === 'undefined') return null;
    const searchParams = new URLSearchParams(window.location.search);
    const cardParam = searchParams.get('card') || searchParams.get('slug') || searchParams.get('id');
    if (cardParam) return cardParam.trim().toLowerCase();

    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (pathname && pathname !== 'vault' && pathname !== 'scan' && pathname !== 'index.html') {
      return pathname.trim().toLowerCase();
    }
    return null;
  }

  /**
   * Checks whether the current path is a public view slug or custom domain
   */
  static isPublicSlugRoute(): boolean {
    if (typeof window === 'undefined') return false;
    if (this.getRouteSlug()) return true;

    const hostname = window.location.hostname.toLowerCase();
    const isPlatformHost = 
      hostname === APP_BASE_DOMAIN || 
      hostname === 'localhost' || 
      hostname.includes('127.0.0.1') || 
      hostname.includes('.run.app') ||
      hostname.includes('.web.app');

    return !isPlatformHost;
  }

  /**
   * Resolves card by inspecting custom domain, URL query parameters, and pathname
   */
  static resolveFromLocation(cards: StoredCard[], fallbackCards: StoredCard[] = []): StoredCard | null {
    if (typeof window === 'undefined') return null;
    const pool = [...cards, ...fallbackCards];
    if (pool.length === 0) return null;

    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const searchParams = new URLSearchParams(window.location.search);
    const cardParam = (searchParams.get('card') || searchParams.get('slug') || searchParams.get('id') || '').toLowerCase();

    const isPlatformHost = 
      hostname === APP_BASE_DOMAIN || 
      hostname === 'localhost' || 
      hostname.includes('127.0.0.1') || 
      hostname.includes('.run.app') ||
      hostname.includes('.web.app');

    if (!isPlatformHost) {
      const matchedCustom = pool.find(c => {
        if (!c.customDomain) return false;
        return this.normalizeDomain(c.customDomain) === hostname;
      });
      if (matchedCustom) return matchedCustom;
    }

    if (cardParam) {
      const matchedParam = pool.find(
        c => (c.slug && c.slug.toLowerCase() === cardParam) || c.id.toLowerCase() === cardParam
      );
      if (matchedParam) return matchedParam;
    }

    if (pathname && pathname !== 'vault' && pathname !== 'scan' && pathname !== 'index.html') {
      const matchedPath = pool.find(
        c => c.slug && c.slug.toLowerCase() === pathname.toLowerCase()
      );
      if (matchedPath) return matchedPath;
    }

    const defaultCard = cards.find(c => c.isMyCard && c.isDefault) || cards.find(c => c.isMyCard) || cards[0] || fallbackCards[0];
    return defaultCard || null;
  }

  /**
   * RFC-6350 / RFC-2426 Compliant vCard 3.0 String Generator
   */
  static toVCard(data: CardData = CARD_DATA, options: VCardOptions = { includeRevision: true }): string {
    const addressJoined = data.address_en || (data.addressLines && data.addressLines.length > 0 
      ? data.addressLines.join(', ') 
      : (data.addressKr || ''));

    const lines: string[] = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${(data.name || '').split(' ').reverse().join(';')};;;`,
      `FN:${data.nameKr ? `${data.name} (${data.nameKr})` : data.name}`,
      `ORG:${data.organization || ''}${data.organizationKr ? ` (${data.organizationKr})` : ''}`,
      `TITLE:${data.title || ''}${data.titleKr ? ` (${data.titleKr})` : ''}`,
      `TEL;TYPE=CELL,VOICE,PREF:${data.phoneRaw || (data.phone ? data.phone.replace(/[^0-9+]/g, '') : '')}`,
      `EMAIL;TYPE=INTERNET,WORK,PREF:${data.email || ''}`,
      `URL;TYPE=WORK:${data.website || ''}`,
      `ADR;TYPE=WORK:;;${addressJoined};;;;`,
      `NOTE:${data.organization || ''} - ${data.title || ''}`
    ];

    if (options.includeRevision) {
      lines.push('REV:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z');
    }
    lines.push('END:VCARD');

    return lines.join('\r\n');
  }

  /**
   * Triggers client-side browser download for .vcf file
   */
  static downloadVCard(data: CardData = CARD_DATA): void {
    const vcardContent = this.toVCard(data);
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const safeName = (data.name || 'Business_Card').replace(/[^a-zA-Z0-9가-힣]/g, '_');
    const safeOrg = (data.organization || 'Card').replace(/[^a-zA-Z0-9가-힣]/g, '_');
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${safeName}_${safeOrg}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Exports StoredCard to portable JSON envelope
   */
  static toJsonEnvelope(card: StoredCard): string {
    const envelope: CardJsonEnvelope = {
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      card
    };
    return JSON.stringify(envelope, null, 2);
  }

  /**
   * Validates and parses a JSON envelope into a StoredCard
   */
  static fromJsonEnvelope(jsonString: string): StoredCard {
    const parsed = JSON.parse(jsonString) as Partial<CardJsonEnvelope> & Partial<StoredCard>;
    if (parsed && typeof parsed === 'object') {
      if (parsed.schemaVersion === '1.0' && parsed.card) {
        return parsed.card;
      }
      if ('id' in parsed && 'data' in parsed) {
        return parsed as StoredCard;
      }
    }
    throw new Error('Invalid Card JSON structure');
  }

  /**
   * Standalone Offline HTML Single-File Bundle
   */
  static toStandaloneHtml(data: CardData, theme: CardTheme = 'pure_white', options: HtmlExportOptions = {}): string {
    const vcardString = this.toVCard(data);
    const vcardEncoded = encodeURIComponent(vcardString);
    const pageTitle = `${sanitizeCardHtml(data.name || '')} (${sanitizeCardHtml(data.nameKr || '')}) — ${sanitizeCardHtml(data.organization || '')}`;
    const pageDesc = `${sanitizeCardHtml(data.organizationKr || '')} ${sanitizeCardHtml(data.titleKr || '')} ${sanitizeCardHtml(data.name || '')}의 디지털 명함입니다.`;
    const officialUrl = data.website || 'https://card.goguma.app/master';

    const themeColors: Record<string, { bg: string; text: string; textSec: string; border: string; accent: string }> = {
      pure_white: { bg: '#FFFFFF', text: '#111111', textSec: '#525252', border: '#E5E5E5', accent: '#000000' },
      sumi_ink: { bg: '#0B0C10', text: '#F8F4EB', textSec: '#C5BEB3', border: '#262420', accent: '#C5A880' },
      warm_paper: { bg: '#F8F4EB', text: '#1F2023', textSec: '#4F4C47', border: '#DFD7C7', accent: '#111111' },
      deep_forest: { bg: '#0D1F18', text: '#F4F7F4', textSec: '#AEC2B4', border: '#1C362A', accent: '#C2A478' },
      classic_navy: { bg: '#0A1128', text: '#F0F4FC', textSec: '#A8BADB', border: '#1E2C52', accent: '#D0D9E8' },
      sand: { bg: '#f8f6f0', text: '#191614', textSec: '#484037', border: '#ded7cb', accent: '#d97706' },
      cotton: { bg: '#fcfcfb', text: '#171717', textSec: '#525252', border: '#e5e5e5', accent: '#171717' },
      obsidian: { bg: '#0c0c0d', text: '#ffffff', textSec: '#9ca3af', border: '#262626', accent: '#d4af37' },
      titanium: { bg: '#18181b', text: '#f4f4f5', textSec: '#a1a1aa', border: '#3f3f46', accent: '#71717a' },
      navy: { bg: '#080e1a', text: '#f8fafc', textSec: '#94a3b8', border: '#1e293b', accent: '#38bdf8' },
      emerald: { bg: '#08140e', text: '#f0fdf4', textSec: '#86efac', border: '#14532d', accent: '#4ade80' },
      burgundy: { bg: '#FFFFFF', text: '#111111', textSec: '#525252', border: '#E5E5E5', accent: '#000000' },
      slate: { bg: '#10151f', text: '#f1f5f9', textSec: '#94a3b8', border: '#334155', accent: '#64748b' }
    };

    const targetTheme = options.theme || theme;
    const selectedTheme = themeColors[targetTheme] || themeColors.pure_white;

    return `<!DOCTYPE html>
<html lang="ko" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${officialUrl}">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

  <style>
    .perspective-1200 { perspective: 1200px; }
    .transform-style-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
    @media print {
      body { background: white !important; color: black !important; }
      .no-print { display: none !important; }
      .print-card { box-shadow: none !important; border: 1px solid #ccc !important; }
    }
  </style>
</head>
<body class="bg-[#0a0a0c] text-neutral-100 min-h-screen flex flex-col items-center justify-between font-sans antialiased selection:bg-neutral-700 selection:text-white">

  <!-- Header -->
  <header class="w-full border-b border-neutral-900/80 px-4 sm:px-8 py-3.5 flex items-center justify-between no-print">
    <div class="flex items-center gap-2.5">
      <div class="w-5 h-5 rounded-full border border-neutral-700 flex items-center justify-center text-[10px] font-serif text-neutral-300">
        韓
      </div>
      <a href="${officialUrl}" class="font-serif tracking-widest text-xs uppercase text-neutral-300 hover:text-white transition-colors">
        ${sanitizeCardHtml(data.organization || '')}
      </a>
    </div>
  </header>

  <!-- Main Viewport -->
  <main class="flex-1 flex flex-col items-center justify-center p-4 max-w-xl w-full">
    
    <div class="flex items-center justify-between w-full max-w-[360px] sm:max-w-[400px] mb-3 no-print text-xs text-neutral-400">
      <span class="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">DIGITAL PASS</span>
      <button id="flip-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:text-white transition-colors cursor-pointer text-xs">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        <span>뒷면 회전</span>
      </button>
    </div>

    <!-- 3D Card Object Canvas -->
    <div class="w-full max-w-[360px] sm:max-w-[400px] perspective-1200 cursor-pointer select-none" id="card-wrapper">
      <div id="card-inner" class="relative w-full aspect-[5/8] rounded-2xl transform-style-3d transition-transform duration-700 shadow-2xl" style="background-color: ${selectedTheme.bg}; border: 1px solid ${selectedTheme.border};">
        
        <!-- CARD FRONT -->
        <div class="absolute inset-0 w-full h-full p-6 sm:p-7 flex flex-col justify-between backface-hidden rounded-2xl overflow-hidden" style="background-color: ${selectedTheme.bg};">
          <div>
            <p class="text-[10px] tracking-tight font-medium text-neutral-400">${sanitizeCardHtml(data.organizationKr || '')}</p>
            <h2 class="text-sm font-semibold tracking-tight text-white">${sanitizeCardHtml(data.organization || '')}</h2>
            ${data.subOrg ? `<p class="text-[9px] font-semibold tracking-[0.2em] uppercase text-neutral-400 mt-0.5">${sanitizeCardHtml(data.subOrg)}</p>` : ''}
          </div>

          <div class="my-auto py-4 space-y-1">
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">${sanitizeCardHtml(data.name || '')}</h1>
            <p class="text-xs font-mono tracking-wider text-neutral-400">${sanitizeCardHtml(data.nameKr || '')}</p>
            <p class="text-xs text-neutral-300 pt-1 font-medium">${sanitizeCardHtml(data.title || '')} <span class="text-neutral-400">(${sanitizeCardHtml(data.titleKr || '')})</span></p>
          </div>

          <div class="space-y-2 pt-4 border-t border-neutral-800 text-xs">
            <div class="flex items-center justify-between text-neutral-300">
              <span class="text-neutral-400 font-mono text-[10px]">MOBILE</span>
              <a href="tel:${data.phoneRaw || ''}" class="hover:text-white transition-colors">${sanitizeCardHtml(data.phone || '')}</a>
            </div>
            <div class="flex items-center justify-between text-neutral-300">
              <span class="text-neutral-400 font-mono text-[10px]">EMAIL</span>
              <a href="mailto:${data.email || ''}" class="hover:text-white transition-colors">${sanitizeCardHtml(data.email || '')}</a>
            </div>
            <div class="flex items-center justify-between text-neutral-300">
              <span class="text-neutral-400 font-mono text-[10px]">WEB</span>
              <a href="${data.website || ''}" target="_blank" class="hover:text-white transition-colors font-medium">${sanitizeCardHtml(data.websiteDisplay || '')}</a>
            </div>
          </div>
        </div>

        <!-- CARD BACK -->
        <div class="absolute inset-0 w-full h-full p-6 sm:p-7 flex flex-col justify-between backface-hidden rotate-y-180 rounded-2xl overflow-hidden" style="background-color: ${selectedTheme.bg};">
          <div class="my-auto text-center space-y-2">
            <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">${sanitizeCardHtml(data.backTitle || '고구마 AI 스튜디오')}</h2>
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-neutral-400">${sanitizeCardHtml(data.backSubtitle || 'GOGUMA AI STUDIO')}</p>
            <p class="text-xs tracking-[0.16em] uppercase text-neutral-400 pt-1">${sanitizeCardHtml(data.backTagline || 'AI EXPERT GROUP')}</p>
          </div>

          <div class="pt-4 border-t border-neutral-800 flex flex-col items-center text-center space-y-2">
            <div id="qrcode-container" class="p-2 bg-white rounded-xl shadow-md w-20 h-20 flex items-center justify-center"></div>
            <p class="font-mono text-[9px] text-neutral-400">SCAN TO CONNECT</p>
            <p class="text-xs font-medium text-neutral-300">${sanitizeCardHtml(data.websiteDisplay || '')}</p>
          </div>
        </div>

      </div>
    </div>

    <!-- Centered Action Dock -->
    <div class="w-full max-w-[360px] sm:max-w-[400px] mt-4 flex items-center justify-center flex-wrap gap-2 text-neutral-400 no-print">
      <a href="data:text/vcard;charset=utf-8,${vcardEncoded}" download="${sanitizeCardHtml(data.name || 'card')}.vcf" class="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:text-white hover:border-neutral-700 transition-colors" title="주소록에 연락처 저장">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
      </a>
      <a href="tel:${data.phoneRaw || ''}" class="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:text-white hover:border-neutral-700 transition-colors" title="전화 걸기">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
      </a>
      <a href="${data.whatsappUrl || ''}" target="_blank" class="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:text-white hover:border-neutral-700 transition-colors" title="WhatsApp 대화">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
      </a>
      <a href="mailto:${data.email || ''}" class="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:text-white hover:border-neutral-700 transition-colors" title="이메일 보내기">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      </a>
      <a href="${data.website || ''}" target="_blank" class="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:text-white hover:border-neutral-700 transition-colors" title="공식 웹사이트">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
      </a>
      <button id="share-btn" class="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer" title="링크 공유">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
      </button>
    </div>

  </main>

  <footer class="py-6 px-4 text-center text-[11px] text-neutral-400 no-print">
    <p>© ${new Date().getFullYear()} ${sanitizeCardHtml(data.organization || '')}. Distributed via Self-Hosted Digital Pass.</p>
  </footer>

  <script>
    let isFlipped = false;
    const cardInner = document.getElementById('card-inner');
    const cardWrapper = document.getElementById('card-wrapper');
    const flipBtn = document.getElementById('flip-btn');

    function toggleFlip() {
      isFlipped = !isFlipped;
      cardInner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
      flipBtn.querySelector('span').textContent = isFlipped ? '앞면 회전' : '뒷면 회전';
    }

    cardWrapper.addEventListener('click', toggleFlip);
    flipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFlip();
    });

    document.getElementById('share-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const shareData = {
        title: '${sanitizeCardHtml(data.name || '')} — ${sanitizeCardHtml(data.organization || '')}',
        text: '${sanitizeCardHtml(data.organizationKr || '')} ${sanitizeCardHtml(data.titleKr || '')} ${sanitizeCardHtml(data.name || '')}의 디지털 명함입니다.',
        url: window.location.href
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch (err) {}
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('명함 링크가 클립보드에 복사되었습니다.');
      }
    });

    window.addEventListener('DOMContentLoaded', () => {
      if (window.QRCode) {
        new QRCode(document.getElementById("qrcode-container"), {
          text: "${officialUrl}",
          width: 72,
          height: 72,
          colorDark : "#0a0a0c",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.M
        });
      }
    });
  </script>
</body>
</html>`;
  }
}

// Backward-compatible ergonomic functional exports
export const generateVCard = (data: CardData = CARD_DATA): string => CardSerializer.toVCard(data);
export const downloadVCard = (data: CardData = CARD_DATA): void => CardSerializer.downloadVCard(data);
export const generateStandaloneHtml = (data: CardData, theme: CardTheme = 'pure_white'): string => 
  CardSerializer.toStandaloneHtml(data, theme);
export const normalizeDomain = (domain: string): string => CardSerializer.normalizeDomain(domain);
export const getRouteSlug = (): string | null => CardSerializer.getRouteSlug();
export const isPublicSlugRoute = (): boolean => CardSerializer.isPublicSlugRoute();
export const getCardShareUrl = (card: StoredCard): string => CardSerializer.getShareUrl(card);
export const getCardDisplayUrl = (card: StoredCard): string => CardSerializer.getDisplayUrl(card);
export const resolveCardFromLocation = (cards: StoredCard[], fallbackCards: StoredCard[] = []): StoredCard | null =>
  CardSerializer.resolveFromLocation(cards, fallbackCards);
