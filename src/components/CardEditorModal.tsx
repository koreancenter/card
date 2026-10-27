import React, { useState, useEffect } from 'react';
import {
  StoredCard,
  CardTheme,
  CardData,
  CardLayoutType,
  CardFeatures,
  CardCreationMode
} from '../types/card';
import { X, RotateCcw } from 'lucide-react';
import { APP_BASE_DOMAIN, normalizeDomain } from '../utils/domain';
import { CARD_DATA } from '../utils/vcard';
import { TemplateModeEditor } from './editor/TemplateModeEditor';
import {
  CustomHtmlEditor,
  DEFAULT_LUXURY_HTML_FRONT,
  DEFAULT_LUXURY_HTML_BACK
} from './editor/CustomHtmlEditor';
import { PhotoArchivingEditor } from './editor/PhotoArchivingEditor';
import { EditorPreviewPanel } from './editor/EditorPreviewPanel';

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
    id: 'pure_white',
    name: '매트 페이퍼',
    description: 'Matte Paper',
    dotColor: '#F5F5F3',
    accent: '#141416'
  },
  {
    id: 'warm_paper',
    name: '파인 코튼',
    description: 'Warm Cotton',
    dotColor: '#EAE7E0',
    accent: '#1C1C1F'
  },
  {
    id: 'sumi_ink',
    name: '수묵 인크',
    description: 'Sumi Ink',
    dotColor: '#141416',
    accent: '#EAEAE6'
  },
  {
    id: 'obsidian',
    name: '웜 슬레이트',
    description: 'Warm Slate',
    dotColor: '#202024',
    accent: '#D4D4D8'
  }
];

const CREATION_MODES: { id: CardCreationMode; label: string }[] = [
  { id: 'template', label: '디자인 템플릿' },
  { id: 'photo', label: '실물 사진' },
  { id: 'custom_html', label: '커스텀 코드' }
];

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  card,
  onSave,
  isMyCardMode = false,
  isCreating = false
}) => {
  // Primary Creation Mode: 'template' | 'photo' | 'custom_html'
  const [creationMode, setCreationMode] = useState<CardCreationMode>(
    card.creation_mode || (card.isPhotoCard ? 'photo' : card.html_front ? 'custom_html' : 'template')
  );

  // Template Mode states
  const [templateSubTab, setTemplateSubTab] = useState<'visual_atelier' | 'identity_profile'>('visual_atelier');
  const [theme, setTheme] = useState<CardTheme>(card.theme || 'pure_white');
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
      setTheme(card.theme || 'pure_white');
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

  const handleResetSample = () => {
    setFormData({ ...CARD_DATA });
    setSlug('master');
    setTheme('pure_white');
    setLayoutType('editorial_minimal');
    setCreationMode('template');
  };

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
      creation_mode: creationMode,
      owner_key: card.owner_key || `key_${Date.now()}`,
      created_at: card.created_at || new Date().toISOString(),
      details: {
        en_name: formData.nameKr,
        sub_org: formData.subOrg,
        address: formData.addressKr,
        address_en: finalAddressEn,
        slogan: formData.backTagline,
        show_address: features.show_address ?? true,
        show_en_name: features.show_en_name ?? true
      },
      html_front: isHtmlMode ? htmlFront : undefined,
      html_back: isHtmlMode ? htmlBack : undefined,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0B0B0D]/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <style>{`
        .editor-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .editor-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .editor-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 9999px; }
        .editor-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.18); }
        .editor-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.08) transparent; }
      `}</style>

      <div
        className="CardEditorModal relative w-full max-w-6xl h-[90vh] max-h-[880px] flex flex-col rounded-2xl bg-[#121214] border border-white/[0.08] text-[#E8E8EC] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.75)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Typographic Mode Tab Strip */}
        <header className="px-6 sm:px-9 pt-6 border-b border-white/[0.06] bg-[#121214] shrink-0">
          <div className="flex items-center justify-between gap-4 pb-5">
            <h3 className="text-base sm:text-[17px] font-medium text-[#F2F2F5] tracking-tight">
              {isCreating
                ? '새 명함 만들기'
                : isMyCardMode
                  ? '내 명함 편집'
                  : '명함 편집'}
            </h3>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleResetSample}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
                title="초기화"
                aria-label="초기화"
              >
                <RotateCcw className="w-4 h-4 stroke-[1.5]" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
                title="닫기"
                aria-label="닫기"
              >
                <X className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {/* Minimal Border-Bottom Typographic Mode Switcher */}
          <nav className="flex items-center gap-7 overflow-x-auto no-scrollbar" aria-label="생성 방식">
            {CREATION_MODES.map((mode) => {
              const isActive = creationMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setCreationMode(mode.id)}
                  className={`relative pb-3.5 text-[13px] tracking-wide whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none ${
                    isActive
                      ? 'text-[#F2F2F5] font-medium'
                      : 'text-zinc-500 hover:text-zinc-300 font-normal'
                  }`}
                >
                  {mode.label}
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#E4E4E7]" />
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        {/* Main Split Workspace */}
        <div className="flex-1 grid grid-cols-12 overflow-y-auto lg:overflow-hidden editor-scrollbar">
          {/* Left Inspector Panel */}
          <div className="order-2 lg:order-1 col-span-12 lg:col-span-5 h-auto lg:h-full lg:overflow-y-auto px-6 py-7 sm:px-9 sm:py-8 editor-scrollbar">
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

          {/* Right Live Gallery Stage */}
          <EditorPreviewPanel
            creationMode={creationMode}
            layoutType={layoutType}
            theme={theme}
            features={features}
            formData={formData}
            effectiveUrl={effectiveUrl}
            effectiveDisplayUrl={effectiveDisplayUrl}
            frontImageUrl={frontImageUrl}
            backImageUrl={backImageUrl}
            htmlFront={htmlFront}
            htmlBack={htmlBack}
            previewFace={previewFace}
            onFlipPreviewFace={() => setPreviewFace(prev => (prev === 'front' ? 'back' : 'front'))}
          />
        </div>

        {/* Restrained Footer */}
        <footer className="px-6 sm:px-9 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-white/[0.06] bg-[#121214] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] cursor-pointer text-[13px] font-normal whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg bg-[#EAEAE6] hover:bg-[#F3F3F0] text-[#121214] font-medium text-[13px] tracking-wide cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          >
            {isCreating ? '등록' : '저장'}
          </button>
        </footer>
      </div>
    </div>
  );
};
