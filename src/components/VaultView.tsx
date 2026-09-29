import React, { useState } from 'react';
import { StoredCard, CardCategory } from '../types/card';
import { 
  Search, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Download, 
  Layers, 
  List, 
  Eye, 
  Sparkles,
  QrCode,
  Smartphone,
  Lock,
  KeyRound
} from 'lucide-react';
import { BusinessCardFront } from './BusinessCardFront';
import { downloadVCard } from '../utils/vcard';

interface VaultViewProps {
  cards: StoredCard[];
  onSelectCard: (card: StoredCard) => void;
  onEditCard: (card: StoredCard) => void;
  onDeleteCard: (cardId: string) => void;
  onExportCard: (card: StoredCard) => void;
  onOpenScan: () => void;
  onOpenEditor: () => void;
  onOpenSync?: () => void;
  isLocked?: boolean;
  onUnlockRequest?: () => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  cards,
  onSelectCard,
  onEditCard,
  onDeleteCard,
  onExportCard,
  onOpenScan,
  onOpenEditor,
  onOpenSync,
  isLocked = false,
  onUnlockRequest
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const categories: CardCategory[] = [
    '전체',
    'VIP 파트너',
    '글로벌 네트워크',
    '공공·기관',
    '투자·금융',
    'IT·기술'
  ];

  const filteredCards = cards.filter((c) => {
    const matchesCategory = selectedCategory === '전체' || c.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch = 
      c.data.name.toLowerCase().includes(q) ||
      c.data.nameKr.toLowerCase().includes(q) ||
      c.data.organization.toLowerCase().includes(q) ||
      c.data.organizationKr.toLowerCase().includes(q) ||
      c.data.title.toLowerCase().includes(q) ||
      c.data.titleKr.toLowerCase().includes(q) ||
      (c.notes && c.notes.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  if (isLocked) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C5A880] mb-5 shadow-2xl">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">명함 보관함이 잠겨 있습니다</h3>
        <p className="text-xs text-white/60 max-w-sm mb-6 leading-relaxed">
          공용 기기 및 타인의 무단 열람을 방지하기 위해 보관함이 4자리 보안 PIN으로 보호되고 있습니다.
        </p>
        <button
          onClick={onUnlockRequest}
          className="px-6 py-3 rounded-2xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-2"
        >
          <KeyRound className="w-4 h-4 text-neutral-800" />
          <span>보안 PIN 입력하여 잠금 해제</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* 1. Quiet Luxury Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="이름, 회사, 직함, 메모 검색..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#121318] border border-white/10 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-[#C5A880]/50 transition-colors"
        />
      </div>

      {/* 2. Wallet Toolbar (Categories on Left, View Mode & Primary Accent Button on Right) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-1 border-b border-white/5">
        {/* Left: Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === '전체' 
              ? cards.length 
              : cards.filter(c => c.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs transition-all cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-[#C5A880] text-neutral-950 font-semibold shadow-sm'
                    : 'bg-[#121318] text-neutral-400 hover:text-white border border-white/5 hover:border-white/10'
                }`}
              >
                <span>{cat}</span>
                <span className={`ml-1.5 text-[10px] ${isSelected ? 'text-neutral-900/80 font-bold' : 'text-neutral-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: View Mode Toggles + Single Primary Accent Button */}
        <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#121318] rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white/10 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="카드 갤러리 뷰"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">카드</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white/10 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="에디토리얼 리스트 뷰"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">리스트</span>
            </button>
          </div>

          {/* Single Primary Accent Button */}
          <button
            onClick={onOpenScan}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C5A880] hover:bg-[#d6b991] active:bg-[#b59870] text-neutral-950 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ 사진 스캔 등록</span>
          </button>
        </div>
      </div>

      {/* Content Rendering: Cards Grid or List Table */}
      {filteredCards.length === 0 ? (
        <div className="py-20 text-center space-y-3 p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/60">
          <p className="text-sm font-semibold text-neutral-300">검색 조건에 일치하는 명함이 없습니다.</p>
          <p className="text-xs text-neutral-500">카메라 사진으로 새 명함을 스캔하거나 직접 등록해 보세요.</p>
          <button
            onClick={onOpenScan}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors"
          >
            명함 스캔하기
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= CARDS GALLERY VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => {
            return (
              <div
                key={card.id}
                className="group relative rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                {/* Card Header Info */}
                <div className="p-4 border-b border-neutral-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                      {card.category}
                    </span>
                    {card.isMyCard && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        내 명함
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {card.createdAt}
                  </span>
                </div>

                {/* Card Miniature Preview (Click to Open in 3D Viewport) */}
                <div 
                  onClick={() => onSelectCard(card)}
                  className="p-4 cursor-pointer relative"
                  title="클릭하여 3D 뷰어로 전체화면 열기"
                >
                  <div className="w-full aspect-[9/5] rounded-xl overflow-hidden shadow-md ring-1 ring-white/10 group-hover:ring-white/30 transition-all pointer-events-none">
                    <BusinessCardFront data={card.data} theme={card.theme} isPrintPreview={true} />
                  </div>
                  
                  {/* Subtle overlay affordance on hover */}
                  <div className="absolute inset-0 m-4 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs">
                    <Eye className="w-4 h-4" />
                    <span>3D 인터랙티브 뷰어로 열기</span>
                  </div>
                </div>

                {/* Card Contact & Meta Info */}
                <div className="px-4 pb-2 space-y-1 text-xs">
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-bold text-white text-sm tracking-tight">{card.data.name}</h4>
                    <span className="text-[11px] text-neutral-400">{card.data.titleKr}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">{card.data.organization}</p>
                  {card.notes && (
                    <p className="text-[10px] text-neutral-400 line-clamp-1 italic pt-0.5">"{card.notes}"</p>
                  )}
                </div>

                {/* Action Rail Footer */}
                <div className="p-3 border-t border-neutral-800/60 bg-neutral-950/40 flex items-center justify-between text-neutral-400">
                  <div className="flex items-center gap-1">
                    {card.data.phoneRaw && (
                      <a
                        href={`tel:${card.data.phoneRaw}`}
                        className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800 transition-colors"
                        title="전화 걸기"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {card.data.email && (
                      <a
                        href={`mailto:${card.data.email}`}
                        className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800 transition-colors"
                        title="이메일 발송"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {card.data.website && (
                      <a
                        href={card.data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800 transition-colors"
                        title="공식 웹사이트"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => downloadVCard(card.data)}
                      className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="주소록 저장 (.vcf)"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* HTML Export */}
                    <button
                      onClick={() => onExportCard(card)}
                      className="p-1.5 rounded-lg hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="독립형 HTML/Tailwind 코드 내보내기"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => onEditCard(card)}
                      className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="명함 정보 수정"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete (prevent deleting default my-card) */}
                    {!card.isMyCard && (
                      <button
                        onClick={() => onDeleteCard(card.id)}
                        className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="명함 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* ================= EDITORIAL LIST VIEW ================= */
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/80 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">성명</th>
                  <th className="py-3 px-4">직함</th>
                  <th className="py-3 px-4">소속 회사/기관</th>
                  <th className="py-3 px-4">카테고리</th>
                  <th className="py-3 px-4">연락처</th>
                  <th className="py-3 px-4 text-right">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {filteredCards.map((card) => (
                  <tr 
                    key={card.id} 
                    className="hover:bg-neutral-800/30 transition-colors cursor-pointer group"
                    onClick={() => onSelectCard(card)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:underline underline-offset-2">{card.data.name}</span>
                        {card.isMyCard && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            내 명함
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
                      {card.data.titleKr || card.data.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-white font-medium">{card.data.organization}</span>
                      <span className="block text-[10px] text-neutral-400">{card.data.organizationKr}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-950 border border-neutral-800 text-neutral-300">
                        {card.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-neutral-300 font-mono text-[11px] block">{card.data.phone}</span>
                      <span className="text-neutral-400 text-[10px] block">{card.data.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 text-neutral-400">
                        <button
                          onClick={() => downloadVCard(card.data)}
                          className="p-1.5 rounded-md hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="주소록 저장"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onExportCard(card)}
                          className="p-1.5 rounded-md hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="HTML 내보내기"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditCard(card)}
                          className="p-1.5 rounded-md hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {!card.isMyCard && (
                          <button
                            onClick={() => onDeleteCard(card.id)}
                            className="p-1.5 rounded-md hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
