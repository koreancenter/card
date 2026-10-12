import { CardLayoutType, ThemePreset, CardTheme, CardFeatures } from '../types/card';

export interface LayoutPresetDefinition {
  id: CardLayoutType;
  name: string;
  nameEn: string;
  description: string;
  recommendedFor: string;
  defaultOrientation: 'landscape' | 'portrait';
  aspectRatio: string;
  iconType: string;
}

export const LAYOUT_PRESETS: LayoutPresetDefinition[] = [
  {
    id: 'editorial_minimal',
    name: '에디토리얼 미니멀',
    nameEn: 'Editorial Minimal',
    description: '비대칭 2단 그리드와 국·영문 듀얼 타이포그래피. 정제된 레이아웃의 정석.',
    recommendedFor: '재단, 국제 네트워크, 고위 공직, 외교',
    defaultOrientation: 'landscape',
    aspectRatio: '9 / 5',
    iconType: 'grid-asymmetric'
  },
  {
    id: 'monogram_executive',
    name: '모노그램 익제큐티브',
    nameEn: 'Monogram Executive',
    description: '상단 중앙 우아한 모노그램 엠블럼과 품격 있는 세리프 서체.',
    recommendedFor: 'C-Level, 사모펀드 파트너, 프라이빗 뱅커, 로펌',
    defaultOrientation: 'landscape',
    aspectRatio: '9 / 5',
    iconType: 'shield-monogram'
  },
  {
    id: 'warm_organic',
    name: '웜 오가닉',
    nameEn: 'Warm Organic',
    description: '부드러운 한지/파인아트 코튼 질감과 여백의 미학을 극대화한 클래식 비례.',
    recommendedFor: '헤리티지 문화재단, 작가, 학술 석학, 갤러리스트',
    defaultOrientation: 'landscape',
    aspectRatio: '9 / 5',
    iconType: 'organic-leaf'
  },
  {
    id: 'swiss_typo_bold',
    name: '스위스 볼드 타이포',
    nameEn: 'Swiss Typo Bold',
    description: '모던 그로테스크 산세리프, 대담한 성명 프레즌스와 정확한 모듈 그리드.',
    recommendedFor: '테크 파운더, 글로벌 벤처, 디자인 아키텍트',
    defaultOrientation: 'landscape',
    aspectRatio: '9 / 5',
    iconType: 'swiss-bold'
  },
  {
    id: 'vertical_atelier',
    name: '버티컬 아틀리에',
    nameEn: 'Vertical Atelier',
    description: '5:8 세로 비율의 건축적 절제미와 정교한 마이크로 메타데이터.',
    recommendedFor: '건축가, 크리에이티브 디렉터, 수석 컨설턴트, 아티스트',
    defaultOrientation: 'portrait',
    aspectRatio: '5 / 8',
    iconType: 'vertical-ratio'
  }
];

export interface ThemePresetDefinition {
  id: ThemePreset;
  name: string;
  nameEn: string;
  description: string;
  canvasBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentName: string;
  borderClass: string;
  hairlineClass: string;
  hoverHighlight: string;
  qrBg: string;
  dotColor: string;
  isLight: boolean;
}

export const LUXURY_THEME_PRESETS: ThemePresetDefinition[] = [
  {
    id: 'pure_white',
    name: '럭셔리 퓨어 화이트 (Pure White)',
    nameEn: 'Luxury Pure White & Monochrome Black',
    description: '순백 프리미엄 캔버스(#FFFFFF)와 깊이 있는 블랙 텍스트, 모노크롬 정밀 디테일',
    canvasBg: 'bg-[#FFFFFF]',
    textPrimary: 'text-[#111111]',
    textSecondary: 'text-[#4A4A4A]',
    textMuted: 'text-[#737373]',
    accent: '#000000',
    accentName: '모노크롬 블랙 (#000000)',
    borderClass: 'border-[#E5E5E5]',
    hairlineClass: 'border-[#E5E5E5]',
    hoverHighlight: 'hover:bg-[#F5F5F5]',
    qrBg: 'bg-[#F5F5F5]',
    dotColor: '#FFFFFF',
    isLight: true
  },
  {
    id: 'sumi_ink',
    name: '수묵 인크 (Sumi Ink)',
    nameEn: 'Sumi Ink & Champagne Brass',
    description: '깊은 먹색 매트 캔버스(#0B0C10)와 웜 아이보리 텍스트, 샴페인 황동 액센트',
    canvasBg: 'bg-[#0B0C10]',
    textPrimary: 'text-[#F8F4EB]',
    textSecondary: 'text-[#C5BEB3]',
    textMuted: 'text-[#878072]',
    accent: '#C5A880',
    accentName: '샴페인 브라스 (#C5A880)',
    borderClass: 'border-[#23242A]',
    hairlineClass: 'border-[#23242A]/80',
    hoverHighlight: 'hover:bg-[#1E1F26]',
    qrBg: 'bg-[#15161D]',
    dotColor: '#0B0C10',
    isLight: false
  },
  {
    id: 'warm_paper',
    name: '웜 페이퍼 (Warm Paper)',
    nameEn: 'Fine Cotton Ivory & Monochrome',
    description: '파인아트 코튼 아이보리(#F8F4EB)와 딥 차콜 텍스트, 럭셔리 모노크롬 액센트',
    canvasBg: 'bg-[#F8F4EB]',
    textPrimary: 'text-[#1F2023]',
    textSecondary: 'text-[#4F4C47]',
    textMuted: 'text-[#827D73]',
    accent: '#111111',
    accentName: '모노크롬 블랙 (#111111)',
    borderClass: 'border-[#DFD7C7]',
    hairlineClass: 'border-[#DFD7C7]/90',
    hoverHighlight: 'hover:bg-[#ECE4D5]',
    qrBg: 'bg-[#EFE8DC]',
    dotColor: '#F8F4EB',
    isLight: true
  },
  {
    id: 'deep_forest',
    name: '딥 포레스트 (Deep Forest)',
    nameEn: 'Dark Forest Emerald & Antique Bronze',
    description: '절제된 다크 에메랄드(#0D1F18)와 오프화이트 서체, 웜 앤틱 브론즈 디테일',
    canvasBg: 'bg-[#0D1F18]',
    textPrimary: 'text-[#F4F7F4]',
    textSecondary: 'text-[#AEC2B4]',
    textMuted: 'text-[#6F8776]',
    accent: '#C2A478',
    accentName: '앤틱 브론즈 (#C2A478)',
    borderClass: 'border-[#1C362A]',
    hairlineClass: 'border-[#1C362A]/80',
    hoverHighlight: 'hover:bg-[#152B21]',
    qrBg: 'bg-[#12261E]',
    dotColor: '#0D1F18',
    isLight: false
  },
  {
    id: 'classic_navy',
    name: '클래식 네이비 (Classic Navy)',
    nameEn: 'Midnight Indigo & Platinum',
    description: '미드나잇 인디고(#0A1128)와 실버화이트 활자, 플래티넘 림 힌트',
    canvasBg: 'bg-[#0A1128]',
    textPrimary: 'text-[#F0F4FC]',
    textSecondary: 'text-[#A8BADB]',
    textMuted: 'text-[#6277A2]',
    accent: '#D0D9E8',
    accentName: '플래티넘 실버 (#D0D9E8)',
    borderClass: 'border-[#1E2C52]',
    hairlineClass: 'border-[#1E2C52]/80',
    hoverHighlight: 'hover:bg-[#131D3F]',
    qrBg: 'bg-[#101938]',
    dotColor: '#0A1128',
    isLight: false
  }
];

export interface ResolvedThemeStyle {
  cardBg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHairline: string;
  tagline: string;
  hoverHighlight: string;
  sheen: string;
  qrBg: string;
  isLight: boolean;
}

export function resolveThemeStyles(theme: CardTheme | undefined): ResolvedThemeStyle {
  const t = theme || 'pure_white';

  // Check luxury presets
  if (t === 'pure_white' || t === 'burgundy') {
    return {
      cardBg: 'bg-[#FFFFFF]',
      border: 'border-[#E5E5E5] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12),0_0_1px_1px_rgba(0,0,0,0.06)]',
      textPrimary: 'text-[#111111]',
      textSecondary: 'text-[#4A4A4A]',
      textMuted: 'text-[#737373]',
      accent: '#000000',
      accentHairline: 'border-[#E5E5E5]',
      tagline: 'text-[#111111]',
      hoverHighlight: 'hover:bg-[#F5F5F5]',
      sheen: 'from-black/[0.04] via-transparent to-transparent',
      qrBg: 'bg-[#F5F5F5]',
      isLight: true
    };
  }

  if (t === 'sumi_ink') {
    return {
      cardBg: 'bg-[#0B0C10]',
      border: 'border-[#262420] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85)]',
      textPrimary: 'text-[#F8F4EB]',
      textSecondary: 'text-[#C5BEB3]',
      textMuted: 'text-[#878072]',
      accent: '#C5A880',
      accentHairline: 'border-[#262420]/80',
      tagline: 'text-[#C5A880]',
      hoverHighlight: 'hover:bg-[#1E1F26]',
      sheen: 'from-amber-200/10 via-transparent to-transparent',
      qrBg: 'bg-[#15161D]',
      isLight: false
    };
  }

  if (t === 'warm_paper' || t === 'sand' || t === 'cotton') {
    return {
      cardBg: 'bg-[#F8F4EB]',
      border: 'border-[#DFD7C7] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.2),0_0_1px_1px_rgba(255,255,255,0.4)]',
      textPrimary: 'text-[#1F2023]',
      textSecondary: 'text-[#4F4C47]',
      textMuted: 'text-[#827D73]',
      accent: '#111111',
      accentHairline: 'border-[#DFD7C7]',
      tagline: 'text-[#1F2023]',
      hoverHighlight: 'hover:bg-[#ECE4D5]',
      sheen: 'from-white/70 via-transparent to-transparent',
      qrBg: 'bg-[#EFE8DC]',
      isLight: true
    };
  }

  if (t === 'deep_forest' || t === 'emerald') {
    return {
      cardBg: 'bg-[#0D1F18]',
      border: 'border-[#1C362A] ring-1 ring-[#1C362A]/40 shadow-2xl',
      textPrimary: 'text-[#F4F7F4]',
      textSecondary: 'text-[#AEC2B4]',
      textMuted: 'text-[#6F8776]',
      accent: '#C2A478',
      accentHairline: 'border-[#1C362A]/80',
      tagline: 'text-[#C2A478]',
      hoverHighlight: 'hover:bg-[#152B21]',
      sheen: 'from-emerald-800/15 via-transparent to-transparent',
      qrBg: 'bg-[#12261E]',
      isLight: false
    };
  }

  if (t === 'classic_navy' || t === 'navy') {
    return {
      cardBg: 'bg-[#0A1128]',
      border: 'border-[#1E2C52] shadow-2xl',
      textPrimary: 'text-[#F0F4FC]',
      textSecondary: 'text-[#A8BADB]',
      textMuted: 'text-[#6277A2]',
      accent: '#D0D9E8',
      accentHairline: 'border-[#1E2C52]/80',
      tagline: 'text-[#D0D9E8]',
      hoverHighlight: 'hover:bg-[#131D3F]',
      sheen: 'from-blue-900/15 via-transparent to-transparent',
      qrBg: 'bg-[#101938]',
      isLight: false
    };
  }

  // Legacy Fallbacks
  if (t === 'obsidian' || t === 'titanium' || t === 'slate') {
    return {
      cardBg: 'bg-[#0C0C0D]',
      border: 'border-neutral-800/80 shadow-2xl',
      textPrimary: 'text-neutral-100',
      textSecondary: 'text-neutral-400',
      textMuted: 'text-neutral-500',
      accent: '#C5A880',
      accentHairline: 'border-neutral-800/60',
      tagline: 'text-neutral-300',
      hoverHighlight: 'hover:bg-neutral-800/40',
      sheen: 'from-neutral-800/20 via-transparent to-transparent',
      qrBg: 'bg-neutral-900/80',
      isLight: false
    };
  }

  if (t === 'burgundy' || (t as string) === 'pure_white') {
    return {
      cardBg: 'bg-[#FFFFFF]',
      border: 'border-[#E5E5E5] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12),0_0_1px_1px_rgba(0,0,0,0.06)]',
      textPrimary: 'text-[#111111]',
      textSecondary: 'text-[#4A4A4A]',
      textMuted: 'text-[#737373]',
      accent: '#000000',
      accentHairline: 'border-[#E5E5E5]',
      tagline: 'text-[#111111]',
      hoverHighlight: 'hover:bg-[#F5F5F5]',
      sheen: 'from-black/[0.04] via-transparent to-transparent',
      qrBg: 'bg-[#F5F5F5]',
      isLight: true
    };
  }

  // Default to pure_white
  return {
    cardBg: 'bg-[#FFFFFF]',
    border: 'border-[#E5E5E5] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12),0_0_1px_1px_rgba(0,0,0,0.06)]',
    textPrimary: 'text-[#111111]',
    textSecondary: 'text-[#4A4A4A]',
    textMuted: 'text-[#737373]',
    accent: '#000000',
    accentHairline: 'border-[#E5E5E5]',
    tagline: 'text-[#111111]',
    hoverHighlight: 'hover:bg-[#F5F5F5]',
    sheen: 'from-black/[0.04] via-transparent to-transparent',
    qrBg: 'bg-[#F5F5F5]',
    isLight: true
  };
}

export const DEFAULT_CARD_FEATURES: CardFeatures = {
  show_en_name: true,
  show_sub_org: true,
  show_address: true,
  custom_logo: '',
  monogram_text: ''
};

export function generateMonogram(name: string, nameKr?: string): string {
  if (nameKr && nameKr.length >= 2) {
    // Korean initial/full short monogram
    return nameKr.slice(0, 2);
  }
  if (!name) return 'KC';
  const parts = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}
