import React, { useState } from 'react';
import { CardData, CardTheme } from '../types/card';
import { generateStandaloneHtml } from '../utils/htmlExport';
import { X, Download, Copy, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardData;
  theme: CardTheme;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  card,
  theme
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'deploy' | 'code'>('deploy');

  if (!isOpen) return null;

  const htmlCode = generateStandaloneHtml(card, theme);
  const displaySlug = card.websiteDisplay || (card.website ? card.website.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'vance.goguma.app');

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `index_${(card.name || 'card').replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 1. Fix Modal Height Jitter: Strict fixed dimensions container */}
      <div 
        className="w-full max-w-[520px] h-[580px] flex flex-col bg-[#0B0C10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              독립형 HTML 배포
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              빌드 및 DB 종속 없는 단일 <code className="text-[#C5A880] font-mono">index.html</code> 파일
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/30 hover:text-[#C5A880] transition cursor-pointer"
            title="닫기"
            aria-label="닫기"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 gap-6 border-b border-white/10 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('deploy')}
            className={`pb-2.5 font-medium transition-colors cursor-pointer border-b-2 ${
              activeTab === 'deploy'
                ? 'border-[#C5A880] text-[#C5A880]'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            배포 가이드
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 font-medium transition-colors cursor-pointer border-b-2 ${
              activeTab === 'code'
                ? 'border-[#C5A880] text-[#C5A880]'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            HTML 소스코드 미리보기
          </button>
        </div>

        {/* Body Content Area: Fixed height, fills exact area without modal jitter */}
        <div className="flex-1 overflow-hidden p-6 flex flex-col">
          {activeTab === 'deploy' ? (
            /* 2. Radical Decluttering of Tab 1 (배포 가이드): 3 ultra-clean minimal cards */
            <div className="h-full flex flex-col justify-center gap-3.5">
              {/* Target 1: Cloudflare Pages */}
              <div className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl transition">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-medium text-white text-xs">Cloudflare Pages</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 font-medium">
                    추천
                  </span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  index.html 업로드 즉시 글로벌 CDN 무료 호스팅
                </p>
              </div>

              {/* Target 2: GitHub Pages */}
              <div className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl transition">
                <div className="font-medium text-white text-xs mb-1.5">
                  GitHub Pages
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  저장소에 업로드하여 무료 도메인 연결
                </p>
              </div>

              {/* Target 3: 자체 웹 호스팅 */}
              <div className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl transition">
                <div className="font-medium text-white text-xs mb-1.5">
                  자체 웹 호스팅
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  FTP / S3 루트 경로에 단일 파일 업로드
                </p>
              </div>
            </div>
          ) : (
            /* 3. Polish Tab 2 (HTML 소스코드 미리보기) */
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <span className="font-mono text-[11px] text-white/40">
                  standalone index.html · {htmlCode.length.toLocaleString()} bytes
                </span>
                <span className="font-mono text-[11px] text-[#C5A880]/80">
                  Zero Build Dependencies
                </span>
              </div>
              <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-xs overflow-auto leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent text-white/80 selection:bg-[#C5A880]/30 selection:text-white">
                <pre className="font-mono text-xs leading-relaxed whitespace-pre">
                  {htmlCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 4. Cohesive Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0B0C10] flex items-center justify-between gap-4 shrink-0">
          {/* Left: Clean card slug badge */}
          <span className="font-mono text-xs text-white/50 truncate max-w-[200px] select-all">
            {displaySlug}
          </span>

          {/* Right: Two polished buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl text-xs text-white/80 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98]"
              title="코드 복사"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#C5A880]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사 완료' : '코드 복사'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-black bg-[#C5A880] hover:bg-[#D4BC96] transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98] shadow-md"
              title="HTML 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
              <span>HTML 다운로드</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
