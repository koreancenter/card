import React, { useState, useEffect } from 'react';
import { 
  StoredCard, 
  CardTheme, 
  CardData, 
  CardLayoutType, 
  CardFeatures, 
  CardCategory,
  CardCreationMode 
} from '../types/card';
import { LAYOUT_PRESETS } from '../constants/templates';
import { 
  X, Check, RotateCcw,
  Palette, Camera, Code2
} from 'lucide-react';
import { BusinessCardFront } from './BusinessCardFront';
import { BusinessCardBack } from './BusinessCardBack';
import { APP_BASE_DOMAIN, normalizeDomain } from '../utils/domain';
import { CARD_DATA } from '../utils/vcard';
import { TemplateModeEditor } from './editor/TemplateModeEditor';
import { CustomHtmlEditor, DEFAULT_LUXURY_HTML_FRONT, DEFAULT_LUXURY_HTML_BACK } from './editor/CustomHtmlEditor';
import { PhotoArchivingEditor } from './editor/PhotoArchivingEditor';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: StoredCard;
  onSave: (updatedCard: StoredCard) => void;
  isMyCardMode?: boolean;
  isCreating?: boolean;
}

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
    description: '깊은 먹색 매트 & 샴페인 황동',
    dotColor: '#0B0C10',
    accent: '#C5A880'
  },
  {
    id: 'warm_paper',
    name: '웜 페이퍼',
    description: '파인아트 코튼 & 딥 와인',
    dotColor: '#F8F4EB',
    accent: '#6B1D42'
  },
  {
    id: 'deep_forest',
    name: '딥 포레스트',
    description: '다크 에메랄드 & 앤틱 브론즈',
    dotColor: '#0D1F18',
    accent: '#C2A478'
  },
  {
    id: 'classic_navy',
    name: '클래식 네이비',
    description: '미드나잇 인디고 & 플래티넘',
    dotColor: '#0A1128',
    accent: '#D0D9E8'
  },
  {
    id: 'obsidian',
    name: '옵시디언 블랙',
    description: '흑요석 매트 & 퓨어 골드',
    dotColor: '#0C0C0D',
    accent: '#D4AF37'
  },
  {
    id: 'sand',
    name: '샌드 캐시미어',
    description: '린넨 텍스처 & 차콜 그레이',
    dotColor: '#F6F3EC',
    accent: '#544B40'
  },
  {
    id: 'burgundy',
    name: '임페리얼 버건디',
    description: '벨벳 와인 & 로즈골드',
    dotColor: '#15070B',
    accent: '#E6A5B8'
  },
  {
    id: 'titanium',
    name: '티타늄 그레이',
    description: '정밀 티타늄 & 크롬 실버',
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
  // Primary 3-Way Creation Mode: 'template' | 'photo' | 'custom_html'
  const [creationMode, setCreationMode] = useState<CardCreationMode>(
    card.creation_mode || (card.isPhotoCard ? 'photo' : card.html_front ? 'custom_html' : 'template')
  );

  // Template Mode states
  const [templateSubTab, setTemplateSubTab] = useState<'visual_atelier' | 'identity_profile'>('visual_atelier');
  const [theme, setTheme] = useState<CardTheme>(card.theme || 'sumi_ink');
  const [layoutType, setLayoutType] = useState<CardLayoutType>(card.layout_type || 'editorial_minimal');
  const [features, setFeatures] = useState<CardFeatures>({
    show_en_name: card.card_features?.show_en_name ?? true,
    show_sub_org: card.card_features?.show_sub_org ?? true,
    show_address: card.card_features?.show_address ?? true,
    custom_logo: card.card_features?.custom_logo ?? '',
    monogram_text: card.card_features?.monogram_text ?? ''
  });

  // Common Profile Data
  const [formData, setFormData] = useState<CardData>({ ...card.data });
  const [category, setCategory] = useState<string>(card.category || '글로벌 네트워크');
  const [notes, setNotes] = useState<string>(card.notes || '');
  const [slug, setSlug] = useState<string>(card.slug || 'master');
  const [customDomain, setCustomDomain] = useState<string>(card.customDomain || '');
  const [isDefault, setIsDefault] = useState<boolean>(Boolean(card.isDefault));

  // Custom HTML Mode states
  const [htmlFront, setHtmlFront] = useState<string>(
    card.html_front || DEFAULT_LUXURY_HTML_FRONT
  );
  const [htmlBack, setHtmlBack] = useState<string>(
    card.html_back || DEFAULT_LUXURY_HTML_BACK
  );
  const [htmlEditorActiveFace, setHtmlEditorActiveFace] = useState<'front' | 'back'>('front');

  // Photo Mode states
  const [frontImageUrl, setFrontImageUrl] = useState<string | undefined>(
    card.front_image_url || card.scannedImage
  );
  const [backImageUrl, setBackImageUrl] = useState<string | undefined>(
    card.back_image_url || card.scannedImageBack
  );

  // Preview Face
  const [previewFace, setPreviewFace] = useState<'front' | 'back'>('front');

  // Sync state whenever card or isOpen changes
  useEffect(() => {
    if (isOpen) {
      const mode: CardCreationMode = 
        card.creation_mode || (card.isPhotoCard ? 'photo' : card.html_front ? 'custom_html' : 'template');
      setCreationMode(mode);

      const initialAddressEn = 
        card.data.address_en || 
        card.details?.address_en || 
        card.data.details?.address_en || 
        (card.data.addressLines && card.data.addressLines.length > 0 ? card.data.addressLines.join(', ') : '');
      const cleanAddressEn = 
        initialAddressEn.includes('77 Cheongdam-ro') && (initialAddressEn.includes('06015') || initialAddressEn.includes('Republic of Korea'))
          ? '' 
          : initialAddressEn;

      const initialData: CardData = {
        ...CARD_DATA,
        ...card.data,
        name: card.data.name || CARD_DATA.name,
        nameKr: card.data.nameKr || CARD_DATA.nameKr,
        organization: card.data.organization || CARD_DATA.organization,
        organizationKr: card.data.organizationKr || CARD_DATA.organizationKr,
        title: card.data.title || CARD_DATA.title,
        titleKr: card.data.titleKr || CARD_DATA.titleKr,
        phone: card.data.phone || CARD_DATA.phone,
        email: card.data.email || CARD_DATA.email,
        addressKr: card.data.addressKr || CARD_DATA.addressKr,
        address_en: cleanAddressEn,
        addressLines: cleanAddressEn ? [cleanAddressEn] : (card.data.addressLines || []),
        website: card.data.website || CARD_DATA.website,
        websiteDisplay: card.data.websiteDisplay || CARD_DATA.websiteDisplay,
        details: {
          ...card.details,
          show_address: card.card_features?.show_address ?? true,
          show_en_name: card.card_features?.show_en_name ?? true,
          address_en: cleanAddressEn
        }
      };
      setFormData(initialData);
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
      setSlug(card.slug || 'master');
      setCustomDomain(card.customDomain || '');
      setIsDefault(Boolean(card.isDefault));
      setHtmlFront(card.html_front || DEFAULT_LUXURY_HTML_FRONT);
      setHtmlBack(card.html_back || DEFAULT_LUXURY_HTML_BACK);
      setFrontImageUrl(card.front_image_url || card.scannedImage);
      setBackImageUrl(card.back_image_url || card.scannedImageBack);
      setPreviewFace('front');
    }
  }, [card, isOpen, isMyCardMode]);

  if (!isOpen) return null;

  const handleFormFieldChange = (field: keyof CardData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'address_en') {
        updated.address_en = value;
        updated.details = {
          ...updated.details,
          show_address: features.show_address ?? true,
          show_en_name: features.show_en_name ?? true,
          address_en: value
        };
        updated.addressLines = value ? [value] : [];
      }
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

  const cleanCustomDomain = customDomain ? normalizeDomain(customDomain) : '';
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || 'card';
  const effectiveUrl = cleanCustomDomain 
    ? `https://${cleanCustomDomain}` 
    : `https://${APP_BASE_DOMAIN}/${cleanSlug}`;
  const effectiveDisplayUrl = cleanCustomDomain || `${APP_BASE_DOMAIN}/${cleanSlug}`;

  const handleSave = () => {
    const finalAddressEn = formData.address_en ?? formData.details?.address_en ?? '';
    const finalData: CardData = {
      ...formData,
      address_en: finalAddressEn,
      addressLines: finalAddressEn ? [finalAddressEn] : (formData.addressLines || []),
      website: effectiveUrl,
      websiteDisplay: effectiveDisplayUrl,
      details: {
        ...formData.details,
        en_name: formData.nameKr,
        sub_org: formData.subOrg,
        address: formData.addressKr,
        address_en: finalAddressEn,
        slogan: formData.backTagline,
        show_address: features.show_address ?? true,
        show_en_name: features.show_en_name ?? true
      }
    };

    const isPhotoMode = creationMode === 'photo';
    const isHtmlMode = creationMode === 'custom_html';

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
      
      // 3-Way Discriminated Union Architecture Integration
      creation_mode: creationMode,
      owner_key: card.owner_key || `key_${Date.now()}`,
      created_at: card.created_at || new Date().toISOString(),

      // Template details
      details: {
        en_name: formData.nameKr,
        sub_org: formData.subOrg,
        address: formData.addressKr,
        address_en: finalAddressEn,
        slogan: formData.backTagline,
        show_address: features.show_address ?? true,
        show_en_name: features.show_en_name ?? true
      },

      // Custom HTML
      html_front: isHtmlMode ? htmlFront : undefined,
      html_back: isHtmlMode ? htmlBack : undefined,

      // Photo
      front_image_url: isPhotoMode ? frontImageUrl : undefined,
      back_image_url: isPhotoMode ? backImageUrl : undefined,
      scannedImage: isPhotoMode ? frontImageUrl : undefined,
      scannedImageBack: isPhotoMode ? backImageUrl : undefined,
      isPhotoCard: isPhotoMode
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <style>{`
        .editor-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .editor-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .editor-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 9999px; }
        .editor-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
        .editor-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.12) transparent; }
      `}</style>
      <div 
        className="CardEditorModal relative w-full max-w-6xl h-[90vh] max-h-[880px] flex flex-col rounded-3xl bg-[#0F1015] border border-white/10 text-neutral-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0B0C10]">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {isCreating 
                ? '새로운 럭셔리 디지털 명함 생성' 
                : isMyCardMode 
                  ? '내 디지털 명함 커스터마이징' 
                  : '명함 정보 & 디자인 에디터'}
            </h3>
            <p className="text-xs text-white/50">
              3-Way 생성 방식: 디자인 템플릿, 실물 명함 사진 보관, 커스텀 HTML/Tailwind 주입
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="닫기"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 2: PRIMARY 3-WAY CREATION MODE SEGMENTED SWITCH */}
        <div className="px-6 py-2.5 border-b border-white/10 bg-[#0B0C10]/95 shrink-0 flex items-center justify-between gap-3 overflow-x-auto">
          {/* Segmented Switch with Minimalist Luxury Cues: bg-white/[0.03], border-white/10, active in #C5A880 */}
          <div className="inline-flex p-1 rounded-2xl bg-white/[0.03] border border-white/10 gap-1 text-xs">
            {/* 1. 디자인 템플릿 */}
            <button
              type="button"
              onClick={() => setCreationMode('template')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                creationMode === 'template'
                  ? 'bg-[#C5A880] text-black font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>🎨 디자인 템플릿</span>
            </button>

            {/* 2. 실물 명함 사진 */}
            <button
              type="button"
              onClick={() => setCreationMode('photo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                creationMode === 'photo'
                  ? 'bg-[#C5A880] text-black font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>📄 실물 명함 사진</span>
            </button>

            {/* 3. 커스텀 HTML */}
            <button
              type="button"
              onClick={() => setCreationMode('custom_html')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                creationMode === 'custom_html'
                  ? 'bg-[#C5A880] text-black font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>⚡ 커스텀 HTML</span>
            </button>
          </div>

          {/* Quick Sample Reset Button */}
          <button
            type="button"
            onClick={() => {
              setFormData({ ...CARD_DATA });
              setSlug('master');
              setTheme('sumi_ink');
              setLayoutType('editorial_minimal');
              setCreationMode('template');
            }}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer shrink-0"
            title="샘플 데이터 복원"
            aria-label="샘플 데이터 복원"
          >
            <RotateCcw className="w-4 h-4 text-white/30 hover:text-white/80" />
          </button>
        </div>

        {/* Main Content Area: Split View (Left Inputs 5 cols / Right Live Hero Preview 7 cols) */}
        <div className="flex-1 grid grid-cols-12 overflow-y-auto lg:overflow-hidden editor-scrollbar">
          
          {/* ================= LEFT PANEL: INSPECTOR (Selected Creation Mode) ================= */}
          <div className="order-2 lg:order-1 col-span-12 lg:col-span-5 h-auto lg:h-full lg:overflow-y-auto p-5 sm:p-6 lg:p-7 editor-scrollbar space-y-6">
            
            {creationMode === 'template' && (
              <TemplateModeEditor
                theme={theme}
                layoutType={layoutType}
                onChangeTheme={setTheme}
                onChangeLayout={setLayoutType}
                formData={formData}
                onChangeFormField={handleFormFieldChange}
                features={features}
                onChangeFeatures={setFeatures}
                slug={slug}
                onChangeSlug={setSlug}
                customDomain={customDomain}
                onChangeCustomDomain={setCustomDomain}
                category={category}
                onChangeCategory={setCategory}
                isDefault={isDefault}
                onChangeIsDefault={setIsDefault}
                isMyCardMode={isMyCardMode}
                subTab={templateSubTab}
                onChangeSubTab={setTemplateSubTab}
              />
            )}

            {creationMode === 'photo' && (
              <PhotoArchivingEditor
                frontImageUrl={frontImageUrl}
                backImageUrl={backImageUrl}
                onChangeFrontImage={setFrontImageUrl}
                onChangeBackImage={setBackImageUrl}
                cardData={formData}
                onChangeCardData={handleFormFieldChange}
                slug={slug}
                onChangeSlug={setSlug}
                notes={notes}
                onChangeNotes={setNotes}
              />
            )}

            {creationMode === 'custom_html' && (
              <CustomHtmlEditor
                htmlFront={htmlFront}
                htmlBack={htmlBack}
                onChangeFront={setHtmlFront}
                onChangeBack={setHtmlBack}
                cardData={formData}
                onChangeCardData={handleFormFieldChange}
                activeFace={htmlEditorActiveFace}
                onChangeActiveFace={setHtmlEditorActiveFace}
              />
            )}

          </div>

          {/* ================= RIGHT PANEL: PURE GALLERY EXHIBITION ================= */}
          <div className="order-1 lg:order-2 col-span-12 lg:col-span-7 h-auto lg:h-full flex items-center justify-center bg-black/40 border-b lg:border-b-0 lg:border-l border-white/5 p-6 sm:p-10 lg:p-12 relative overflow-hidden select-none">
            {/* Pure Ambient Atmosphere Glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent" />

            {/* Prominently Centered Luxury Card Object Floating on Sumi Ink Canvas */}
            <div 
              className={`${
                layoutType === 'vertical_atelier' && creationMode === 'template'
                  ? 'w-full max-w-[280px] sm:max-w-[320px] aspect-[5/8]' 
                  : 'w-full max-w-[500px] aspect-[1.586/1]'
              } transition-all duration-300 relative [perspective:1200px] cursor-pointer group`}
              onClick={() => setPreviewFace(prev => (prev === 'front' ? 'back' : 'front'))}
              title="클릭하여 앞/뒷면 회전 (Click to flip)"
            >
              <div 
                className={`w-full h-full relative rounded-2xl transition-transform duration-500 ease-out [transform-style:preserve-3d] group-hover:scale-[1.015] shadow-[0_28px_65px_-15px_rgba(0,0,0,0.9),0_15px_30px_-8px_rgba(0,0,0,0.6),0_45px_95px_-20px_rgba(0,0,0,0.98)] ${
                  previewFace === 'back' ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
                }`}
              >
                {/* FRONT FACE */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl overflow-hidden bg-[#0A0B0E]">
                  {creationMode === 'template' && (
                    <BusinessCardFront 
                      data={{ 
                        ...formData, 
                        address_en: formData.address_en ?? formData.details?.address_en,
                        website: effectiveUrl, 
                        websiteDisplay: effectiveDisplayUrl 
                      }} 
                      theme={theme}
                      layout_type={layoutType}
                      card_features={features}
                      isPrintPreview={false} 
                      hideBorder={true}
                    />
                  )}
                  {creationMode === 'photo' && (
                    frontImageUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={frontImageUrl}
                          alt={formData.name || '실물 명함 사진 앞면'}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
                          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#C5A880] tracking-wider uppercase shadow-sm">
                            PHOTO ARCHIVE
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400 bg-neutral-900/60">
                        <Camera className="w-8 h-8 text-[#C5A880]/60 mb-2" />
                        <p className="text-xs font-semibold text-white">등록된 명함 사진이 없습니다</p>
                        <p className="text-[10px] text-neutral-500 mt-1">좌측 패널에서 사진을 업로드해 주세요</p>
                      </div>
                    )
                  )}
                  {creationMode === 'custom_html' && (
                    htmlFront ? (
                      <div 
                        className="w-full h-full overflow-hidden rounded-2xl"
                        dangerouslySetInnerHTML={{ 
                          __html: htmlFront
                            .replace(/^```html\s*/i, '')
                            .replace(/^```\s*/i, '')
                            .replace(/\s*```$/i, '')
                            .trim() 
                        }} 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400 bg-neutral-900/60">
                        <Code2 className="w-8 h-8 text-[#C5A880]/60 mb-2" />
                        <p className="text-xs font-semibold text-white">HTML 코드가 비어 있습니다</p>
                        <p className="text-[10px] text-neutral-500 mt-1">좌측 에디터에 Tailwind HTML 코드를 입력하세요</p>
                      </div>
                    )
                  )}
                </div>

                {/* BACK FACE */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden bg-[#0A0B0E]">
                  {creationMode === 'template' && (
                    <BusinessCardBack 
                      data={{ 
                        ...formData, 
                        address_en: formData.address_en ?? formData.details?.address_en,
                        website: effectiveUrl, 
                        websiteDisplay: effectiveDisplayUrl 
                      }} 
                      theme={theme}
                      layout_type={layoutType}
                      isPrintPreview={false} 
                      hideBorder={true}
                    />
                  )}
                  {creationMode === 'photo' && (
                    backImageUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={backImageUrl}
                          alt="실물 명함 사진 뒷면"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
                          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#C5A880] tracking-wider uppercase shadow-sm">
                            BACK PHOTO
                          </span>
                        </div>
                      </div>
                    ) : (
                      <BusinessCardBack 
                        data={{ 
                          ...formData, 
                          address_en: formData.address_en ?? formData.details?.address_en,
                          website: effectiveUrl, 
                          websiteDisplay: effectiveDisplayUrl 
                        }} 
                        theme={theme}
                        layout_type={layoutType}
                        isPrintPreview={false} 
                        hideBorder={true}
                      />
                    )
                  )}
                  {creationMode === 'custom_html' && (
                    htmlBack ? (
                      <div 
                        className="w-full h-full overflow-hidden rounded-2xl"
                        dangerouslySetInnerHTML={{ 
                          __html: htmlBack
                            .replace(/^```html\s*/i, '')
                            .replace(/^```\s*/i, '')
                            .replace(/\s*```$/i, '')
                            .trim() 
                        }} 
                      />
                    ) : (
                      <BusinessCardBack 
                        data={{ 
                          ...formData, 
                          address_en: formData.address_en ?? formData.details?.address_en,
                          website: effectiveUrl, 
                          websiteDisplay: effectiveDisplayUrl 
                        }} 
                        theme={theme}
                        layout_type={layoutType}
                        isPrintPreview={false} 
                        hideBorder={true}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-white/10 bg-[#0B0C10] flex items-center justify-between shrink-0">
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
