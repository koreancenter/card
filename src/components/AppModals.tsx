import React from 'react';
import { StoredCard, PrintConfig } from '../types/card';
import { ModalManager } from '../hooks/useModalState';
import { ShareModal } from './ShareModal';
import { QrModal } from './QrModal';
import { PrintModal } from './PrintModal';
import { ExportModal } from './ExportModal';
import { PhotoArchiveModal } from './PhotoArchiveModal';
import { CardEditorModal } from './CardEditorModal';
import { DeviceSyncModal } from './DeviceSyncModal';
import { PinLockModal } from './PinLockModal';
import { BiometricsSettingModal } from './BiometricsSettingModal';
import { LazyPinSetupModal } from './LazyPinSetupModal';
import { LegalModal } from './LegalModal';
import { ResetDataModal } from './ResetDataModal';
import { loadUserCards } from '../utils/initialCards';
import { getCardShareUrl } from '../utils/domain';

export interface AppModalsProps {
  modals: ModalManager;
  activeCard?: StoredCard;
  isOwner: boolean;
  printConfig: PrintConfig;
  setPrintConfig: React.Dispatch<React.SetStateAction<PrintConfig>>;
  onSaveCard: (card: StoredCard) => void;
  onConfirmReset: () => void;
  isLocked: boolean;
  isPinConfigured: boolean;
  unlockApp: () => void;
  refreshPinStatus: () => void;
  setCards: React.Dispatch<React.SetStateAction<StoredCard[]>>;
  showToast: (msg: string) => void;
  onBiometricUnlock: () => void;
}

/**
 * AppModals
 * Centralized declarative container for all application modals.
 * Decouples modal orchestration and lifecycle from App.tsx layout shell.
 */
export const AppModals: React.FC<AppModalsProps> = ({
  modals,
  activeCard,
  isOwner,
  printConfig,
  setPrintConfig,
  onSaveCard,
  onConfirmReset,
  isLocked,
  isPinConfigured,
  unlockApp,
  refreshPinStatus,
  setCards,
  showToast,
  onBiometricUnlock,
}) => {
  return (
    <>
      {/* Modals (Owner Mode Only) */}
      {isOwner && activeCard && (
        <>
          <ShareModal
            isOpen={modals.isShareOpen}
            onClose={modals.closeShare}
            data={activeCard.data}
            cardUrl={getCardShareUrl(activeCard)}
            onOpenPrint={modals.openPrint}
            onOpenExport={modals.openExport}
          />

          <QrModal
            isOpen={modals.isQrOpen}
            onClose={modals.closeQr}
            data={activeCard.data}
          />

          <PrintModal
            isOpen={modals.isPrintOpen}
            onClose={modals.closePrint}
            data={activeCard.data}
            config={printConfig}
            onConfigChange={setPrintConfig}
          />

          <ExportModal
            isOpen={modals.isExportOpen}
            onClose={modals.closeExport}
            card={activeCard.data}
            theme={activeCard.theme}
            slug={activeCard.slug}
          />
        </>
      )}

      {/* Photo Archiving & Card Scan Modal */}
      <PhotoArchiveModal
        isOpen={modals.isScanOpen}
        onClose={modals.closeScan}
        onSaveCard={onSaveCard}
      />

      {/* Device Cross-Sync Modal */}
      <DeviceSyncModal
        isOpen={modals.isSyncOpen}
        onClose={modals.closeSync}
      />

      {/* Fullscreen Lock Screen Overlay when app is locked */}
      <PinLockModal
        isOpen={isLocked && isPinConfigured}
        mode="unlock"
        allowCancel={false}
        onUnlock={() => {
          unlockApp();
          const decrypted = loadUserCards();
          if (decrypted && decrypted.length > 0) {
            setCards(decrypted);
          }
          showToast('보안 잠금이 해제되었습니다.');
        }}
        onBiometricUnlock={onBiometricUnlock}
      />

      {/* PIN Configuration Modal (Setup / Change / Disable) */}
      <PinLockModal
        isOpen={modals.isPinConfigOpen}
        mode={modals.pinModalMode}
        allowCancel={true}
        onClose={modals.closePinConfig}
        onSuccess={() => {
          refreshPinStatus();
          const decrypted = loadUserCards();
          if (decrypted && decrypted.length > 0) {
            setCards(decrypted);
          }
          showToast(
            modals.pinModalMode === 'setup'
              ? '4자리 PIN 잠금이 설정되었습니다.'
              : 'PIN 번호가 성공적으로 변경되었습니다.'
          );
        }}
      />

      {/* Dedicated Register Biometrics UI Setting Modal */}
      <BiometricsSettingModal
        isOpen={modals.isBiometricsOpen}
        onClose={modals.closeBiometrics}
        onOpenPinSetup={() => {
          modals.openPinConfig(isPinConfigured ? 'change' : 'setup');
        }}
        onStatusChange={() => {
          refreshPinStatus();
        }}
      />

      {/* Lazy PIN Setup Modal (triggers only after user creates and saves first card) */}
      <LazyPinSetupModal
        isOpen={modals.isLazyPinOpen}
        onClose={() => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('lazy_pin_dismissed', 'true');
          }
          modals.closeLazyPin();
          showToast('설정 메뉴에서 언제든 4자리 PIN을 설정할 수 있습니다.');
        }}
        onProceedSetup={() => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('lazy_pin_dismissed', 'true');
          }
          modals.closeLazyPin();
          modals.openPinConfig('setup');
        }}
      />

      {/* Legal Disclosures Modal (Privacy Policy & Terms of Service) */}
      <LegalModal
        isOpen={modals.isLegalOpen}
        initialDoc={modals.legalDocType}
        onClose={modals.closeLegal}
      />

      {/* Local Data Reset Confirmation Modal */}
      <ResetDataModal
        isOpen={modals.isResetOpen}
        onClose={modals.closeReset}
        onConfirmReset={onConfirmReset}
      />

      {/* Multi-mode Card Editor Modal */}
      {modals.editingCard && (
        <CardEditorModal
          isOpen={modals.isEditorOpen}
          onClose={modals.closeEditor}
          card={modals.editingCard}
          onSave={onSaveCard}
          isMyCardMode={modals.editingCard.isMyCard || modals.isCreatingCard}
          isCreating={modals.isCreatingCard}
        />
      )}
    </>
  );
};
