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
    a.download = `index_${card.name.replace(/\s+/g, '_')}.html`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Globe className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                독립형 HTML / Tailwind 단일 파일 배포
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              외부 서버나 DB 종속 없이 단 1개의 <code className="text-amber-300 font-mono">index.html</code> 파일로 개인 도메인에 즉시 호스팅할 수 있습니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 gap-2 border-b border-neutral-800 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('deploy')}
            className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'deploy'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>개인 도메인 배포 가이드 (3분)</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'code'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>HTML 소스코드 미리보기</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {activeTab === 'deploy' ? (
            <div className="space-y-4 text-neutral-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  단일 파일 배포의 특별한 장점
                </h4>
                <p className="text-neutral-400 text-xs">
                  생성된 코드는 <strong>Tailwind CSS CDN, 3D 카드 틸트/회전 인터랙션, 주소록 vCard 다운로드, 자동 QR 생성</strong>이 전부 1개의 <code className="text-white">index.html</code> 안에 포함되어 있습니다. npm 설치나 빌드 과정이 전혀 필요 없습니다.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-white text-xs tracking-wider uppercase text-neutral-400">
                  추천 배포 방법 (원하는 플랫폼 선택)
                </h5>

                {/* Option 1: Cloudflare Pages */}
                <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">1. Cloudflare Pages (무료 & 가장 쉬움)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/20 font-medium">추천</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    1) 아래 <strong>[HTML 파일 다운로드]</strong> 버튼을 클릭하여 <code className="text-neutral-200">index.html</code> 저장<br />
                    2) Cloudflare Pages 대시보드에서 <strong>'Direct Upload(직접 업로드)'</strong> 선택<br />
                    3) 방금 다운로드한 폴더를 드래그 앤 드롭하면 10초 만에 전 세계 CDN 무료 배포 및 개인 도메인(예: <code className="text-[#C5A880]">yourdomain.com</code>) 연결 완료!
                  </p>
                </div>

                {/* Option 2: GitHub Pages */}
                <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                  <span className="font-semibold text-white">2. GitHub Pages</span>
                  <p className="text-neutral-400 text-[11px]">
                    새 GitHub 저장소 생성 후 <code className="text-neutral-200">index.html</code> 파일만 업로드하고 Settings &gt; Pages에서 활성화하면 즉시 <code className="text-amber-300">username.github.io</code> 무료 호스팅 생성.
                  </p>
                </div>

                {/* Option 3: Traditional Web Hosting / cPanel */}
                <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                  <span className="font-semibold text-white">3. 기존 웹 호스팅 서버 (카페24, 가비아, AWS S3 등)</span>
                  <p className="text-neutral-400 text-[11px]">
                    FTP를 통해 호스팅의 루트 경로(<code className="text-neutral-200">public_html</code> 또는 <code className="text-neutral-200">html/</code>)에 <code className="text-neutral-200">index.html</code>을 덮어쓰기만 하면 완료됩니다.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                <span>독립 실행형 단일 HTML 파일 ({htmlCode.length.toLocaleString()} bytes)</span>
                <span className="font-mono text-emerald-400">Zero Build Dependencies</span>
              </div>
              <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-[360px] selection:bg-neutral-800">
                {htmlCode}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-neutral-400">
            적용 대상: <strong className="text-white">{card.name}</strong> ({card.organization}) · 테마: <strong className="text-white">{theme}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사 완료' : '코드 복사'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black transition-colors text-xs font-bold cursor-pointer shadow-lg"
            >
              <Download className="w-3.5 h-3.5" />
              <span>HTML 파일 다운로드 (.html)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
