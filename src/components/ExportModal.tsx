import React, { useState } from 'react';
import { CardData, CardTheme } from '../types/card';
import { generateStandaloneHtml } from '../utils/htmlExport';
import { X, Copy, Download, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardData;
  theme?: CardTheme;
  slug?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  card,
  theme = 'pure_white',
  slug,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'deploy' | 'code'>('deploy');

  if (!isOpen) return null;

  const htmlCode = generateStandaloneHtml(card, theme);
  const displaySlug = slug ? `/${slug}` : '/card';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `index.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Container: Rich Dark Surface (#0A0A0B) with hairline border */}
      <div 
        className="w-full max-w-[520px] h-[580px] flex flex-col bg-[#0A0A0B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              독립형 HTML 배포
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              빌드 및 DB 종속 없는 단일 <code className="text-zinc-200 font-mono">index.html</code> 파일
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-500 hover:text-white transition cursor-pointer hover:bg-white/5"
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
                ? 'border-white text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            배포 가이드
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 font-medium transition-colors cursor-pointer border-b-2 ${
              activeTab === 'code'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            HTML 소스코드 미리보기
          </button>
        </div>

        {/* Body Content Area */}
        <div className="flex-1 overflow-hidden p-6 flex flex-col">
          {activeTab === 'deploy' ? (
            <div className="h-full flex flex-col justify-center gap-3.5">
              {/* Target 1: Cloudflare Pages */}
              <div className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-4 rounded-2xl transition">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-medium text-white text-xs">Cloudflare Pages</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white border border-white/20 font-medium">
                    추천
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  index.html 업로드 즉시 글로벌 엣지 CDN 무료 호스팅
                </p>
              </div>

              {/* Target 2: GitHub Pages */}
              <div className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-4 rounded-2xl transition">
                <div className="font-medium text-white text-xs mb-1.5">
                  GitHub Pages
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  저장소에 업로드하여 무료 도메인 연결
                </p>
              </div>

              {/* Target 3: 자체 웹 호스팅 */}
              <div className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-4 rounded-2xl transition">
                <div className="font-medium text-white text-xs mb-1.5">
                  자체 웹 호스팅
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  FTP / S3 루트 경로에 단일 파일 업로드
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <span className="font-mono text-[11px] text-zinc-400">
                  standalone index.html · {htmlCode.length.toLocaleString()} bytes
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  Zero Build Dependencies
                </span>
              </div>
              <div className="flex-1 bg-black/60 border border-white/5 rounded-2xl p-4 font-mono text-xs overflow-auto leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent text-zinc-300 selection:bg-white/20 selection:text-white">
                <pre className="font-mono text-xs leading-relaxed whitespace-pre">
                  {htmlCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0A0A0B] flex items-center justify-between gap-4 shrink-0">
          <span className="font-mono text-xs text-zinc-400 truncate max-w-[200px] select-all">
            {displaySlug}
          </span>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl text-xs text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98]"
              title="코드 복사"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사 완료' : '코드 복사'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-black bg-white hover:bg-zinc-200 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98] shadow-md"
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
