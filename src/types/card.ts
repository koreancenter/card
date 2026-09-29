export type CardTheme = 
  | 'obsidian'   // 1. Obsidian Noir (Deep Black)
  | 'cotton'     // 2. Cotton White (Fine Art Paper)
  | 'titanium'   // 3. Architectural Titanium
  | 'navy'       // 4. Midnight Diplomatic Navy
  | 'emerald'    // 5. Deep Forest Evergreen & Champagne
  | 'sand'       // 6. Warm Travertine Cashmere
  | 'burgundy'   // 7. Imperial Burgundy & Cordovan
  | 'slate';     // 8. Nordic Mineral Slate

export interface CardData {
  organization: string;
  organizationKr: string;
  name: string;
  nameKr: string;
  title: string;
  titleKr: string;
  phone: string;
  phoneRaw: string;
  whatsappUrl: string;
  email: string;
  website: string;
  websiteDisplay: string;
  addressLines: string[];
  addressKr: string;
  googleMapsUrl: string;
  naverMapsUrl: string;
}

export type PrintLayout = 'single-card' | 'front-back-duo' | 'a4-sheet';
export type PrintSize = 'kr-standard' | 'iso-standard'; // 90x50mm vs 85x55mm
export type CardOrientation = 'portrait' | 'landscape';

export interface PrintConfig {
  layout: PrintLayout;
  size: PrintSize;
  showCropMarks: boolean;
  theme: CardTheme;
  scale: number;
}

export interface StoredCard {
  id: string;
  data: CardData;
  theme: CardTheme;
  category: string;
  isMyCard?: boolean;
  isDefault?: boolean;
  slug?: string;
  customDomain?: string;
  ownerEmail?: string;
  createdAt: string;
  notes?: string;
  scannedImage?: string;
}

export type CardCategory = '전체' | 'VIP 파트너' | '글로벌 네트워크' | '공공·기관' | '투자·금융' | 'IT·기술' | '기타';

export type AppViewMode = 'my-card' | 'vault-cards' | 'vault-list';
