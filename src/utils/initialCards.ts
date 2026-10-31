import { StoredCard, CardData } from '../types/card';
import { CARD_DATA } from './vcard';

export const INITIAL_CARDS: StoredCard[] = [
  {
    id: 'sample-card-goguma-master',
    isMyCard: true,
    isDefault: true,
    slug: 'master',
    owner_key: 'owner_master_sample',
    customDomain: 'card.goguma.app/master',
    category: '글로벌 네트워크',
    theme: 'pure_white',
    layout_type: 'editorial_minimal',
    card_features: {
      show_en_name: true,
      show_sub_org: true,
      show_address: true,
      monogram_text: 'PG'
    },
    createdAt: '2026-03-01',
    notes: '고구마 지식 관리실 대표 마스터 샘플 명함',
    data: {
      ...CARD_DATA,
      website: 'https://card.goguma.app/master',
      websiteDisplay: 'card.goguma.app/master'
    }
  },
  {
    id: 'sample-card-elena-rostova',
    isMyCard: false,
    category: '글로벌 네트워크',
    theme: 'deep_forest',
    layout_type: 'monogram_executive',
    card_features: {
      show_en_name: true,
      show_sub_org: true,
      show_address: true,
      monogram_text: 'ER'
    },
    createdAt: '2026-03-05',
    notes: '글로벌 디자인 랩 인터내셔널 파트너',
    data: {
      organization: 'Studio Rostova & Partners',
      organizationKr: '로스토바 스튜디오 디자인',
      name: 'Elena Rostova',
      nameKr: '엘레나 로스토바',
      title: 'Design Director',
      titleKr: '총괄 디자인 디렉터',
      phone: '+44 20 7946 0991',
      phoneRaw: '+442079460991',
      whatsappUrl: 'https://wa.me/442079460991',
      email: 'elena@rostovastudio.com',
      website: 'https://rostovastudio.com',
      websiteDisplay: 'rostovastudio.com',
      addressLines: [
        '28 Shoreditch High Street',
        'London E1 6PG, United Kingdom'
      ],
      addressKr: '영국 런던 쇼디치 하이스트리트 28',
      googleMapsUrl: 'https://maps.google.com/?q=London+UK',
      naverMapsUrl: 'https://map.naver.com'
    }
  },
  {
    id: 'card-michael-harrison',
    isMyCard: false,
    category: 'VIP 파트너',
    theme: 'classic_navy',
    layout_type: 'monogram_executive',
    card_features: {
      show_en_name: true,
      show_sub_org: true,
      show_address: true,
      monogram_text: 'MH'
    },
    createdAt: '2026-03-12',
    notes: '워싱턴 DC 국제문화교류 심포지엄 미팅 (실물 명함 사진 보관)',
    scannedImage: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500"><rect width="900" height="500" fill="#FAFAFA"/><rect x="28" y="28" width="844" height="444" fill="none" stroke="#E4E4E7" stroke-width="1.5"/><text x="68" y="100" font-family="sans-serif" font-size="18" fill="#52525B" letter-spacing="3">GLOBAL HERITAGE FOUNDATION</text><text x="68" y="245" font-family="serif" font-size="44" font-weight="bold" fill="#0A0A0B">Dr. Michael Harrison</text><text x="68" y="288" font-family="sans-serif" font-size="20" fill="#52525B">Senior Executive Director</text><line x1="68" y1="365" x2="832" y2="365" stroke="#E4E4E7" stroke-width="1"/><text x="68" y="412" font-family="monospace" font-size="18" fill="#18181B">+1 (202) 555-0182  ·  m.harrison@globalheritage.org</text><text x="68" y="442" font-family="sans-serif" font-size="16" fill="#71717A">1400 K Street NW, Suite 900, Washington, DC</text></svg>')}`,
    data: {
      organization: 'Global Heritage Foundation',
      organizationKr: '글로벌헤리티지재단',
      name: 'Dr. Michael Harrison',
      nameKr: '마이클 해리슨',
      title: 'Senior Executive Director',
      titleKr: '수석총괄이사',
      phone: '+1 (202) 555-0182',
      phoneRaw: '+12025550182',
      whatsappUrl: 'https://wa.me/12025550182',
      email: 'm.harrison@globalheritage.org',
      website: 'https://globalheritage.org',
      websiteDisplay: 'globalheritage.org',
      addressLines: ['1400 K Street NW, Suite 900', 'Washington, DC 20005, USA'],
      addressKr: '미국 워싱턴 DC K스트리트 1400',
      googleMapsUrl: 'https://maps.google.com/?q=Washington+DC',
      naverMapsUrl: 'https://map.naver.com'
    }
  },
  {
    id: 'card-jung-seoyun',
    isMyCard: false,
    category: '공공·기관',
    theme: 'warm_paper',
    layout_type: 'warm_organic',
    card_features: {
      show_en_name: true,
      show_sub_org: true,
      show_address: true,
      monogram_text: '서윤'
    },
    createdAt: '2026-03-18',
    notes: '공공 외교 문화 콘텐츠 공동 기획 협력사',
    data: {
      organization: 'Korea Cultural Exchange Foundation',
      organizationKr: '한국문화교류진흥재단',
      name: '정서윤',
      nameEn: '',
      nameKr: '',
      title: 'Executive Vice President',
      titleKr: '부사장',
      phone: '+82 10-3882-9011',
      phoneRaw: '+821038829011',
      whatsappUrl: 'https://wa.me/821038829011',
      email: 'sy.jung@kcef.or.kr',
      website: 'https://kcef.or.kr',
      websiteDisplay: 'kcef.or.kr',
      addressLines: ['서울특별시 중구 세종대로 124', '프레스센터 빌딩 14층'],
      addressKr: '서울특별시 중구 세종대로 124 프레스센터 14층',
      googleMapsUrl: 'https://maps.google.com/?q=Seoul+Press+Center',
      naverMapsUrl: 'https://map.naver.com'
    }
  },
  {
    id: 'card-james-vance',
    isMyCard: false,
    category: '투자·금융',
    theme: 'sumi_ink',
    layout_type: 'swiss_typo_bold',
    card_features: {
      show_en_name: true,
      show_sub_org: true,
      show_address: true,
      monogram_text: 'JV'
    },
    createdAt: '2026-03-22',
    notes: '아시아태평양 벤처 펀드 운용 총괄 (실물 명함 보관)',
    scannedImage: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500"><rect width="900" height="500" fill="#121214"/><rect x="28" y="28" width="844" height="444" fill="none" stroke="#27272A" stroke-width="1.5"/><text x="68" y="100" font-family="sans-serif" font-size="18" fill="#A1A1AA" letter-spacing="3">VANCE &amp; PARTNERS CAPITAL</text><text x="68" y="245" font-family="sans-serif" font-size="44" font-weight="bold" fill="#FAFAFA">JAMES VANCE</text><text x="68" y="288" font-family="sans-serif" font-size="20" fill="#A1A1AA">Managing Partner</text><line x1="68" y1="365" x2="832" y2="365" stroke="#27272A" stroke-width="1"/><text x="68" y="412" font-family="monospace" font-size="18" fill="#E4E4E7">+65 6712 3400  ·  jvance@vancecap.sg</text><text x="68" y="442" font-family="sans-serif" font-size="16" fill="#71717A">1 Raffles Place, Singapore 048616</text></svg>')}`,
    data: {
      organization: 'Vance & Partners Capital',
      organizationKr: '밴스 앤 파트너스 캐피탈',
      name: 'James Vance',
      nameKr: '제임스 밴스',
      title: 'Managing Partner',
      titleKr: '대표 매니징 파트너',
      phone: '+65 6712 3400',
      phoneRaw: '+6567123400',
      whatsappUrl: 'https://wa.me/6567123400',
      email: 'jvance@vancecap.sg',
      website: 'https://vancecap.sg',
      websiteDisplay: 'vancecap.sg',
      addressLines: ['1 Raffles Place, #28-01 One Raffles Place', 'Singapore 048616'],
      addressKr: '싱가포르 래플스 플레이스 원',
      googleMapsUrl: 'https://maps.google.com/?q=One+Raffles+Place+Singapore',
      naverMapsUrl: 'https://map.naver.com'
    }
  }
];

export const SAMPLE_CARDS = INITIAL_CARDS;

import {
  isEncryptedEnvelope,
  encryptCardsVault,
  decryptCardsVault,
  getActiveSessionKey,
  getActiveSessionPin,
  clearActiveSessionKey,
  EncryptedEnvelope
} from './cryptoVault';
import { isPinSet } from './pinLock';

const STORAGE_KEY = 'my_cards';
const FALLBACK_STORAGE_KEY = 'user_cards';
const LEGACY_STORAGE_KEY = 'koreancenter_stored_cards_v2';

// In-memory decrypted cards cache to protect against DevTools plain-text extraction
let memoryDecryptedCards: StoredCard[] | null = null;

function enrichCard(c: StoredCard): StoredCard {
  const rawData = c.data;
  const primaryName = (rawData?.name || rawData?.nameKr || '').trim();
  const rawNameKr = (rawData?.nameKr || '').trim();
  const rawNameEn = (rawData?.nameEn || '').trim();
  const cleanNameKr =
    rawNameKr && rawNameKr.toLowerCase() !== primaryName.toLowerCase() ? rawData.nameKr : '';
  const cleanNameEn =
    rawNameEn && rawNameEn.toLowerCase() !== primaryName.toLowerCase() ? rawData.nameEn : '';

  const rawOrg = (rawData?.organization || '').trim();
  const rawOrgKr = (rawData?.organizationKr || '').trim();
  const cleanOrg =
    rawOrg && rawOrgKr && rawOrg.toLowerCase() === rawOrgKr.toLowerCase()
      ? ''
      : (rawData?.organization || '');

  const rawTitle = (rawData?.title || '').trim();
  const rawTitleKr = (rawData?.titleKr || '').trim();
  const cleanTitle =
    rawTitle && rawTitleKr && rawTitle.toLowerCase() === rawTitleKr.toLowerCase()
      ? ''
      : (rawData?.title || '');

  const enriched: StoredCard = {
    ...c,
    owner_key: c.owner_key || (c.isMyCard ? `key_${c.id}` : undefined),
    data: rawData
      ? {
          ...rawData,
          name: primaryName || rawData.name || '',
          nameEn: cleanNameEn,
          nameKr: cleanNameKr,
          organization: cleanOrg,
          title: cleanTitle,
        }
      : c.data,
  };
  const isLegacyMasterSample =
    c.id === 'sample-card-alexander-vance' ||
    c.slug === 'vance' ||
    ((c.id === 'sample-card-goguma-master' || c.slug === 'master') &&
      (c.data?.organization === 'GOGUMA AI STUDIO' || c.data?.organizationKr === '고구마 AI 스튜디오'));

  if (isLegacyMasterSample) {
    return {
      ...enriched,
      id: 'sample-card-goguma-master',
      slug: 'master',
      owner_key: c.owner_key || 'owner_master_sample',
      customDomain: 'card.goguma.app/master',
      category: '글로벌 네트워크',
      theme: c.theme || 'pure_white',
      data: {
        ...CARD_DATA,
        website: 'https://card.goguma.app/master',
        websiteDisplay: 'card.goguma.app/master'
      }
    };
  }
  return enriched;
}

export function loadUserCards(): StoredCard[] {
  if (typeof window === 'undefined') return [];

  // 1. If cards have been decrypted into memory during the authenticated session, return them
  if (memoryDecryptedCards !== null) {
    return memoryDecryptedCards;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // 2. If storage holds an AES-GCM Encrypted Envelope and session is locked, return empty
    // to prevent unauthenticated plain-text extraction via browser DevTools
    if (isEncryptedEnvelope(parsed)) {
      // Data is encrypted with AES-256-GCM. Will be decrypted asynchronously upon PIN/biometric unlock.
      return [];
    }

    // 3. Unencrypted legacy cards (when no PIN is configured)
    if (Array.isArray(parsed) && parsed.length > 0) {
      const enriched = parsed.map(enrichCard);
      memoryDecryptedCards = enriched;
      return enriched;
    }
    return [];
  } catch (e) {
    console.warn('Notice loading cards from storage', e);
    return [];
  }
}

export const loadStoredCards = loadUserCards;

/**
 * Asynchronously decrypts AES-GCM encrypted cards from localStorage upon successful authentication
 */
export async function decryptStoredCards(keyOrPin?: CryptoKey | string): Promise<StoredCard[]> {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (isEncryptedEnvelope(parsed)) {
      const key = keyOrPin || getActiveSessionKey() || getActiveSessionPin();
      if (!key) {
        console.warn('No active cryptographic key available to decrypt cards vault');
        return [];
      }

      const decrypted = await decryptCardsVault(parsed, key);
      const enriched = decrypted.map(enrichCard);
      memoryDecryptedCards = enriched;
      return enriched;
    }

    if (Array.isArray(parsed)) {
      const enriched = parsed.map(enrichCard);
      memoryDecryptedCards = enriched;
      return enriched;
    }

    return [];
  } catch (err) {
    console.warn('Notice decrypting stored cards vault:', err);
    return [];
  }
}

/**
 * Saves cards to storage. If PIN lock is configured, card data is immediately encrypted
 * via AES-GCM 256-bit using PBKDF2 derived keys before writing to localStorage,
 * completely neutralizing DevTools plain-text data extraction attacks.
 */
export function saveUserCards(cards: StoredCard[]): void {
  if (typeof window === 'undefined') return;

  memoryDecryptedCards = cards;

  try {
    if (!cards || cards.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FALLBACK_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem('saved_cards');
      return;
    }

    const pinActive = isPinSet();

    if (pinActive) {
      const activeKey = getActiveSessionKey();
      const activePin = getActiveSessionPin();

      if (activeKey || activePin) {
        encryptCardsVault(cards, activeKey || activePin!).then((envelope) => {
          const encryptedPayload = JSON.stringify(envelope);
          localStorage.setItem(STORAGE_KEY, encryptedPayload);
          localStorage.setItem(FALLBACK_STORAGE_KEY, encryptedPayload);
          localStorage.setItem('saved_cards', encryptedPayload);
        }).catch((err) => {
          console.warn('Background encryption save notice:', err);
        });
        return;
      }
    }

    // Default unencrypted write when PIN protection is disabled
    const plainJson = JSON.stringify(cards);
    localStorage.setItem(STORAGE_KEY, plainJson);
    localStorage.setItem(FALLBACK_STORAGE_KEY, plainJson);
    localStorage.setItem('saved_cards', plainJson);
  } catch (e) {
    console.warn('Notice saving cards to storage', e);
  }
}

export const saveStoredCards = saveUserCards;

/**
 * Re-encrypts all current cards when a new PIN is created or changed
 */
export async function reEncryptCardsOnPinChange(pin: string): Promise<void> {
  const currentCards = memoryDecryptedCards || loadUserCards();
  if (!currentCards || currentCards.length === 0) return;

  try {
    const envelope = await encryptCardsVault(currentCards, pin);
    const payload = JSON.stringify(envelope);
    localStorage.setItem(STORAGE_KEY, payload);
    localStorage.setItem(FALLBACK_STORAGE_KEY, payload);
    localStorage.setItem('saved_cards', payload);
  } catch (err) {
    console.warn('Notice re-encrypting cards on PIN change:', err);
  }
}

/**
 * Re-saves cards in plain text format when PIN lock is completely removed
 */
export function reSaveUnencryptedCards(): void {
  const currentCards = memoryDecryptedCards || loadUserCards();
  if (!currentCards || currentCards.length === 0) return;

  const plainJson = JSON.stringify(currentCards);
  localStorage.setItem(STORAGE_KEY, plainJson);
  localStorage.setItem(FALLBACK_STORAGE_KEY, plainJson);
  localStorage.setItem('saved_cards', plainJson);
}

/**
 * Completely clears all local data stored by GOGUMA CARD STUDIO:
 * user cards, encrypted vault tokens, PIN hashes, biometric keys, sync IDs, and lazy preferences.
 */
export function clearAllLocalData(): void {
  if (typeof window === 'undefined') return;
  try {
    memoryDecryptedCards = null;
    clearActiveSessionKey();

    localStorage.removeItem('my_cards');
    localStorage.removeItem(FALLBACK_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem('saved_cards');
    localStorage.removeItem('app_pin_hash');
    localStorage.removeItem('app_pin_vault_token');
    localStorage.removeItem('app_pin_last_verified_at');
    localStorage.removeItem('app_biometric_credential_id');
    localStorage.removeItem('app_biometric_vault_token');
    localStorage.removeItem('biometric_credential_id');
    localStorage.removeItem('wallet_sync_id');
    localStorage.removeItem('card_sync_id');
    localStorage.removeItem('lazy_pin_dismissed');
    sessionStorage.clear();
  } catch (e) {
    console.warn('Notice resetting local data', e);
  }
}

