import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@spotapp_cache:';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

/**
 * Read cached data from AsyncStorage, returning null if expired or missing.
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
    if (isExpired) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Write data to AsyncStorage with a TTL.
 */
export async function setCache(key: string, data: unknown, ttlMs: number = DEFAULT_TTL_MS): Promise<void> {
  try {
    const entry: CacheEntry<unknown> = {
      data,
      timestamp: Date.now(),
      ttlMs,
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Silently fail — cache is best-effort
  }
}

/**
 * Check whether the cached entry for a key still has a valid TTL.
 */
export async function isCacheValid(key: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return false;

    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return Date.now() - entry.timestamp <= entry.ttlMs;
  } catch {
    return false;
  }
}

/**
 * Remove a specific cache entry.
 */
export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // Silently fail
  }
}
