'use client';

import { useLanguageStore } from '@/lib/store';
import { TranslationKey } from '@/lib/i18n';

export function useTranslation() {
  const { language, setLanguage, t } = useLanguageStore();

  return {
    t,
    language,
    setLanguage,
    /** Shorthand: t('key') directly */
  };
}

export type { TranslationKey };