import React, { useState } from 'react';
import { Copy, Check, Sparkles, Code, RefreshCw, Wand2 } from 'lucide-react';
import { CardData } from '../../types/card';

interface CustomHtmlEditorProps {
  htmlFront: string;
  htmlBack: string;
  onChangeFront: (val: string) => void;
  onChangeBack: (val: string) => void;
  cardData: CardData;
  onChangeCardData: (field: keyof CardData, val: string) => void;
  activeFace: 'front' | 'back';
  onChangeActiveFace: (face: 'front' | 'back') => void;
}

export const CLOUD_AI_QUIET_LUXURY_PROMPT = `너는 최고급 하이엔드 브랜딩 전문 시니어 UI/UX 디자이너이자 프론트엔드 엔지니어입니다.
아래의 명함 정보를 바탕으로, 현대적이고 우아한 'Quiet Luxury' 스타일의 디지털 명함 앞면 HTML 코드를 작성해 주세요.

[명함 정보]
- 회사/조직명: (예: 고구마 스튜디오)
- 이름 및 직함: (예: 홍길동 / 수석 디자이너)
- 연락처: (예: 010-1234-5678 / contact@example.com)
- 슬로건 또는 웹사이트: (예: goguma.app)

[엄격한 기술 및 디자인 제약 사항]
1. 최상위 태그는 단 1개의 <div>로 감싸야 하며, <html>, <head>, <body> 태그는 절대 포함하지 마세요.
2. 카드 규격은 가로형 명함 표준 비율(1.586:1)을 유지할 수 있도록 \`w-full h-full aspect-[1.586/1]\` 클래스를 사용하세요.
3. 스타일링은 오직 Tailwind CSS 유틸리티 클래스만 사용하세요.
4. 테마 및 색상:
   - 배경: 칠흑색(bg-[#0B0C10] 또는 bg-[#16181D])
   - 주 텍스트: 아이보리/오프화이트(text-[#F8F4EB] 또는 text-white/90)
   - 포인트 액센트: 샴페인 브라스(text-[#C5A880] 또는 border-[#C5A880]/30)
5. 오직 HTML 코드 블록(\`\`\`html ... \`\`\`)만 출력하고 불필요한 설명은 생략하세요.`;

export const DEFAULT_LUXURY_HTML_FRONT = `<div class="w-full h-full aspect-[1.586/1] bg-[#0B0C10] text-[#F8F4EB] p-7 flex flex-col justify-between border border-[#C5A880]/30 rounded-2xl relative overflow-hidden font-sans shadow-2xl select-none">
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
</div>`;

export const DEFAULT_LUXURY_HTML_BACK = `<div class="w-full h-full aspect-[1.586/1] bg-[#0B0C10] text-[#F8F4EB] p-8 flex flex-col items-center justify-center border border-[#C5A880]/20 rounded-2xl text-center relative overflow-hidden select-none">
  <div class="w-14 h-14 rounded-full border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] font-serif font-bold text-lg mb-3 shadow-inner">
    PG
  </div>
  <h3 class="text-sm font-bold tracking-wider text-white uppercase font-sans">GOGUMA GLOBAL NETWORK</h3>
  <p class="text-[11px] text-neutral-400 mt-1 max-w-[260px] leading-relaxed">Pioneering Privacy-First Local Encrypted Digital Identities</p>
  <div class="mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#C5A880]">
    card.goguma.app/master
  </div>
</div>`;

export const CustomHtmlEditor: React.FC<CustomHtmlEditorProps> = ({
  htmlFront,
  htmlBack,
  onChangeFront,
  onChangeBack,
  cardData,
  onChangeCardData,
  activeFace,
  onChangeActiveFace
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  const handleCopyPrompt = () => {
    // Dynamically insert current card details if present, or use standard prompt
    let promptText = CLOUD_AI_QUIET_LUXURY_PROMPT;
    if (cardData.name || cardData.organizationKr) {
      promptText = promptText.replace(
        '[명함 정보]\n- 회사/조직명: (예: 고구마 스튜디오)\n- 이름 및 직함: (예: 홍길동 / 수석 디자이너)\n- 연락처: (예: 010-1234-5678 / contact@example.com)\n- 슬로건 또는 웹사이트: (예: goguma.app)',
        `[명함 정보]\n- 회사/조직명: ${cardData.organizationKr || cardData.organization || '고구마 AI 스튜디오'}\n- 이름 및 직함: ${cardData.name || '홍길동'} / ${cardData.titleKr || cardData.title || '수석 마스터'}\n- 연락처: ${cardData.phone || '010-1234-5678'} / ${cardData.email || 'contact@goguma.app'}\n- 슬로건 또는 웹사이트: ${cardData.website || 'card.goguma.app'}`
      );
    }

    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2200);
  };

  const handleGenerateDirectAi = async () => {
    setIsGeneratingAi(true);
    setAiStatus('Cloud AI(Gemini 3.8 Flash)로 명함 HTML 코드를 생성 중입니다...');
    try {
      const res = await fetch('/api/generate-card-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: CLOUD_AI_QUIET_LUXURY_PROMPT,
          profileData: {
            name: cardData.name || '홍길동',
            company: cardData.organizationKr || cardData.organization || '고구마 AI 스튜디오',
            title: cardData.titleKr || cardData.title || '수석 디자이너',
            phone: cardData.phone || '010-1234-5678',
            email: cardData.email || 'contact@example.com',
            website: cardData.website || 'card.goguma.app'
          }
        })
      });
      const data = await res.json();
      if (data.success && data.html) {
        onChangeFront(data.html);
        setAiStatus('✓ AI 생성 코드가 앞면에 자동 적용되었습니다.');
      } else {
        onChangeFront(DEFAULT_LUXURY_HTML_FRONT);
        onChangeBack(DEFAULT_LUXURY_HTML_BACK);
        setAiStatus('✓ 콰이어트 럭셔리 마스터 코드가 적용되었습니다.');
      }
    } catch {
      onChangeFront(DEFAULT_LUXURY_HTML_FRONT);
      setAiStatus('✓ 기본 콰이어트 럭셔리 코드가 적용되었습니다.');
    } finally {
      setIsGeneratingAi(false);
      setTimeout(() => setAiStatus(null), 3500);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Built-in Cloud AI Prompt Helper Banner */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-[#C5A880]/30 shadow-lg space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-[#C5A880]" />
              <span>Built-in Cloud AI Prompt Helper</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Quiet Luxury 표준 규격(1.586:1, 칠흑색·아이보리·샴페인 브라스 테마)이 정의된 엄격한 프롬프트를 1클릭 복사합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyPrompt}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-md active:scale-95 ${
              copiedPrompt
                ? 'bg-emerald-500 text-black'
                : 'bg-[#C5A880] hover:bg-[#d6b991] text-black'
            }`}
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPrompt ? '복사 완료!' : '📋 AI 프롬프트 복사하기'}</span>
          </button>
        </div>

        {/* Quick direct AI render button & status */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
          <span className="text-neutral-500 font-mono">ChatGPT / Claude / Gemini 붙여넣기 최적화</span>
          <button
            type="button"
            onClick={handleGenerateDirectAi}
            disabled={isGeneratingAi}
            className="flex items-center gap-1 text-[#C5A880] hover:underline cursor-pointer disabled:opacity-50"
          >
            {isGeneratingAi ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            <span>{isGeneratingAi ? '생성 중...' : '프리셋 코드 즉시 적용'}</span>
          </button>
        </div>
        {aiStatus && (
          <p className="text-[11px] text-[#C5A880] font-mono animate-in fade-in duration-150">
            {aiStatus}
          </p>
        )}
      </div>

      {/* 2. Code Editor Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[#C5A880] font-mono">01.</span>
            <span>커스텀 HTML / Tailwind 코드 입력</span>
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
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="font-mono">앞면 HTML (w-full h-full aspect-[1.586/1])</span>
              <span className="text-[10px] text-neutral-500 font-mono">Tailwind CSS Classes</span>
            </div>
            <textarea
              rows={11}
              value={htmlFront}
              onChange={(e) => onChangeFront(e.target.value)}
              placeholder="<div class=&quot;w-full h-full aspect-[1.586/1] bg-[#0B0C10] text-[#F8F4EB] p-7 ...&quot;>...</div>"
              className="w-full p-3.5 rounded-xl bg-[#08090C] border border-white/10 focus:border-[#C5A880] focus:outline-none text-[#F8F4EB] text-xs font-mono leading-relaxed resize-y selection:bg-[#C5A880]/30"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="font-mono">뒷면 HTML (선택 사항)</span>
              <span className="text-[10px] text-neutral-500 font-mono">비워둘 경우 기본 QR 카드 뒷면 적용</span>
            </div>
            <textarea
              rows={11}
              value={htmlBack}
              onChange={(e) => onChangeBack(e.target.value)}
              placeholder="<div class=&quot;w-full h-full aspect-[1.586/1] bg-[#0B0C10] ...&quot;>...</div>"
              className="w-full p-3.5 rounded-xl bg-[#08090C] border border-white/10 focus:border-[#C5A880] focus:outline-none text-[#F8F4EB] text-xs font-mono leading-relaxed resize-y selection:bg-[#C5A880]/30"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* 3. Action Metadata Fields */}
      <div className="border-t border-white/[0.06] pt-5 space-y-3">
        <div className="space-y-0.5">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[#C5A880] font-mono">02.</span>
            <span>액션바 연동 메타데이터 (Action Mapping)</span>
          </label>
          <p className="text-[11px] text-neutral-400">
            커스텀 HTML 명함 하단의 원클릭 전화걸기, vCard 저장, 문자 전송 버튼과 매핑됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* 성명 (Name) */}
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-300 font-medium flex items-center gap-1">
              <span>성명 (Name)</span>
              <span className="text-[#C5A880] font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={cardData.name}
              onChange={(e) => onChangeCardData('name', e.target.value)}
              placeholder="예: 홍길동 또는 John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-semibold"
            />
          </div>

          {/* 대표 전화번호 (Phone) */}
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-300 font-medium flex items-center gap-1">
              <span>전화번호 (Phone)</span>
              <span className="text-[#C5A880] font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={cardData.phone}
              onChange={(e) => onChangeCardData('phone', e.target.value)}
              placeholder="010-1234-5678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-[#C5A880] focus:outline-none text-white text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
