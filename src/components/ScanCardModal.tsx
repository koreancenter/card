import React, { useState, useRef } from 'react';
import { StoredCard, CardTheme } from '../types/card';
import { Camera, Upload, Sparkles, Check, X, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<'upload' | 'review'>('upload');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Parsed Form Fields for Review
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
  const [theme, setTheme] = useState<CardTheme>('obsidian');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      triggerOcrScan(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const triggerOcrScan = async (base64Image: string, mimeType: string) => {
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/scan-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: mimeType || 'image/jpeg'
        })
      });

      const result = await response.json();

      if (response.ok && result.success && result.card) {
        const c = result.card;
        setName(c.name || '');
        setNameKr(c.nameKr || c.name || '');
        setTitle(c.title || '');
        setTitleKr(c.titleKr || c.title || '');
        setOrganization(c.organization || '');
        setOrganizationKr(c.organizationKr || c.organization || '');
        setPhone(c.phone || '');
        setEmail(c.email || '');
        setWebsite(c.website || (c.websiteDisplay ? `https://${c.websiteDisplay}` : ''));
        setAddress(c.address || '');
        if (c.category) setCategory(c.category);
        if (c.themeRecommendation) setTheme(c.themeRecommendation);
        setNotes('모바일 사진 OCR 자동 스캔 등록');
        setScanStep('review');
      } else {
        // Fallback for manual review if AI key is missing or parse issue
        console.warn('Scan notice:', result.message || result.error);
        setErrorMessage(result.message || '사진 분석 결과를 검토 후 필요한 내용을 확인해 주세요.');
        // Prefill template so user can proceed
        setName('신규 등록 명함');
        setTitle('임원 / Director');
        setOrganization('비즈니스 파트너');
        setScanStep('review');
      }
    } catch (err) {
      console.error('OCR Request Error:', err);
      setErrorMessage('OCR 분석 중 문제가 발생하여 수동 입력 모드로 전환되었습니다.');
      setName('신규 등록 명함');
      setOrganization('비즈니스 파트너');
      setScanStep('review');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = () => {
    const phoneClean = phone.replace(/[^0-9+]/g, '');
    const cleanWebsite = website.replace(/^https?:\/\//, '');

    const newCard: StoredCard = {
      id: `scanned-${Date.now()}`,
      isMyCard: false,
      category: category || '일반',
      theme: theme || 'obsidian',
      createdAt: new Date().toISOString().split('T')[0],
      notes: notes || '사진 촬영 등록',
      scannedImage: imagePreview || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Camera className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {scanStep === 'upload' ? '사진으로 명함 자동 등록' : '스캔 정보 확인 및 보관'}
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              {scanStep === 'upload' 
                ? '종이 명함을 촬영하거나 앨범에서 선택하면 AI가 연락처를 자동 인식합니다.'
                : '인식된 정보가 정확한지 확인 후 보관함에 저장하세요.'}
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
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {scanStep === 'upload' ? (
            <div className="space-y-6">
              {isScanning ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                    <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">명함 분석 및 디지털화 진행 중...</p>
                    <p className="text-xs text-neutral-400">Gemini Vision AI가 성명, 소속, 직함, 연락처를 정밀 추출하고 있습니다.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Camera Snap */}
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-8 rounded-2xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 flex flex-col items-center justify-center space-y-3 transition-all cursor-pointer group active:scale-98"
                  >
                    <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="text-center space-y-1">
                      <span className="font-bold text-sm text-white block">카메라로 실물 촬영</span>
                      <span className="text-[11px] text-neutral-400 block">스마트폰으로 즉시 종이 명함 찍기</span>
                    </div>
                  </button>

                  {/* Album Photo Upload */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 rounded-2xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 flex flex-col items-center justify-center space-y-3 transition-all cursor-pointer group active:scale-98"
                  >
                    <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div className="text-center space-y-1">
                      <span className="font-bold text-sm text-white block">사진 앨범에서 선택</span>
                      <span className="text-[11px] text-neutral-400 block">저장된 명함 사진 파일 불러오기</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Direct manual button */}
              <div className="pt-4 border-t border-neutral-800 text-center">
                <button
                  onClick={() => {
                    setName('');
                    setOrganization('');
                    setScanStep('review');
                  }}
                  className="text-xs text-neutral-400 hover:text-neutral-200 underline underline-offset-4 cursor-pointer"
                >
                  사진 없이 직접 수동으로 입력하기 →
                </button>
              </div>
            </div>
          ) : (
            /* Review & Edit Step */
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {imagePreview && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <img src={imagePreview} alt="스캔된 명함" className="w-14 h-9 object-cover rounded-md border border-neutral-700" />
                  <div className="flex-1 text-[11px] text-neutral-400">
                    실물 명함 사진이 첨부되었습니다.
                  </div>
                  <button
                    onClick={() => setScanStep('upload')}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>재촬영</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">성명 (영문/공식)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Michael Harrison"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">성명 (국문)</label>
                  <input
                    type="text"
                    value={nameKr}
                    onChange={(e) => setNameKr(e.target.value)}
                    placeholder="e.g. 마이클 해리슨"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">소속 회사/기관명</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Global Heritage Foundation"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">소속 기관 (국문)</label>
                  <input
                    type="text"
                    value={organizationKr}
                    onChange={(e) => setOrganizationKr(e.target.value)}
                    placeholder="e.g. 글로벌헤리티지재단"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">직책/직함</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Managing Director"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">직책 (국문)</label>
                  <input
                    type="text"
                    value={titleKr}
                    onChange={(e) => setTitleKr(e.target.value)}
                    placeholder="e.g. 전무이사"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">전화번호</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +82 10-1234-5678"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. contact@domain.com"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-medium text-neutral-400">웹사이트</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://domain.com"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-medium text-neutral-400">주소</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 서울특별시 강남구 테헤란로 123"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
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
                  <label className="text-[11px] font-medium text-neutral-400">디지털 명함 테마</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as CardTheme)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white focus:outline-none text-white text-xs"
                  >
                    <option value="obsidian">옵시디언 블랙 (Obsidian)</option>
                    <option value="cotton">코튼 화이트 (Cotton)</option>
                    <option value="sand">샌드 캐시미어 (Sand)</option>
                    <option value="navy">미드나잇 네이비 (Navy)</option>
                    <option value="emerald">포레스트 그린 (Emerald)</option>
                    <option value="burgundy">임페리얼 버건디 (Burgundy)</option>
                    <option value="titanium">티타늄 그레이 (Titanium)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {scanStep === 'review' && (
          <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => setScanStep('upload')}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              다시 스캔하기
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-colors cursor-pointer shadow-lg"
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
