import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CardData } from '../types/card';
import { generateVCard } from '../utils/vcard';
import { X, Copy, Check, Download, ExternalLink } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CardData;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, data }) => {
  const [qrType, setQrType] = useState<'url' | 'vcard'>('url');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // The official production destination URL
  const targetUrl = data.website || 'https://mrpark.koreancenter.net';

  useEffect(() => {
    if (!isOpen) return;

    const contentToEncode = qrType === 'url' ? targetUrl : generateVCard(data);

    QRCode.toDataURL(contentToEncode, {
      width: 480,
      margin: 2,
      color: {
        dark: '#0a0a0c',
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

  const displayHost = data.websiteDisplay || targetUrl.replace(/^https?:\/\//, '');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!dataUrl) return;
    const safeDomain = displayHost.replace(/[^a-zA-Z0-9]/g, '_');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${safeDomain}_${qrType.toUpperCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-7 text-neutral-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-5">
          <p className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
            OFFICIAL CONNECT QR
          </p>
          <h3 className="text-lg font-bold text-white tracking-tight">디지털 명함 QR 코드</h3>
          <p className="text-xs text-neutral-400">
            스마트폰 카메라로 스캔하면 바로 연결됩니다
          </p>
        </div>

        {/* Mode Segmented Tab */}
        <div className="flex items-center p-1 bg-neutral-950 rounded-xl border border-neutral-800/80 mb-5">
          <button
            onClick={() => setQrType('url')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              qrType === 'url'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            공식 도메인 (URL)
          </button>
          <button
            onClick={() => setQrType('vcard')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              qrType === 'vcard'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            연락처 바로저장 (vCard)
          </button>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center mx-auto shadow-xl max-w-[260px]">
          {dataUrl ? (
            <img 
              src={dataUrl} 
              alt={`${displayHost} QR Code`} 
              className="w-full h-auto aspect-square object-contain"
            />
          ) : (
            <div className="w-[200px] h-[200px] flex items-center justify-center text-xs text-neutral-500">
              QR 생성 중...
            </div>
          )}

          {/* Encoded URL Display */}
          <div className="mt-2.5 pt-2 border-t border-neutral-100 w-full text-center">
            <span className="font-mono text-[10px] font-medium text-neutral-800 tracking-tight">
              {qrType === 'url' ? displayHost : `${data.name} vCard`}
            </span>
          </div>
        </div>

        {/* Info label */}
        <p className="mt-3.5 text-center text-[11px] text-neutral-400">
          {qrType === 'url' 
            ? `스캔 시 공식 주소 ${displayHost} 페이지가 열립니다`
            : `스캔 즉시 스마트폰 주소록에 ${data.nameKr || data.name} 연락처가 등록됩니다`}
        </p>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사 완료' : '주소 복사'}</span>
          </button>

          <button
            onClick={handleDownloadQr}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>QR 다운로드</span>
          </button>
        </div>

        {/* Direct Link Affordance */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 text-center">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <span>{displayHost} 바로 열기</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
