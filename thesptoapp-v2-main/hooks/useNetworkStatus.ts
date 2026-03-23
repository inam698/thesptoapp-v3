import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

const PING_URL = 'https://clients3.google.com/generate_204';
const CHECK_INTERVAL_MS = 30_000; // Re-check every 30 seconds

/**
 * Lightweight connectivity detector.
 * Uses a small HTTP fetch instead of expo-network to avoid adding a native dependency.
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnectivity = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch(PING_URL, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnectivity();

    // Periodic polling
    intervalRef.current = setInterval(checkConnectivity, CHECK_INTERVAL_MS);

    // Re-check when app comes to foreground
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        checkConnectivity();
      }
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      subscription.remove();
    };
  }, []);

  return { isConnected };
}
