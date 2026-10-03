import React, { useState, useRef } from 'react';
import { StoredCard, CardCategory } from '../types/card';
import { 
  Camera, Upload, Check, X, RefreshCw, Smartphone, 
  Trash2, Phone, User, Building, FileText, ArrowRight, Layers,
  Download, Eye, RotateCcw, ExternalLink, Calendar, Tag
} from 'lucide-react';
import { BusinessCardFront } from './BusinessCardFront';

export interface PhotoArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  card?: StoredCard | null;
  onSaveCard?: (newCard: StoredCard) => void;
}

export const PhotoArchiveModal: React.FC<PhotoArchiveModalProps> = ({
  isOpen,
  onClose,
  card,
  onSaveCard
}) => {
  // If card is provided and onSaveCard is not, we are in Viewer mode
  const isViewerMode = Boolean(card && !onSaveCard);

  // Viewer State
  const [viewTab, setViewTab] = useState<'photo' | 'digital' | 'compare'>('photo');

  // Archive Capture State (image/webp canvas compression)
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<'front' | 'back'>('front');

  // Minimalist Quick Input: Essential fields (Name + Phone)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyAndNote, setCompanyAndNote] = useState('');
  const [category, setCategory] = useState<string>('VIP 파트너');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // VIEWER MODE: Original Photo & Dual Comparison
  if (isViewerMode && card) {
    const downloadOriginalPhoto = () => {
      if (!card.scannedImage) return;
      const a = document.createElement('a');
      a.href = card.scannedImage;
      a.download = `${card.data.name || 'card'}-physical-archive.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
        <div 
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0F1015] border border-white/10 text-neutral-100 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0B0C10]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 font-mono text-xs">
                  ARCHIVE
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {card.data.name} — 실물 명함 원본 아카이브
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#C5A880]" />
                  <span>{card.category}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-400" />
                  <span>보관일: {card.createdAt}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {card.scannedImage && (
                <button
                  onClick={downloadOriginalPhoto}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer transition-colors"
                  title="실물 사진 원본 다운로드"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">사진 저장</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* View Mode Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#0B0C10]/80 border-b border-white/5 text-xs">
            <div className="flex items-center gap-1 p-1 bg-[#14151C] rounded-xl border border-white/5">
              <button
                onClick={() => setViewTab('photo')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                  viewTab === 'photo'
                    ? 'bg-[#C5A880] text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                실물 원본 사진
              </button>
              <button
                onClick={() => setViewTab('compare')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                  viewTab === 'compare'
                    ? 'bg-[#C5A880] text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                실물 & 디지털 듀얼 비교
              </button>
              <button
                onClick={() => setViewTab('digital')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                  viewTab === 'digital'
                    ? 'bg-[#C5A880] text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                디지털 명함 뷰
              </button>
            </div>

            <div className="text-[11px] text-neutral-400 hidden sm:block">
              {card.scannedImage ? 'WebP 무손실 로컬 아카이빙 완료' : '실물 사진 미등록'}
            </div>
          </div>

          {/* Content Viewport */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center">
            {viewTab === 'photo' && (
              <div className="w-full max-w-xl flex flex-col items-center gap-4 animate-in fade-in duration-150">
                <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black/60 aspect-[9/5] w-full flex items-center justify-center">
                  {card.scannedImage ? (
                    <img 
                      src={card.scannedImage} 
                      alt="Archived Physical Card" 
                      className="w-full h-full object-cover select-none"
                    />
                  ) : (
                    <div className="text-center p-6 text-neutral-500">
                      실물 사진이 등록되지 않았습니다.
                    </div>
                  )}
                </div>
                {card.scannedImageBack && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black/60 aspect-[9/5] w-full flex items-center justify-center">
                    <img 
                      src={card.scannedImageBack} 
                      alt="Archived Back Card" 
                      className="w-full h-full object-cover select-none"
                    />
                  </div>
                )}
              </div>
            )}

            {viewTab === 'compare' && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 items-center animate-in fade-in duration-150 max-w-4xl">
                <div className="space-y-2">
                  <span className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider block text-center">
                    실물 촬영 아카이브
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-black/60 aspect-[9/5] w-full flex items-center justify-center">
                    {card.scannedImage ? (
                      <img 
                        src={card.scannedImage} 
                        alt="Physical Card" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-neutral-500">실물 사진 없음</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] text-[#C5A880] font-mono uppercase tracking-wider block text-center">
                    실시간 디지털 인터랙티브 뷰
                  </span>
                  <div className="rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-xl w-full">
                    <BusinessCardFront 
                      data={card.data} 
                      theme={card.theme} 
                      layout_type={card.layout_type}
                      card_features={card.card_features}
                      isPrintPreview={false}
                    />
                  </div>
                </div>
              </div>
            )}

            {viewTab === 'digital' && (
              <div className="w-full max-w-md animate-in fade-in duration-150">
                <div className="rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-2xl">
                  <BusinessCardFront 
                    data={card.data} 
                    theme={card.theme} 
                    layout_type={card.layout_type}
                    card_features={card.card_features}
                    isPrintPreview={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CAPTURE / ARCHIVE INPUT MODE: Client-side canvas compression (WebP) & Quick Manual Contact Input (Name + Phone)
  const processImageToCardRatio = (file: File, slot: 'front' | 'back') => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        // Standard Business Card Ratio 90mm x 50mm = 9:5 (1.8 ratio)
        const targetWidth = 1080;
        const targetHeight = 600;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const targetRatio = targetWidth / targetHeight; // 1.8
        const imgRatio = imgWidth / imgHeight;

        let srcX = 0;
        let srcY = 0;
        let srcW = imgWidth;
        let srcH = imgHeight;

        if (imgRatio > targetRatio) {
          srcW = imgHeight * targetRatio;
          srcX = (imgWidth - srcW) / 2;
        } else {
          srcH = imgWidth / targetRatio;
          srcY = (imgHeight - srcH) / 2;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

        // Client-side WebP compression (fallback to jpeg if needed)
        try {
          const webpDataUrl = canvas.toDataURL('image/webp', 0.88);
          if (slot === 'front') {
            setFrontPhoto(webpDataUrl);
          } else {
            setBackPhoto(webpDataUrl);
          }
        } catch {
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          if (slot === 'front') {
            setFrontPhoto(jpegDataUrl);
          } else {
            setBackPhoto(jpegDataUrl);
          }
        }
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageToCardRatio(file, activeSlot);
    }
  };

  const triggerUpload = (slot: 'front' | 'back', useCamera = false) => {
    setActiveSlot(slot);
    if (useCamera && cameraInputRef.current) {
      cameraInputRef.current.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSave = () => {
    if (!name.trim() || !phone.trim() || !onSaveCard) return;

    const rawPhone = phone.replace(/[^0-9+]/g, '');
    const id = `photo-card-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];

    const newCard: StoredCard = {
      id,
      isMyCard: false,
      isPhotoCard: true,
      category,
      theme: 'sumi_ink',
      layout_type: 'editorial_minimal',
      createdAt: now,
      notes: companyAndNote.trim() || '실물 명함 사진 보관 등록',
      scannedImage: frontPhoto || undefined,
      scannedImageBack: backPhoto || undefined,
      data: {
        name: name.trim(),
        nameKr: name.trim(),
        title: '',
        titleKr: '',
        organization: companyAndNote.trim() || '비즈니스 파트너',
        organizationKr: companyAndNote.trim() || '비즈니스 파트너',
        phone: phone.trim(),
        phoneRaw: rawPhone,
        whatsappUrl: rawPhone ? `https://wa.me/${rawPhone.replace(/^\+/, '')}` : '',
        email: '',
        website: '',
        websiteDisplay: '',
        addressLines: [],
        addressKr: '',
        googleMapsUrl: '',
        naverMapsUrl: ''
      }
    };

    onSaveCard(newCard);
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0F1015] border border-white/10 text-neutral-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden inputs */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        <input 
          type="file" 
          ref={cameraInputRef} 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleFileChange} 
        />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0B0C10]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30">
                <Camera className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                실물 명함 사진 보관 및 간편 등록
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              클라이언트 캔버스 WebP 압축으로 원본을 최적화하고 성명·연락처만 빠르게 등록합니다.
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* 1. Card Photo Slot Containers (9:5 Ratio) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>명함 실물 사진 첨부 (9:5 비율 자동 최적화)</span>
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">WebP Canvas Compressed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Front Slot */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                  <span>명함 앞면 사진 {frontPhoto && '✓'}</span>
                  {frontPhoto && (
                    <button
                      type="button"
                      onClick={() => setFrontPhoto(null)}
                      className="text-rose-400 hover:underline text-[10px] cursor-pointer"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className="relative aspect-[9/5] w-full rounded-2xl border border-white/10 bg-[#14151C] overflow-hidden flex flex-col items-center justify-center group shadow-inner">
                  {frontPhoto ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={frontPhoto} 
                        alt="Front Card" 
                        className="w-full h-full object-cover" 
                      />
                      <button
                        type="button"
                        onClick={() => triggerUpload('front')}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-medium cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>다시 등록</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-3 text-center">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerUpload('front', true)}
                          className="px-3 py-1.5 rounded-xl bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#C5A880] border border-[#C5A880]/30 flex items-center gap-1.5 cursor-pointer font-medium"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>촬영</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerUpload('front', false)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>앨범</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-neutral-500">실물 앞면</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Slot */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                  <span>명함 뒷면 (선택 사항) {backPhoto && '✓'}</span>
                  {backPhoto && (
                    <button
                      type="button"
                      onClick={() => setBackPhoto(null)}
                      className="text-rose-400 hover:underline text-[10px] cursor-pointer"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className="relative aspect-[9/5] w-full rounded-2xl border border-white/10 bg-[#14151C] overflow-hidden flex flex-col items-center justify-center group shadow-inner">
                  {backPhoto ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={backPhoto} 
                        alt="Back Card" 
                        className="w-full h-full object-cover" 
                      />
                      <button
                        type="button"
                        onClick={() => triggerUpload('back')}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-medium cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>다시 등록</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-3 text-center">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerUpload('back', true)}
                          className="px-3 py-1.5 rounded-xl bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#C5A880] border border-[#C5A880]/30 flex items-center gap-1.5 cursor-pointer font-medium"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>촬영</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerUpload('back', false)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>앨범</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-neutral-500">실물 뒷면</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Quick Essential Input Fields (Name + Phone) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#14151C] border border-white/10 space-y-3.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>핵심 정보 빠른 입력 (Manual Input)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-300 font-medium">
                  성명 (필수) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 김민수 대표"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-300 font-medium">
                  전화번호 (필수) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="예: 010-1234-5678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-neutral-300 font-medium">
                소속 및 메모 (선택)
              </label>
              <input
                type="text"
                value={companyAndNote}
                onChange={(e) => setCompanyAndNote(e.target.value)}
                placeholder="예: 글로벌 디자인 랩 / 2026 파트너십 미팅"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
              />
            </div>

            {/* Category Quick Chips */}
            <div className="space-y-1 pt-1 border-t border-white/5">
              <label className="text-[10px] text-neutral-400">보관함 카테고리</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] transition-colors cursor-pointer ${
                      category === cat
                        ? 'bg-[#C5A880] text-black font-bold'
                        : 'bg-[#0B0C10] text-neutral-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
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
          
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || !phone.trim() || isProcessing}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#d6b991] disabled:opacity-40 disabled:hover:bg-[#C5A880] text-black font-bold text-xs transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>보관함에 실물 명함 저장</span>
          </button>
        </div>

      </div>
    </div>
  );
};
