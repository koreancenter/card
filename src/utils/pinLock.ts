// SHA-256 helper using browser Web Crypto API
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`goguma_card_pin_${pin}_salt`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const PIN_STORAGE_KEY = 'app_pin_hash';
const SESSION_LOCK_KEY = 'app_session_locked';
export const PIN_LAST_VERIFIED_KEY = 'app_pin_last_verified_at';

/**
 * Records the current timestamp as the last PIN verification time
 */
export function recordPinVerified(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PIN_LAST_VERIFIED_KEY, Date.now().toString());
}

/**
 * Gets the timestamp when the PIN was last verified/unlocked
 */
export function getLastPinVerifiedAt(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PIN_LAST_VERIFIED_KEY);
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Returns the stored SHA-256 PIN hash or null
 */
export function getStoredPinHash(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PIN_STORAGE_KEY);
}

/**
 * Returns whether a 4-digit PIN lock has been set by the user
 */
export function isPinSet(): boolean {
  return Boolean(getStoredPinHash());
}

/**
 * Saves a new 4-digit PIN after hashing
 */
export async function setAppPin(pin: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_STORAGE_KEY, hash);
  recordPinVerified();
  setSessionLocked(false);
}

/**
 * Verifies entered PIN against stored hash
 */
export async function verifyPin(pin: string): Promise<boolean> {
  const stored = getStoredPinHash();
  if (!stored) return true; // No PIN set
  const enteredHash = await hashPin(pin);
  const matched = stored === enteredHash;
  if (matched) {
    recordPinVerified();
    setSessionLocked(false);
  }
  return matched;
}

/**
 * Removes the PIN configuration (disables PIN lock)
 */
export function clearAppPin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PIN_STORAGE_KEY);
  localStorage.removeItem(PIN_LAST_VERIFIED_KEY);
  setSessionLocked(false);
}

/**
 * Checks if the current session is locked.
 * Defaults to true if a PIN is set and session has not been explicitly unlocked.
 */
export function getSessionLocked(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isPinSet()) return false;
  const sessionVal = sessionStorage.getItem(SESSION_LOCK_KEY);
  return sessionVal !== 'unlocked';
}

/**
 * Alias for getSessionLocked
 */
export const getSessionLockState = getSessionLocked;

/**
 * Sets current runtime unlock status in sessionStorage
 */
export function setSessionLocked(locked: boolean): void {
  if (typeof window === 'undefined') return;
  if (locked) {
    sessionStorage.setItem(SESSION_LOCK_KEY, 'locked');
  } else {
    sessionStorage.setItem(SESSION_LOCK_KEY, 'unlocked');
  }
}

/**
 * Alias for setSessionLocked
 */
export const setSessionLockState = setSessionLocked;
