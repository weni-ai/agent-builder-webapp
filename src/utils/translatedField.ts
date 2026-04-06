import i18n from '@/utils/plugins/i18n';

export type TranslatedField<T = string> = {
  en: T | null;
  pt: T | null;
  es: T | null;
};

function getCurrentLocaleKey(): keyof TranslatedField {
  const locale = i18n.global.locale as string;
  if (locale === 'pt-br') return 'pt';
  return locale as keyof TranslatedField;
}

function isEmpty(value: unknown): boolean {
  if (value == null || value === '') return true;
  return Array.isArray(value) && value.length === 0;
}

export function getTranslatedField<T>(
  field: TranslatedField<T> | undefined | null,
): T | undefined {
  if (!field) return undefined;

  const value = field[getCurrentLocaleKey()];

  return isEmpty(value) ? field.en : value;
}
