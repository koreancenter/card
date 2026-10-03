import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CardData } from '../types/card';
import { downloadVCard } from '../utils/vcard';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  UserPlus, 
  Share2, 
  FileCode 
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CardData;
  onOpenPrint?: () => void;
  onOpenExport?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  data,
  onOpenPrint,
  onOpenExport,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [qrType, setQrType] = useState<'url' | 'vcard'>('url');

  const targetUrl = data.website || (typeof window !== 'undefined' ? window.location.href : 'https://card.goguma.app/master');
  const displayHost = data.websiteDisplay || targetUrl.replace(/^https?:\/\//, '');

  useEffect(() => {
    if (!isOpen) return;

    const contentToEncode = qrType === 'url' ? targetUrl : `BEGIN:VCARD\nVERSION:3.0\nFN:${data.name}\nTEL:${data.phoneRaw || data.phone}\nEMAIL:${data.email}\nORG:${data.organization}\nTITLE:${data.title}\nURL:${data.website}\nEND:VCARD`;

    QRCode.toDataURL(contentToEncode, {
      width: 400,
      margin: 1.5,
      color: {
        dark: '#0B0C10',
        light: '#F7F5F0'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to create QR code', err);
      });
  }, [isOpen, qrType, data, targetUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${(data.name || 'Card').replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${qrType.toUpperCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.name} — ${data.organization}`,
          text: `${data.organization} ${data.title} ${data.name} 디지털 명함`,
          url: targetUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm rounded-3xl bg-[#121318] border border-white/10 text-neutral-100 shadow-2xl p-6 sm:p-7 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          title="닫기"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase block mb-1">
            DIGITAL CARD SHARING
          </span>
          <h3 className="text-base font-semibold text-white tracking-tight">
            {data.name} {data.title && <span className="text-neutral-400 font-normal">· {data.title}</span>}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-[260px]">
            {data.organization}
          </p>
        </div>

        {/* Minimalist QR Mode Toggle on Dark Surface */}
        <div className="flex items-center gap-1.5 mb-3 px-1 py-0.5">
          <button
            onClick={() => setQrType('url')}
            className={`px-3 py-1 text-xs font-medium transition-all relative cursor-pointer ${
              qrType === 'url' ? 'text-[#C5A880]' : 'text-white/45 hover:text-white/70'
            }`}
          >
            <span>웹 링크 QR</span>
            {qrType === 'url' && (
              <span className="absolute bottom-0 inset-x-2.5 h-[1.5px] bg-[#C5A880] rounded-full" />
            )}
          </button>
          <span className="text-white/15 text-xs font-light">|</span>
          <button
            onClick={() => setQrType('vcard')}
            className={`px-3 py-1 text-xs font-medium transition-all relative cursor-pointer ${
              qrType === 'vcard' ? 'text-[#C5A880]' : 'text-white/45 hover:text-white/70'
            }`}
          >
            <span>연락처 저장 QR</span>
            {qrType === 'vcard' && (
              <span className="absolute bottom-0 inset-x-2.5 h-[1.5px] bg-[#C5A880] rounded-full" />
            )}
          </button>
        </div>

        {/* Refined Warm Fine-Paper QR Code Container */}
        <div className="relative p-5 rounded-3xl bg-[#F7F5F0] border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.45)] mb-4 flex flex-col items-center justify-center">
          {dataUrl ? (
            <img 
              src={dataUrl} 
              alt="Digital Card QR" 
              className="w-44 h-44 object-contain rounded-xl"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-neutral-400 text-xs">
              QR 생성 중...
            </div>
          )}
        </div>

        {/* Streamlined Deep Matte Share URL Box */}
        <div className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-mono text-white/80 truncate select-all">
            {displayHost}
          </span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5A880]/15 hover:bg-[#C5A880]/25 active:bg-[#C5A880]/30 border border-[#C5A880]/30 text-[#C5A880] text-xs font-medium transition-all cursor-pointer shrink-0"
            title="링크 복사"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>
        </div>

        {/* Primary Direct Actions (Split into 2 Main Luxury Buttons) */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-3.5">
          <button
            onClick={() => downloadVCard(data)}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border border-white/10 text-white/90 text-xs font-medium transition-all cursor-pointer shadow-sm group"
            title="연락처 파일 다운로드"
          >
            <UserPlus className="w-4 h-4 text-[#C5A880] transition-transform group-hover:scale-105" />
            <span>연락처(.vcf) 저장</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border border-white/10 text-white/90 text-xs font-medium transition-all cursor-pointer shadow-sm group"
            title="시스템 공유 창 열기"
          >
            <Share2 className="w-4 h-4 text-[#C5A880] transition-transform group-hover:scale-105" />
            <span>명함 바로 공유</span>
          </button>
        </div>

        {/* Export & Pro Tools (Subtle bottom row) */}
        <div className="w-full pt-3 border-t border-white/5 flex items-center justify-center gap-4 text-xs">
          {onOpenPrint && (
            <button
              onClick={() => {
                onClose();
                onOpenPrint();
              }}
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-[11px] font-medium transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
            >
              <Printer className="w-3.5 h-3.5 text-white/40" />
              <span>인쇄 / PDF 출력</span>
            </button>
          )}

          {onOpenExport ? (
            <button
              onClick={() => {
                onClose();
                onOpenExport();
              }}
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-[11px] font-medium transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
            >
              <FileCode className="w-3.5 h-3.5 text-white/40" />
              <span>독립 HTML 배포</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadQr}
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-[11px] font-medium transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
            >
              <Download className="w-3.5 h-3.5 text-white/40" />
              <span>QR 이미지 저장</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
