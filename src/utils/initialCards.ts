import { StoredCard, CardData } from '../types/card';
import { CARD_DATA } from './vcard';

export const INITIAL_CARDS: StoredCard[] = [
  {
    id: 'my-card-park-gihong',
    isMyCard: true,
    isDefault: true,
    slug: 'mrpark',
    customDomain: 'mrpark.koreancenter.net',
    category: '글로벌 네트워크',
    theme: 'sand',
    createdAt: '2026-03-01',
    notes: '본인 공식 디지털 명함 (card.goguma.app/mrpark | mrpark.koreancenter.net)',
    data: {
      ...CARD_DATA,
      website: 'https://card.goguma.app/mrpark',
      websiteDisplay: 'card.goguma.app/mrpark'
    }
  },
  {
    id: 'my-card-indonesia-center',
    isMyCard: true,
    isDefault: false,
    slug: 'indonesia',
    customDomain: 'mrpark.indonesiacenter.net',
    category: '글로벌 네트워크',
    theme: 'emerald',
    createdAt: '2026-03-05',
    notes: '인도네시아 센터 총괄의장 명함 (card.goguma.app/indonesia | mrpark.indonesiacenter.net)',
    data: {
      organization: 'Indonesia Center Global Network',
      organizationKr: '인도네시아센터글로벌네트워크',
      name: 'PARK, GIHONG',
      nameKr: '박기홍',
      title: 'Founder & Executive Chairman',
      titleKr: '설립자 / 총괄의장',
      phone: '+62-812-2824-9672',
      phoneRaw: '+6281228249672',
      whatsappUrl: 'https://wa.me/6281228249672',
      email: 'mrpark@indonesiacenter.net',
      website: 'https://card.goguma.app/indonesia',
      websiteDisplay: 'card.goguma.app/indonesia',
      addressLines: [
        'Cyber 2 Tower, 18th Fl, Jl. H.R. Rasuna Said',
        'Jakarta Selatan 12950, Indonesia'
      ],
      addressKr: '인도네시아 자카르타 남부 라수나 사이드 사이버 2 타워 18층',
      googleMapsUrl: 'https://maps.google.com/?q=Jakarta+Indonesia',
      naverMapsUrl: 'https://map.naver.com'
    }
  },
  {
    id: 'card-michael-harrison',
    isMyCard: false,
    category: 'VIP 파트너',
    theme: 'navy',
    createdAt: '2026-03-12',
    notes: '워싱턴 DC 국제문화교류 심포지엄 미팅',
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
    theme: 'sand',
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
    theme: 'titanium',
    createdAt: '2026-03-22',
    notes: '아시아태평양 벤처 펀드 운용 총괄',
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

const STORAGE_KEY = 'koreancenter_stored_cards_v1';

export function loadStoredCards(): StoredCard[] {
  if (typeof window === 'undefined') return INITIAL_CARDS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CARDS));
      return INITIAL_CARDS;
    }
    const parsed: StoredCard[] = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure my-card-park-gihong has slug and isDefault
      let updatedList = parsed.map(c => {
        if (c.id === 'my-card-park-gihong') {
          return {
            ...c,
            isMyCard: true,
            isDefault: c.isDefault !== undefined ? c.isDefault : true,
            slug: c.slug || 'koreancenter',
            theme: c.theme === 'obsidian' ? ('sand' as const) : c.theme
          };
        }
        return c;
      });

      // If user doesn't have the Indonesia Center sample card yet, append it as a secondary my-card
      const hasIndonesia = updatedList.some(c => c.id === 'my-card-indonesia-center' || c.slug === 'indonesia');
      if (!hasIndonesia) {
        const indoCard = INITIAL_CARDS.find(c => c.id === 'my-card-indonesia-center');
        if (indoCard) {
          updatedList.splice(1, 0, indoCard);
        }
      }
      return updatedList;
    }
    return INITIAL_CARDS;
  } catch (e) {
    console.error('Failed to load cards from storage', e);
    return INITIAL_CARDS;
  }
}

export function saveStoredCards(cards: StoredCard[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save cards to storage', e);
  }
}
