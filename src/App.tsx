/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CardTheme, PrintConfig, StoredCard } from './types/card';
import { loadStoredCards, saveStoredCards } from './utils/initialCards';
import { CardContainer } from './components/CardContainer';
import { MyCardSwitcher } from './components/MyCardSwitcher';
import { ShareModal } from './components/ShareModal';
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
import { PinLockModal, PinModalMode } from './components/PinLockModal';
import { BiometricsSettingModal } from './components/BiometricsSettingModal';
import { useAutoLock } from './hooks/useAutoLock';
import { verifyBiometric } from './utils/biometrics';
import { 
  Check, 
  CreditCard, 
  FolderArchive, 
  ArrowLeft,
  Smartphone,
  Lock,
  ShieldCheck,
  Fingerprint,
  Settings
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
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isScanOpen, setIsScanOpen] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isCreatingCard, setIsCreatingCard] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState<boolean>(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const [editingCard, setEditingCard] = useState<StoredCard | null>(null);

  // Close settings popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };
    if (isSettingsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsMenuOpen]);

  // Local-First 4-Digit PIN App Lock with Auto-Lock (Manual, Visibility, Idle 5m)
  const { isLocked, setIsLocked, lockApp, unlockApp, isPinConfigured, refreshPinStatus } = useAutoLock();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isBiometricsModalOpen, setIsBiometricsModalOpen] = useState<boolean>(false);
  const [pinModalMode, setPinModalMode] = useState<PinModalMode>('setup');

  const requireUnlock = (action: () => void) => {
    if (isPinConfigured && isLocked) {
      lockApp();
    } else {
      action();
    }
  };

  // Optional Biometric Unlock handler
  const handleBiometricUnlock = async () => {
    const res = await verifyBiometric();
    if (res.success) {
      unlockApp();
      showToast('생체 인증(Biometrics)으로 잠금이 해제되었습니다.');
    } else if (res.error && !res.error.includes('취소')) {
      showToast(res.error);
    }
  };

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

  // Create New My Card (Protected by PIN if locked)
  const handleOpenCreateModal = () => {
    requireUnlock(() => {
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
    });
  };

  // Duplicate Current Card as Template (Protected by PIN if locked)
  const handleDuplicateMyCard = (sourceCard: StoredCard) => {
    requireUnlock(() => {
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
    });
  };

  // Set as Primary Default Card
  const handleSetDefaultCard = (id: string) => {
    setCards(prev => prev.map(c => ({
      ...c,
      isDefault: c.id === id
    })));
    showToast('기본 대표 명함으로 지정되었습니다.');
  };

  // Delete Secondary My Card (Protected by PIN if locked)
  const handleDeleteMyCard = (id: string) => {
    requireUnlock(() => {
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
    });
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
        className="min-h-screen bg-[#0B0C10] text-neutral-100 flex flex-col justify-between selection:bg-neutral-100 selection:text-neutral-950 font-sans"
      >
        {/* Top Minimalist Luxury Header */}
        <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0B0C10]/90 backdrop-blur-xl px-4 sm:px-8 py-3 flex items-center justify-between">
          
          {/* Institutional Wordmark */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-white font-sans">
              KOREAN CENTER <span className="text-neutral-400 font-light hidden sm:inline">CARD STUDIO</span>
            </span>
          </div>

          {/* Center Navigation: Segmented Switcher (내 명함 vs 보관함) */}
          <nav className="flex items-center p-1 bg-[#121318] rounded-2xl border border-white/5 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('my-card');
                const defaultCard = myCards.find(c => c.isDefault) || myCards[0];
                if (defaultCard) setActiveCardId(defaultCard.id);
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'my-card'
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>내 명함</span>
            </button>

            <button
              onClick={() => {
                requireUnlock(() => {
                  setActiveTab('vault');
                });
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'vault'
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>명함 보관함</span>
              {isPinConfigured && isLocked && (
                <Lock className="w-3 h-3 text-[#C5A880]" />
              )}
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/40 border border-white/5 text-neutral-400">
                {cards.length}
              </span>
            </button>
          </nav>

          {/* Right Header: Consolidated Security & Settings Popover */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-h-[32px] relative" ref={settingsMenuRef}>
            {/* If PIN configured: Minimalist Lock icon for instant lock */}
            {isPinConfigured && (
              <button
                onClick={() => {
                  lockApp();
                  showToast('화면이 보안 잠금되었습니다.');
                }}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer active:scale-95"
                title="즉시 화면 잠금 (Lock Screen)"
                aria-label="화면 잠금"
              >
                <Lock className="w-4 h-4 text-[#C5A880]" />
              </button>
            )}

            {/* Consolidated Settings Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all cursor-pointer active:scale-95"
                title="보안 및 기기 설정"
                aria-label="설정 메뉴"
              >
                <Settings className="w-4 h-4" />
              </button>

              {isSettingsMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#121318] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  <button
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      setPinModalMode(isPinConfigured ? 'change' : 'setup');
                      setIsConfigModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{isPinConfigured ? 'PIN 번호 변경 / 관리' : '4자리 PIN 보안 설정'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      setIsBiometricsModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Fingerprint className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>생체 인증 (Face ID / 지문)</span>
                  </button>

                  <div className="my-1 border-t border-white/5" />

                  <button
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      setIsSyncModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>기기 연결 및 동기화</span>
                  </button>
                </div>
              )}
            </div>
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
                  onOpenShare={() => setIsShareModalOpen(true)}
                  onOpenEdit={() => {
                    requireUnlock(() => {
                      setEditingCard(activeCard);
                      setIsCreatingCard(false);
                      setIsEditorOpen(true);
                    });
                  }}
                />
              </div>
            </div>
          ) : (
            /* ================= VIEW 2: THE VAULT (CARD / LIST) ================= */
            <VaultView
              cards={cards}
              isLocked={isPinConfigured && isLocked}
              onUnlockRequest={() => {
                lockApp();
              }}
              onSelectCard={(selected) => {
                setActiveCardId(selected.id);
                setActiveTab('my-card');
              }}
              onEditCard={(cardToEdit) => {
                requireUnlock(() => {
                  setEditingCard(cardToEdit);
                  setIsCreatingCard(false);
                  setIsEditorOpen(true);
                });
              }}
              onDeleteCard={(id) => {
                requireUnlock(() => {
                  handleDeleteCard(id);
                });
              }}
              onExportCard={(cardToExport) => {
                setActiveCardId(cardToExport.id);
                setIsExportOpen(true);
              }}
              onOpenScan={() => {
                requireUnlock(() => {
                  setIsScanOpen(true);
                });
              }}
              onOpenSync={() => setIsSyncModalOpen(true)}
              onOpenEditor={() => {
                requireUnlock(() => {
                  setEditingCard(activeCard);
                  setIsCreatingCard(false);
                  setIsEditorOpen(true);
                });
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
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          data={activeCard.data}
          onOpenPrint={() => setIsPrintOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
        />

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

        {/* Fullscreen Lock Screen Overlay when app is locked */}
        <PinLockModal
          isOpen={isLocked && isPinConfigured}
          mode="unlock"
          allowCancel={false}
          onUnlock={() => {
            unlockApp();
            showToast('보안 잠금이 해제되었습니다.');
          }}
          onBiometricUnlock={handleBiometricUnlock}
        />

        {/* PIN Configuration Modal (Setup / Change / Disable) */}
        <PinLockModal
          isOpen={isConfigModalOpen}
          mode={pinModalMode}
          allowCancel={true}
          onClose={() => setIsConfigModalOpen(false)}
          onSuccess={() => {
            refreshPinStatus();
            showToast(pinModalMode === 'setup' ? '4자리 PIN 잠금이 설정되었습니다.' : 'PIN 번호가 성공적으로 변경되었습니다.');
          }}
        />

        {/* Dedicated Register Biometrics UI Setting Modal */}
        <BiometricsSettingModal
          isOpen={isBiometricsModalOpen}
          onClose={() => setIsBiometricsModalOpen(false)}
          onOpenPinSetup={() => {
            setPinModalMode(isPinConfigured ? 'change' : 'setup');
            setIsConfigModalOpen(true);
          }}
          onStatusChange={() => {
            refreshPinStatus();
          }}
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
