import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Zap, Sparkles, Check, Globe } from 'lucide-react';
import { CardData } from '../../types/card';
import { APP_BASE_DOMAIN } from '../../utils/domain';

interface PhotoArchivingEditorProps {
  frontImageUrl?: string;
  backImageUrl?: string;
  onChangeFrontImage: (dataUrl: string | undefined) => void;
  onChangeBackImage: (dataUrl: string | undefined) => void;
  cardData: CardData;
  onChangeCardData: (field: keyof CardData, val: string) => void;
  slug: string;
  onChangeSlug: (slug: string) => void;
  notes: string;
  onChangeNotes: (val: string) => void;
}

interface CompressionStats {
  originalBytes: number;
  compressedBytes: number;
  ratio: number;
}

export const PhotoArchivingEditor: React.FC<PhotoArchivingEditorProps> = ({
  frontImageUrl,
  backImageUrl,
  onChangeFrontImage,
  onChangeBackImage,
  cardData,
  onChangeCardData,
  slug,
  onChangeSlug,
  notes,
  onChangeNotes
}) => {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [frontStats, setFrontStats] = useState<CompressionStats | null>(null);
  const [isDraggingFront, setIsDraggingFront] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Automatically compress and rescale to 900×540 aspect ratio via HTML Canvas export to image/webp
  const compressTo900x540 = (file: File): Promise<{ dataUrl: string; stats: CompressionStats }> => {
    return new Promise((resolve, reject) => {
      const originalBytes = file.size;
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Standard business card resolution: 900 × 540 (aspect ratio 5:3 / 1.667 or 1.586 scaled)
          const targetWidth = 900;
          const targetHeight = 540;

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Crop and fill to precisely fit 900x540 without stretching
          const imgAspect = img.width / img.height;
          const targetAspect = targetWidth / targetHeight;
          let drawWidth = targetWidth;
          let drawHeight = targetHeight;
          let offsetX = 0;
          let offsetY = 0;

          if (imgAspect > targetAspect) {
            drawWidth = targetHeight * imgAspect;
            offsetX = (targetWidth - drawWidth) / 2;
          } else {
            drawHeight = targetWidth / imgAspect;
            offsetY = (targetHeight - drawHeight) / 2;
          }

          // Background fill for clean matte card
          ctx.fillStyle = '#0B0C10';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          // Export to image/webp (fallback to jpeg if not supported)
          let compressedUrl = canvas.toDataURL('image/webp', 0.88);
          if (!compressedUrl.startsWith('data:image/webp')) {
            compressedUrl = canvas.toDataURL('image/jpeg', 0.88);
          }

          const base64Length = compressedUrl.length - (compressedUrl.indexOf(',') + 1);
          const compressedBytes = Math.round((base64Length * 3) / 4);
          const ratio = originalBytes > 0 
            ? Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100))
            : 0;

          resolve({
            dataUrl: compressedUrl,
            stats: {
              originalBytes,
              compressedBytes,
              ratio
            }
          });
        };
        img.onerror = () => reject(new Error('Failed to load image into Canvas'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsCompressing(true);
    try {
      const { dataUrl, stats } = await compressTo900x540(file);
      onChangeFrontImage(dataUrl);
      setFrontStats(stats);
    } catch (err) {
      console.error('Canvas compression error:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFront(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFront(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFront(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleLoadSample = () => {
    onChangeFrontImage('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80');
    setFrontStats({
      originalBytes: 1540000,
      compressedBytes: 124000,
      ratio: 92
    });
    if (!cardData.name || cardData.name === 'PARK, GIHONG') {
      onChangeCardData('name', 'Dr. Michael Harrison');
      onChangeCardData('phone', '+1 (202) 555-0182');
      onChangeCardData('email', 'm.harrison@globalheritage.org');
      onChangeSlug('harrison');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Photo Upload Slot with Drag-and-Drop & 900x540 Canvas Compression */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[#C5A880] font-mono">01.</span>
            <span>실물 명함 사진 등록 (Canvas 900×540 WebP)</span>
          </label>
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1 text-[11px] text-[#C5A880] hover:underline cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>샘플 명함 로드</span>
          </button>
        </div>
        <p className="text-[11px] text-neutral-400">
          드래그 앤 드롭 또는 클릭하여 사진을 올리면 900×540 해상도의 고품질 WebP 파일로 브라우저에서 자동 압축됩니다.
        </p>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !frontImageUrl && frontInputRef.current?.click()}
          className={`relative w-full aspect-[900/540] rounded-2xl border-2 transition-all overflow-hidden flex flex-col items-center justify-center ${
            isDraggingFront
              ? 'border-[#C5A880] bg-[#C5A880]/10 scale-[1.01]'
              : frontImageUrl
                ? 'border-white/10 bg-black/60'
                : 'border-dashed border-white/20 hover:border-[#C5A880]/80 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer'
          }`}
        >
          {frontImageUrl ? (
            <div className="relative w-full h-full group">
              <img
                src={frontImageUrl}
                alt="실물 명함"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    frontInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs backdrop-blur-md transition-colors cursor-pointer"
                >
                  사진 교체
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeFrontImage(undefined);
                    setFrontStats(null);
                  }}
                  className="p-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white text-xs backdrop-blur-md transition-colors cursor-pointer"
                  title="사진 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C5A880] mb-1">
                {isCompressing ? <Zap className="w-6 h-6 animate-pulse" /> : <Camera className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">명함 사진 드래그 앤 드롭 또는 클릭하여 업로드</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">900×540 Canvas 자동 스케일링 & WebP 압축</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#C5A880]">
                JPG / PNG / WEBP 지원
              </span>
            </div>
          )}
          <input
            type="file"
            ref={frontInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFrontUpload}
          />
        </div>

        {/* Compression Badge */}
        {frontStats && (
          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono flex items-center justify-between animate-in fade-in duration-200">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>{formatFileSize(frontStats.originalBytes)} → {formatFileSize(frontStats.compressedBytes)}</span>
              <span className="text-[10px] text-emerald-500">(Canvas 900×540 WebP)</span>
            </span>
            <span className="font-bold">{frontStats.ratio}% 용량 절감</span>
          </div>
        )}
      </div>

      {/* 2. Quick-Input Metadata Form (Frictionless) */}
      <div className="border-t border-white/[0.06] pt-5 space-y-3">
        <div className="space-y-0.5">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[#C5A880] font-mono">02.</span>
            <span>퀵 메타데이터 입력 (하단 액션바 바인딩)</span>
          </label>
          <p className="text-[11px] text-neutral-400">
            실물 사진과 연동되어 원클릭 통화, vCard 저장, 전용 링크 공유를 작동시키는 핵심 정보입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* 성명 (Name) - Required */}
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-300 font-medium flex items-center gap-1">
              <span>성명 (Name)</span>
              <span className="text-[#C5A880] font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={cardData.name}
              onChange={(e) => onChangeCardData('name', e.target.value)}
              placeholder="예: 홍길동 또는 John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-semibold"
            />
          </div>

          {/* 대표 전화번호 (Phone) - Required */}
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-300 font-medium flex items-center gap-1">
              <span>대표 전화번호 (Phone)</span>
              <span className="text-[#C5A880] font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={cardData.phone}
              onChange={(e) => onChangeCardData('phone', e.target.value)}
              placeholder="010-1234-5678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 공식 이메일 (Email) - Optional */}
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400 flex items-center gap-1">
              <span>공식 이메일 (Email, Optional)</span>
            </label>
            <input
              type="email"
              value={cardData.email}
              onChange={(e) => onChangeCardData('email', e.target.value)}
              placeholder="contact@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
            />
          </div>

          {/* 전용 URL 슬러그 (Slug) - Required */}
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-300 font-medium flex items-center gap-1">
              <span>전용 URL 슬러그 (Slug)</span>
              <span className="text-[#C5A880] font-bold">*</span>
            </label>
            <div className="flex rounded-xl bg-white/[0.02] border border-white/10 focus-within:border-[#C5A880] overflow-hidden text-xs">
              <span className="px-2.5 py-2.5 bg-neutral-800/60 text-neutral-400 font-mono text-[10px] shrink-0 border-r border-white/10 select-none">
                {APP_BASE_DOMAIN}/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => onChangeSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="slug"
                className="w-full px-2.5 py-2.5 bg-transparent text-[#C5A880] focus:outline-none font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-1 pt-1">
          <label className="text-[11px] text-neutral-400">만난 장소 / 수령 메모 (Notes, Optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            placeholder="예: 2026 글로벌 파트너스 데이 미팅에서 수령"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
          />
        </div>
      </div>
    </div>
  );
};
