import { 
  setSessionLocked, 
  isPinSet, 
  getLastPinVerifiedAt, 
  recordPinVerified 
} from './pinLock';

const BIOMETRIC_CREDENTIAL_KEY = 'app_biometric_credential_id';

// Security Threshold: 7 days without 4-digit PIN verification forces re-authentication
export const SECURITY_THRESHOLD_DAYS = 7;
export const SECURITY_THRESHOLD_MS = SECURITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

export interface BiometricSecurityThresholdStatus {
  isThresholdEnforced: boolean;
  isExpired: boolean;
  lastPinVerifiedAt: number | null;
  daysRemaining: number;
  hoursRemaining: number;
  formattedLastVerified: string;
}

// Base64URL encoding / decoding helpers for WebAuthn ArrayBuffers
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Checks whether the browser and current device hardware support WebAuthn platform biometrics (TouchID, FaceID, Windows Hello, Android Biometrics).
 */
export async function isBiometricSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;

  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    }
  } catch (e) {
    console.warn('Error checking platform authenticator availability', e);
  }
  return false;
}

/**
 * Returns whether biometric authentication has been registered on this device.
 */
export function isBiometricRegistered(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(BIOMETRIC_CREDENTIAL_KEY));
}

/**
 * Returns friendly name for biometric device depending on OS/User Agent.
 */
export function getBiometricLabel(): string {
  if (typeof navigator === 'undefined') return '생체 인증';
  const ua = navigator.userAgent;
  if (/Macintosh|iPhone|iPad|iPod/.test(ua)) {
    return 'Face ID / Touch ID';
  }
  if (/Windows/.test(ua)) {
    return 'Windows Hello';
  }
  if (/Android/.test(ua)) {
    return '지문 / 생체 인식';
  }
  return '지문 / 생체 인증';
}

/**
 * Computes the 7-day Security Threshold status for biometric credentials.
 * If 7 days have passed since the last PIN unlock/verification, biometric credentials are invalidated
 * until the user re-verifies with their 4-digit PIN.
 */
export function getBiometricSecurityThresholdStatus(): BiometricSecurityThresholdStatus {
  if (typeof window === 'undefined') {
    return {
      isThresholdEnforced: false,
      isExpired: false,
      lastPinVerifiedAt: null,
      daysRemaining: SECURITY_THRESHOLD_DAYS,
      hoursRemaining: SECURITY_THRESHOLD_DAYS * 24,
      formattedLastVerified: '기록 없음',
    };
  }

  const pinConfigured = isPinSet();
  if (!pinConfigured) {
    return {
      isThresholdEnforced: false,
      isExpired: false,
      lastPinVerifiedAt: null,
      daysRemaining: SECURITY_THRESHOLD_DAYS,
      hoursRemaining: SECURITY_THRESHOLD_DAYS * 24,
      formattedLastVerified: 'PIN 미설정',
    };
  }

  const lastVerified = getLastPinVerifiedAt();
  if (!lastVerified) {
    return {
      isThresholdEnforced: true,
      isExpired: true,
      lastPinVerifiedAt: null,
      daysRemaining: 0,
      hoursRemaining: 0,
      formattedLastVerified: '인증 필요',
    };
  }

  const elapsedMs = Date.now() - lastVerified;
  const isExpired = elapsedMs >= SECURITY_THRESHOLD_MS;
  const remainingMs = Math.max(0, SECURITY_THRESHOLD_MS - elapsedMs);
  const daysRemaining = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const hoursRemaining = Math.floor(remainingMs / (60 * 60 * 1000));

  const dateObj = new Date(lastVerified);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - dateObj.getTime()) / (24 * 60 * 60 * 1000));

  let formattedLastVerified = '';
  if (diffDays === 0) {
    const diffHours = Math.floor((now.getTime() - dateObj.getTime()) / (60 * 60 * 1000));
    if (diffHours === 0) {
      formattedLastVerified = '방금 전';
    } else {
      formattedLastVerified = `오늘 (${diffHours}시간 전)`;
    }
  } else if (diffDays === 1) {
    formattedLastVerified = '어제';
  } else {
    formattedLastVerified = `${diffDays}일 전 (${dateObj.toLocaleDateString()})`;
  }

  return {
    isThresholdEnforced: true,
    isExpired,
    lastPinVerifiedAt: lastVerified,
    daysRemaining,
    hoursRemaining,
    formattedLastVerified,
  };
}

/**
 * Returns whether the 7-day Security Threshold has expired, requiring 4-digit PIN verification.
 */
export function isBiometricThresholdExpired(): boolean {
  const status = getBiometricSecurityThresholdStatus();
  return status.isThresholdEnforced && status.isExpired;
}

/**
 * Registers biometric authentication (Touch ID, Face ID, Windows Hello) via WebAuthn platform authenticator.
 */
export async function registerBiometric(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { success: false, error: 'WebAuthn 생체 인증을 지원하지 않는 브라우저입니다.' };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new TextEncoder().encode('korean_center_executive_user');

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Korean Center Card Studio',
        id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      },
      user: {
        id: userId,
        name: 'user@koreancenter.net',
        displayName: 'Executive Cardholder',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256 (ECDSA w/ SHA-256)
        { alg: -257, type: 'public-key' }, // RS256 (RSA w/ SHA-256)
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: '생체 인증 등록이 취소되었습니다.' };
    }

    const rawIdBase64 = bufferToBase64Url(credential.rawId);
    localStorage.setItem(BIOMETRIC_CREDENTIAL_KEY, rawIdBase64);

    // Initial registration also marks current timestamp if PIN is already set
    if (isPinSet() && !getLastPinVerifiedAt()) {
      recordPinVerified();
    }

    return { success: true };
  } catch (err: any) {
    console.error('Biometric registration error:', err);
    if (err.name === 'NotAllowedError') {
      return { success: false, error: '사용자가 인증을 취소했거나 권한이 거부되었습니다.' };
    }
    return { success: false, error: err.message || '생체 인증 등록 중 오류가 발생했습니다.' };
  }
}

/**
 * Verifies identity using registered biometric credentials via WebAuthn.
 * Automatically checks and enforces the 7-day Security Threshold: if the device hasn't been unlocked
 * with the 4-digit PIN for > 7 days, biometrics are invalidated until PIN is verified.
 */
export async function verifyBiometric(): Promise<{ 
  success: boolean; 
  error?: string; 
  requiresPinRevalidation?: boolean; 
}> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { success: false, error: 'WebAuthn 생체 인증을 지원하지 않는 브라우저입니다.' };
  }

  const storedRawId = localStorage.getItem(BIOMETRIC_CREDENTIAL_KEY);
  if (!storedRawId) {
    return { success: false, error: '등록된 생체 인증 정보가 없습니다.' };
  }

  // Enforce Security Threshold (7 Days PIN Invalidation Policy)
  const threshold = getBiometricSecurityThresholdStatus();
  if (threshold.isThresholdEnforced && threshold.isExpired) {
    return { 
      success: false, 
      requiresPinRevalidation: true,
      error: '보안 정책(Security Threshold): 7일 이상 4자리 PIN을 입력하지 않아 생체 인증이 만료되었습니다. PIN으로 먼저 재인증해 주세요.' 
    };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credentialIdBuffer = base64UrlToBuffer(storedRawId);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [
        {
          id: credentialIdBuffer,
          type: 'public-key',
        },
      ],
      userVerification: 'required',
      timeout: 60000,
      rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
    };

    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential | null;

    if (assertion) {
      setSessionLocked(false);
      return { success: true };
    }

    return { success: false, error: '인증에 실패했습니다.' };
  } catch (err: any) {
    console.error('Biometric verification error:', err);
    if (err.name === 'NotAllowedError') {
      return { success: false, error: '생체 인증이 취소되었습니다.' };
    }
    return { success: false, error: err.message || '생체 인증 실패' };
  }
}

/**
 * Backward compatibility alias for verifyBiometric
 */
export const authenticateBiometric = verifyBiometric;

/**
 * Removes registered biometric credential.
 */
export function removeBiometric(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BIOMETRIC_CREDENTIAL_KEY);
}
