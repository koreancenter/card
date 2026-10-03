import React, { useState } from 'react';
import { CardData, CardTheme } from '../types/card';
import { generateStandaloneHtml } from '../utils/htmlExport';
import { X, Download, Copy, Check, Globe, Code, Sparkles, Server, HelpCircle } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardData;
  theme: CardTheme;
}

interface TooltipBadgeProps {
  title: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom';
}

const TooltipBadge: React.FC<TooltipBadgeProps> = ({ title, children, placement = 'bottom' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className="w-5 h-5 rounded-full bg-white/5 hover:bg-[#C5A880]/20 border border-white/20 hover:border-[#C5A880]/60 text-white/50 hover:text-[#C5A880] flex items-center justify-center transition-all cursor-pointer text-[10px] font-mono font-bold shrink-0 shadow-sm"
        aria-label={`${title} 도움말`}
      >
        ?
      </button>

      {isOpen && (
        <div 
          className={`absolute right-0 ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } w-72 sm:w-84 p-4 rounded-2xl bg-[#14151C] border border-white/20 text-white shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150`}
          style={{ 
            boxShadow: '0 24px 48px -12px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.1)' 
          }}
        >
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10 text-xs font-bold text-[#C5A880]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{title}</span>
          </div>
          <div className="text-[11px] text-white/70 leading-relaxed font-sans">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

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
            <span>개인 도메인 배포 가이드</span>
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

        {/* Tab Content Body (No Box-in-Box, Open Seamless Layout, overflow-visible for tooltips) */}
        <div className={`p-6 flex-1 text-xs space-y-4 luxury-scrollbar ${activeTab === 'deploy' ? 'overflow-visible' : 'overflow-y-auto'}`}>
          {activeTab === 'deploy' ? (
            <div className="space-y-4 text-white/80">
              
              {/* Feature highlight header (Clean & Borderless, No Box-in-Box) */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-white text-xs truncate">단일 파일 배포 아키텍처</span>
                    <span className="text-[10px] text-[#C5A880] font-mono px-2 py-0.5 rounded-md bg-[#C5A880]/10 border border-[#C5A880]/20 font-medium shrink-0">
                      Zero Build
                    </span>
                  </div>
                </div>

                <TooltipBadge title="단일 파일 배포의 특별한 장점">
                  <p>
                    생성된 코드는 <span className="text-white font-medium">Tailwind CSS CDN, 3D 카드 인터랙션, 주소록 vCard 다운로드, 자동 QR 생성</span>이 전부 1개의 <code className="text-[#C5A880] font-mono">index.html</code> 안에 완벽히 내장되어 있습니다.
                  </p>
                  <p className="mt-1.5 text-white/50 text-[10px]">
                    별도의 npm 설치나 서버 빌드 과정이 일체 필요하지 않습니다.
                  </p>
                </TooltipBadge>
              </div>

              {/* Hosting Platforms (Seamless Flat List, No Box-in-Box) */}
              <div className="pt-1 space-y-1">
                <h5 className="font-semibold text-[11px] tracking-wider uppercase text-white/40 px-1 mb-2">
                  호스팅 배포 플랫폼
                </h5>

                <div className="divide-y divide-white/5">
                  {/* Option 1: Cloudflare Pages */}
                  <div className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-white/[0.02] rounded-xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/20 flex items-center justify-center text-[#C5A880] text-xs font-mono font-bold shrink-0">
                        1
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-xs">Cloudflare Pages</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/20 font-medium">추천</span>
                        </div>
                        <p className="text-[11px] text-white/40 truncate mt-0.5">
                          무료 글로벌 CDN 고속 호스팅 & 개인 커스텀 도메인 지원
                        </p>
                      </div>
                    </div>

                    <TooltipBadge title="Cloudflare Pages 배포 가이드">
                      <ol className="space-y-1.5 list-decimal list-inside text-white/80">
                        <li>하단 다운로드 버튼으로 <code className="text-white font-mono">index.html</code> 저장</li>
                        <li>Cloudflare Pages 대시보드에서 <strong>'Direct Upload'</strong> 선택</li>
                        <li>다운로드한 파일을 업로드하면 10초 만에 글로벌 고속 CDN 무료 배포 및 개인 도메인(예: <code className="text-[#C5A880] font-mono">yourdomain.com</code>) 연결 완료</li>
                      </ol>
                    </TooltipBadge>
                  </div>

                  {/* Option 2: GitHub Pages */}
                  <div className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-white/[0.02] rounded-xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 text-xs font-mono font-bold shrink-0">
                        2
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-white text-xs">GitHub Pages</span>
                        <p className="text-[11px] text-white/40 truncate mt-0.5">
                          username.github.io 무료 호스팅 & Git 버전 관리
                        </p>
                      </div>
                    </div>

                    <TooltipBadge title="GitHub Pages 배포 가이드">
                      <p>
                        새 GitHub 저장소를 생성한 후 <code className="text-white font-mono">index.html</code> 파일만 업로드하고, 저장소 <strong>Settings &gt; Pages</strong>에서 활성화하면 즉시 <code className="text-[#C5A880] font-mono">username.github.io</code> 무료 호스팅이 개설됩니다.
                      </p>
                    </TooltipBadge>
                  </div>

                  {/* Option 3: Traditional Web Hosting */}
                  <div className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-white/[0.02] rounded-xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 text-xs font-mono font-bold shrink-0">
                        3
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-white text-xs">기존 웹 호스팅 서버</span>
                        <p className="text-[11px] text-white/40 truncate mt-0.5">
                          카페24, 가비아, AWS S3, cPanel 등
                        </p>
                      </div>
                    </div>

                    <TooltipBadge title="웹 호스팅 FTP 배포 가이드">
                      <p>
                        FTP 또는 파일 관리자를 통해 호스팅의 웹 루트 디렉터리(<code className="text-white font-mono">public_html/</code> 또는 <code className="text-white font-mono">html/</code>)에 <code className="text-[#C5A880] font-mono">index.html</code>을 업로드(덮어쓰기)하기만 하면 즉시 적용됩니다.
                      </p>
                    </TooltipBadge>
                  </div>
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

        {/* Modal Action Bar (Icon-Only Buttons for Copy and Download) */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0B0C10]/80 flex items-center justify-between gap-3.5 shrink-0">
          <div className="text-[11px] text-white/50 truncate">
            적용 대상: <strong className="text-white">{card.name}</strong> ({card.organization}) · 테마: <strong className="text-[#C5A880] font-medium">{theme}</strong>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/90 border border-white/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              title={copied ? '복사 완료' : '코드 복사'}
              aria-label="코드 복사"
            >
              {copied ? <Check className="w-4 h-4 text-[#C5A880]" /> : <Copy className="w-4 h-4 text-white/80" />}
            </button>

            <button
              onClick={handleDownload}
              className="p-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black transition-all active:scale-95 cursor-pointer shadow-lg flex items-center justify-center"
              title="HTML 파일 다운로드"
              aria-label="HTML 파일 다운로드"
            >
              <Download className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
