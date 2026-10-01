import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl bg-[#16181D] border border-rose-900/30 shadow-2xl p-6 sm:p-7 relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Destructive Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-900/30 flex items-center justify-center text-rose-400 mb-4">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>

        {/* Title */}
        <h3 id="reset-modal-title" className="text-lg font-bold text-white tracking-tight">
          로컬 데이터 전체 초기화
        </h3>

        {/* Warning Details */}
        <div className="mt-3.5 space-y-2 text-xs text-neutral-300 leading-relaxed text-left p-3.5 rounded-xl bg-black/50 border border-rose-950/50">
          <p className="font-semibold text-rose-300/80 flex items-center gap-1.5">
            <span>주의: 모든 데이터가 브라우저에서 영구 삭제됩니다.</span>
          </p>
          <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px]">
            <li>직접 생성한 내 명함 및 보관된 명함 전체</li>
            <li>설정된 4자리 보안 PIN 해시값 및 생체 인증 정보</li>
            <li>기기 간 동기화 세션 ID 및 환경 설정</li>
          </ul>
        </div>

        <p className="text-[11px] text-neutral-500 mt-3 text-center leading-normal">
          삭제된 데이터는 복구할 수 없습니다. 초기화 후 서비스는 초기 방문자 상태로 되돌아갑니다.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-6">
          <button
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#4A1525] hover:bg-[#5C1B2E] text-rose-100 border border-rose-700/30 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>전체 데이터 삭제 및 초기화</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white transition-colors text-xs font-medium cursor-pointer whitespace-nowrap"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
