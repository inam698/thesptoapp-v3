import { useTranslation } from 'react-i18next';
import { AVAILABLE_LANGUAGES, setAppLanguage } from '@/lib/i18n';
import { useCallback } from 'react';

export function useLanguage() {
  const { t, i18n } = useTranslation();

  const setLanguage = useCallback(
    async (code: string) => {
      await setAppLanguage(code);
    },
    []
  );

  return {
    t,
    language: i18n.language,
    setLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
  };
}
