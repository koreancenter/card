import React, { useState } from 'react';
import { Sparkles, Copy, Check, Wand2, Code, Eye, RefreshCw } from 'lucide-react';
import { CardData } from '../../types/card';

interface CustomHtmlEditorProps {
  htmlFront: string;
  htmlBack: string;
  onChangeFront: (val: string) => void;
  onChangeBack: (val: string) => void;
  cardData: CardData;
  activeFace: 'front' | 'back';
  onChangeActiveFace: (face: 'front' | 'back') => void;
}

export const LUXURY_PROMPT_PRESETS = [
  {
    id: 'gold_obsidian',
    title: '골드 호일 & 흑요석 블랙',
    desc: '매트 흑요석 배경, 샴페인 골드 액센트, 고딕 모던 타이포그래피',
    prompt: 'Ultra-luxury executive card with matte black background (#0C0C0E), champagne gold (#C5A880) borders and typography, elegant serif initials monogram at top right, asymmetric contact layout, fine divider line, and understated Korean/English typography hierarchy.',
    starterFront: `<div class="w-full h-full bg-[#0B0C10] text-[#F8F4EB] p-7 flex flex-col justify-between border border-[#C5A880]/30 rounded-2xl relative overflow-hidden font-sans shadow-2xl">
  <div class="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#C5A880]/5 blur-2xl pointer-events-none"></div>
  <div class="flex justify-between items-start">
    <div>
      <span class="text-[10px] tracking-[0.25em] text-[#C5A880] uppercase font-mono block mb-1">GLOBAL PARTNER</span>
      <h2 class="text-xl font-bold tracking-tight text-white">PARK, GIHONG</h2>
      <p class="text-xs text-neutral-400 font-light mt-0.5">박기홍 · Principal Master</p>
    </div>
    <div class="w-10 h-10 rounded-xl border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] font-serif font-bold text-sm bg-white/[0.02]">
      PG
    </div>
  </div>
  <div class="space-y-2 border-t border-white/10 pt-4">
    <div class="flex justify-between items-center text-[11px]">
      <span class="text-neutral-500 font-mono">ORGANIZATION</span>
      <span class="text-neutral-300 font-medium">GOGUMA AI STUDIO</span>
    </div>
    <div class="flex justify-between items-center text-[11px]">
      <span class="text-neutral-500 font-mono">DIRECT</span>
      <span class="text-[#C5A880] font-mono">+82 10-1234-5678</span>
    </div>
    <div class="flex justify-between items-center text-[11px]">
      <span class="text-neutral-500 font-mono">ENCRYPTED</span>
      <span class="text-neutral-400 font-mono">master@goguma.app</span>
    </div>
  </div>
</div>`,
    starterBack: `<div class="w-full h-full bg-[#0B0C10] text-[#F8F4EB] p-8 flex flex-col items-center justify-center border border-[#C5A880]/20 rounded-2xl text-center relative overflow-hidden">
  <div class="w-14 h-14 rounded-full border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] font-serif font-bold text-lg mb-3 shadow-inner">
    PG
  </div>
  <h3 class="text-sm font-bold tracking-wider text-white uppercase font-sans">GOGUMA GLOBAL NETWORK</h3>
  <p class="text-[11px] text-neutral-400 mt-1 max-w-[260px] leading-relaxed">Pioneering Privacy-First Local Encrypted Digital Identities</p>
  <div class="mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#C5A880]">
    card.goguma.app/master
  </div>
</div>`
  },
  {
    id: 'swiss_modernism',
    title: '스위스 인터내셔널 모더니즘',
    desc: '볼드 산세리프, 고대비 그리드, 간결하고 명확한 텍스트 위계',
    prompt: 'Swiss International Typographic style business card with bold grotesque typography, asymmetric stark grid, stark black and ivory contrast with high-contrast vermilion orange accent badge, pure minimalist structure.',
    starterFront: `<div class="w-full h-full bg-[#F4F3EF] text-[#111215] p-7 flex flex-col justify-between rounded-2xl relative font-sans border border-neutral-300">
  <div class="flex justify-between items-start">
    <div class="space-y-1">
      <span class="inline-block px-2 py-0.5 rounded bg-black text-[#F4F3EF] text-[9px] font-mono uppercase tracking-widest font-semibold">IDENTITY</span>
      <h1 class="text-2xl font-black tracking-tighter uppercase mt-1">PARK GIHONG</h1>
      <p class="text-xs font-mono text-neutral-600">DIRECTOR / SYSTEM ARCHITECT</p>
    </div>
    <div class="w-3 h-3 bg-[#E63946] rounded-full"></div>
  </div>
  <div class="grid grid-cols-2 gap-4 border-t-2 border-black pt-3 text-[11px]">
    <div>
      <p class="font-bold text-[10px] text-neutral-500 uppercase">AFFILIATION</p>
      <p class="font-medium text-black">KOREAN CENTER LABS</p>
      <p class="text-[10px] text-neutral-600">SEOUL, KOREA</p>
    </div>
    <div class="text-right">
      <p class="font-bold text-[10px] text-neutral-500 uppercase">CHANNELS</p>
      <p class="font-mono text-black font-semibold">+82 10-1234-5678</p>
      <p class="font-mono text-neutral-600">master@goguma.app</p>
    </div>
  </div>
</div>`,
    starterBack: `<div class="w-full h-full bg-[#111215] text-[#F4F3EF] p-8 flex flex-col justify-between rounded-2xl relative font-sans">
  <div class="flex justify-between items-center">
    <span class="text-xs font-mono tracking-widest text-[#E63946]">01 / ARCHITECTURE</span>
    <span class="text-xs font-mono text-neutral-500">ISO-7810</span>
  </div>
  <div class="my-auto">
    <h2 class="text-3xl font-black tracking-tighter uppercase leading-none">ZERO-KNOWLEDGE<br/>DIGITAL CARD</h2>
  </div>
  <div class="border-t border-neutral-800 pt-3 flex justify-between text-[10px] font-mono text-neutral-400">
    <span>KOREAN CENTER FOUNDATION</span>
    <span>VERIFIED PROTOCOL</span>
  </div>
</div>`
  },
  {
    id: 'deep_forest_atelier',
    title: '딥 포레스트 & 브론즈 아틀리에',
    desc: '다크 에메랄드 그린 배경, 앤틱 브론즈 디테일, 우아한 여백',
    prompt: 'Dark emerald green (#0D1F18) quiet luxury card with muted antique bronze metallic accents, subtle organic texture, refined serif typography, and elegant spacious margins.',
    starterFront: `<div class="w-full h-full bg-[#0D1F18] text-[#F5F7F4] p-7 flex flex-col justify-between border border-[#C2A478]/30 rounded-2xl relative font-sans">
  <div class="flex justify-between items-start">
    <div>
      <p class="text-[10px] tracking-[0.2em] text-[#C2A478] uppercase font-serif">ATELIER ARCHIVE</p>
      <h2 class="text-xl font-serif font-bold text-white mt-1">PARK, GIHONG</h2>
      <p class="text-xs text-neutral-300 font-light">Managing Director</p>
    </div>
    <div class="w-8 h-8 rounded-full border border-[#C2A478]/50 flex items-center justify-center text-[#C2A478] text-xs font-serif">
      숲
    </div>
  </div>
  <div class="border-t border-[#C2A478]/20 pt-4 space-y-1.5 text-xs text-neutral-300">
    <p class="flex justify-between"><span class="text-neutral-400 text-[10px] font-mono">COMPANY</span><span class="text-white font-serif">Korean Heritage Atelier</span></p>
    <p class="flex justify-between"><span class="text-neutral-400 text-[10px] font-mono">TELEPHONE</span><span class="font-mono text-[#C2A478]">+82 10-1234-5678</span></p>
  </div>
</div>`,
    starterBack: `<div class="w-full h-full bg-[#091510] text-[#F5F7F4] p-8 flex flex-col items-center justify-center border border-[#C2A478]/20 rounded-2xl text-center">
  <div class="w-12 h-12 rounded-full border border-[#C2A478]/30 flex items-center justify-center text-[#C2A478] font-serif text-lg mb-2">
    紀
  </div>
  <h4 class="font-serif text-sm text-[#C2A478] tracking-widest">KOREAN CENTER LABS</h4>
  <p class="text-[11px] text-neutral-400 mt-1">Quiet Luxury On-Device Heritage</p>
</div>`
  }
];

export const CustomHtmlEditor: React.FC<CustomHtmlEditorProps> = ({
  htmlFront,
  htmlBack,
  onChangeFront,
  onChangeBack,
  cardData,
  activeFace,
  onChangeActiveFace
}) => {
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [customAiPrompt, setCustomAiPrompt] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  const handleCopyPrompt = (presetId: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPromptId(presetId);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleApplyPreset = (preset: typeof LUXURY_PROMPT_PRESETS[0]) => {
    onChangeFront(preset.starterFront);
    onChangeBack(preset.starterBack);
  };

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    setAiStatus('Cloud AI가 럭셔리 명함 Tailwind HTML을 렌더링 중입니다...');
    try {
      const res = await fetch('/api/generate-card-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customAiPrompt.trim() || '프라이빗 뱅커 샴페인 골드 럭셔리 명함',
          profileData: {
            name: cardData.name || 'PARK, GIHONG',
            company: cardData.organizationKr || cardData.organization || 'GOGUMA AI STUDIO',
            title: cardData.titleKr || cardData.title || 'Principal Master',
            phone: cardData.phone || '+82 10-1234-5678',
            email: cardData.email || 'master@goguma.app',
            website: cardData.website || 'card.goguma.app/master',
            address: cardData.addressKr || 'Seoul, Korea'
          }
        })
      });

      const data = await res.json();
      if (data.success && data.html) {
        onChangeFront(data.html);
        setAiStatus('✓ AI 코드가 앞면에 성공적으로 주입되었습니다.');
      } else if (data.fallback) {
        // Fallback to luxury preset if API key not available on server
        onChangeFront(LUXURY_PROMPT_PRESETS[0].starterFront);
        onChangeBack(LUXURY_PROMPT_PRESETS[0].starterBack);
        setAiStatus('서버 AI 키 미설정 상태로 최고급 골드 흑요석 프리셋이 자동 적용되었습니다.');
      } else {
        setAiStatus('생성 중 오류가 발생했습니다. 프리셋 코드를 사용해 보세요.');
      }
    } catch (e: any) {
      setAiStatus('네트워크 요청 실패: 기본 럭셔리 프리셋 코드를 적용합니다.');
      onChangeFront(LUXURY_PROMPT_PRESETS[0].starterFront);
    } finally {
      setIsGeneratingAi(false);
      setTimeout(() => setAiStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Description */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <span className="text-[#C5A880] font-mono">01.</span>
          <span>커스텀 HTML & Tailwind CSS 주입</span>
        </label>
        <p className="text-[11px] text-neutral-400">
          Tailwind CSS 클래스로 직접 명함 디자인을 작성하거나, Cloud AI Prompt Helper로 프롬프트를 복사/생성합니다.
        </p>
      </div>

      {/* Cloud AI Prompt Helper Panel */}
      <div className="p-4 rounded-2xl bg-[#0B0C10] border border-[#C5A880]/30 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#C5A880]/15 flex items-center justify-center text-[#C5A880]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-white tracking-wide">Cloud AI Prompt Helper</h4>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#C5A880]/10 text-[10px] font-mono text-[#C5A880] border border-[#C5A880]/20">
            Gemini 3.8 Flash Ready
          </span>
        </div>

        {/* AI Quick Generation Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={customAiPrompt}
              onChange={(e) => setCustomAiPrompt(e.target.value)}
              placeholder="예: 런던 사모펀드 파트너를 위한 다크 네이비 & 플래티넘 모노그램 명함"
              className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs placeholder:text-neutral-500"
            />
            <button
              type="button"
              onClick={handleGenerateAi}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C5A880] hover:bg-[#d6b991] text-black font-bold text-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isGeneratingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              <span>AI 자동 생성</span>
            </button>
          </div>
          {aiStatus && (
            <p className="text-[11px] text-[#C5A880] font-mono animate-in fade-in duration-150">
              {aiStatus}
            </p>
          )}
        </div>

        {/* Curated Luxury Prompt Templates */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            검증된 럭셔리 디자인 템플릿 & 프롬프트 복사
          </p>
          <div className="grid grid-cols-1 gap-2">
            {LUXURY_PROMPT_PRESETS.map((preset) => (
              <div 
                key={preset.id}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{preset.title}</p>
                  <p className="text-[10px] text-neutral-400 truncate mt-0.5">{preset.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(preset.id, preset.prompt)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                    title="외부 AI 프롬프트 복사"
                  >
                    {copiedPromptId === preset.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>프롬프트 복사</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#C5A880]/20 hover:bg-[#C5A880]/30 text-[#C5A880] border border-[#C5A880]/30 transition-colors cursor-pointer text-[10px] font-medium"
                  >
                    코드 적용
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HTML Code Editor Sections */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[#C5A880] font-mono">02.</span>
            <span>명함 면별 HTML 소스</span>
          </label>
          {/* Front / Back Toggle for Editor */}
          <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => onChangeActiveFace('front')}
              className={`px-3 py-1 rounded font-medium transition-all cursor-pointer ${
                activeFace === 'front' 
                  ? 'bg-[#C5A880] text-black font-bold' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              앞면 (Front)
            </button>
            <button
              type="button"
              onClick={() => onChangeActiveFace('back')}
              className={`px-3 py-1 rounded font-medium transition-all cursor-pointer ${
                activeFace === 'back' 
                  ? 'bg-[#C5A880] text-black font-bold' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              뒷면 (Back)
            </button>
          </div>
        </div>

        {activeFace === 'front' ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="font-mono">앞면 HTML (Front Card Face)</span>
              <span className="text-[10px] text-neutral-500 font-mono">w-full h-full aspect-[9/5] 권장</span>
            </div>
            <textarea
              rows={12}
              value={htmlFront}
              onChange={(e) => onChangeFront(e.target.value)}
              placeholder="<div class=&quot;w-full h-full bg-neutral-900 text-white p-6 ...&quot;>...</div>"
              className="w-full p-3.5 rounded-xl bg-[#08090C] border border-white/10 focus:border-[#C5A880] focus:outline-none text-[#F8F4EB] text-xs font-mono leading-relaxed resize-y"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="font-mono">뒷면 HTML (Back Card Face - 선택)</span>
              <span className="text-[10px] text-neutral-500 font-mono">비워둘 경우 기본 QR/단색 뒷면 적용</span>
            </div>
            <textarea
              rows={12}
              value={htmlBack}
              onChange={(e) => onChangeBack(e.target.value)}
              placeholder="<div class=&quot;w-full h-full bg-[#0B0C10] p-6 ...&quot;>...</div>"
              className="w-full p-3.5 rounded-xl bg-[#08090C] border border-white/10 focus:border-[#C5A880] focus:outline-none text-[#F8F4EB] text-xs font-mono leading-relaxed resize-y"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
