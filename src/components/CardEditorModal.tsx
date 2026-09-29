import React, { useState, useEffect } from 'react';
import { StoredCard, CardTheme, CardData } from '../types/card';
import { X, Check, Edit3, Plus, Globe, Sparkles, Star, HelpCircle, Link as LinkIcon } from 'lucide-react';
import { BusinessCardFront } from './BusinessCardFront';
import { APP_BASE_DOMAIN, normalizeDomain } from '../utils/domain';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: StoredCard;
  onSave: (updatedCard: StoredCard) => void;
  isMyCardMode?: boolean;
  isCreating?: boolean;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  card,
  onSave,
  isMyCardMode = false,
  isCreating = false
}) => {
  const [formData, setFormData] = useState<CardData>({ ...card.data });
  const [theme, setTheme] = useState<CardTheme>(card.theme || 'sand');
  const [category, setCategory] = useState<string>(card.category || '글로벌 네트워크');
  const [notes, setNotes] = useState<string>(card.notes || '');
  const [slug, setSlug] = useState<string>(card.slug || '');
  const [customDomain, setCustomDomain] = useState<string>(card.customDomain || '');
  const [isDefault, setIsDefault] = useState<boolean>(Boolean(card.isDefault));
  const [showDnsHelp, setShowDnsHelp] = useState<boolean>(false);

  // Sync state whenever card or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...card.data });
      setTheme(card.theme || 'sand');
      setCategory(card.category || (isMyCardMode ? '글로벌 네트워크' : 'VIP 파트너'));
      setNotes(card.notes || '');
      setSlug(card.slug || (card.id.startsWith('my-card') ? 'mrpark' : ''));
      setCustomDomain(card.customDomain || '');
      setIsDefault(Boolean(card.isDefault));
    }
  }, [card, isOpen, isMyCardMode]);

  if (!isOpen) return null;

  const handleChange = (field: keyof CardData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'phone' ? { phoneRaw: value.replace(/[^0-9+]/g, '') } : {}),
      ...(field === 'website' ? { websiteDisplay: value.replace(/^https?:\/\//, '') } : {})
    }));
  };

  // Compute canonical URL preview
  const cleanCustomDomain = customDomain ? normalizeDomain(customDomain) : '';
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || 'card';
  const effectiveUrl = cleanCustomDomain 
    ? `https://${cleanCustomDomain}` 
    : `https://${APP_BASE_DOMAIN}/${cleanSlug}`;
  const effectiveDisplayUrl = cleanCustomDomain || `${APP_BASE_DOMAIN}/${cleanSlug}`;

  const handleSave = () => {
    const finalData: CardData = {
      ...formData,
      website: effectiveUrl,
      websiteDisplay: effectiveDisplayUrl
    };

    const updated: StoredCard = {
      ...card,
      data: finalData,
      theme,
      category,
      notes,
      slug: cleanSlug,
      customDomain: cleanCustomDomain || undefined,
      isDefault: isMyCardMode ? isDefault : false,
      isMyCard: isMyCardMode || card.isMyCard
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg border ${
                isCreating 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-white/10 text-white border-white/10'
              }`}>
                {isCreating ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isCreating 
                  ? '새로운 내 명함 만들기' 
                  : isMyCardMode 
                    ? '내 디지털 명함 정보 및 도메인 설정' 
                    : '명함 정보 상세 편집'}
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              {isCreating 
                ? '새로운 소속·직함 및 card.goguma.app 전용 주소를 생성합니다.'
                : '입력된 주소는 3D 카드, 실시간 QR코드, 스마트폰 연락처(vCard)에 즉시 자동 반영됩니다.'}
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Form */}
          <div className="space-y-4">

            {/* DOMAIN SETTINGS BOX (Requirements 1 & 2) */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
                  <Globe className="w-3.5 h-3.5" />
                  <span>도메인 및 접속 주소 설정</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDnsHelp(!showDnsHelp)}
                  className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-200 transition-colors cursor-pointer font-mono"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>CNAME 연결 안내</span>
                </button>
              </div>

              {/* 1. Base URL: card.goguma.app/[slug] */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>1. 기본 제공 주소 (card.goguma.app/사용자별 주소)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">즉시 사용 가능</span>
                </label>
                <div className="flex rounded-xl bg-neutral-900 border border-neutral-700/80 focus-within:border-amber-400 overflow-hidden text-xs">
                  <span className="px-2.5 py-2 bg-neutral-800/80 text-neutral-400 font-mono select-none text-[11px] shrink-0 border-r border-neutral-700/60">
                    {APP_BASE_DOMAIN}/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="mrpark"
                    className="w-full px-2.5 py-2 bg-transparent text-amber-200 focus:outline-none font-mono text-xs"
                  />
                </div>
                <p className="text-[10px] text-neutral-400">
                  누구나 <span className="text-neutral-300 font-mono">{APP_BASE_DOMAIN}/{cleanSlug}</span> 로 접속하여 이 명함을 열람할 수 있습니다.
                </p>
              </div>

              {/* 2. Custom Domain: Personally Owned Domain */}
              <div className="space-y-1 pt-1 border-t border-neutral-800/80">
                <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                  <span>2. 개인 보유 도메인 연결 (선택 사항)</span>
                  <span className="text-[10px] text-neutral-400 font-mono">Custom Domain</span>
                </label>
                <div className="flex rounded-xl bg-neutral-900 border border-neutral-700/80 focus-within:border-amber-400 overflow-hidden text-xs">
                  <span className="px-2.5 py-2 bg-neutral-800/80 text-neutral-400 font-mono select-none text-[11px] shrink-0 border-r border-neutral-700/60">
                    https://
                  </span>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="mrpark.indonesiacenter.net"
                    className="w-full px-2.5 py-2 bg-transparent text-amber-200 focus:outline-none font-mono text-xs"
                  />
                </div>
                <p className="text-[10px] text-neutral-400">
                  개인 도메인 입력 시 QR코드와 연락처에 해당 도메인이 우선 적용됩니다.
                </p>
              </div>

              {/* DNS Help Collapsible Box */}
              {showDnsHelp && (
                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 space-y-1.5 animate-in fade-in duration-150">
                  <p className="font-semibold text-white text-[11px]">개인 도메인 DNS 연결 방법 (Cloudflare / 네임서버)</p>
                  <p className="text-[10px] text-neutral-400 leading-relaxed">
                    도메인 관리 사이트(Cloudflare 등)에서 아래와 같이 <strong className="text-neutral-200">CNAME 레코드</strong>를 추가해 주시면 별도 서버 없이 자동 연결됩니다:
                  </p>
                  <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-emerald-300 space-y-0.5">
                    <div>유형: <span className="text-white">CNAME</span></div>
                    <div>이름(호스트): <span className="text-white">{customDomain ? customDomain.split('.')[0] : 'mrpark'}</span></div>
                    <div>대상(값): <span className="text-white">card.goguma.app</span> (프록시 켬)</div>
                  </div>
                </div>
              )}

              {/* Default Card Checkbox */}
              {isMyCardMode && (
                <div className="pt-1 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] text-neutral-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="rounded border-neutral-700 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <span>기본 대표 명함으로 지정 (앱 접속 시 우선 노출)</span>
                  </label>
                </div>
              )}
            </div>
            
            {/* Primary Details */}
            <div className="space-y-2.5">
              <h4 className="font-semibold text-neutral-300 text-xs uppercase tracking-wider">소속 및 직함</h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">소속 기관 (국문)</label>
                  <input
                    type="text"
                    value={formData.organizationKr}
                    onChange={(e) => handleChange('organizationKr', e.target.value)}
                    placeholder="한국센터글로벌네트워크"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">소속 기관 (영문)</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => handleChange('organization', e.target.value)}
                    placeholder="Korean Center Global Network"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">직책/직함 (국문)</label>
                  <input
                    type="text"
                    value={formData.titleKr}
                    onChange={(e) => handleChange('titleKr', e.target.value)}
                    placeholder="대표이사 / 이사장"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">직책/직함 (영문)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="President Director"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Person & Contact Info */}
            <div className="space-y-2.5">
              <h4 className="font-semibold text-neutral-300 text-xs uppercase tracking-wider">인명 및 연락처</h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">성명 (영문/공식)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">성명 (국문)</label>
                  <input
                    type="text"
                    value={formData.nameKr}
                    onChange={(e) => handleChange('nameKr', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">전화번호</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">이메일</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">사업장 주소 (국문)</label>
                <input
                  type="text"
                  value={formData.addressKr}
                  onChange={(e) => handleChange('addressKr', e.target.value)}
                  placeholder="사업장 주소"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                />
              </div>
            </div>

            {/* Theme & Category */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">디지털 명함 재질 테마</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as CardTheme)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs cursor-pointer"
                >
                  <option value="sand">샌드 캐시미어 (소프트 아이보리)</option>
                  <option value="emerald">포레스트 에메랄드 그린</option>
                  <option value="navy">미드나잇 네이비</option>
                  <option value="obsidian">옵시디언 블랙</option>
                  <option value="cotton">코튼 화이트</option>
                  <option value="burgundy">임페리얼 버건디</option>
                  <option value="titanium">티타늄 그레이</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">구분 카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs cursor-pointer"
                >
                  <option value="글로벌 네트워크">글로벌 네트워크</option>
                  <option value="VIP 파트너">VIP 파트너</option>
                  <option value="공공·기관">공공·기관</option>
                  <option value="투자·금융">투자·금융</option>
                  <option value="IT·기술">IT·기술</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

          </div>

          {/* Right Live Preview */}
          <div className="flex flex-col items-center justify-between p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div className="w-full text-center space-y-1 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                실시간 디자인 프리뷰
              </span>
              <p className="text-[11px] text-neutral-400">
                입력된 도메인과 정보로 실시간 시뮬레이션됩니다.
              </p>
            </div>

            <div className="w-full max-w-[280px] shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/10 my-auto">
              <BusinessCardFront data={{ ...formData, website: effectiveUrl, websiteDisplay: effectiveDisplayUrl }} theme={theme} isPrintPreview={false} />
            </div>

            <div className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300 text-center mt-3 space-y-1">
              <div className="flex items-center justify-center gap-1 text-amber-300">
                <LinkIcon className="w-3 h-3" />
                <span className="font-semibold">{effectiveDisplayUrl}</span>
              </div>
              <p className="text-[9px] text-neutral-400 font-sans">
                {cleanCustomDomain ? '개인 도메인 연결 모드' : 'card.goguma.app 공용 주소 모드'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-colors cursor-pointer shadow-lg active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{isCreating ? '새 명함 등록 완료' : '수정 사항 저장'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
