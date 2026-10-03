import React, { useState } from 'react';
import { CardData, CardTheme } from '../types/card';
import { generateStandaloneHtml } from '../utils/htmlExport';
import { X, Download, Copy, Check, Globe, Code, Sparkles, Server } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'code' | 'deploy'>('deploy');

  if (!isOpen) return null;

  const htmlCode = generateStandaloneHtml(card, theme);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <style>{`
        .luxury-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .luxury-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .luxury-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
        }
        .luxury-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .luxury-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
      `}</style>

      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#121318] border border-white/10 text-neutral-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/20">
                <Globe className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                독립형 HTML / Tailwind 단일 파일 배포
              </h3>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              외부 서버나 DB 종속 없이 단 1개의 <code className="text-[#C5A880] font-mono">index.html</code> 파일로 개인 도메인에 즉시 호스팅할 수 있습니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="닫기"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 gap-3 border-b border-white/10 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('deploy')}
            className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'deploy'
                ? 'border-[#C5A880] text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>개인 도메인 배포 가이드 (3분)</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'code'
                ? 'border-[#C5A880] text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>HTML 소스코드 미리보기</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4 luxury-scrollbar">
          {activeTab === 'deploy' ? (
            <div className="space-y-4 text-white/80 leading-relaxed">
              {/* Feature highlight card without redundant nesting */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <h4 className="font-semibold text-white flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-[#C5A880]" />
                  단일 파일 배포의 특별한 장점
                </h4>
                <p className="text-white/60 text-xs leading-relaxed">
                  생성된 코드는 <span className="text-white font-medium">Tailwind CSS CDN, 3D 카드 인터랙션, 주소록 vCard 다운로드, 자동 QR 생성</span>이 전부 1개의 <code className="text-[#C5A880] font-mono">index.html</code> 안에 완벽히 내장되어 있습니다. npm 설치나 별도 빌드 과정이 전혀 필요하지 않습니다.
                </p>
              </div>

              <div className="space-y-2.5">
                <h5 className="font-semibold text-xs tracking-wider uppercase text-white/40 pt-1">
                  추천 배포 방법 (원하는 플랫폼 선택)
                </h5>

                {/* Option 1: Cloudflare Pages */}
                <div className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">1. Cloudflare Pages (무료 & 초간편)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/20 font-medium">추천</span>
                  </div>
                  <p className="text-white/60 text-[11px] leading-relaxed">
                    1) 하단 <strong>[HTML 파일 다운로드]</strong> 버튼으로 <code className="text-white/90 font-mono">index.html</code> 저장<br />
                    2) Cloudflare Pages 대시보드에서 <strong>'Direct Upload(직접 업로드)'</strong> 선택<br />
                    3) 다운로드한 파일을 드래그 앤 드롭하면 10초 만에 글로벌 고속 CDN 무료 배포 및 개인 도메인(예: <code className="text-[#C5A880] font-mono">yourdomain.com</code>) 연결 완료!
                  </p>
                </div>

                {/* Option 2: GitHub Pages */}
                <div className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all space-y-1.5">
                  <span className="font-semibold text-white text-xs">2. GitHub Pages</span>
                  <p className="text-white/60 text-[11px] leading-relaxed">
                    새 GitHub 저장소 생성 후 <code className="text-white/90 font-mono">index.html</code> 파일만 업로드하고 Settings &gt; Pages에서 활성화하면 즉시 <code className="text-[#C5A880] font-mono">username.github.io</code> 무료 호스팅이 개설됩니다.
                  </p>
                </div>

                {/* Option 3: Traditional Web Hosting / cPanel */}
                <div className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all space-y-1.5">
                  <span className="font-semibold text-white text-xs">3. 기존 웹 호스팅 서버 (카페24, 가비아, AWS S3 등)</span>
                  <p className="text-white/60 text-[11px] leading-relaxed">
                    FTP 또는 파일 관리자를 통해 호스팅의 루트 디렉터리(<code className="text-white/90 font-mono">public_html/</code> 또는 <code className="text-white/90 font-mono">html/</code>)에 <code className="text-[#C5A880] font-mono">index.html</code>을 덮어쓰기만 하면 완료됩니다.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-white/50 text-[11px]">
                <span>독립 실행형 단일 HTML 파일 ({htmlCode.length.toLocaleString()} bytes)</span>
                <span className="font-mono text-[#C5A880] font-medium">Zero Build Dependencies</span>
              </div>
              <pre className="luxury-scrollbar p-5 rounded-2xl bg-[#090A0D] border border-white/10 font-mono text-xs text-neutral-300 leading-relaxed overflow-x-auto max-h-[380px] selection:bg-[#C5A880]/30 selection:text-white">
                {htmlCode}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0B0C10]/80 flex flex-col sm:flex-row items-center justify-between gap-3.5 shrink-0">
          <div className="text-[11px] text-white/50">
            적용 대상: <strong className="text-white">{card.name}</strong> ({card.organization}) · 테마: <strong className="text-[#C5A880] font-medium">{theme}</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial whitespace-nowrap flex items-center justify-center gap-2 text-sm font-medium bg-white/[0.05] hover:bg-white/[0.1] text-white/90 border border-white/10 px-5 py-2.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              title="전체 HTML 코드 클립보드 복사"
            >
              {copied ? <Check className="w-4 h-4 text-[#C5A880]" /> : <Copy className="w-4 h-4 text-white/70" />}
              <span>{copied ? '복사 완료' : '코드 복사'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial whitespace-nowrap flex items-center justify-center gap-2 text-sm font-semibold bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-lg"
              title="독립형 HTML 파일 다운로드"
            >
              <Download className="w-4 h-4 text-black" />
              <span>HTML 파일 다운로드</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
