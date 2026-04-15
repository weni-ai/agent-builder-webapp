import { useI18n } from 'vue-i18n';

export type TranslatedField<T = string> = {
  en: T | null;
  pt: T | null;
  es: T | null;
};

function isEmpty(value: unknown): boolean {
  if (value == null || value === '') return true;
  return Array.isArray(value) && value.length === 0;
}

export default function useTranslatedField() {
  const { locale } = useI18n();

  return <T>(field: TranslatedField<T> | undefined | null): T | undefined => {
    if (!field) return undefined;

    const key = locale.value === 'pt-br' ? 'pt' : locale.value;
    const value = field[key as keyof TranslatedField<T>];

    return isEmpty(value) ? field.en : (value as T);
  };
}
