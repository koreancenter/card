import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, X, Smartphone } from "lucide-react";
import { getOrCreateSyncId } from "../utils/syncWallet";

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({ isOpen, onClose }) => {
  const [qrSrc, setQrSrc] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const syncId = getOrCreateSyncId();
  const syncUrl = typeof window !== 'undefined' ? `${window.location.origin}?sync=${syncId}` : '';

  useEffect(() => {
    if (isOpen && syncUrl) {
      QRCode.toDataURL(syncUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: "#0B0C10",
          light: "#FFFFFF",
        },
      }).then(setQrSrc);
    }
  }, [isOpen, syncUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(syncUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#16181D] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#C5A880]">
          <Smartphone size={24} />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">기기 연결 (보관함 동기화)</h3>
        <p className="text-xs text-white/60 mb-5">
          스마트폰 기본 카메라로 QR 코드를 스캔하면<br />가입 없이 현재 보관함이 그대로 연결됩니다.
        </p>

        {qrSrc && (
          <div className="bg-white p-3 rounded-xl inline-block mx-auto mb-5 shadow-inner">
            <img src={qrSrc} alt="Sync QR" className="w-48 h-48 block" />
          </div>
        )}

        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-2 px-3 text-xs text-left mb-2">
          <span className="truncate text-white/60 flex-1">{syncUrl}</span>
          <button
            onClick={handleCopy}
            className="text-white/80 hover:text-white p-1 transition flex items-center gap-1"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};