import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, CheckCircle2, Image as ImageIcon, Zap, Sparkles } from 'lucide-react';
import { CardData } from '../../types/card';

interface PhotoArchivingEditorProps {
  frontImageUrl?: string;
  backImageUrl?: string;
  onChangeFrontImage: (dataUrl: string | undefined) => void;
  onChangeBackImage: (dataUrl: string | undefined) => void;
  cardData: CardData;
  onChangeCardData: (field: keyof CardData, val: string) => void;
  notes: string;
  onChangeNotes: (val: string) => void;
  category: string;
  onChangeCategory: (val: string) => void;
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
  notes,
  onChangeNotes,
  category,
  onChangeCategory
}) => {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [frontStats, setFrontStats] = useState<CompressionStats | null>(null);
  const [backStats, setBackStats] = useState<CompressionStats | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Client-Side Canvas Compression (Scales max dim to 1600px, exports to WebP 0.85)
  const compressImage = (file: File): Promise<{ dataUrl: string; stats: CompressionStats }> => {
    return new Promise((resolve, reject) => {
      const originalBytes = file.size;
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not supported'));
            return;
          }

          // Crisp rendering with subtle smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Attempt WebP with quality 0.85, fallback to JPEG if browser lacks WebP export
          let compressedUrl = canvas.toDataURL('image/webp', 0.85);
          if (!compressedUrl.startsWith('data:image/webp')) {
            compressedUrl = canvas.toDataURL('image/jpeg', 0.85);
          }

          // Calculate approximate base64 bytes
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
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsDataURL(file);
    });
  };

  const handleFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const { dataUrl, stats } = await compressImage(file);
      onChangeFrontImage(dataUrl);
      setFrontStats(stats);
    } catch (err) {
      console.error('Compression failed:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const { dataUrl, stats } = await compressImage(file);
      onChangeBackImage(dataUrl);
      setBackStats(stats);
    } catch (err) {
      console.error('Compression failed:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleLoadSample = () => {
    // Provide a sample high-res card photo
    onChangeFrontImage('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80');
    setFrontStats({
      originalBytes: 1250000,
      compressedBytes: 112000,
      ratio: 91
    });
    if (!cardData.name || cardData.name === 'PARK, GIHONG') {
      onChangeCardData('name', 'Dr. Michael Harrison');
      onChangeCardData('nameKr', '마이클 해리슨');
      onChangeCardData('organizationKr', '글로벌헤리티지재단');
      onChangeCardData('organization', 'Global Heritage Foundation');
      onChangeCardData('titleKr', '수석총괄이사');
      onChangeCardData('phone', '+1 (202) 555-0182');
      onChangeCardData('email', 'm.harrison@globalheritage.org');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Photo Upload with Canvas Compression */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[#C5A880] font-mono">01.</span>
            <span>실물 명함 사진 촬영 및 캔버스 압축</span>
          </label>
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1 text-[11px] text-[#C5A880] hover:underline cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>샘플 사진 불러오기</span>
          </button>
        </div>
        <p className="text-[11px] text-neutral-400">
          오프라인에서 교환받은 실물 명함을 촬영하면 브라우저 내 캔버스에서 WebP 고효율로 자동 경량화되어 저장됩니다.
        </p>

        {/* Upload Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Front Photo */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>명함 앞면 사진 (필수)</span>
              </span>
              {frontImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onChangeFrontImage(undefined);
                    setFrontStats(null);
                  }}
                  className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  title="사진 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {frontImageUrl ? (
              <div className="space-y-2">
                <div className="w-full aspect-[9/5] rounded-xl overflow-hidden border border-white/10 bg-black relative">
                  <img src={frontImageUrl} alt="Front Card" className="w-full h-full object-cover" />
                </div>
                {frontStats && (
                  <div className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 shrink-0" />
                      <span>{formatFileSize(frontStats.originalBytes)} → {formatFileSize(frontStats.compressedBytes)}</span>
                    </span>
                    <span className="font-bold">{frontStats.ratio}% 압축</span>
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={() => frontInputRef.current?.click()}
                className="w-full aspect-[9/5] rounded-xl border border-dashed border-white/15 hover:border-[#C5A880] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-white/[0.03]"
              >
                <Upload className="w-6 h-6 text-neutral-400 mb-1" />
                <span className="text-xs font-medium text-white">앞면 촬영 / 이미지 업로드</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">자동 WebP 캔버스 압축</span>
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

          {/* Back Photo */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>명함 뒷면 사진 (선택)</span>
              </span>
              {backImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onChangeBackImage(undefined);
                    setBackStats(null);
                  }}
                  className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  title="사진 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {backImageUrl ? (
              <div className="space-y-2">
                <div className="w-full aspect-[9/5] rounded-xl overflow-hidden border border-white/10 bg-black relative">
                  <img src={backImageUrl} alt="Back Card" className="w-full h-full object-cover" />
                </div>
                {backStats && (
                  <div className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 shrink-0" />
                      <span>{formatFileSize(backStats.originalBytes)} → {formatFileSize(backStats.compressedBytes)}</span>
                    </span>
                    <span className="font-bold">{backStats.ratio}% 압축</span>
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={() => backInputRef.current?.click()}
                className="w-full aspect-[9/5] rounded-xl border border-dashed border-white/15 hover:border-[#C5A880] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-white/[0.03]"
              >
                <Upload className="w-6 h-6 text-neutral-400 mb-1" />
                <span className="text-xs font-medium text-white">뒷면 촬영 / 이미지 업로드</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">선택 사항</span>
              </div>
            )}
            <input
              type="file"
              ref={backInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleBackUpload}
            />
          </div>
        </div>
      </div>

      {/* 02. Quick Metadata Inputs */}
      <div className="border-t border-white/[0.06] pt-5 space-y-3">
        <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <span className="text-[#C5A880] font-mono">02.</span>
          <span>퀵 메타데이터 & 인적사항 (Quick Indexing)</span>
        </label>
        <p className="text-[11px] text-neutral-400">
          실물 명함의 핵심 연락처 정보를 입력해 두면 검색, 원클릭 전화걸기, vCard 내보내기가 활성화됩니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">성명 (Name) *</label>
            <input
              type="text"
              value={cardData.name}
              onChange={(e) => onChangeCardData('name', e.target.value)}
              placeholder="예: 홍길동 또는 John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">회사 / 기관명 (Company)</label>
            <input
              type="text"
              value={cardData.organizationKr || cardData.organization}
              onChange={(e) => onChangeCardData('organizationKr', e.target.value)}
              placeholder="예: 대한무역투자진흥공사"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">직함 / 직책 (Title)</label>
            <input
              type="text"
              value={cardData.titleKr || cardData.title}
              onChange={(e) => onChangeCardData('titleKr', e.target.value)}
              placeholder="예: 상무이사 / Executive Director"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">전화번호 (Phone)</label>
            <input
              type="text"
              value={cardData.phone}
              onChange={(e) => onChangeCardData('phone', e.target.value)}
              placeholder="+82 10-1234-5678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">이메일 (Email)</label>
            <input
              type="email"
              value={cardData.email}
              onChange={(e) => onChangeCardData('email', e.target.value)}
              placeholder="contact@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">보관함 분류 카테고리</label>
            <select
              value={category}
              onChange={(e) => onChangeCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] text-white text-xs cursor-pointer"
            >
              <option value="VIP 파트너">VIP 파트너</option>
              <option value="글로벌 네트워크">글로벌 네트워크</option>
              <option value="공공·기관">공공·기관</option>
              <option value="투자·금융">투자·금융</option>
              <option value="IT·기술">IT·기술</option>
              <option value="기타">기타</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-neutral-400">미팅 일시 / 교환 메모 (Notes)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            placeholder="예: 2026 한미 비즈니스 포럼 오찬 회동에서 수령"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
          />
        </div>
      </div>
    </div>
  );
};
