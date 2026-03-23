import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

// Shared listener set so all hook instances stay in sync
const _listeners = new Set<(val: boolean) => void>();

export interface OnboardingState {
  hasCompletedOnboarding: boolean | null;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export function useOnboarding(): OnboardingState {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();

    // Subscribe so other instances can notify us of changes
    const listener = (val: boolean) => setHasCompletedOnboarding(val);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      setHasCompletedOnboarding(value === 'true');
    } catch {
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setHasCompletedOnboarding(true);
      // Notify every other hook instance
      _listeners.forEach(fn => fn(true));
    } catch {
      // Silently fail — onboarding state is non-critical
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      setHasCompletedOnboarding(false);
      _listeners.forEach(fn => fn(false));
    } catch {
      // Silently fail
    }
  };

  return {
    hasCompletedOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
} 