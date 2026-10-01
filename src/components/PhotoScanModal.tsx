import React, { useState, useRef } from 'react';
import { StoredCard, CardCategory } from '../types/card';
import { 
  Camera, Upload, Check, X, RefreshCw, Smartphone, 
  Trash2, Sparkles, Phone, User, Building, FileText, ArrowRight, Layers
} from 'lucide-react';

interface PhotoScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCard: (newCard: StoredCard) => void;
}

export const PhotoScanModal: React.FC<PhotoScanModalProps> = ({
  isOpen,
  onClose,
  onSaveCard
}) => {
  // Captured & Canvas-Cropped Card Photos (image/webp)
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<'front' | 'back'>('front');

  // Minimalist Quick Input: Only 2~3 essential fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyAndNote, setCompanyAndNote] = useState('');
  const [category, setCategory] = useState<string>('VIP 파트너');

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // In-Browser HTML Canvas: Auto-crop & Rescale to Standard Business Card 9:5 Ratio
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
          // Image is wider than 9:5 -> Crop horizontal edges to center
          srcW = imgHeight * targetRatio;
          srcX = (imgWidth - srcW) / 2;
        } else {
          // Image is taller than 9:5 -> Crop vertical edges to center
          srcH = imgWidth / targetRatio;
          srcY = (imgHeight - srcH) / 2;
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw cropped card
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

  const handleSave = () => {
    if (!name.trim()) {
      alert('성함(이름)을 입력해 주세요.');
      return;
    }
    if (!phone.trim()) {
      alert('연락처(전화번호)를 입력해 주세요.');
      return;
    }

    const phoneClean = phone.replace(/[^0-9+]/g, '');

    const newCard: StoredCard = {
      id: `photo-card-${Date.now()}`,
      isMyCard: false,
      isPhotoCard: true, // Renders authentic high-res cropped physical photo as card face
      visualMode: 'photo_archive',
      scannedImage: frontPhoto || undefined,
      scannedImageBack: backPhoto || undefined,
      category: category || 'VIP 파트너',
      theme: 'sumi_ink',
      layout_type: 'editorial_minimal',
      createdAt: new Date().toISOString().split('T')[0],
      notes: companyAndNote || '실물 명함 사진 보관',
      data: {
        name: name.trim(),
        nameKr: name.trim(),
        title: '비즈니스 파트너',
        titleKr: '비즈니스 파트너',
        organization: companyAndNote.trim() || '실물 보관 명함',
        organizationKr: companyAndNote.trim() || '실물 보관 명함',
        phone: phone.trim(),
        phoneRaw: phoneClean,
        whatsappUrl: phoneClean ? `https://wa.me/${phoneClean.replace(/^\+/, '')}` : '',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0F1015] border border-white/10 text-neutral-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
              무거운 AI나 OCR 대신, 9:5 황금비율 크롭 원본 사진과 필수 3항목만 즉시 저장합니다.
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* 1. Camera Capture / Image File Upload (Front & Optional Back) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>명함 실물 사진 촬영 / 업로드 (9:5 자동 크롭 & WebP 압축)</span>
              </span>
              <div className="flex items-center gap-1 bg-[#14151C] p-0.5 rounded-lg border border-white/5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setActiveSlot('front')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    activeSlot === 'front' ? 'bg-[#C5A880] text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  앞면 {frontPhoto ? '✓' : '*'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlot('back')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    activeSlot === 'back' ? 'bg-[#C5A880] text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  뒷면 {backPhoto ? '✓' : '(선택)'}
                </button>
              </div>
            </div>

            {/* Photo Canvas Slot */}
            <div className="relative w-full aspect-[9/5] rounded-2xl overflow-hidden border border-white/10 bg-[#0B0C10] shadow-2xl flex flex-col items-center justify-center group">
              {activeSlot === 'front' && frontPhoto ? (
                <>
                  <img src={frontPhoto} alt="명함 앞면" className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#C5A880]">
                    FRONT • 9:5 CANVAS
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>재촬영</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrontPhoto(null)}
                      className="p-2 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 backdrop-blur-md cursor-pointer"
                      title="사진 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : activeSlot === 'back' && backPhoto ? (
                <>
                  <img src={backPhoto} alt="명함 뒷면" className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#C5A880]">
                    BACK • 9:5 CANVAS
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>재촬영</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBackPhoto(null)}
                      className="p-2 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 backdrop-blur-md cursor-pointer"
                      title="사진 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                /* No photo uploaded in current slot */
                <div className="p-6 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-2xl bg-[#C5A880]/15 hover:bg-[#C5A880]/25 border border-[#C5A880]/30 text-[#C5A880] text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>카메라로 즉시 촬영</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>앨범 사진 선택</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    촬영된 사진은 캔버스에서 규격(9:5)으로 자동 중앙 크롭되어 가벼운 WebP로 저장됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Minimalist Quick Input (Frictionless: Exactly 2~3 Essential Fields) */}
          <div className="p-4 rounded-2xl bg-[#14151C] border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>필수 2~3항목 간편 입력 (Quick Input)</span>
              </span>
              <span className="text-[10px] text-neutral-400">전화/문자 즉시 바인딩</span>
            </div>

            {/* Field 1: Name (Required) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1">
                <User className="w-3 h-3 text-[#C5A880]" />
                <span>1. 성함 / 성명 (Name) *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김민우 대표, David Miller"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-semibold"
              />
            </div>

            {/* Field 2: Phone Number (Required) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#C5A880]" />
                <span>2. 전화번호 (Phone Number) *</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="예: 010-1234-5678 또는 +82 10-1234-5678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-mono"
              />
            </div>

            {/* Field 3: Company / Note (Optional) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1">
                <Building className="w-3 h-3 text-neutral-400" />
                <span>3. 소속 회사 및 메모 (Company / Note) - 선택</span>
              </label>
              <input
                type="text"
                value={companyAndNote}
                onChange={(e) => setCompanyAndNote(e.target.value)}
                placeholder="예: 삼정KPMG M&A본부 / 2026 파트너십 미팅"
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
