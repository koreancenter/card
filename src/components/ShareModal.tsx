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
  QrCode, 
  Share2, 
  FileCode, 
  ExternalLink 
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

  const targetUrl = data.website || (typeof window !== 'undefined' ? window.location.href : 'https://mrpark.koreancenter.net');
  const displayHost = data.websiteDisplay || targetUrl.replace(/^https?:\/\//, '');

  useEffect(() => {
    if (!isOpen) return;

    const contentToEncode = qrType === 'url' ? targetUrl : `BEGIN:VCARD\nVERSION:3.0\nFN:${data.name}\nTEL:${data.phoneRaw || data.phone}\nEMAIL:${data.email}\nORG:${data.organization}\nTITLE:${data.title}\nURL:${data.website}\nEND:VCARD`;

    QRCode.toDataURL(contentToEncode, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0B0C10',
        light: '#ffffff'
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
    a.download = `QR_${data.name}_${qrType.toUpperCase()}.png`;
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
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
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

        {/* QR Code Container */}
        <div className="relative p-4 rounded-2xl bg-white shadow-xl mb-4 group flex flex-col items-center">
          {dataUrl ? (
            <img 
              src={dataUrl} 
              alt="Digital Card QR" 
              className="w-44 h-44 object-contain rounded-lg"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-neutral-400 text-xs">
              QR 생성 중...
            </div>
          )}

          {/* QR Type Switcher */}
          <div className="flex items-center gap-1 mt-2.5 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
            <button
              onClick={() => setQrType('url')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                qrType === 'url' ? 'bg-[#0B0C10] text-white shadow-sm' : 'text-neutral-600 hover:text-black'
              }`}
            >
              웹 링크 QR
            </button>
            <button
              onClick={() => setQrType('vcard')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                qrType === 'vcard' ? 'bg-[#0B0C10] text-white shadow-sm' : 'text-neutral-600 hover:text-black'
              }`}
            >
              연락처 저장 QR
            </button>
          </div>
        </div>

        {/* Link Copy Bar */}
        <div className="w-full flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 mb-4">
          <span className="text-[11px] font-mono text-neutral-400 truncate px-2">
            {displayHost}
          </span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-medium transition-all cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>
        </div>

        {/* Action Grid (vCard, Print, HTML, QR Download) */}
        <div className="w-full grid grid-cols-2 gap-2 text-xs">
          {/* Save vCard */}
          <button
            onClick={() => downloadVCard(data)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-neutral-200 font-medium transition-all cursor-pointer active:scale-98"
          >
            <UserPlus className="w-4 h-4 text-[#C5A880]" />
            <span>연락처(.vcf) 저장</span>
          </button>

          {/* Native / System Share */}
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-neutral-200 font-medium transition-all cursor-pointer active:scale-98"
          >
            <Share2 className="w-4 h-4 text-[#C5A880]" />
            <span>명함 바로 공유</span>
          </button>

          {/* High-res Print / PDF */}
          {onOpenPrint && (
            <button
              onClick={() => {
                onClose();
                onOpenPrint();
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-neutral-200 font-medium transition-all cursor-pointer active:scale-98"
            >
              <Printer className="w-4 h-4 text-neutral-400" />
              <span>인쇄 / PDF 출력</span>
            </button>
          )}

          {/* Standalone HTML Export */}
          {onOpenExport ? (
            <button
              onClick={() => {
                onClose();
                onOpenExport();
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-neutral-200 font-medium transition-all cursor-pointer active:scale-98"
            >
              <FileCode className="w-4 h-4 text-neutral-400" />
              <span>단일 HTML 저장</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadQr}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-neutral-200 font-medium transition-all cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4 text-neutral-400" />
              <span>QR 이미지 저장</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
