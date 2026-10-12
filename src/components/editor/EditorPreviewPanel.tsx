import React from 'react';
import { CardCreationMode, CardLayoutType, CardTheme, CardFeatures, CardData } from '../../types/card';
import { BusinessCardFront } from '../BusinessCardFront';
import { BusinessCardBack } from '../BusinessCardBack';
import { SandboxedCardRenderer } from '../SandboxedCardRenderer';
import { Camera, Code2 } from 'lucide-react';

interface EditorPreviewPanelProps {
  creationMode: CardCreationMode;
  layoutType: CardLayoutType;
  theme: CardTheme;
  features: CardFeatures;
  formData: CardData;
  effectiveUrl: string;
  effectiveDisplayUrl: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  htmlFront: string;
  htmlBack: string;
  previewFace: 'front' | 'back';
  onFlipPreviewFace: () => void;
}

/**
 * EditorPreviewPanel
 * Cleanly encapsulated gallery exhibition panel for live card preview in CardEditorModal.
 * Supports Template Mode, Photo Archive Mode, and Sandboxed Custom HTML Mode with 3D flip card animations.
 */
export const EditorPreviewPanel: React.FC<EditorPreviewPanelProps> = ({
  creationMode,
  layoutType,
  theme,
  features,
  formData,
  effectiveUrl,
  effectiveDisplayUrl,
  frontImageUrl,
  backImageUrl,
  htmlFront,
  htmlBack,
  previewFace,
  onFlipPreviewFace,
}) => {
  const cardDataForPreview: CardData = {
    ...formData,
    address_en: formData.address_en ?? formData.details?.address_en,
    website: effectiveUrl,
    websiteDisplay: effectiveDisplayUrl,
  };

  const isVerticalAtelier = layoutType === 'vertical_atelier' && creationMode === 'template';

  return (
    <div className="order-1 lg:order-2 col-span-12 lg:col-span-7 h-auto lg:h-full flex items-center justify-center bg-black/40 border-b lg:border-b-0 lg:border-l border-white/5 p-6 sm:p-10 lg:p-12 relative overflow-hidden select-none">
      {/* Pure Ambient Atmosphere Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent" />

      {/* Prominently Centered Luxury Card Object Floating on Sumi Ink Canvas */}
      <div 
        className={`${
          isVerticalAtelier
            ? 'w-full max-w-[280px] sm:max-w-[320px] aspect-[5/8]' 
            : 'w-full max-w-[500px] aspect-[1.586/1]'
        } transition-all duration-300 relative [perspective:1200px] cursor-pointer group`}
        onClick={onFlipPreviewFace}
        title="클릭하여 앞/뒷면 회전 (Click to flip)"
      >
        <div 
          className={`w-full h-full relative rounded-2xl transition-transform duration-500 ease-out [transform-style:preserve-3d] group-hover:scale-[1.015] shadow-[0_28px_65px_-15px_rgba(0,0,0,0.9),0_15px_30px_-8px_rgba(0,0,0,0.6),0_45px_95px_-20px_rgba(0,0,0,0.98)] ${
            previewFace === 'back' ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
          }`}
        >
          {/* ================= FRONT FACE ================= */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl overflow-hidden bg-[#0A0B0E]">
            {creationMode === 'template' && (
              <BusinessCardFront 
                data={cardDataForPreview} 
                theme={theme}
                layout_type={layoutType}
                card_features={features}
                isPrintPreview={false} 
                hideBorder={true}
              />
            )}

            {creationMode === 'photo' && (
              frontImageUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={frontImageUrl}
                    alt={formData.name || '실물 명함 사진 앞면'}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#C5A880] tracking-wider uppercase shadow-sm">
                      PHOTO ARCHIVE
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400 bg-neutral-900/60">
                  <Camera className="w-8 h-8 text-[#C5A880]/60 mb-2" />
                  <p className="text-xs font-semibold text-white">등록된 명함 사진이 없습니다</p>
                  <p className="text-[10px] text-neutral-500 mt-1">좌측 패널에서 사진을 업로드해 주세요</p>
                </div>
              )
            )}

            {creationMode === 'custom_html' && (
              htmlFront ? (
                <div className="w-full h-full overflow-hidden rounded-2xl">
                  <SandboxedCardRenderer
                    html={htmlFront}
                    isPortrait={isVerticalAtelier}
                    isPrintPreview={false}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400 bg-neutral-900/60">
                  <Code2 className="w-8 h-8 text-[#C5A880]/60 mb-2" />
                  <p className="text-xs font-semibold text-white">HTML 코드가 비어 있습니다</p>
                  <p className="text-[10px] text-neutral-500 mt-1">좌측 에디터에 Tailwind HTML 코드를 입력하세요</p>
                </div>
              )
            )}
          </div>

          {/* ================= BACK FACE ================= */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden bg-[#0A0B0E]">
            {creationMode === 'template' && (
              <BusinessCardBack 
                data={cardDataForPreview} 
                theme={theme}
                layout_type={layoutType}
                isPrintPreview={false} 
                hideBorder={true}
              />
            )}

            {creationMode === 'photo' && (
              backImageUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={backImageUrl}
                    alt="실물 명함 사진 뒷면"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#C5A880] tracking-wider uppercase shadow-sm">
                      BACK PHOTO
                    </span>
                  </div>
                </div>
              ) : (
                <BusinessCardBack 
                  data={cardDataForPreview} 
                  theme={theme}
                  layout_type={layoutType}
                  isPrintPreview={false} 
                  hideBorder={true}
                />
              )
            )}

            {creationMode === 'custom_html' && (
              htmlBack ? (
                <div className="w-full h-full overflow-hidden rounded-2xl">
                  <SandboxedCardRenderer
                    html={htmlBack}
                    isPortrait={isVerticalAtelier}
                    isPrintPreview={false}
                  />
                </div>
              ) : (
                <BusinessCardBack 
                  data={cardDataForPreview} 
                  theme={theme}
                  layout_type={layoutType}
                  isPrintPreview={false} 
                  hideBorder={true}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
