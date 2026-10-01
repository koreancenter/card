import React, { useState, useEffect, useRef } from 'react';
import { StoredCard, CardTheme, CardData, CardLayoutType, CardFeatures } from '../types/card';
import { LAYOUT_PRESETS, LUXURY_THEME_PRESETS } from '../constants/templates';
import { 
  X, Check, Edit3, Plus, Globe, Sparkles, HelpCircle, Link as LinkIcon, 
  Layers, Palette, Sliders, User, Phone, Mail, MapPin, Share2, 
  Camera, Upload, Trash2, RotateCcw, Copy, ExternalLink, CheckCircle2
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

export type EditorTab = 'layout_theme' | 'profile_typography' | 'contact_channels';

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
  const [showDnsHelp, setShowDnsHelp] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('layout_theme');
  const [previewFace, setPreviewFace] = useState<'front' | 'back'>('front');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoArchiveRef = useRef<HTMLInputElement>(null);

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
      setActiveTab('layout_theme');
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

  const handlePhotoArchiveUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setScannedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // Compute canonical URL preview
  const cleanCustomDomain = customDomain ? normalizeDomain(customDomain) : '';
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || 'card';
  const effectiveUrl = cleanCustomDomain 
    ? `https://${cleanCustomDomain}` 
    : `https://${APP_BASE_DOMAIN}/${cleanSlug}`;
  const effectiveDisplayUrl = cleanCustomDomain || `${APP_BASE_DOMAIN}/${cleanSlug}`;

  const copyDisplayUrl = () => {
    navigator.clipboard.writeText(effectiveUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
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

  // Mini wireframe visual previews for the 5 layout presets
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
          <div className="space-y-1 my-auto flex flex-col items-center">
            <div className={`w-18 h-2 rounded ${strokeClass}`} />
            <div className={`w-10 h-1 rounded ${subClass}`} />
          </div>
          <div className={`w-20 h-1 rounded ${subClass}`} />
        </div>
      );
    }

    if (id === 'vertical_atelier') {
      return (
        <div className="w-full aspect-[9/5] p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center">
          <div className="h-full aspect-[5/8] p-1.5 rounded bg-black/60 border border-white/10 flex flex-col justify-between">
            <div className={`w-6 h-1 rounded ${subClass}`} />
            <div className="space-y-1 my-auto">
              <div className={`w-8 h-1.5 rounded ${strokeClass}`} />
              <div className={`w-5 h-1 rounded ${subClass}`} />
            </div>
            <div className={`w-7 h-1 rounded ${subClass}`} />
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl bg-[#0F1015] border border-white/10 text-neutral-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0B0C10]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30">
                {isCreating ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isCreating 
                  ? '새로운 럭셔리 디지털 명함 만들기' 
                  : isMyCardMode 
                    ? '내 디지털 명함 세미-커스터마이징' 
                    : '명함 정보 & 디자인 에디터'}
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              콰이어트 럭셔리 철학: 디자이너가 큐레이션한 레이아웃과 소재 팔레트로 조화로운 미학을 완성합니다.
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

        {/* 3 Step Segmented Tab Control */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 pb-2.5 border-b border-white/5 bg-[#0B0C10]/80 overflow-x-auto no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('layout_theme')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'layout_theme'
                ? 'bg-[#C5A880] text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. 레이아웃 & 테마 (Layout & Theme)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile_typography')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile_typography'
                ? 'bg-[#C5A880] text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>2. 프로필 & 타이포 (Profile & Typography)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact_channels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'contact_channels'
                ? 'bg-[#C5A880] text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3. 연락처 & 도메인 (Contact & Channels)</span>
          </button>
        </div>

        {/* Main Content Area: Split View (Step Form Left 7 cols, Live Preview Right 5 cols) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ================= LEFT COLUMN: STEP FORMS (7 COLS) ================= */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* ---------------- STEP 1: LAYOUT & THEME TAB ---------------- */}
            {activeTab === 'layout_theme' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* 1. Interactive Preview Selector for 5 Layout Thumbnail Cards */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>5대 럭셔리 레이아웃 프리셋 (Layout Presets)</span>
                    </label>
                    <span className="text-[10px] text-[#C5A880] font-mono">Curated Semi-Custom</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                              : 'bg-[#14151C] border-white/5 hover:border-white/20 hover:bg-[#181922]'
                          }`}
                        >
                          {/* Mini wireframe */}
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

                          <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[9px] text-neutral-400 truncate">
                              {preset.recommendedFor.split(',')[0]}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Visual Swatch Circles for 4 Curated Material Palettes */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>4대 큐레이션 머티리얼 팔레트 (Material Swatches)</span>
                    </label>
                    <span className="text-[10px] text-neutral-400 font-mono">Tactile Art Finishes</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LUXURY_THEME_PRESETS.map((t) => {
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                            isSelected
                              ? 'bg-white/10 border-[#C5A880] ring-1 ring-[#C5A880]/50 shadow-md'
                              : 'bg-[#14151C] border-white/5 hover:border-white/15 hover:bg-[#181922]'
                          }`}
                        >
                          {/* Visual Swatch Circle with 2-Tone Concentric Design */}
                          <div 
                            className="relative w-10 h-10 rounded-full border border-white/20 shrink-0 shadow-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105"
                            style={{ backgroundColor: t.dotColor }}
                          >
                            <div 
                              className="w-3.5 h-3.5 rounded-full shadow-md border border-black/20"
                              style={{ backgroundColor: t.accent }}
                            />
                            {isSelected && (
                              <div className="absolute inset-0 ring-2 ring-[#C5A880] ring-offset-2 ring-offset-[#0F1015] rounded-full" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white truncate">{t.name}</span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" />}
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                              {t.description.split('와 ')[0]}
                            </p>
                            <span 
                              className="text-[9px] font-mono mt-0.5 block truncate font-medium"
                              style={{ color: t.accent }}
                            >
                              Accent • {t.accentName}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation CTA to next step */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile_typography')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    <span>다음: 프로필 & 타이포 설정</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 2: PROFILE & TYPOGRAPHY TAB ---------------- */}
            {activeTab === 'profile_typography' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Standardized Input Fields */}
                <div className="p-4 rounded-2xl bg-[#14151C] border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>소속 및 직함 (Organization & Role)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">소속 기관명 (국문/공식)</label>
                      <input
                        type="text"
                        value={formData.organizationKr}
                        onChange={(e) => handleChange('organizationKr', e.target.value)}
                        placeholder="한국센터글로벌네트워크"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">소속 기관명 (영문 / Sub-org)</label>
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) => handleChange('organization', e.target.value)}
                        placeholder="Korean Center Global Network"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">직책 / 역할 (국문)</label>
                      <input
                        type="text"
                        value={formData.titleKr}
                        onChange={(e) => handleChange('titleKr', e.target.value)}
                        placeholder="대표이사 / 총괄의장"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">직책 / 역할 (영문 Job Title)</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="President Director"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Name Primary & Sub-English */}
                <div className="p-4 rounded-2xl bg-[#14151C] border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>성명 표기 (Name & Identity)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">주 성명 (Primary Name)</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="PARK, GIHONG"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">보조 국문/서브 성명 (Sub Name)</label>
                      <input
                        type="text"
                        value={formData.nameKr}
                        onChange={(e) => handleChange('nameKr', e.target.value)}
                        placeholder="박기홍"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Typography Toggles */}
                  <div className="pt-2 space-y-2 border-t border-white/5">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-[#0B0C10] border border-white/5 cursor-pointer">
                      <div>
                        <p className="text-xs font-semibold text-white">영문/보조 성명 서브텍스트 표기</p>
                        <p className="text-[10px] text-neutral-400">비활성화 시 주 성명만 단독으로 표시합니다.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={features.show_en_name !== false}
                        onChange={(e) => setFeatures(prev => ({ ...prev, show_en_name: e.target.checked }))}
                        className="w-4 h-4 rounded border-neutral-700 text-[#C5A880] focus:ring-0 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-[#0B0C10] border border-white/5 cursor-pointer">
                      <div>
                        <p className="text-xs font-semibold text-white">보조 재단/기관 서브텍스트 표기</p>
                        <p className="text-[10px] text-neutral-400">소속 기관 아래 보조 슬로건/재단 표기를 유지합니다.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={features.show_sub_org !== false}
                        onChange={(e) => setFeatures(prev => ({ ...prev, show_sub_org: e.target.checked }))}
                        className="w-4 h-4 rounded border-neutral-700 text-[#C5A880] focus:ring-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Emblem & Monogram / Custom Logo */}
                <div className="p-4 rounded-2xl bg-[#14151C] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>엠블럼 및 로고 설정 (Monogram & Logo)</span>
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-mono">Optional</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">텍스트 모노그램 (이니셜 2~4자)</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={features.monogram_text || ''}
                        onChange={(e) => setFeatures(prev => ({ ...prev, monogram_text: e.target.value.toUpperCase() }))}
                        placeholder="e.g. PK 또는 KC"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-serif uppercase tracking-widest"
                      />
                      <p className="text-[10px] text-neutral-400">비워둘 경우 성명에서 2글자를 자동 추출합니다.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">커스텀 기업/개인 로고 업로드</label>
                      <input
                        type="file"
                        ref={logoInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      {features.custom_logo ? (
                        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0B0C10] border border-white/10">
                          <img src={features.custom_logo} alt="Custom Logo" className="w-8 h-8 object-contain rounded" />
                          <span className="text-[10px] text-neutral-300 truncate flex-1">로고 이미지 등록됨</span>
                          <button
                            type="button"
                            onClick={() => setFeatures(prev => ({ ...prev, custom_logo: '' }))}
                            className="p-1 text-neutral-400 hover:text-rose-400 cursor-pointer"
                            title="로고 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="w-full py-2 px-3 rounded-xl bg-[#0B0C10] hover:bg-[#181920] border border-white/10 text-xs text-neutral-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>로고 이미지 파일 첨부</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation CTA to next step */}
                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('layout_theme')}
                    className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    ← 이전: 레이아웃 & 테마
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('contact_channels')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    <span>다음: 연락처 & 도메인</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 3: CONTACT CHANNELS TAB ---------------- */}
            {activeTab === 'contact_channels' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Contact Channels */}
                <div className="p-4 rounded-2xl bg-[#14151C] border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>직통 연락 채널 (Direct Channels)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">전화번호 (+국가번호 포함)</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+82 10-2824-9672"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">공식 이메일 주소</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="mrpark@koreancenter.net"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Physical Address */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] text-neutral-400">사업장 주소 (Physical Address)</label>
                    <input
                      type="text"
                      value={formData.addressKr}
                      onChange={(e) => handleChange('addressKr', e.target.value)}
                      placeholder="경기도 부천시 원미구 길주로 137"
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                    />
                  </div>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-[#0B0C10] border border-white/5 cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold text-white">주소 블록 카드 노출 여부 (show_address)</p>
                      <p className="text-[10px] text-neutral-400">해제 시 주소를 숨기고 미니멀한 직통 연락처만 강조합니다.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={features.show_address !== false}
                      onChange={(e) => setFeatures(prev => ({ ...prev, show_address: e.target.checked }))}
                      className="w-4 h-4 rounded border-neutral-700 text-[#C5A880] focus:ring-0 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Domain & Hosting Address */}
                <div className="p-4 rounded-2xl bg-[#14151C] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>도메인 & 전용 웹 주소 (Domain Slug)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowDnsHelp(!showDnsHelp)}
                      className="flex items-center gap-1 text-[10px] text-[#C5A880] hover:underline cursor-pointer font-mono"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>CNAME 가이드</span>
                    </button>
                  </div>

                  {/* 1. Base URL */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                      <span>기본 제공 접속 주소 ({APP_BASE_DOMAIN}/[slug])</span>
                      <span className="text-[10px] text-emerald-400 font-mono">즉시 활성</span>
                    </label>
                    <div className="flex rounded-xl bg-[#0B0C10] border border-white/10 focus-within:border-[#C5A880] overflow-hidden text-xs">
                      <span className="px-2.5 py-2 bg-neutral-800/80 text-neutral-400 font-mono select-none text-[11px] shrink-0 border-r border-white/10">
                        {APP_BASE_DOMAIN}/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="mrpark"
                        className="w-full px-2.5 py-2 bg-transparent text-[#C5A880] focus:outline-none font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* 2. Custom Domain */}
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    <label className="text-[11px] font-medium text-neutral-300">
                      개인 보유 독립 도메인 연결 (선택)
                    </label>
                    <div className="flex rounded-xl bg-[#0B0C10] border border-white/10 focus-within:border-[#C5A880] overflow-hidden text-xs">
                      <span className="px-2.5 py-2 bg-neutral-800/80 text-neutral-400 font-mono select-none text-[11px] shrink-0 border-r border-white/10">
                        https://
                      </span>
                      <input
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="mrpark.koreancenter.net"
                        className="w-full px-2.5 py-2 bg-transparent text-[#C5A880] focus:outline-none font-mono text-xs"
                      />
                    </div>
                  </div>

                  {showDnsHelp && (
                    <div className="p-3 rounded-xl bg-[#0B0C10] border border-white/10 text-[11px] text-neutral-300 space-y-1.5 animate-in fade-in duration-150">
                      <p className="font-semibold text-white text-[11px]">개인 도메인 CNAME 연결 가이드</p>
                      <p className="text-[10px] text-neutral-400 leading-relaxed">
                        도메인 관리 네임서버(Cloudflare 등)에서 CNAME 레코드를 추가해 주세요:
                      </p>
                      <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-emerald-300 space-y-0.5">
                        <div>유형: <span className="text-white">CNAME</span></div>
                        <div>호스트: <span className="text-white">{customDomain ? customDomain.split('.')[0] : 'mrpark'}</span></div>
                        <div>대상: <span className="text-white">card.goguma.app</span></div>
                      </div>
                    </div>
                  )}

                  {isMyCardMode && (
                    <label className="flex items-center gap-2 text-[11px] text-neutral-300 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="rounded border-neutral-700 text-[#C5A880] focus:ring-0 cursor-pointer"
                      />
                      <span>기본 대표 명함으로 지정 (앱 접속 시 우선 노출)</span>
                    </label>
                  )}
                </div>

                {/* Optional Social Links & Notes */}
                <div className="p-4 rounded-2xl bg-[#14151C] border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>소셜 링크 & 아카이브 메모 (Social & Archive)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">WhatsApp 링크</label>
                      <input
                        type="text"
                        value={formData.whatsappUrl}
                        onChange={(e) => handleChange('whatsappUrl', e.target.value)}
                        placeholder="https://wa.me/821012345678"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">LinkedIn 프로필 링크</label>
                      <input
                        type="text"
                        value={formData.linkedinUrl || ''}
                        onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/gihongpark"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">분류 카테고리</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs cursor-pointer"
                      >
                        <option value="글로벌 네트워크">글로벌 네트워크</option>
                        <option value="VIP 파트너">VIP 파트너</option>
                        <option value="공공·기관">공공·기관</option>
                        <option value="투자·금융">투자·금융</option>
                        <option value="IT·기술">IT·기술</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">관리 메모</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. 파트너십 미팅 명함"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation CTA to previous step */}
                <div className="pt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile_typography')}
                    className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    ← 이전: 프로필 & 타이포
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ================= RIGHT COLUMN: LIVE CARD PREVIEW (5 COLS) ================= */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-3xl bg-[#0B0C10] border border-white/10 shadow-2xl relative">
            
            {/* Live Preview Top Bar */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A880] font-bold">
                  실시간 라이브 프리뷰
                </span>
              </div>

              {/* Front / Back Toggle */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#14151C] border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreviewFace('front')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    previewFace === 'front' ? 'bg-[#C5A880] text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  앞면
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFace('back')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    previewFace === 'back' ? 'bg-[#C5A880] text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  뒷면 (QR)
                </button>
              </div>
            </div>

            {/* Tactile Card Rendering Box */}
            <div className="my-auto py-5 flex flex-col items-center justify-center">
              <div 
                className={`w-full ${
                  layoutType === 'vertical_atelier' 
                    ? 'max-w-[210px] sm:max-w-[230px]' 
                    : 'max-w-[320px] sm:max-w-[340px]'
                } shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden ring-1 ring-white/15 transition-all duration-300 hover:scale-[1.01]`}
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

              {/* Quick Spec Badge */}
              <div className="mt-3 flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                <span className="px-2 py-0.5 rounded-full bg-[#14151C] border border-white/5">
                  {layoutType === 'vertical_atelier' ? '세로형 50×80mm (5:8)' : '가로형 90×50mm (9:5)'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#14151C] border border-white/5 text-[#C5A880]">
                  {LAYOUT_PRESETS.find(p => p.id === layoutType)?.name}
                </span>
              </div>
            </div>

            {/* Canonical Link Box */}
            <div className="w-full p-2.5 rounded-2xl bg-[#14151C] border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#C5A880] truncate font-mono">
                  <LinkIcon className="w-3 h-3 shrink-0" />
                  <span className="font-semibold truncate">{effectiveDisplayUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={copyDisplayUrl}
                  className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-1"
                  title="주소 복사"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-[9px] text-neutral-400 font-sans">
                {cleanCustomDomain ? '독립 도메인 연동 모드' : 'goguma 공용 주소 모드'}
              </p>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0B0C10] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
          >
            취소
          </button>
          
          <div className="flex items-center gap-2">
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
    </div>
  );
};
