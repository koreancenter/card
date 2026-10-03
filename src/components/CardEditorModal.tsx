import React, { useState, useEffect, useRef } from 'react';
import { StoredCard, CardTheme, CardData, CardLayoutType, CardFeatures, CardCategory } from '../types/card';
import { LAYOUT_PRESETS } from '../constants/templates';
import { 
  X, Check, Edit3, Plus, Globe, 
  Layers, Palette, User, Phone, 
  Upload, Trash2, Copy, CheckCircle2
} from 'lucide-react';
import { BusinessCardFront } from './BusinessCardFront';
import { BusinessCardBack } from './BusinessCardBack';
import { APP_BASE_DOMAIN, normalizeDomain } from '../utils/domain';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: StoredCard;
  onSave: (updatedCard: StoredCard) => void;
  isMyCardMode?: boolean;
  isCreating?: boolean;
}

export type EditorTab = 'visual_atelier' | 'identity_profile' | 'theme_styling' | 'layout' | 'profile_typography' | 'contact_channels';

export const THEME_OPTIONS: {
  id: CardTheme;
  name: string;
  description: string;
  dotColor: string;
  accent: string;
}[] = [
  {
    id: 'sumi_ink',
    name: '수묵 인크',
    description: '깊은 먹색 매트 캔버스와 웜 아이보리, 샴페인 황동 액센트',
    dotColor: '#0B0C10',
    accent: '#C5A880'
  },
  {
    id: 'warm_paper',
    name: '웜 페이퍼',
    description: '파인아트 코튼 아이보리와 딥 차콜 활자, 딥 와인 프라이머리',
    dotColor: '#F8F4EB',
    accent: '#6B1D42'
  },
  {
    id: 'deep_forest',
    name: '딥 포레스트',
    description: '절제된 다크 에메랄드와 오프화이트, 앤틱 브론즈 디테일',
    dotColor: '#0D1F18',
    accent: '#C2A478'
  },
  {
    id: 'classic_navy',
    name: '클래식 네이비',
    description: '미드나잇 인디고와 실버화이트 활자, 플래티넘 실버 림',
    dotColor: '#0A1128',
    accent: '#D0D9E8'
  },
  {
    id: 'obsidian',
    name: '옵시디언 블랙',
    description: '칠흑 같은 흑요석 매트 질감과 선명한 퓨어 골드',
    dotColor: '#0C0C0D',
    accent: '#D4AF37'
  },
  {
    id: 'sand',
    name: '샌드 캐시미어',
    description: '따뜻한 모래사장 린넨 텍스처와 소프트 차콜 그레이',
    dotColor: '#F6F3EC',
    accent: '#544B40'
  },
  {
    id: 'burgundy',
    name: '임페리얼 버건디',
    description: '기품 있는 딥 벨벳 와인 컬러와 로즈골드 메탈릭 하이라이트',
    dotColor: '#15070B',
    accent: '#E6A5B8'
  },
  {
    id: 'titanium',
    name: '티타늄 그레이',
    description: '정밀 가공된 티타늄 금속 톤과 현대적인 크롬 실버 라인',
    dotColor: '#18181B',
    accent: '#A1A1AA'
  }
];

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  card,
  onSave,
  isMyCardMode = false,
  isCreating = false
}) => {
  const [formData, setFormData] = useState<CardData>({ ...card.data });
  const [theme, setTheme] = useState<CardTheme>(card.theme || 'sumi_ink');
  const [layoutType, setLayoutType] = useState<CardLayoutType>(card.layout_type || 'editorial_minimal');
  const [features, setFeatures] = useState<CardFeatures>({
    show_en_name: card.card_features?.show_en_name ?? true,
    show_sub_org: card.card_features?.show_sub_org ?? true,
    show_address: card.card_features?.show_address ?? true,
    custom_logo: card.card_features?.custom_logo ?? '',
    monogram_text: card.card_features?.monogram_text ?? ''
  });
  const [category, setCategory] = useState<string>(card.category || '글로벌 네트워크');
  const [notes, setNotes] = useState<string>(card.notes || '');
  const [slug, setSlug] = useState<string>(card.slug || '');
  const [customDomain, setCustomDomain] = useState<string>(card.customDomain || '');
  const [isDefault, setIsDefault] = useState<boolean>(Boolean(card.isDefault));
  const [isPhotoCard, setIsPhotoCard] = useState<boolean>(Boolean(card.isPhotoCard));
  const [scannedImage, setScannedImage] = useState<string | undefined>(card.scannedImage);
  const [scannedImageBack, setScannedImageBack] = useState<string | undefined>(card.scannedImageBack);

  // 2-Tab Unified Architecture (Visual Atelier & Identity Profile)
  const [activeTab, setActiveTab] = useState<'visual_atelier' | 'identity_profile'>('visual_atelier');
  const [previewFace, setPreviewFace] = useState<'front' | 'back'>('front');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever card or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...card.data });
      setTheme(card.theme || 'sumi_ink');
      setLayoutType(card.layout_type || 'editorial_minimal');
      setFeatures({
        show_en_name: card.card_features?.show_en_name ?? true,
        show_sub_org: card.card_features?.show_sub_org ?? true,
        show_address: card.card_features?.show_address ?? true,
        custom_logo: card.card_features?.custom_logo ?? '',
        monogram_text: card.card_features?.monogram_text ?? ''
      });
      setCategory(card.category || (isMyCardMode ? '글로벌 네트워크' : 'VIP 파트너'));
      setNotes(card.notes || '');
      setSlug(card.slug || (card.id.startsWith('my-card') ? 'mrpark' : ''));
      setCustomDomain(card.customDomain || '');
      setIsDefault(Boolean(card.isDefault));
      setIsPhotoCard(Boolean(card.isPhotoCard));
      setScannedImage(card.scannedImage);
      setScannedImageBack(card.scannedImageBack);
      setActiveTab('visual_atelier');
      setPreviewFace('front');
    }
  }, [card, isOpen, isMyCardMode]);

  if (!isOpen) return null;

  const handleChange = (field: keyof CardData, value: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      if (field === 'phone') {
        const raw = value.replace(/[^0-9+]/g, '');
        updated.phoneRaw = raw;
        if (!prev.whatsappUrl || prev.whatsappUrl.includes('wa.me')) {
          updated.whatsappUrl = raw ? `https://wa.me/${raw.replace(/^\+/, '')}` : '';
        }
      }
      if (field === 'website') {
        updated.websiteDisplay = value.replace(/^https?:\/\//, '');
      }
      return updated;
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFeatures(prev => ({ ...prev, custom_logo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const cleanCustomDomain = customDomain ? normalizeDomain(customDomain) : '';
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || 'card';
  const effectiveUrl = cleanCustomDomain 
    ? `https://${cleanCustomDomain}` 
    : `https://${APP_BASE_DOMAIN}/${cleanSlug}`;
  const effectiveDisplayUrl = cleanCustomDomain || `${APP_BASE_DOMAIN}/${cleanSlug}`;

  const copyDisplayUrl = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(effectiveUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleSave = () => {
    const finalData: CardData = {
      ...formData,
      website: effectiveUrl,
      websiteDisplay: effectiveDisplayUrl
    };

    const updated: StoredCard = {
      ...card,
      data: finalData,
      theme,
      layout_type: layoutType,
      card_features: features,
      category,
      notes,
      slug: cleanSlug,
      customDomain: cleanCustomDomain || undefined,
      isDefault: isMyCardMode ? isDefault : false,
      isMyCard: isMyCardMode || card.isMyCard,
      scannedImage,
      scannedImageBack,
      isPhotoCard
    };
    onSave(updated);
    onClose();
  };

  const renderLayoutMiniWireframe = (id: CardLayoutType, isSelected: boolean) => {
    const strokeClass = isSelected ? 'bg-[#C5A880]' : 'bg-neutral-600';
    const subClass = isSelected ? 'bg-[#C5A880]/60' : 'bg-neutral-700';

    if (id === 'editorial_minimal') {
      return (
        <div className="w-full aspect-[9/5] p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className={`w-12 h-1 rounded ${subClass}`} />
            <div className={`w-20 h-1.5 rounded ${strokeClass}`} />
          </div>
          <div className="space-y-1 my-auto">
            <div className={`w-16 h-2 rounded ${strokeClass}`} />
            <div className={`w-10 h-1 rounded ${subClass}`} />
          </div>
          <div className="flex justify-between items-end pt-1 border-t border-white/5">
            <div className={`w-12 h-1 rounded ${subClass}`} />
            <div className={`w-8 h-1 rounded ${subClass}`} />
          </div>
        </div>
      );
    }

    if (id === 'monogram_executive') {
      return (
        <div className="w-full aspect-[9/5] p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between items-center text-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-4 h-4 rounded-full border border-dashed flex items-center justify-center ${isSelected ? 'border-[#C5A880]' : 'border-neutral-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${strokeClass}`} />
            </div>
            <div className={`w-14 h-1 rounded ${subClass}`} />
          </div>
          <div className="space-y-1 my-auto">
            <div className={`w-16 h-2 rounded ${strokeClass}`} />
            <div className={`w-12 h-1 rounded ${subClass}`} />
          </div>
          <div className={`w-24 h-1 rounded ${subClass}`} />
        </div>
      );
    }

    if (id === 'vertical_atelier') {
      return (
        <div className="w-full aspect-[5/8] p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between items-center text-center">
          <div className="space-y-1 w-full flex flex-col items-center">
            <div className={`w-10 h-1 rounded ${subClass}`} />
            <div className={`w-12 h-1.5 rounded ${strokeClass}`} />
          </div>
          <div className="space-y-1.5 my-auto w-full flex flex-col items-center">
            <div className={`w-14 h-2 rounded ${strokeClass}`} />
            <div className={`w-8 h-1 rounded ${subClass}`} />
          </div>
          <div className="space-y-1 w-full pt-1 border-t border-white/5 flex flex-col items-center">
            <div className={`w-12 h-1 rounded ${subClass}`} />
            <div className={`w-10 h-1 rounded ${subClass}`} />
          </div>
        </div>
      );
    }

    if (id === 'swiss_typo_bold') {
      return (
        <div className="w-full aspect-[9/5] p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between">
          <div className={`w-24 h-1.5 rounded font-black ${strokeClass}`} />
          <div className="space-y-1 my-auto">
            <div className={`w-20 h-2.5 rounded ${strokeClass}`} />
            <div className="flex items-center gap-1">
              <div className={`w-2 h-1 rounded ${strokeClass}`} />
              <div className={`w-12 h-1 rounded ${subClass}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/5">
            <div className={`w-10 h-1 rounded ${subClass}`} />
            <div className={`w-8 h-1 rounded ${subClass}`} />
          </div>
        </div>
      );
    }

    // warm_organic
    return (
      <div className="w-full aspect-[9/5] p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className={`w-14 h-1 rounded ${subClass}`} />
          <div className={`w-2 h-2 rounded-full ${strokeClass}`} />
        </div>
        <div className="space-y-1 my-auto">
          <div className={`w-16 h-1.5 rounded ${strokeClass}`} />
          <div className={`w-10 h-1 rounded ${subClass}`} />
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-white/5">
          <div className={`w-10 h-1 rounded ${subClass}`} />
          <div className={`w-6 h-1 rounded ${subClass}`} />
        </div>
      </div>
    );
  };

  const categories: CardCategory[] = [
    'VIP 파트너',
    '글로벌 네트워크',
    '공공·기관',
    '투자·금융',
    'IT·기술',
    '기타'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl bg-[#0F1015] border border-white/10 text-neutral-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0B0C10]">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {isCreating 
                ? '새로운 럭셔리 디지털 명함 만들기' 
                : isMyCardMode 
                  ? '내 디지털 명함 커스터마이징' 
                  : '명함 정보 & 디자인 에디터'}
            </h3>
            <p className="text-xs text-neutral-400">
              절제된 여백과 큐레이션된 소재 팔레트로 완성도 높은 디지털 아이덴티티를 완성합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Tab Unified Navigation (Visual Atelier & Identity Profile) */}
        <div className="flex items-center px-5 sm:px-7 pt-3 pb-2.5 border-b border-white/5 bg-[#0B0C10]/80 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('visual_atelier')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'visual_atelier'
                ? 'bg-[#C5A880] text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>비주얼 아틀리에 (소재 & 레이아웃)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('identity_profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'identity_profile'
                ? 'bg-[#C5A880] text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>인적사항 & 활자 (프로필 & 채널)</span>
          </button>
        </div>

        {/* Main Content Area: Split View (Form Left 7 cols, Gallery Showcase Right 5 cols) */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 text-xs grid grid-cols-1 lg:grid-cols-12 gap-7">
          
          {/* ================= LEFT COLUMN: CLEAN FORM INSPECTOR (7 COLS) ================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* ---------------- TAB 1: VISUAL ATELIER (THEME & LAYOUT) ---------------- */}
            {activeTab === 'visual_atelier' && (
              <div className="space-y-7 animate-in fade-in duration-200">
                
                {/* 1. Theme Swatches */}
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-[#C5A880] font-mono">01.</span>
                      <span>소재 & 테마 팔레트</span>
                    </label>
                    <p className="text-[11px] text-neutral-400">
                      명함 전·후면에 일관되게 적용될 프리미엄 촉감 질감과 메탈릭 액센트입니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {THEME_OPTIONS.map((t) => {
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 group ${
                            isSelected
                              ? 'bg-white/10 border-[#C5A880] ring-1 ring-[#C5A880]/50 shadow-md'
                              : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div 
                            className="relative w-9 h-9 rounded-full border border-white/20 shrink-0 shadow-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105"
                            style={{ backgroundColor: t.dotColor }}
                          >
                            <div 
                              className="w-3 h-3 rounded-full shadow-md border border-black/20"
                              style={{ backgroundColor: t.accent }}
                            />
                            {isSelected && (
                              <div className="absolute inset-0 ring-2 ring-[#C5A880] ring-offset-2 ring-offset-[#0F1015] rounded-full" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`font-bold text-xs truncate ${isSelected ? 'text-[#C5A880]' : 'text-white'}`}>
                                {t.name}
                              </span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />}
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                              {t.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.06] pt-6 space-y-3">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-[#C5A880] font-mono">02.</span>
                      <span>아키텍처 레이아웃</span>
                    </label>
                    <p className="text-[11px] text-neutral-400">
                      직함과 성향, 활동 분야에 맞춰 설계된 그리드 비례를 선택합니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {LAYOUT_PRESETS.map((preset) => {
                      const isSelected = layoutType === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setLayoutType(preset.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                            isSelected
                              ? 'bg-[#C5A880]/15 border-[#C5A880] shadow-md ring-1 ring-[#C5A880]/40'
                              : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="mb-2.5 w-full">
                            {renderLayoutMiniWireframe(preset.id, isSelected)}
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`font-bold text-xs ${isSelected ? 'text-[#C5A880]' : 'text-white'}`}>
                                {preset.name}
                              </span>
                              <span className="text-[9px] font-mono text-neutral-400">
                                {preset.aspectRatio}
                              </span>
                            </div>
                            <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                              {preset.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Switch to next tab button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('identity_profile')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    <span>인적사항 & 활자 입력하기</span>
                    <span>→</span>
                  </button>
                </div>

              </div>
            )}

            {/* ---------------- TAB 2: IDENTITY PROFILE (CONTENT & CONTACT) ---------------- */}
            {activeTab === 'identity_profile' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 1. Organization & Title */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-[#C5A880] font-mono">01.</span>
                    <span>소속 및 직함</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">소속 기관명 (국문)</label>
                      <input
                        type="text"
                        value={formData.organizationKr}
                        onChange={(e) => handleChange('organizationKr', e.target.value)}
                        placeholder="예: 한국센터글로벌네트워크"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 focus:outline-none text-white text-xs transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">소속 기관명 (영문)</label>
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) => handleChange('organization', e.target.value)}
                        placeholder="예: Korean Center Global Network"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 focus:outline-none text-white text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">직책 및 역할 (국문)</label>
                      <input
                        type="text"
                        value={formData.titleKr}
                        onChange={(e) => handleChange('titleKr', e.target.value)}
                        placeholder="예: 대표이사 / 총괄의장"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 focus:outline-none text-white text-xs transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">직책 및 역할 (영문)</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="예: President Director"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 focus:outline-none text-white text-xs transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Name & Identity */}
                <div className="border-t border-white/[0.06] pt-6 space-y-3">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-[#C5A880] font-mono">02.</span>
                    <span>성명 표기 및 정체성</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">주 성명 (Primary Name)</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="예: PARK, GIHONG"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 focus:outline-none text-white text-xs font-semibold transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">보조 국문 성명 (Sub Name)</label>
                      <input
                        type="text"
                        value={formData.nameKr}
                        onChange={(e) => handleChange('nameKr', e.target.value)}
                        placeholder="예: 박기홍"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 focus:outline-none text-white text-xs transition-colors"
                      />
                    </div>
                  </div>

                  {/* Clean Minimalist Checkbox Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={features.show_en_name !== false}
                        onChange={(e) => setFeatures(prev => ({ ...prev, show_en_name: e.target.checked }))}
                        className="w-4 h-4 rounded border-white/20 text-[#C5A880] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[11px] text-neutral-300">영문/보조 성명 서브텍스트 표기</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={features.show_sub_org !== false}
                        onChange={(e) => setFeatures(prev => ({ ...prev, show_sub_org: e.target.checked }))}
                        className="w-4 h-4 rounded border-white/20 text-[#C5A880] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[11px] text-neutral-300">소속 기관 보조 표기 유지</span>
                    </label>
                  </div>
                </div>

                {/* 3. Direct Contact Channels */}
                <div className="border-t border-white/[0.06] pt-6 space-y-3">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-[#C5A880] font-mono">03.</span>
                    <span>직통 연락 채널</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">전화번호</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+82 10-2824-9672"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 focus:outline-none text-white text-xs font-mono transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">공식 이메일</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="mrpark@koreancenter.net"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 focus:outline-none text-white text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400">사업장 주소</label>
                    <input
                      type="text"
                      value={formData.addressKr}
                      onChange={(e) => handleChange('addressKr', e.target.value)}
                      placeholder="경기도 부천시 원미구 길주로 137"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 focus:outline-none text-white text-xs transition-colors"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={features.show_address !== false}
                      onChange={(e) => setFeatures(prev => ({ ...prev, show_address: e.target.checked }))}
                      className="w-4 h-4 rounded border-white/20 text-[#C5A880] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-neutral-300">주소 블록 카드 노출 (해제 시 주소 숨김)</span>
                  </label>
                </div>

                {/* 4. Emblem & Custom Logo */}
                <div className="border-t border-white/[0.06] pt-6 space-y-3">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-[#C5A880] font-mono">04.</span>
                    <span>엠블럼 및 로고 설정 (선택)</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">텍스트 모노그램 (이니셜 2~4자)</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={features.monogram_text || ''}
                        onChange={(e) => setFeatures(prev => ({ ...prev, monogram_text: e.target.value.toUpperCase() }))}
                        placeholder="예: PK 또는 KC"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 focus:outline-none text-white text-xs font-mono uppercase tracking-widest transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">커스텀 기업/개인 로고</label>
                      <input 
                        type="file" 
                        ref={logoInputRef} 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoUpload} 
                      />
                      {features.custom_logo ? (
                        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/10">
                          <img 
                            src={features.custom_logo} 
                            alt="Logo" 
                            className="h-6 w-auto max-w-[80px] object-contain rounded" 
                          />
                          <button
                            type="button"
                            onClick={() => setFeatures(prev => ({ ...prev, custom_logo: undefined }))}
                            className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                            title="로고 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-dashed border-white/15 hover:border-[#C5A880] text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>로고 이미지 첨부</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Domain & Category */}
                <div className="border-t border-white/[0.06] pt-6 space-y-3">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-[#C5A880] font-mono">05.</span>
                    <span>도메인 및 관리 정보</span>
                  </label>

                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400">기본 전용 웹 주소 슬러그</label>
                    <div className="flex rounded-xl bg-white/[0.02] border border-white/10 focus-within:border-[#C5A880] overflow-hidden text-xs">
                      <span className="px-3 py-2.5 bg-neutral-800/60 text-neutral-400 font-mono select-none text-[11px] shrink-0 border-r border-white/10">
                        {APP_BASE_DOMAIN}/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="mrpark"
                        className="w-full px-3 py-2.5 bg-transparent text-[#C5A880] focus:outline-none font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">독립 도메인 (선택)</label>
                      <input
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="mrpark.koreancenter.net"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-mono transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">분류 카테고리</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs cursor-pointer transition-colors"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isMyCardMode && (
                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 text-[#C5A880] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[11px] text-neutral-300">기본 대표 명함으로 지정 (앱 접속 시 우선 노출)</span>
                    </label>
                  )}
                </div>

                {/* Back to visual atelier button */}
                <div className="pt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setActiveTab('visual_atelier')}
                    className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    ← 소재 & 레이아웃 변경
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* ================= RIGHT COLUMN: GALLERY SHOWCASE VIEWPORT (5 COLS) ================= */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-3xl bg-[#0B0C10] border border-white/10 shadow-2xl relative">
            
            {/* Gallery Top Bar */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-[11px] text-neutral-400 font-mono">
                {layoutType === 'vertical_atelier' ? '50 × 80 mm' : '90 × 50 mm'} · {LAYOUT_PRESETS.find(p => p.id === layoutType)?.name}
              </span>

              {/* Front / Back Toggle */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreviewFace('front')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    previewFace === 'front' ? 'bg-[#C5A880] text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  앞면
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFace('back')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    previewFace === 'back' ? 'bg-[#C5A880] text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  뒷면
                </button>
              </div>
            </div>

            {/* Tactile Card Rendering Canvas */}
            <div className="my-auto py-6 flex flex-col items-center justify-center">
              <div 
                className={`w-full ${
                  layoutType === 'vertical_atelier' 
                    ? 'max-w-[210px] sm:max-w-[230px]' 
                    : 'max-w-[320px] sm:max-w-[340px]'
                } shadow-[0_24px_64px_rgba(0,0,0,0.85)] rounded-2xl overflow-hidden ring-1 ring-white/15 transition-all duration-300 hover:scale-[1.01]`}
              >
                {previewFace === 'front' ? (
                  <BusinessCardFront 
                    data={{ ...formData, website: effectiveUrl, websiteDisplay: effectiveDisplayUrl }} 
                    theme={theme}
                    layout_type={layoutType}
                    card_features={features}
                    isPrintPreview={false} 
                    isPhotoCard={isPhotoCard}
                    photoUrl={scannedImage}
                  />
                ) : (
                  <BusinessCardBack 
                    data={{ ...formData, website: effectiveUrl, websiteDisplay: effectiveDisplayUrl }} 
                    theme={theme}
                    layout_type={layoutType}
                    isPrintPreview={false}
                    backPhotoUrl={scannedImageBack}
                  />
                )}
              </div>
            </div>

            {/* Understated Minimalist Link Bar */}
            <div className="w-full pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span className="truncate text-neutral-300">{effectiveDisplayUrl}</span>
              <button
                type="button"
                onClick={copyDisplayUrl}
                className="flex items-center gap-1 text-[#C5A880] hover:text-[#d6b991] transition-colors cursor-pointer shrink-0 ml-2 font-sans text-xs"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? '복사됨' : '복사'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-t border-white/10 bg-[#0B0C10] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
          >
            취소
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#d6b991] text-black font-bold text-xs transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{isCreating ? '새 럭셔리 명함 등록' : '수정 사항 저장'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
