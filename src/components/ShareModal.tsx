import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CardData } from '../types/card';
import { downloadVCard, generateVCard } from '../utils/vcard';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  UserPlus, 
  Printer, 
  FileCode2 
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CardData;
  cardUrl?: string;
  onOpenPrint?: () => void;
  onOpenExport?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  data,
  cardUrl,
  onOpenPrint,
  onOpenExport
}) => {
  const [copied, setCopied] = useState(false);
  const [qrType, setQrType] = useState<'url' | 'vcard'>('url');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const resolvedUrl = cardUrl || data.website || 'https://card.goguma.app/master';

  useEffect(() => {
    if (!isOpen) return;

    const qrTarget = qrType === 'url' ? resolvedUrl : generateVCard(data);
    QRCode.toDataURL(qrTarget, {
      width: 480,
      margin: 1,
      color: {
        dark: '#0A0A0B',
        light: '#FAFAFA'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [isOpen, qrType, resolvedUrl, data]);

  if (!isOpen) return null;

  const displayHost = (data.websiteDisplay || resolvedUrl).replace(/^https?:\/\//, '');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.name} — ${data.organization}`,
          text: `${data.organizationKr} ${data.titleKr} ${data.name}의 디지털 명함입니다.`,
          url: resolvedUrl
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${data.name}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Surface: Rich dark canvas (#0A0A0B) with hairline border */}
      <div 
        className="relative bg-[#0A0A0B] border border-white/10 rounded-3xl p-7 sm:p-8 max-w-[420px] w-full shadow-2xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal, airy close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition cursor-pointer p-1.5 rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
          title="닫기"
          aria-label="닫기"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* 1. Header: Crisp Monochrome Header Hierarchy */}
        <div className="text-center mb-5">
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block mb-1.5">
            DIGITAL CARD SHARING
          </span>
          <h3 className="text-base font-semibold text-white tracking-tight">
            {data.name} {data.title && <span className="text-zinc-400 font-normal">· {data.title}</span>}
          </h3>
          {data.organization && (
            <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-[280px]">
              {data.organization}
            </p>
          )}
        </div>

        {/* Tab Switcher: Crisp monochrome active indicator */}
        <div className="flex items-center justify-center gap-6 mb-4 text-xs tracking-wider">
          <button
            type="button"
            onClick={() => setQrType('url')}
            className={`transition cursor-pointer pb-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 ${
              qrType === 'url'
                ? 'text-white border-b-2 border-white font-medium'
                : 'text-neutral-500 hover:text-zinc-300 border-b-2 border-transparent'
            }`}
          >
            웹 링크 QR
          </button>
          <span className="text-zinc-800 select-none">|</span>
          <button
            type="button"
            onClick={() => setQrType('vcard')}
            className={`transition cursor-pointer pb-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 ${
              qrType === 'vcard'
                ? 'text-white border-b-2 border-white font-medium'
                : 'text-neutral-500 hover:text-zinc-300 border-b-2 border-transparent'
            }`}
          >
            연락처 저장 QR
          </button>
        </div>

        {/* 2. QR Code Canvas: Warm matte paper (#FAFAFA) with subtle black/5 border */}
        <div className="relative p-5 rounded-2xl bg-[#FAFAFA] border border-black/5 shadow-inner mb-6 flex flex-col items-center justify-center">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="Digital Card QR" 
              className="w-44 h-44 object-contain"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-neutral-500 font-mono">
              QR 생성 중...
            </div>
          )}
        </div>

        {/* 3. URL Row: Monospace URL with text copy link */}
        <div className="w-full flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 mb-6">
          <span className="font-mono text-xs text-zinc-300 truncate select-all">
            {displayHost}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-white hover:bg-white/10 px-2.5 py-1 rounded-lg font-medium text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
            title="링크 복사"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
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

        {/* 4. Bottom: Restrained Monochrome Floating Action Dock */}
        <div 
          className="bg-[#121214] border border-white/10 rounded-full px-5 py-2 flex items-center justify-center gap-4 shadow-xl"
          role="toolbar"
          aria-label="명함 빠른 작업 도크"
        >
          <button
            type="button"
            onClick={() => downloadVCard(data)}
            className="text-zinc-400 hover:text-white transition p-1.5 cursor-pointer rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 flex items-center justify-center"
            title="연락처(.vcf) 저장"
            aria-label="연락처(.vcf) 저장"
          >
            <UserPlus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="text-zinc-400 hover:text-white transition p-1.5 cursor-pointer rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 flex items-center justify-center"
            title="명함 링크 공유"
            aria-label="명함 링크 공유"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10" />

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPrint?.();
            }}
            className="text-zinc-400 hover:text-white transition p-1.5 cursor-pointer rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 flex items-center justify-center"
            title="인쇄 및 고해상도 PDF"
            aria-label="인쇄 및 고해상도 PDF"
          >
            <Printer className="w-4 h-4" />
          </button>

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
            className="text-zinc-400 hover:text-white transition p-1.5 cursor-pointer rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 flex items-center justify-center"
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
