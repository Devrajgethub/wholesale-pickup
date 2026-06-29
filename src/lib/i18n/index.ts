import { en, TranslationKey } from './en';
import { hi } from './hi';
import { bn } from './bn';

export type { TranslationKey };

export type Language = 'en' | 'hi' | 'bn';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  hi,
  bn,
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  bn: 'বাংলা',
};
