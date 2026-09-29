import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  Check, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Smartphone, 
  Trash2, 
  RefreshCw,
  Lock,
  ArrowRight,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { 
  isBiometricSupported, 
  isBiometricRegistered, 
  registerBiometric, 
  verifyBiometric, 
  removeBiometric, 
  getBiometricLabel,
  getBiometricSecurityThresholdStatus,
  SECURITY_THRESHOLD_DAYS,
  BiometricSecurityThresholdStatus
} from '../utils/biometrics';
import { isPinSet } from '../utils/pinLock';

interface BiometricsSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPinSetup?: () => void;
  onStatusChange?: () => void;
}

export const BiometricsSettingModal: React.FC<BiometricsSettingModalProps> = ({
  isOpen,
  onClose,
  onOpenPinSetup,
  onStatusChange,
}) => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [biometricLabel, setBiometricLabel] = useState<string>('Face ID / Touch ID');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [thresholdStatus, setThresholdStatus] = useState<BiometricSecurityThresholdStatus | null>(null);

  const refreshAllStatus = () => {
    setHasPin(isPinSet());
    setBiometricLabel(getBiometricLabel());
    setIsRegistered(isBiometricRegistered());
    setThresholdStatus(getBiometricSecurityThresholdStatus());

    isBiometricSupported().then((supported) => {
      setIsSupported(supported);
    });
  };

  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
      setIsLoading(false);
      refreshAllStatus();
    }
  }, [isOpen]);

  const handleRegister = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await registerBiometric();
      if (res.success) {
        setIsRegistered(true);
        refreshAllStatus();
        setStatusMessage({
          type: 'success',
          text: `${biometricLabel} 등록이 완료되었습니다. 공개 키 크레덴셜이 로컬에 안전하게 저장되었습니다.`
        });
        if (onStatusChange) onStatusChange();
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || '생체 인증 등록 중 문제가 발생했습니다.'
        });
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: e.message || '등록 실패'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestVerify = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await verifyBiometric();
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `인증 성공: ${biometricLabel} 및 보안 임계치가 정상적으로 작동합니다.`
        });
      } else {
        if (!res.error?.includes('취소')) {
          setStatusMessage({
            type: 'error',
            text: res.error || '인증에 실패했습니다.'
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    removeBiometric();
    setIsRegistered(false);
    refreshAllStatus();
    setStatusMessage({
      type: 'info',
      text: '생체 인증 크레덴셜이 기기에서 삭제되었습니다.'
    });
    if (onStatusChange) onStatusChange();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#16181D] border border-white/10 text-neutral-100 shadow-2xl p-6 sm:p-7 flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C5A880] shadow-inner shrink-0">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>생체 인증 설정</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30">
                WebAuthn
              </span>
            </h3>
            <p className="text-xs text-white/60">
              디바이스 하드웨어 센서를 통한 안전한 원터치 잠금 해제
            </p>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`mb-4 p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
              : 'bg-neutral-800/80 border-neutral-700 text-neutral-300'
          }`}>
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            ) : (
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#C5A880] mt-0.5" />
            )}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* Security Threshold Card (7-day Invalidation Policy) */}
        <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>보안 임계치 (Security Threshold)</span>
            </span>
            {thresholdStatus?.isExpired ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                <ShieldAlert className="w-3 h-3" /> 임계치 초과 (만료)
              </span>
            ) : thresholdStatus?.isThresholdEnforced ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <Check className="w-3 h-3" /> 유효 (D-{thresholdStatus.daysRemaining})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                PIN 설정 대기
              </span>
            )}
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
            기기 보안을 위해 <strong className="text-neutral-200">7일 이상 4자리 PIN을 입력하지 않으면</strong> 생체 크레덴셜이 자동 무효화되며, PIN으로 재인증해야 다시 생체 인증이 활성화됩니다.
          </p>

          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs mb-3">
            <div>
              <span className="text-[10px] text-neutral-500 block mb-0.5">마지막 PIN 인증</span>
              <span className="text-xs font-medium text-neutral-200">
                {thresholdStatus?.formattedLastVerified || '기록 없음'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block mb-0.5">PIN 재인증 유효 기간</span>
              <span className={`text-xs font-semibold ${
                thresholdStatus?.isExpired ? 'text-rose-400' : 'text-[#C5A880]'
              }`}>
                {thresholdStatus?.isExpired 
                  ? '만료됨 (PIN 인증 필요)' 
                  : `${thresholdStatus?.daysRemaining ?? 7}일 남음`}
              </span>
            </div>
          </div>

          {thresholdStatus?.isExpired && onOpenPinSetup && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPinSetup();
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>지금 PIN 입력하여 생체 인증 재활성화</span>
            </button>
          )}
        </div>

        {/* Support Check / Platform Authenticator Card */}
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">인식 플랫폼 하드웨어</span>
            {isSupported ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <Check className="w-3 h-3" /> 지원됨
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <AlertCircle className="w-3 h-3" /> 하드웨어 미확인
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#C5A880]" />
            <span>{biometricLabel}</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
            {isSupported
              ? '브라우저 및 기기(Touch ID, Face ID, Windows Hello 등)의 보안 엔클레이브를 활용할 수 있습니다.'
              : '현재 브라우저 또는 환경에서 플랫폼 생체 인증 센서가 감지되지 않았습니다. HTTPS 및 지원 브라우저를 확인하세요.'}
          </p>
        </div>

        {/* Registration Card & Action */}
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-neutral-400 font-medium">등록 상태</span>
            {isRegistered ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <Check className="w-3 h-3" /> 등록 완료
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 bg-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-700">
                미등록
              </span>
            )}
          </div>

          {isRegistered ? (
            <div className="space-y-3">
              <p className="text-xs text-neutral-300 leading-relaxed">
                공개 키 크레덴셜이 이 기기 브라우저에 안전하게 저장되어 있습니다. 잠금 화면에서 언제든 <strong className="text-white font-semibold">Use Biometrics</strong> 버튼으로 잠금을 해제할 수 있습니다.
              </p>
              
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestVerify}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>인증 테스트</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-rose-500/20 border border-neutral-700 hover:border-rose-500/40 text-neutral-400 hover:text-rose-400 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  title="생체 인증 크레덴셜 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>해제</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-neutral-400 mb-3.5 leading-relaxed">
                아래 버튼을 눌러 기기의 지문 센서나 안면 인식을 등록하세요. 서버 전송 없이 로컬에서만 암호화 인증됩니다.
              </p>
              <button
                type="button"
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#C5A880] hover:bg-[#d6b991] active:bg-[#b0936b] text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#C5A880]/15 active:scale-98"
              >
                <Fingerprint className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
                <span>{isLoading ? '인증 진행 중...' : 'Register Biometrics (생체 인증 등록)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* PIN Master Key Backup Status */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#C5A880]" />
            <div>
              <div className="text-xs font-semibold text-white">4자리 PIN 마스터 백업</div>
              <div className="text-[11px] text-white/50">
                {hasPin ? 'PIN 번호가 설정되어 있습니다.' : '생체 인식 실패 시 사용할 PIN을 먼저 설정하세요.'}
              </div>
            </div>
          </div>
          {onOpenPinSetup && (
            <button
              onClick={() => {
                onClose();
                onOpenPinSetup();
              }}
              className="text-xs text-[#C5A880] hover:underline font-medium flex items-center gap-1 shrink-0 ml-2"
            >
              <span>{hasPin ? 'PIN 변경' : 'PIN 설정'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
