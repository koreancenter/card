import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CardData } from '../types/card';
import { downloadVCard } from '../utils/vcard';
import { 
  X, 
  Copy, 
  Check, 
  UserPlus, 
  Share2, 
  Printer, 
  FileCode2 
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
        dark: '#16181D',
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
      {/* Modal Surface: Deep Sumi Ink matte canvas */}
      <div 
        className="relative bg-[#0B0C10]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-[420px] w-full shadow-2xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal, airy close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/30 hover:text-[#C5A880] transition cursor-pointer p-1"
          title="닫기"
          aria-label="닫기"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* 1. Header: Minimalist Name & Org header */}
        <div className="text-center mb-5">
          <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase block mb-1.5">
            DIGITAL CARD SHARING
          </span>
          <h3 className="text-base font-medium text-white tracking-tight">
            {data.name} {data.title && <span className="text-white/40 font-normal">· {data.title}</span>}
          </h3>
          {data.organization && (
            <p className="text-xs text-white/40 mt-0.5 truncate max-w-[280px]">
              {data.organization}
            </p>
          )}
        </div>

        {/* Tab Switcher: Wide letter-spacing, champagne brass active indicator */}
        <div className="flex items-center justify-center gap-6 mb-4 text-xs tracking-widest">
          <button
            type="button"
            onClick={() => setQrType('url')}
            className={`transition cursor-pointer pb-1 ${
              qrType === 'url'
                ? 'text-[#C5A880] border-b border-[#C5A880] font-medium'
                : 'text-white/40 hover:text-white/70 border-b border-transparent'
            }`}
          >
            웹 링크 QR
          </button>
          <span className="text-white/10 select-none">|</span>
          <button
            type="button"
            onClick={() => setQrType('vcard')}
            className={`transition cursor-pointer pb-1 ${
              qrType === 'vcard'
                ? 'text-[#C5A880] border-b border-[#C5A880] font-medium'
                : 'text-white/40 hover:text-white/70 border-b border-transparent'
            }`}
          >
            연락처 저장 QR
          </button>
        </div>

        {/* 2. QR Code Canvas: Fine Paper + Champagne Brass inner border */}
        <div className="relative p-5 rounded-2xl bg-[#F7F5F0] border border-[#C5A880]/30 shadow-inner mb-6 flex flex-col items-center justify-center">
          {dataUrl ? (
            <img 
              src={dataUrl} 
              alt="Digital Card QR" 
              className="w-44 h-44 object-contain"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-neutral-400 text-xs font-mono">
              QR 생성 중...
            </div>
          )}
        </div>

        {/* 3. URL Row: Monospace URL with text copy link */}
        <div className="w-full flex items-center justify-between gap-3 border-b border-white/10 pb-3 mb-6">
          <span className="font-mono text-xs text-white/70 truncate select-all">
            {displayHost}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-[#C5A880] hover:text-[#E2CFB4] font-medium text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            title="링크 복사"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>복사</span>
              </>
            )}
          </button>
        </div>

        {/* 4. Bottom: Unified Minimalist Floating Action Dock matching studio canvas */}
        <div 
          className="bg-white/[0.03] border border-white/10 rounded-full px-5 py-2.5 flex items-center justify-center gap-4 shadow-xl backdrop-blur-md"
          role="toolbar"
          aria-label="명함 빠른 작업 도크"
        >
          {/* Action 1: Add to Contacts (.vcf) */}
          <button
            type="button"
            onClick={() => downloadVCard(data)}
            className="text-white/60 hover:text-[#C5A880] transition transform hover:scale-110 p-1.5 cursor-pointer rounded-full hover:bg-white/5 flex items-center justify-center"
            title="연락처(.vcf) 저장"
            aria-label="연락처(.vcf) 저장"
          >
            <UserPlus className="w-4 h-4" />
          </button>

          {/* Action 2: Share Card Link / Web Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="text-white/60 hover:text-[#C5A880] transition transform hover:scale-110 p-1.5 cursor-pointer rounded-full hover:bg-white/5 flex items-center justify-center"
            title="명함 링크 공유"
            aria-label="명함 링크 공유"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* 1px Vertical Divider */}
          <div className="h-4 w-[1px] bg-white/10" />

          {/* Action 3: Open Print / PDF Modal */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPrint?.();
            }}
            className="text-white/60 hover:text-[#C5A880] transition transform hover:scale-110 p-1.5 cursor-pointer rounded-full hover:bg-white/5 flex items-center justify-center"
            title="인쇄 및 고해상도 PDF"
            aria-label="인쇄 및 고해상도 PDF"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Action 4: Open Standalone HTML Modal (or download QR if not configured) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenExport) {
                onOpenExport();
              } else {
                handleDownloadQr();
              }
            }}
            className="text-white/60 hover:text-[#C5A880] transition transform hover:scale-110 p-1.5 cursor-pointer rounded-full hover:bg-white/5 flex items-center justify-center"
            title="독립 HTML 파일 배포"
            aria-label="독립 HTML 파일 배포"
          >
            <FileCode2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
