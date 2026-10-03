import { StoredCard, CardData } from '../types/card';
import { CARD_DATA } from './vcard';

export const INITIAL_CARDS: StoredCard[] = [
  {
    id: 'sample-card-goguma-master',
    isMyCard: true,
    isDefault: true,
    slug: 'master',
    customDomain: 'card.goguma.app/master',
    category: 'AI·기술',
    theme: 'sumi_ink',
    layout_type: 'editorial_minimal',
    card_features: {
      show_en_name: true,
      show_sub_org: false,
      show_address: true,
      monogram_text: 'PG'
    },
    createdAt: '2026-03-01',
    notes: 'GOGUMA AI STUDIO 대표 마스터 샘플 명함',
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
    scannedImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
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
      nameKr: '정서윤',
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
    scannedImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
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

const STORAGE_KEY = 'my_cards';
const FALLBACK_STORAGE_KEY = 'user_cards';
const LEGACY_STORAGE_KEY = 'koreancenter_stored_cards_v2';

export function loadUserCards(): StoredCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('my_cards') || localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!raw) {
      // Never automatically seed or save INITIAL_CARDS
      return [];
    }
    const parsed: StoredCard[] = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(c => {
        if (c.id === 'sample-card-alexander-vance' || c.slug === 'vance' || c.id === 'sample-card-goguma-master' || c.slug === 'master') {
          return {
            ...c,
            id: 'sample-card-goguma-master',
            slug: 'master',
            customDomain: 'card.goguma.app/master',
            category: 'AI·기술',
            data: {
              ...CARD_DATA,
              name: 'PARK, GIHONG',
              website: 'https://card.goguma.app/master',
              websiteDisplay: 'card.goguma.app/master'
            }
          };
        }
        return c;
      });
    }
    return [];
  } catch (e) {
    console.error('Failed to load cards from storage', e);
    return [];
  }
}

export const loadStoredCards = loadUserCards;

export function saveUserCards(cards: StoredCard[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (!cards || cards.length === 0) {
      localStorage.removeItem('my_cards');
      localStorage.removeItem(FALLBACK_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem('saved_cards');
      return;
    }
    localStorage.setItem('my_cards', JSON.stringify(cards));
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(cards));
    localStorage.setItem('saved_cards', JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save cards to storage', e);
  }
}

export const saveStoredCards = saveUserCards;

/**
 * Completely clears all local data stored by GOGUMA CARD STUDIO:
 * user cards, PIN hash, biometric keys, sync IDs, and lazy setup preferences.
 */
export function clearAllLocalData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('my_cards');
    localStorage.removeItem(FALLBACK_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem('saved_cards');
    localStorage.removeItem('app_pin_hash');
    localStorage.removeItem('app_pin_last_verified_at');
    localStorage.removeItem('biometric_credential_id');
    localStorage.removeItem('wallet_sync_id');
    localStorage.removeItem('card_sync_id');
    localStorage.removeItem('lazy_pin_dismissed');
    sessionStorage.clear();
  } catch (e) {
    console.error('Failed to reset local data', e);
  }
}
