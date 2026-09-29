import React from 'react';
import { CardData, CardTheme, PrintConfig, PrintLayout, PrintSize } from '../types/card';
import { BusinessCardFront } from './BusinessCardFront';
import { BusinessCardBack } from './BusinessCardBack';
import { THEMES } from './ThemeSelector';
import { X, Printer, Info, Check, Layers } from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CardData;
  config: PrintConfig;
  onConfigChange: (newConfig: PrintConfig) => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  data,
  config,
  onConfigChange
}) => {
  if (!isOpen) return null;

  const handleExecutePrint = () => {
    window.print();
  };

  const updateConfig = (patch: Partial<PrintConfig>) => {
    onConfigChange({
      ...config,
      ...patch
    });
  };

  const isKr = config.size === 'kr-standard';
  const widthDisplay = isKr ? '90 × 50 mm' : '85 × 55 mm';

  // Professional Hairline Crop Marks Simulation
  const CropMarksPreview = () => (
    <div className="absolute -inset-2.5 pointer-events-none">
      {/* 3mm Bleed Boundary */}
      <div className="absolute inset-0 border border-dashed border-neutral-600/60" />

      {/* Top Left Crosshairs */}
      <div className="absolute top-0 left-2.5 -mt-2 w-px h-2 bg-neutral-400" />
      <div className="absolute top-2.5 left-0 -ml-2 w-2 h-px bg-neutral-400" />

      {/* Top Right Crosshairs */}
      <div className="absolute top-0 right-2.5 -mt-2 w-px h-2 bg-neutral-400" />
      <div className="absolute top-2.5 right-0 -mr-2 w-2 h-px bg-neutral-400" />

      {/* Bottom Left Crosshairs */}
      <div className="absolute bottom-0 left-2.5 -mb-2 w-px h-2 bg-neutral-400" />
      <div className="absolute bottom-2.5 left-0 -ml-2 w-2 h-px bg-neutral-400" />

      {/* Bottom Right Crosshairs */}
      <div className="absolute bottom-0 right-2.5 -mb-2 w-px h-2 bg-neutral-400" />
      <div className="absolute bottom-2.5 right-0 -mr-2 w-2 h-px bg-neutral-400" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-8 text-neutral-100 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-6 pr-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
              HIGH-RESOLUTION PRINT & VECTOR PDF
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            인쇄용 고품질 PDF 출력 및 설정
          </h2>
          <p className="text-xs text-neutral-400">
            인쇄소 상업 인쇄 규격(3mm 재단 여백, 십자 돔보선) 및 사무용 A4 출력을 위한 고해상도 벡터 PDF를 생성합니다.
          </p>
        </div>

        {/* Configuration Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 text-xs">
          {/* 1. Layout Mode */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-300 block">출력 레이아웃 (Layout)</label>
            <select
              value={config.layout}
              onChange={(e) => updateConfig({ layout: e.target.value as PrintLayout })}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-neutral-500 cursor-pointer"
            >
              <option value="single-card">양면 2페이지 (명함 전용 인쇄소용)</option>
              <option value="front-back-duo">한 장 나란히 보기 (1-Sheet Duo / 프레젠테이션용)</option>
              <option value="a4-sheet">A4 다단 배열 (10매 사무실 인쇄용)</option>
            </select>
          </div>

          {/* 2. Paper Size Specification */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-300 block">규격 (Dimensions)</label>
            <select
              value={config.size}
              onChange={(e) => updateConfig({ size: e.target.value as PrintSize })}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-neutral-500 cursor-pointer"
            >
              <option value="kr-standard">한국 표준 규격 (90 × 50 mm)</option>
              <option value="iso-standard">국제 / 유럽 규격 (85 × 55 mm)</option>
            </select>
          </div>

          {/* 3. Paper Tone / Finish */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-300 block">지류 / 테마 피니시 (Color Finish)</label>
            <select
              value={config.theme}
              onChange={(e) => updateConfig({ theme: e.target.value as CardTheme })}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-neutral-500 cursor-pointer"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Options Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 mb-5 text-xs text-neutral-300">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.showCropMarks}
              onChange={(e) => updateConfig({ showCropMarks: e.target.checked })}
              className="rounded bg-neutral-950 border-neutral-700 text-white focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
            />
            <span>3mm 재단 여백(Bleed) 및 십자 돔보선(Crop Marks) 포함</span>
          </label>

          <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
            <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>브라우저 인쇄 창에서 대상: <b>PDF로 저장</b>, <b>배경 그래픽 포함</b>을 체크하세요</span>
          </div>
        </div>

        {/* Visual Print Live Preview Box */}
        <div className="p-4 sm:p-6 bg-neutral-950/90 rounded-2xl border border-neutral-800/80">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-800/70 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>LIVE WYSIWYG PREVIEW</span>
            </div>
            <span>{widthDisplay} · {config.theme.toUpperCase()}</span>
          </div>

          {/* Mode A & B: Side-by-Side Dual Card View (Zero Cut-off Guarantee) */}
          {config.layout !== 'a4-sheet' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center py-2">
              {/* Front Card */}
              <div className="w-full max-w-[420px] flex flex-col items-center">
                <span className="text-[11px] font-medium text-neutral-400 mb-2">앞면 (Front)</span>
                <div className="relative p-2.5 w-full">
                  {config.showCropMarks && <CropMarksPreview />}
                  <div className="w-full rounded-lg shadow-xl overflow-hidden ring-1 ring-white/10">
                    <BusinessCardFront data={data} theme={config.theme} isPrintPreview={true} />
                  </div>
                </div>
              </div>

              {/* Back Card */}
              <div className="w-full max-w-[420px] flex flex-col items-center">
                <span className="text-[11px] font-medium text-neutral-400 mb-2">뒷면 (Back)</span>
                <div className="relative p-2.5 w-full">
                  {config.showCropMarks && <CropMarksPreview />}
                  <div className="w-full rounded-lg shadow-xl overflow-hidden ring-1 ring-white/10">
                    <BusinessCardBack data={data} theme={config.theme} isPrintPreview={true} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Mode C: A4 Sheet 10-Card Multi-Up Grid Preview */
            <div className="flex flex-col items-center justify-center py-2">
              <div className="flex items-center gap-2 mb-3 text-xs text-neutral-400">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>A4 용지 1장에 10매 배열 (2열 × 5행 칼선 가이드 포함)</span>
              </div>

              {/* A4 Sheet Proportion Canvas (210 x 297 ratio) */}
              <div 
                className="relative bg-neutral-900 border border-neutral-700/80 rounded-lg p-3 shadow-2xl max-w-sm w-full mx-auto"
                style={{ aspectRatio: '210 / 297' }}
              >
                <div className="w-full h-full grid grid-cols-2 gap-1.5 border border-dashed border-neutral-600/80 p-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="border border-neutral-700/50 rounded flex flex-col justify-between p-1 bg-neutral-800/40 text-[7px] leading-tight overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-neutral-500 font-mono text-[6px]">
                        <span>#{i + 1}</span>
                        <span>{widthDisplay}</span>
                      </div>
                      <div className="text-center font-bold text-neutral-300 truncate">
                        {data.name}
                      </div>
                      <div className="text-[6px] text-neutral-400 text-center truncate">
                        {data.organization}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-neutral-500 font-sans">
            * 인쇄 시 브라우저 설정에서 <b>‘배경 그래픽 포함’</b> 옵션을 꼭 체크해 주세요.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
            >
              닫기
            </button>
            <button
              onClick={handleExecutePrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 transition-colors text-xs font-bold shadow-lg cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-neutral-950" />
              <span>고품질 인쇄 / PDF 저장</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
