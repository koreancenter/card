import React, { useState, useRef } from 'react';
import { StoredCard, CardTheme, CardLayoutType, CardFeatures } from '../types/card';
import { LAYOUT_PRESETS, LUXURY_THEME_PRESETS } from '../constants/templates';
import { 
  Camera, Upload, Check, X, RefreshCw, Layers, Palette, 
  Sparkles, Sliders, Smartphone, Image as ImageIcon, ArrowRight 
} from 'lucide-react';
import { BusinessCardFront } from './BusinessCardFront';

interface ScanCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCard: (newCard: StoredCard) => void;
}

export const ScanCardModal: React.FC<ScanCardModalProps> = ({
  isOpen,
  onClose,
  onSaveCard
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [step, setStep] = useState<'capture' | 'customize'>('capture');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Card Data
  const [name, setName] = useState('');
  const [nameKr, setNameKr] = useState('');
  const [title, setTitle] = useState('');
  const [titleKr, setTitleKr] = useState('');
  const [organization, setOrganization] = useState('');
  const [organizationKr, setOrganizationKr] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<string>('VIP 파트너');
  const [notes, setNotes] = useState('실물 명함 사진 보관 등록');

  // Curated Semi-Customization
  const [layoutType, setLayoutType] = useState<CardLayoutType>('editorial_minimal');
  const [theme, setTheme] = useState<CardTheme>('sumi_ink');
  const [features, setFeatures] = useState<CardFeatures>({
    show_en_name: true,
    show_sub_org: true,
    show_address: true,
  });

  if (!isOpen) return null;

  // In-browser image compressor for local-first storage efficiency
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          setPhotoPreview(compressed);
          setStep('customize');
        } else {
          setPhotoPreview(e.target?.result as string);
          setStep('customize');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Quick preset template helpers
  const applyQuickTemplate = (type: 'global_partner' | 'executive' | 'investor' | 'tech') => {
    if (type === 'global_partner') {
      setOrganization('Korean Center Global Network');
      setOrganizationKr('한국센터글로벌네트워크');
      setTitle('Director of Global Operations');
      setTitleKr('글로벌 총괄 디렉터');
      setCategory('글로벌 네트워크');
      setLayoutType('editorial_minimal');
      setTheme('sumi_ink');
    } else if (type === 'executive') {
      setOrganization('Heritage Foundation International');
      setOrganizationKr('헤리티지 국제재단');
      setTitle('Senior Vice President');
      setTitleKr('수석부회장');
      setCategory('공공·기관');
      setLayoutType('monogram_executive');
      setTheme('warm_paper');
    } else if (type === 'investor') {
      setOrganization('Aura Capital Partners');
      setOrganizationKr('아우라캐피탈파트너스');
      setTitle('Managing Partner');
      setTitleKr('대표 파트너');
      setCategory('투자·금융');
      setLayoutType('swiss_typo_bold');
      setTheme('deep_forest');
    } else if (type === 'tech') {
      setOrganization('Atelier Nexum Co.');
      setOrganizationKr('(주)아틀리에 넥섬');
      setTitle('Chief Design Architect');
      setTitleKr('수석 디자인 아키텍트');
      setCategory('IT·기술');
      setLayoutType('vertical_atelier');
      setTheme('classic_navy');
    }
  };

  const handleSave = () => {
    const phoneClean = phone.replace(/[^0-9+]/g, '');
    const cleanWebsite = website.replace(/^https?:\/\//, '');

    const newCard: StoredCard = {
      id: `archived-${Date.now()}`,
      isMyCard: false,
      category: category || 'VIP 파트너',
      theme,
      layout_type: layoutType,
      card_features: features,
      createdAt: new Date().toISOString().split('T')[0],
      notes: notes || '실물 명함 사진 보관 등록',
      scannedImage: photoPreview || undefined,
      data: {
        name: name || '성명 미상',
        nameKr: nameKr || name || '성명 미상',
        title: title || '직함 미상',
        titleKr: titleKr || title || '직함 미상',
        organization: organization || '소속 미상',
        organizationKr: organizationKr || organization || '소속 미상',
        phone: phone || '',
        phoneRaw: phoneClean || '',
        whatsappUrl: phoneClean ? `https://wa.me/${phoneClean.replace(/^\+/, '')}` : '',
        email: email || '',
        website: website ? (website.startsWith('http') ? website : `https://${website}`) : '',
        websiteDisplay: cleanWebsite || '',
        addressLines: address ? [address] : [],
        addressKr: address || '',
        googleMapsUrl: address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : '',
        naverMapsUrl: 'https://map.naver.com'
      }
    };

    onSaveCard(newCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0F1015] border border-white/10 text-neutral-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0B0C10]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30">
                <Camera className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {step === 'capture' ? '실물 명함 사진 보관 및 등록' : '명함 정보 입력 & 레이아웃 커스텀'}
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              {step === 'capture' 
                ? '외부 AI나 과금 API 없이, 스마트폰 사진을 고화질 그대로 안전하게 로컬 보관소에 아카이빙합니다.'
                : '보관할 실물 사진을 확인하며 5대 레이아웃과 4대 소재 테마를 즉시 지정합니다.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden inputs */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        <input 
          type="file" 
          ref={cameraInputRef} 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleFileChange} 
        />

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs">
          {step === 'capture' ? (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Camera Snap */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-8 rounded-3xl bg-[#14151C] hover:bg-[#1A1C24] border border-white/10 hover:border-[#C5A880]/50 flex flex-col items-center justify-center space-y-3 transition-all cursor-pointer group active:scale-98 shadow-xl"
                >
                  <div className="p-4 rounded-2xl bg-[#C5A880]/10 text-[#C5A880] group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="font-bold text-sm text-white block">카메라로 실물 촬영</span>
                    <span className="text-[11px] text-neutral-400 block">스마트폰으로 즉시 종이 명함 찍어 보관</span>
                  </div>
                </button>

                {/* Album Photo Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-3xl bg-[#14151C] hover:bg-[#1A1C24] border border-white/10 hover:border-[#C5A880]/50 flex flex-col items-center justify-center space-y-3 transition-all cursor-pointer group active:scale-98 shadow-xl"
                >
                  <div className="p-4 rounded-2xl bg-white/10 text-white group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="font-bold text-sm text-white block">사진 앨범에서 선택</span>
                    <span className="text-[11px] text-neutral-400 block">저장된 명함 사진 파일 불러오기</span>
                  </div>
                </button>
              </div>

              {/* Direct manual button */}
              <div className="pt-6 border-t border-white/5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setStep('customize');
                  }}
                  className="text-xs text-neutral-400 hover:text-[#C5A880] underline underline-offset-4 cursor-pointer transition-colors"
                >
                  사진 첨부 없이 직접 수동 등록하기 →
                </button>
              </div>
            </div>
          ) : (
            /* Customize & Review Step */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form & Semi-Customization (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Photo Archive Thumbnail Bar */}
                {photoPreview ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#14151C] border border-white/10">
                    <img src={photoPreview} alt="스캔된 명함" className="w-16 h-10 object-cover rounded-lg border border-white/10" />
                    <div className="flex-1 text-[11px] text-neutral-300">
                      <span className="font-bold text-white block">실물 명함 사진 보관 완료</span>
                      <span className="text-[10px] text-neutral-400">보관함에서 언제든 원본 사진 열람 가능</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('capture')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-neutral-300 hover:text-white cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>재촬영</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#14151C] border border-dashed border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">실물 사진 없이 디지털 등록 중</span>
                    <button
                      type="button"
                      onClick={() => setStep('capture')}
                      className="text-[11px] text-[#C5A880] hover:underline cursor-pointer"
                    >
                      사진 추가하기
                    </button>
                  </div>
                )}

                {/* Quick Templates */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-400">빠른 템플릿 입력 (선택)</span>
                    <span className="text-[10px] text-[#C5A880]">클릭 시 자동 세팅</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyQuickTemplate('global_partner')}
                      className="p-2 rounded-xl bg-[#14151C] hover:bg-[#1A1C24] border border-white/5 text-[10px] text-left text-neutral-300 hover:text-white cursor-pointer"
                    >
                      글로벌 파트너
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickTemplate('executive')}
                      className="p-2 rounded-xl bg-[#14151C] hover:bg-[#1A1C24] border border-white/5 text-[10px] text-left text-neutral-300 hover:text-white cursor-pointer"
                    >
                      재단 임원
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickTemplate('investor')}
                      className="p-2 rounded-xl bg-[#14151C] hover:bg-[#1A1C24] border border-white/5 text-[10px] text-left text-neutral-300 hover:text-white cursor-pointer"
                    >
                      투자 파트너
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickTemplate('tech')}
                      className="p-2 rounded-xl bg-[#14151C] hover:bg-[#1A1C24] border border-white/5 text-[10px] text-left text-neutral-300 hover:text-white cursor-pointer"
                    >
                      테크 아키텍트
                    </button>
                  </div>
                </div>

                {/* Layout Preset Selector */}
                <div className="space-y-1.5 pt-1 border-t border-white/5">
                  <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>레이아웃 프리셋 선택</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {LAYOUT_PRESETS.map((p) => {
                      const isSelected = layoutType === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setLayoutType(p.id)}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#C5A880] font-bold'
                              : 'bg-[#14151C] border-white/5 text-neutral-300 hover:text-white'
                          }`}
                        >
                          <div className="text-[11px] leading-tight">{p.name}</div>
                          <div className="text-[9px] text-neutral-400 font-mono mt-0.5">{p.aspectRatio}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Material Palette Selector */}
                <div className="space-y-1.5 pt-1 border-t border-white/5">
                  <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>머티리얼 테마 선택</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {LUXURY_THEME_PRESETS.map((t) => {
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id)}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-white/10 border-[#C5A880] text-white font-bold'
                              : 'bg-[#14151C] border-white/5 text-neutral-300 hover:text-white'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 ${t.canvasBg}`} />
                          <span className="text-[11px] truncate">{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contact Input Fields */}
                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">성명 (영문/공식) *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Michael Harrison"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">성명 (국문)</label>
                      <input
                        type="text"
                        value={nameKr}
                        onChange={(e) => setNameKr(e.target.value)}
                        placeholder="e.g. 마이클 해리슨"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">소속 회사/기관명</label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. Global Heritage Foundation"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">소속 기관 (국문)</label>
                      <input
                        type="text"
                        value={organizationKr}
                        onChange={(e) => setOrganizationKr(e.target.value)}
                        placeholder="e.g. 글로벌헤리티지재단"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">직책/직함</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Managing Director"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">직책 (국문)</label>
                      <input
                        type="text"
                        value={titleKr}
                        onChange={(e) => setTitleKr(e.target.value)}
                        placeholder="e.g. 전무이사"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">전화번호</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+82 10-1234-5678"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">이메일</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@domain.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">카테고리</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs cursor-pointer"
                      >
                        <option value="VIP 파트너">VIP 파트너</option>
                        <option value="글로벌 네트워크">글로벌 네트워크</option>
                        <option value="공공·기관">공공·기관</option>
                        <option value="투자·금융">투자·금융</option>
                        <option value="IT·기술">IT·기술</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">웹사이트</label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400">사업장 주소</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 서울특별시 강남구 테헤란로 123"
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs"
                    />
                  </div>
                </div>

              </div>

              {/* Right Column: Live Tactile Preview & Dual Comparison (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-between p-4 rounded-3xl bg-[#0B0C10] border border-white/10">
                <div className="w-full text-center space-y-1 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A880]">
                    실시간 생성 프리뷰
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    등록 즉시 로컬 보관소와 에지 동기화에 저장됩니다.
                  </p>
                </div>

                <div className={`w-full ${layoutType === 'vertical_atelier' ? 'max-w-[220px]' : 'max-w-[320px]'} shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/15 my-auto transition-all duration-300`}>
                  <BusinessCardFront 
                    data={{
                      name: name || '성명 미상',
                      nameKr: nameKr || name || '성명 미상',
                      title: title || '직함 미상',
                      titleKr: titleKr || title || '직함 미상',
                      organization: organization || '소속 미상',
                      organizationKr: organizationKr || organization || '소속 미상',
                      phone,
                      phoneRaw: phone.replace(/[^0-9+]/g, ''),
                      whatsappUrl: '',
                      email,
                      website: website || 'https://card.goguma.app',
                      websiteDisplay: website ? website.replace(/^https?:\/\//, '') : 'card.goguma.app',
                      addressLines: address ? [address] : [],
                      addressKr: address,
                      googleMapsUrl: '',
                      naverMapsUrl: ''
                    }} 
                    theme={theme}
                    layout_type={layoutType}
                    card_features={features}
                    isPrintPreview={false} 
                  />
                </div>

                {photoPreview && (
                  <div className="w-full mt-3 p-2 rounded-xl bg-[#14151C] border border-white/10 flex items-center gap-2">
                    <img src={photoPreview} alt="스캔된 실물" className="w-10 h-7 object-cover rounded" />
                    <div className="text-[10px] text-neutral-400 truncate">
                      <span className="text-white block font-medium">실물 아카이브 연동</span>
                      <span>보관함에서 1-클릭 비교 가능</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {step === 'customize' && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0B0C10] flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setStep('capture')}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              다시 촬영/선택
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#d6b991] text-black font-bold text-xs transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>보관함에 저장하기</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
