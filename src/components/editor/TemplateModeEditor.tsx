import React, { useRef } from 'react';
import { CardTheme, CardLayoutType, CardFeatures, CardData, CardCategory } from '../../types/card';
import { LAYOUT_PRESETS } from '../../constants/templates';
import { Palette, User, Upload, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { THEME_OPTIONS } from '../CardEditorModal';
import { APP_BASE_DOMAIN } from '../../utils/domain';

interface TemplateModeEditorProps {
  theme: CardTheme;
  layoutType: CardLayoutType;
  onChangeTheme: (theme: CardTheme) => void;
  onChangeLayout: (layout: CardLayoutType) => void;
  formData: CardData;
  onChangeFormField: (field: keyof CardData, value: string) => void;
  features: CardFeatures;
  onChangeFeatures: React.Dispatch<React.SetStateAction<CardFeatures>>;
  slug: string;
  onChangeSlug: (slug: string) => void;
  customDomain: string;
  onChangeCustomDomain: (dom: string) => void;
  category: string;
  onChangeCategory: (cat: string) => void;
  isDefault: boolean;
  onChangeIsDefault: (isDef: boolean) => void;
  isMyCardMode: boolean;
  subTab: 'visual_atelier' | 'identity_profile';
  onChangeSubTab: (tab: 'visual_atelier' | 'identity_profile') => void;
}

export const TemplateModeEditor: React.FC<TemplateModeEditorProps> = ({
  theme,
  layoutType,
  onChangeTheme,
  onChangeLayout,
  formData,
  onChangeFormField,
  features,
  onChangeFeatures,
  slug,
  onChangeSlug,
  customDomain,
  onChangeCustomDomain,
  category,
  onChangeCategory,
  isDefault,
  onChangeIsDefault,
  isMyCardMode,
  subTab,
  onChangeSubTab
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onChangeFeatures(prev => ({ ...prev, custom_logo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const renderLayoutMiniWireframe = (id: CardLayoutType, isSelected: boolean) => {
    const strokeClass = isSelected ? 'bg-[#C5A880]' : 'bg-neutral-600';
    const subClass = isSelected ? 'bg-[#C5A880]/60' : 'bg-neutral-700';

    if (id === 'editorial_minimal') {
      return (
        <div className="w-full aspect-[9/5] p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className={`w-12 h-1 rounded ${subClass}`} />
            <div className={`w-20 h-1.5 rounded ${strokeClass}`} />
          </div>
          <div className="space-y-1 my-auto">
            <div className={`w-16 h-2 rounded ${strokeClass}`} />
            <div className={`w-10 h-1 rounded ${subClass}`} />
          </div>
          <div className="flex justify-between items-end pt-1 border-t border-white/5">
            <div className={`w-12 h-1 rounded ${subClass}`} />
            <div className={`w-8 h-1 rounded ${subClass}`} />
          </div>
        </div>
      );
    }

    if (id === 'monogram_executive') {
      return (
        <div className="w-full aspect-[9/5] p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between items-center text-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-4 h-4 rounded-full border border-dashed flex items-center justify-center ${isSelected ? 'border-[#C5A880]' : 'border-neutral-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${strokeClass}`} />
            </div>
            <div className={`w-14 h-1 rounded ${subClass}`} />
          </div>
          <div className="space-y-1 my-auto">
            <div className={`w-16 h-2 rounded ${strokeClass}`} />
            <div className={`w-12 h-1 rounded ${subClass}`} />
          </div>
          <div className={`w-24 h-1 rounded ${subClass}`} />
        </div>
      );
    }

    if (id === 'vertical_atelier') {
      return (
        <div className="w-full aspect-[5/8] p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between items-center text-center">
          <div className="space-y-1 w-full flex flex-col items-center">
            <div className={`w-10 h-1 rounded ${subClass}`} />
            <div className={`w-12 h-1.5 rounded ${strokeClass}`} />
          </div>
          <div className="space-y-1.5 my-auto w-full flex flex-col items-center">
            <div className={`w-14 h-2 rounded ${strokeClass}`} />
            <div className={`w-8 h-1 rounded ${subClass}`} />
          </div>
          <div className="space-y-1 w-full pt-1 border-t border-white/5 flex flex-col items-center">
            <div className={`w-12 h-1 rounded ${subClass}`} />
            <div className={`w-10 h-1 rounded ${subClass}`} />
          </div>
        </div>
      );
    }

    if (id === 'swiss_typo_bold') {
      return (
        <div className="w-full aspect-[9/5] p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between">
          <div className={`w-24 h-1.5 rounded font-black ${strokeClass}`} />
          <div className="space-y-1 my-auto">
            <div className={`w-20 h-2.5 rounded ${strokeClass}`} />
            <div className="flex items-center gap-1">
              <div className={`w-2 h-1 rounded ${strokeClass}`} />
              <div className={`w-12 h-1 rounded ${subClass}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/5">
            <div className={`w-10 h-1 rounded ${subClass}`} />
            <div className={`w-8 h-1 rounded ${subClass}`} />
          </div>
        </div>
      );
    }

    // warm_organic
    return (
      <div className="w-full aspect-[9/5] p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className={`w-14 h-1 rounded ${subClass}`} />
          <div className={`w-2 h-2 rounded-full ${strokeClass}`} />
        </div>
        <div className="space-y-1 my-auto">
          <div className={`w-16 h-1.5 rounded ${strokeClass}`} />
          <div className={`w-10 h-1 rounded ${subClass}`} />
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-white/5">
          <div className={`w-10 h-1 rounded ${subClass}`} />
          <div className={`w-6 h-1 rounded ${subClass}`} />
        </div>
      </div>
    );
  };

  const categories: CardCategory[] = [
    'VIP 파트너',
    '글로벌 네트워크',
    '공공·기관',
    '투자·금융',
    'IT·기술',
    '기타'
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation: Visual Atelier vs Identity Profile */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
        <button
          type="button"
          onClick={() => onChangeSubTab('visual_atelier')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
            subTab === 'visual_atelier'
              ? 'bg-[#C5A880] text-black font-bold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>소재 & 레이아웃</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeSubTab('identity_profile')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
            subTab === 'identity_profile'
              ? 'bg-[#C5A880] text-black font-bold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>인적사항 & 활자</span>
        </button>
      </div>

      {/* SUB-TAB 1: Visual Atelier */}
      {subTab === 'visual_atelier' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Theme Palette */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-[#C5A880] font-mono">01.</span>
                <span>소재 & 테마 팔레트 (Refined Presets)</span>
              </label>
              <p className="text-[11px] text-neutral-400">
                수묵 인크, 웜 페이퍼, 딥 포레스트, 클래식 네이비 등 엄선된 촉감 질감 팔레트입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {THEME_OPTIONS.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChangeTheme(t.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 group ${
                      isSelected
                        ? 'bg-white/10 border-[#C5A880] ring-1 ring-[#C5A880]/50 shadow-md'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div 
                      className="relative w-9 h-9 rounded-full border border-white/20 shrink-0 shadow-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105"
                      style={{ backgroundColor: t.dotColor }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full shadow-md border border-black/20"
                        style={{ backgroundColor: t.accent }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 ring-2 ring-[#C5A880] ring-offset-2 ring-offset-[#0F1015] rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs truncate ${isSelected ? 'text-[#C5A880]' : 'text-white'}`}>
                          {t.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />}
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {t.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Architecture Layouts */}
          <div className="border-t border-white/[0.06] pt-5 space-y-3">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-[#C5A880] font-mono">02.</span>
                <span>아키텍처 레이아웃</span>
              </label>
              <p className="text-[11px] text-neutral-400">
                골드비 그리드와 직함 성격에 맞는 레이아웃을 선택합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {LAYOUT_PRESETS.map((preset) => {
                const isSelected = layoutType === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChangeLayout(preset.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-[#C5A880]/15 border-[#C5A880] shadow-md ring-1 ring-[#C5A880]/40'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="mb-3 w-full">
                      {renderLayoutMiniWireframe(preset.id, isSelected)}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className={`font-bold text-xs truncate ${isSelected ? 'text-[#C5A880]' : 'text-white'}`}>
                          {preset.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#C5A880] shrink-0 font-medium">
                          {preset.aspectRatio}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Identity Profile */}
      {subTab === 'identity_profile' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 1. Affiliation */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-[#C5A880] font-mono">01.</span>
              <span>소속 및 직함</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">소속 기관명 (국문)</label>
                <input
                  type="text"
                  value={formData.organizationKr}
                  onChange={(e) => onChangeFormField('organizationKr', e.target.value)}
                  placeholder="예: 고구마 AI 스튜디오"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">소속 기관명 (영문)</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => onChangeFormField('organization', e.target.value)}
                  placeholder="예: GOGUMA AI STUDIO"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">직책 / 역할 (국문)</label>
                <input
                  type="text"
                  value={formData.titleKr}
                  onChange={(e) => onChangeFormField('titleKr', e.target.value)}
                  placeholder="예: 대표 마스터"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">직책 / 역할 (영문)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => onChangeFormField('title', e.target.value)}
                  placeholder="예: Principal Master"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Name */}
          <div className="border-t border-white/[0.06] pt-5 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-[#C5A880] font-mono">02.</span>
              <span>성명 표기 및 상세 옵션</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">주 성명 (Primary Name)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => onChangeFormField('name', e.target.value)}
                  placeholder="예: PARK, GIHONG"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">보조 국문 성명 (Sub Name)</label>
                <input
                  type="text"
                  value={formData.nameKr}
                  onChange={(e) => onChangeFormField('nameKr', e.target.value)}
                  placeholder="예: 박 기 홍"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.show_en_name !== false}
                  onChange={(e) => onChangeFeatures(prev => ({ ...prev, show_en_name: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#C5A880] cursor-pointer"
                />
                <span className="text-[11px] text-neutral-300">영문/보조 성명 서브텍스트 표기</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.show_sub_org !== false}
                  onChange={(e) => onChangeFeatures(prev => ({ ...prev, show_sub_org: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#C5A880] cursor-pointer"
                />
                <span className="text-[11px] text-neutral-300">소속 기관 보조 표기 유지</span>
              </label>
            </div>
          </div>

          {/* 3. Direct Contact */}
          <div className="border-t border-white/[0.06] pt-5 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-[#C5A880] font-mono">03.</span>
              <span>직통 연락 채널</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">전화번호</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => onChangeFormField('phone', e.target.value)}
                  placeholder="+82 10-1234-5678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">공식 이메일</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onChangeFormField('email', e.target.value)}
                  placeholder="master@goguma.app"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">사업장 주소 (국문)</label>
                <input
                  type="text"
                  value={formData.addressKr}
                  onChange={(e) => onChangeFormField('addressKr', e.target.value)}
                  placeholder="서울특별시 강남구 테헤란로 152"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">사업장 주소 (영문, Address EN)</label>
                <input
                  type="text"
                  value={formData.address_en ?? formData.details?.address_en ?? ''}
                  onChange={(e) => onChangeFormField('address_en', e.target.value)}
                  placeholder="예: 77 Cheongdam-ro, Gangnam-gu, Seoul"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* 4. Monogram & Logo */}
          <div className="border-t border-white/[0.06] pt-5 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-[#C5A880] font-mono">04.</span>
              <span>모노그램 및 커스텀 로고</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">텍스트 모노그램 (2~4자)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={features.monogram_text || ''}
                  onChange={(e) => onChangeFeatures(prev => ({ ...prev, monogram_text: e.target.value.toUpperCase() }))}
                  placeholder="예: PG"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs font-mono uppercase tracking-widest"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">커스텀 기업/개인 로고</label>
                <input 
                  type="file" 
                  ref={logoInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload} 
                />
                {features.custom_logo ? (
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/10">
                    <img src={features.custom_logo} alt="Logo" className="h-6 w-auto max-w-[80px] object-contain rounded" />
                    <button
                      type="button"
                      onClick={() => onChangeFeatures(prev => ({ ...prev, custom_logo: undefined }))}
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      title="로고 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-dashed border-white/15 hover:border-[#C5A880] text-neutral-400 hover:text-white cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>로고 이미지 첨부</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 5. Domain & Category */}
          <div className="border-t border-white/[0.06] pt-5 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-[#C5A880] font-mono">05.</span>
              <span>웹 주소 슬러그 및 보관 정보</span>
            </label>
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400">전용 웹 주소 슬러그</label>
              <div className="flex rounded-xl bg-white/[0.02] border border-white/10 focus-within:border-[#C5A880] overflow-hidden text-xs">
                <span className="px-3 py-2.5 bg-neutral-800/60 text-neutral-400 font-mono select-none text-[11px] shrink-0 border-r border-white/10">
                  {APP_BASE_DOMAIN}/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => onChangeSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="master"
                  className="w-full px-3 py-2.5 bg-transparent text-[#C5A880] focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">독립 커스텀 도메인 (선택)</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => onChangeCustomDomain(e.target.value)}
                  placeholder="card.yourdomain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] text-white text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">분류 카테고리</label>
                <select
                  value={category}
                  onChange={(e) => onChangeCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] text-white text-xs cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {isMyCardMode && (
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => onChangeIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#C5A880] cursor-pointer"
                />
                <span className="text-[11px] text-neutral-300">기본 대표 명함으로 지정 (앱 접속 시 우선 노출)</span>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
