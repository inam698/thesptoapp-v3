import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/** Must stay in sync with app.json → expo.version */
export const APP_VERSION = '2.1.0';

export interface AppVersionConfig {
  currentVersion: string;
  minimumVersion: string;
  forceUpdate: boolean;
  updateMessage: string;
  updatedAt: string;
}

/** Semver regex: "1.2.3" */
const SEMVER_RE = /^\d+\.\d+\.\d+$/;

/** Returns true if the string looks like a valid semver (e.g. "2.1.0"). */
export function isValidSemver(v: unknown): v is string {
  return typeof v === 'string' && SEMVER_RE.test(v);
}

/**
 * Compare two semver strings. Returns:
 *  -1 if a < b
 *   0 if a == b
 *   1 if a > b
 *
 * Returns 0 (treat as equal / no action needed) when either input is
 * invalid — this is the safest default because it avoids triggering a
 * false force-update that could lock users out.
 */
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  if (!isValidSemver(a) || !isValidSemver(b)) return 0;

  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na < nb) return -1;
    if (na > nb) return 1;
  }
  return 0;
}

/**
 * Validate and sanitise raw Firestore data into a safe AppVersionConfig.
 * Returns null if any required field is missing or has the wrong type.
 */
function validateVersionConfig(data: Record<string, unknown>): AppVersionConfig | null {
  const { currentVersion, minimumVersion, forceUpdate, updateMessage, updatedAt } = data;

  if (!isValidSemver(currentVersion)) return null;
  if (!isValidSemver(minimumVersion)) return null;

  return {
    currentVersion,
    minimumVersion,
    forceUpdate: typeof forceUpdate === 'boolean' ? forceUpdate : false,
    updateMessage: typeof updateMessage === 'string' ? updateMessage : '',
    updatedAt: typeof updatedAt === 'string' ? updatedAt : '',
  };
}

/**
 * Fetch the version config document from Firestore.
 * Returns null if the document doesn't exist, contains invalid data,
 * or on network failure. Never throws.
 */
export async function getVersionConfig(): Promise<AppVersionConfig | null> {
  try {
    const snap = await getDoc(doc(db, 'app_config', 'version'));
    if (!snap.exists()) return null;
    return validateVersionConfig(snap.data());
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Rollout Config  (app_config/rollout)
// ---------------------------------------------------------------------------

export interface RolloutConfig {
  /** Percentage of users that should receive OTA updates (0–100). */
  rolloutPercentage: number;
  /** Kill switch — when true, ALL OTA updates are suppressed. */
  disableUpdates: boolean;
}

const DEFAULT_ROLLOUT: RolloutConfig = {
  rolloutPercentage: 100,
  disableUpdates: false,
};

export async function getRolloutConfig(): Promise<RolloutConfig> {
  try {
    const snap = await getDoc(doc(db, 'app_config', 'rollout'));
    if (!snap.exists()) return DEFAULT_ROLLOUT;
    const data = snap.data();
    return {
      rolloutPercentage:
        typeof data.rolloutPercentage === 'number' &&
        data.rolloutPercentage >= 0 &&
        data.rolloutPercentage <= 100
          ? data.rolloutPercentage
          : 100,
      disableUpdates:
        typeof data.disableUpdates === 'boolean' ? data.disableUpdates : false,
    };
  } catch {
    // On failure, allow updates — safest default for majority of users.
    return DEFAULT_ROLLOUT;
  }
}

/**
 * Deterministic bucket for a user (0–99).
 *
 * Uses a simple string-hash so the same identifier always lands in the
 * same bucket. Works with Firebase UID, anonymous device ID, or any
 * stable string.
 */
export function getUserBucket(identifier: string): number {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash * 31 + identifier.charCodeAt(i)) | 0; // keep 32-bit
  }
  return Math.abs(hash) % 100;
}

// ---------------------------------------------------------------------------
// Feature Flags  (app_config/features)
// ---------------------------------------------------------------------------

export interface FeatureFlags {
  [key: string]: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {};

export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    const snap = await getDoc(doc(db, 'app_config', 'features'));
    if (!snap.exists()) return DEFAULT_FLAGS;
    const data = snap.data();
    // Only accept boolean values — ignore anything else.
    const flags: FeatureFlags = {};
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'boolean') flags[key] = val;
    }
    return flags;
  } catch {
    return DEFAULT_FLAGS;
  }
}
