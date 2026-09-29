/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CardTheme, PrintConfig, StoredCard } from './types/card';
import { loadStoredCards, saveStoredCards } from './utils/initialCards';
import { CardContainer } from './components/CardContainer';
import { MyCardSwitcher } from './components/MyCardSwitcher';
import { QrModal } from './components/QrModal';
import { PrintModal } from './components/PrintModal';
import { PrintSheet } from './components/PrintSheet';
import { ExportModal } from './components/ExportModal';
import { ScanCardModal } from './components/ScanCardModal';
import { CardEditorModal } from './components/CardEditorModal';
import { VaultView } from './components/VaultView';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { APP_BASE_DOMAIN, resolveCardFromLocation, getCardShareUrl } from './utils/domain';
import { pullWalletFromEdge, pushWalletToEdge } from './utils/syncWallet';
import { 
  Check, 
  Camera, 
  CreditCard, 
  FolderArchive, 
  ArrowLeft,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [cards, setCards] = useState<StoredCard[]>(() => loadStoredCards());
  const [activeCardId, setActiveCardId] = useState<string>(() => {
    const loaded = loadStoredCards();
    const defaultCard = loaded.find(c => c.isMyCard && c.isDefault);
    return defaultCard?.id || loaded[0]?.id || 'my-card-park-gihong';
  });

  const [activeTab, setActiveTab] = useState<'my-card' | 'vault'>('my-card');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  
  // Modals state
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isScanOpen, setIsScanOpen] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isCreatingCard, setIsCreatingCard] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<StoredCard | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync cards with local storage
  useEffect(() => {
    saveStoredCards(cards);
  }, [cards]);

  // 1. URL Sync Detection & Initialization (Cross-device anonymous wallet)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const syncId = searchParams.get('sync');
    if (syncId) {
      pullWalletFromEdge(syncId).then((remoteCards) => {
        if (remoteCards && Array.isArray(remoteCards) && remoteCards.length > 0) {
          setCards(remoteCards);
          saveStoredCards(remoteCards);
          setActiveTab('vault');
          showToast('기기 보관함이 성공적으로 동기화되었습니다.');
        }
        // Clean up URL query parameter using replaceState without page refresh
        const url = new URL(window.location.href);
        url.searchParams.delete('sync');
        window.history.replaceState({}, document.title, url.pathname + (url.search || ''));
      });
    }
  }, []);

  // 2. Automatic background sync of wallet to Cloudflare edge
  useEffect(() => {
    if (!cards || cards.length === 0) return;
    const timer = setTimeout(() => {
      pushWalletToEdge(cards);
    }, 800);
    return () => clearTimeout(timer);
  }, [cards]);

  // URL query parameter (?card=...), Pathname (/mrpark), & Custom Domain smart routing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const matched = resolveCardFromLocation(cards);
      if (matched) {
        setActiveCardId(matched.id);
        setActiveTab('my-card');
      }
    } catch (e) {
      console.error('URL routing error', e);
    }
  }, [cards]);

  const activeCard: StoredCard = cards.find(c => c.id === activeCardId) || cards[0];
  const myCards = cards.filter(c => c.isMyCard);

  // Print Config for active card
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    layout: 'single-card',
    size: 'kr-standard',
    theme: 'cotton',
    showCropMarks: true,
    scale: 1,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Card Switcher Handler
  const handleSelectMyCard = (id: string) => {
    setActiveCardId(id);
    setIsFlipped(false);
    const selectedCard = cards.find(c => c.id === id);
    if (selectedCard && typeof window !== 'undefined') {
      const slug = selectedCard.slug || selectedCard.id;
      const url = new URL(window.location.href);
      url.searchParams.set('card', slug);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Create New My Card (Requirement #1)
  const handleOpenCreateModal = () => {
    const newCardTemplate: StoredCard = {
      id: `my-card-${Date.now()}`,
      isMyCard: true,
      isDefault: false,
      slug: '',
      theme: 'emerald',
      category: '글로벌 네트워크',
      createdAt: new Date().toISOString().split('T')[0],
      notes: '신규 프로필 명함',
      data: {
        ...activeCard.data,
        organization: '',
        organizationKr: '',
        title: '',
        titleKr: '',
        website: 'https://mrpark.indonesiacenter.net',
        websiteDisplay: 'mrpark.indonesiacenter.net',
        email: 'mrpark@indonesiacenter.net'
      }
    };
    setEditingCard(newCardTemplate);
    setIsCreatingCard(true);
    setIsEditorOpen(true);
  };

  // Duplicate Current Card as Template
  const handleDuplicateMyCard = (sourceCard: StoredCard) => {
    const newCardTemplate: StoredCard = {
      id: `my-card-${Date.now()}`,
      isMyCard: true,
      isDefault: false,
      slug: `${sourceCard.slug || 'card'}-copy`,
      theme: sourceCard.theme,
      category: sourceCard.category,
      createdAt: new Date().toISOString().split('T')[0],
      notes: `${sourceCard.data.organization} 복제 프로필`,
      data: {
        ...sourceCard.data,
        title: `${sourceCard.data.title}`,
        titleKr: `${sourceCard.data.titleKr}`
      }
    };
    setEditingCard(newCardTemplate);
    setIsCreatingCard(true);
    setIsEditorOpen(true);
  };

  // Set as Primary Default Card
  const handleSetDefaultCard = (id: string) => {
    setCards(prev => prev.map(c => ({
      ...c,
      isDefault: c.id === id
    })));
    showToast('기본 대표 명함으로 지정되었습니다.');
  };

  // Delete Secondary My Card
  const handleDeleteMyCard = (id: string) => {
    const currentMyCards = cards.filter(c => c.isMyCard);
    if (currentMyCards.length <= 1) {
      showToast('최소 1개의 내 명함은 유지되어야 합니다.');
      return;
    }
    setCards(prev => prev.filter(c => c.id !== id));
    if (activeCardId === id) {
      const remaining = currentMyCards.filter(c => c.id !== id);
      setActiveCardId(remaining[0].id);
    }
    showToast('명함이 삭제되었습니다.');
  };

  const handleShare = async () => {
    const targetUrl = getCardShareUrl(activeCard);
    const displayUrl = activeCard.data.websiteDisplay || targetUrl;
    const shareData = {
      title: `${activeCard.data.name} — ${activeCard.data.organization}`,
      text: `${activeCard.data.organization} ${activeCard.data.title} ${activeCard.data.name} 디지털 명함`,
      url: targetUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(targetUrl);
          showToast(`명함 링크(${displayUrl})가 복사되었습니다`);
        }
      }
    } else {
      navigator.clipboard.writeText(targetUrl);
      showToast(`명함 링크(${displayUrl})가 복사되었습니다`);
    }
  };

  const handleThemeChange = (newTheme: CardTheme) => {
    setCards(prev => prev.map(c => c.id === activeCard.id ? { ...c, theme: newTheme } : c));
  };

  const handleSaveCard = (savedCard: StoredCard) => {
    setCards(prev => {
      let nextCards = [...prev];
      // If marked as default, clear default on other cards
      if (savedCard.isDefault) {
        nextCards = nextCards.map(c => ({ ...c, isDefault: false }));
      }

      const exists = nextCards.some(c => c.id === savedCard.id);
      if (exists) {
        return nextCards.map(c => c.id === savedCard.id ? savedCard : c);
      } else {
        return [savedCard, ...nextCards];
      }
    });

    setActiveCardId(savedCard.id);
    if (savedCard.isMyCard) {
      setActiveTab('my-card');
      showToast(isCreatingCard ? '새로운 내 명함이 생성되었습니다.' : '내 명함 정보가 수정되었습니다.');
    } else {
      showToast(`'${savedCard.data.name}' 명함이 보관함에 등록되었습니다.`);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    const target = cards.find(c => c.id === cardId);
    if (!target) return;
    if (confirm(`'${target.data.name}' 명함을 보관함에서 삭제하시겠습니까?`)) {
      setCards(prev => prev.filter(c => c.id !== cardId));
      if (activeCardId === cardId) {
        const remaining = cards.filter(c => c.id !== cardId);
        if (remaining.length > 0) setActiveCardId(remaining[0].id);
      }
      showToast('명함이 삭제되었습니다.');
    }
  };

  // Keyboard shortcut: Space to flip card in my-card mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space' && activeTab === 'my-card') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  return (
    <>
      {/* SCREEN UI CONTAINER */}
      <div 
        id="screen-app-container" 
        className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col justify-between selection:bg-neutral-100 selection:text-neutral-950 font-sans"
      >
        {/* Top Minimalist Luxury Header */}
        <header className="sticky top-0 z-40 w-full border-b border-neutral-900/90 bg-[#09090b]/85 backdrop-blur-xl px-4 sm:px-8 py-3 flex items-center justify-between">
          
          {/* Institutional Wordmark */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-6 h-6 rounded-full border border-neutral-700/80 flex items-center justify-center text-[10px] font-serif text-neutral-300 shrink-0">
              韓
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-white">
                Korean Center
              </span>
              <span className="hidden md:inline text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                Card Studio
              </span>
            </div>
          </div>

          {/* Center Navigation: Segmented Switcher (내 명함 vs 보관함) */}
          <nav className="flex items-center p-1 bg-neutral-950 rounded-2xl border border-neutral-800/80 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('my-card');
                const defaultCard = myCards.find(c => c.isDefault) || myCards[0];
                if (defaultCard) setActiveCardId(defaultCard.id);
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'my-card'
                  ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>내 명함</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'vault'
                  ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>명함 보관함</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
                {cards.length}
              </span>
            </button>
          </nav>

          {/* Right Header: Actions (Vault only) */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-h-[32px]">
            {activeTab === 'vault' && (
              <>
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="스마트폰과 보관함 동기화"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span className="hidden sm:inline">기기 연결</span>
                </button>
                <button
                  onClick={() => setIsScanOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="카메라로 종이 명함 촬영 및 자동 등록"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>명함 스캔</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Main Showcase Viewport */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-5 sm:py-7 max-w-6xl mx-auto w-full">
          
          {activeTab === 'my-card' ? (
            /* ================= VIEW 1: 3D CARD SHOWCASE ================= */
            <div className="w-full flex flex-col items-center space-y-3 sm:space-y-3.5">
              
              {/* Context Bar if viewing someone else's card from the vault */}
              {!activeCard.isMyCard ? (
                <div className="flex items-center justify-between w-full max-w-[360px] sm:max-w-[400px] text-xs">
                  <button
                    onClick={() => setActiveTab('vault')}
                    className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>보관함 목록으로</span>
                  </button>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400">
                    보관 명함 열람 중 ({activeCard.category})
                  </span>
                </div>
              ) : (
                /* Multi-Profile Switcher & Creator (Requirement #1 & #2) */
                <MyCardSwitcher
                  myCards={myCards}
                  activeCardId={activeCard.id}
                  onSelectCard={handleSelectMyCard}
                  onCreateNewCard={handleOpenCreateModal}
                  onDuplicateCard={handleDuplicateMyCard}
                  onSetDefaultCard={handleSetDefaultCard}
                  onDeleteCard={handleDeleteMyCard}
                />
              )}

              {/* 3D Tactile Business Card */}
              <div className="w-full">
                <CardContainer 
                  data={activeCard.data} 
                  theme={activeCard.theme} 
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped(prev => !prev)}
                  onOpenQr={() => setIsQrOpen(true)}
                  onOpenPrint={() => setIsPrintOpen(true)}
                  onShare={handleShare}
                  onSelectTheme={handleThemeChange}
                  onOpenEdit={() => {
                    setEditingCard(activeCard);
                    setIsCreatingCard(false);
                    setIsEditorOpen(true);
                  }}
                  onOpenExport={() => setIsExportOpen(true)}
                />
              </div>
            </div>
          ) : (
            /* ================= VIEW 2: THE VAULT (CARD / LIST) ================= */
            <VaultView
              cards={cards}
              onSelectCard={(selected) => {
                setActiveCardId(selected.id);
                setActiveTab('my-card');
              }}
              onEditCard={(cardToEdit) => {
                setEditingCard(cardToEdit);
                setIsCreatingCard(false);
                setIsEditorOpen(true);
              }}
              onDeleteCard={handleDeleteCard}
              onExportCard={(cardToExport) => {
                setActiveCardId(cardToExport.id);
                setIsExportOpen(true);
              }}
              onOpenScan={() => setIsScanOpen(true)}
              onOpenSync={() => setIsSyncModalOpen(true)}
              onOpenEditor={() => {
                setEditingCard(activeCard);
                setIsCreatingCard(false);
                setIsEditorOpen(true);
              }}
            />
          )}

        </main>

        {/* Discreet Editorial Footer */}
        <footer className="border-t border-neutral-900 py-5 px-4 text-center text-neutral-400 font-sans text-[11px]">
          <p>
            © {new Date().getFullYear()} Korean Center Global Network. Executive Card Platform.
          </p>
        </footer>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-neutral-900 border border-neutral-700/80 text-white text-xs font-medium shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modals */}
        <QrModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          data={activeCard.data}
        />

        <PrintModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          data={activeCard.data}
          config={printConfig}
          onConfigChange={setPrintConfig}
        />

        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          card={activeCard.data}
          theme={activeCard.theme}
        />

        <ScanCardModal
          isOpen={isScanOpen}
          onClose={() => setIsScanOpen(false)}
          onSaveCard={handleSaveCard}
        />

        <DeviceSyncModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
        />

        {editingCard && (
          <CardEditorModal
            isOpen={isEditorOpen}
            onClose={() => {
              setIsEditorOpen(false);
              setEditingCard(null);
              setIsCreatingCard(false);
            }}
            card={editingCard}
            onSave={handleSaveCard}
            isMyCardMode={editingCard.isMyCard || isCreatingCard}
            isCreating={isCreatingCard}
          />
        )}

      </div>

      {/* PRINT-ONLY VECTOR CONTAINER (Triggered on window.print()) */}
      <PrintSheet data={activeCard.data} config={printConfig} />
    </>
  );
}
