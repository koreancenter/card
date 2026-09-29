import { StoredCard } from '../types/card';

export const APP_BASE_DOMAIN = 'card.goguma.app';
export const APP_BASE_URL = `https://${APP_BASE_DOMAIN}`;

/**
 * Normalizes custom domain string by stripping protocols and trailing slashes
 */
export function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
}

/**
 * Returns the canonical shareable URL for a card
 */
export function getCardShareUrl(card: StoredCard): string {
  if (card.customDomain && card.customDomain.trim()) {
    const cleanDomain = normalizeDomain(card.customDomain);
    return `https://${cleanDomain}`;
  }
  const slug = card.slug || card.id;
  return `${APP_BASE_URL}/${slug}`;
}

/**
 * Returns a clean display format of the card's URL (e.g., 'card.goguma.app/mrpark')
 */
export function getCardDisplayUrl(card: StoredCard): string {
  if (card.customDomain && card.customDomain.trim()) {
    return normalizeDomain(card.customDomain);
  }
  const slug = card.slug || card.id;
  return `${APP_BASE_DOMAIN}/${slug}`;
}

/**
 * Resolves which card matches the current window location
 */
export function resolveCardFromLocation(cards: StoredCard[]): StoredCard | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const searchParams = new URLSearchParams(window.location.search);
  const cardParam = (searchParams.get('card') || searchParams.get('id') || '').toLowerCase();

  // 1. Check custom domain mapping (if host is not card.goguma.app, localhost, or run.app)
  const isPlatformHost = 
    hostname === APP_BASE_DOMAIN || 
    hostname === 'localhost' || 
    hostname.includes('127.0.0.1') || 
    hostname.includes('.run.app') ||
    hostname.includes('.web.app');

  if (!isPlatformHost) {
    const matchedCustom = cards.find(c => {
      if (!c.customDomain) return false;
      return normalizeDomain(c.customDomain) === hostname;
    });
    if (matchedCustom) return matchedCustom;
  }

  // 2. Check query param: ?card=mrpark
  if (cardParam) {
    const matchedParam = cards.find(
      c => (c.slug && c.slug.toLowerCase() === cardParam) || c.id === cardParam
    );
    if (matchedParam) return matchedParam;
  }

  // 3. Check pathname: /mrpark or /indonesia
  if (pathname && pathname !== 'vault' && pathname !== 'scan') {
    const matchedPath = cards.find(
      c => c.slug && c.slug.toLowerCase() === pathname.toLowerCase()
    );
    if (matchedPath) return matchedPath;
  }

  // 4. Default card fallback (for owner)
  const defaultCard = cards.find(c => c.isMyCard && c.isDefault) || cards.find(c => c.isMyCard) || cards[0];
  return defaultCard || null;
}
