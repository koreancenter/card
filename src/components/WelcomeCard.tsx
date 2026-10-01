import React from 'react';
import { Plus, Eye, ShieldCheck, Sparkles } from 'lucide-react';

interface WelcomeCardProps {
  onCreateFirstCard: () => void;
  onExploreSample: () => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  onCreateFirstCard,
  onExploreSample,
}) => {
  return (
    <div className="w-full max-w-[540px] mx-auto select-none flex flex-col items-center">
      {/* 3D-Style Luxury Business Card Surface */}
      <div 
        className="w-full relative rounded-2xl bg-[#16181D] border border-white/10 hover:border-[#C5A880]/40 transition-all duration-300 shadow-[0_24px_64px_rgba(0,0,0,0.6)] hover:shadow-[0_32px_80px_rgba(0,0,0,0.75)] p-7 sm:p-9 flex flex-col justify-between overflow-hidden group min-h-[320px] sm:min-h-[340px]"
        style={{ aspectRatio: '1.586 / 1' }}
      >
        {/* Subtle Luxury Ambient Glow & Watermark Geometry */}
        <div 
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#C5A880]/5 blur-3xl pointer-events-none group-hover:bg-[#C5A880]/10 transition-colors duration-500" 
          aria-hidden="true"
        />
        <div 
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" 
          aria-hidden="true"
        />

        {/* Top Header: Brand Wordmark & Security Marker */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A880]/80 shadow-[0_0_8px_#C5A880]" />
            <h2 className="text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-neutral-200 font-sans">
              GOGUMA CARD STUDIO
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#C5A880]/80 font-mono tracking-tight">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Local-First</span>
          </div>
        </div>

        {/* Center Hero: Subtitle & Value Proposition */}
        <div className="relative z-10 my-auto text-center space-y-3 py-2">
          <p className="text-base sm:text-lg font-medium text-neutral-100 tracking-tight leading-snug text-balance">
            회원가입 없이 브라우저에 안전히 보관되는<br className="hidden sm:inline" /> 로컬 퍼스트 디지털 명함
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
            <span>개인정보 비수집</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>기기 암호화</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>3D 인터랙티브</span>
          </div>
        </div>

        {/* Action Controls: Primary CTA & Secondary Sample Preview */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
            {/* Primary CTA Button */}
            <button
              onClick={onCreateFirstCard}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#D6B991] text-neutral-950 font-bold text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-[#C5A880]/15 hover:shadow-[#C5A880]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ 첫 명함 만들기</span>
            </button>

            {/* Secondary Text Button */}
            <button
              onClick={onExploreSample}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition-colors duration-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 cursor-pointer underline-offset-4 hover:underline whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>샘플 둘러보기</span>
            </button>
          </div>

          {/* Micro Footnote */}
          <p className="text-[11px] text-neutral-500 text-center tracking-tight leading-none pt-1">
            데이터는 기본적으로 사용자의 기기 브라우저에만 암호화 저장됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
