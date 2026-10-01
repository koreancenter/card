import React, { useState } from 'react';
import { StoredCard } from '../types/card';
import { X, Download, Eye, Smartphone, RotateCcw, ExternalLink, Calendar, Tag } from 'lucide-react';
import { BusinessCardFront } from './BusinessCardFront';

interface PhotoArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: StoredCard | null;
}

export const PhotoArchiveModal: React.FC<PhotoArchiveModalProps> = ({
  isOpen,
  onClose,
  card
}) => {
  const [viewTab, setViewTab] = useState<'photo' | 'digital' | 'compare'>('photo');

  if (!isOpen || !card) return null;

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
            {card.scannedImage ? '무손실 로컬 아카이빙 완료' : '실물 사진 미등록'}
          </div>
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center min-h-[350px]">
          {viewTab === 'photo' && (
            <div className="w-full flex flex-col items-center justify-center space-y-3">
              {card.scannedImage ? (
                <div className="relative max-w-2xl max-h-[62vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                  <img 
                    src={card.scannedImage} 
                    alt="실물 명함 원본" 
                    className="w-full h-auto max-h-[62vh] object-contain rounded-2xl"
                  />
                </div>
              ) : (
                <div className="py-16 text-center space-y-2">
                  <p className="text-sm font-semibold text-white">등록된 실물 명함 사진이 없습니다.</p>
                  <p className="text-xs text-neutral-400">명함 편집에서 실물 사진을 첨부하여 아카이빙할 수 있습니다.</p>
                </div>
              )}
            </div>
          )}

          {viewTab === 'compare' && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left: Original Photo */}
              <div className="space-y-2">
                <div className="text-center font-mono text-[11px] text-[#C5A880] uppercase tracking-wider">
                  실물 명함 원본 (Physical Archive)
                </div>
                {card.scannedImage ? (
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black/60 aspect-[9/5] flex items-center justify-center">
                    <img src={card.scannedImage} alt="실물 명함" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 aspect-[9/5] flex items-center justify-center text-xs text-neutral-400">
                    실물 사진 없음
                  </div>
                )}
              </div>

              {/* Right: Digital Card */}
              <div className="space-y-2">
                <div className="text-center font-mono text-[11px] text-[#C5A880] uppercase tracking-wider">
                  디지털 명함 (Digital Architecture)
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl aspect-[9/5]">
                  <BusinessCardFront 
                    data={card.data} 
                    theme={card.theme} 
                    layout_type={card.layout_type}
                    card_features={card.card_features}
                    isPrintPreview={true} 
                  />
                </div>
              </div>
            </div>
          )}

          {viewTab === 'digital' && (
            <div className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden">
              <BusinessCardFront 
                data={card.data} 
                theme={card.theme} 
                layout_type={card.layout_type}
                card_features={card.card_features}
                isPrintPreview={false} 
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0B0C10] flex items-center justify-between text-xs text-neutral-400">
          <div>
            <span>{card.data.organization}</span>
            {card.notes && <span className="ml-2 text-neutral-400">"{card.notes}"</span>}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
