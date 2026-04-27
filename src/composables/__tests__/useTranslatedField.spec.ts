import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

import useTranslatedField, { TranslatedField } from '../useTranslatedField';

const mockLocale = ref('en');

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: mockLocale,
  }),
}));

describe('useTranslatedField', () => {
  beforeEach(() => {
    mockLocale.value = 'en';
    vi.clearAllMocks();
  });

  describe('when field is nullish', () => {
    it('returns undefined when field is null', () => {
      const getTranslatedField = useTranslatedField();

      expect(getTranslatedField(null)).toBeUndefined();
    });

    it('returns undefined when field is undefined', () => {
      const getTranslatedField = useTranslatedField();

      expect(getTranslatedField(undefined)).toBeUndefined();
    });
  });

  describe('when locale is "en"', () => {
    beforeEach(() => {
      mockLocale.value = 'en';
    });

    it('returns English value', () => {
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField = {
        en: 'Hello',
        pt: 'Olá',
        es: 'Hola',
      };

      expect(getTranslatedField(field)).toBe('Hello');
    });

    it('returns English value even when it is the fallback', () => {
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField = {
        en: 'Hello',
        pt: null,
        es: null,
      };

      expect(getTranslatedField(field)).toBe('Hello');
    });
  });

  describe('when locale is "pt-br"', () => {
    beforeEach(() => {
      mockLocale.value = 'pt-br';
    });

    it('returns Portuguese value', () => {
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField = {
        en: 'Hello',
        pt: 'Olá',
        es: 'Hola',
      };

      expect(getTranslatedField(field)).toBe('Olá');
    });

    it('falls back to English when Portuguese value is null', () => {
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField = {
        en: 'Hello',
        pt: null,
        es: 'Hola',
      };

      expect(getTranslatedField(field)).toBe('Hello');
    });

    it('falls back to English when Portuguese value is empty string', () => {
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField = {
        en: 'Hello',
        pt: '',
        es: 'Hola',
      };

      expect(getTranslatedField(field)).toBe('Hello');
    });
  });

  describe('when locale is "es"', () => {
    beforeEach(() => {
      mockLocale.value = 'es';
    });

    it('returns Spanish value', () => {
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField = {
        en: 'Hello',
        pt: 'Olá',
        es: 'Hola',
      };

      expect(getTranslatedField(field)).toBe('Hola');
    });

    it('falls back to English when Spanish value is null', () => {
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField = {
        en: 'Hello',
        pt: 'Olá',
        es: null,
      };

      expect(getTranslatedField(field)).toBe('Hello');
    });

    it('falls back to English when Spanish value is empty string', () => {
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField = {
        en: 'Hello',
        pt: 'Olá',
        es: '',
      };

      expect(getTranslatedField(field)).toBe('Hello');
    });
  });

  describe('with generic types', () => {
    it('works with array types', () => {
      mockLocale.value = 'en';
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField<string[]> = {
        en: ['item1', 'item2'],
        pt: ['item1-pt', 'item2-pt'],
        es: null,
      };

      expect(getTranslatedField(field)).toEqual(['item1', 'item2']);
    });

    it('falls back to English when array is empty', () => {
      mockLocale.value = 'pt-br';
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField<string[]> = {
        en: ['item1', 'item2'],
        pt: [],
        es: null,
      };

      expect(getTranslatedField(field)).toEqual(['item1', 'item2']);
    });

    it('works with number types', () => {
      mockLocale.value = 'es';
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField<number> = {
        en: 100,
        pt: 200,
        es: 300,
      };

      expect(getTranslatedField(field)).toBe(300);
    });

    it('works with object types', () => {
      mockLocale.value = 'pt-br';
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField<{ name: string }> = {
        en: { name: 'English' },
        pt: { name: 'Portuguese' },
        es: { name: 'Spanish' },
      };

      expect(getTranslatedField(field)).toEqual({ name: 'Portuguese' });
    });
  });

  describe('edge cases', () => {
    it('returns English fallback when all locale values are null except English', () => {
      mockLocale.value = 'es';
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField = {
        en: 'Fallback',
        pt: null,
        es: null,
      };

      expect(getTranslatedField(field)).toBe('Fallback');
    });

    it('returns English value (null) when English is also null', () => {
      mockLocale.value = 'pt-br';
      const getTranslatedField = useTranslatedField();
      const field: TranslatedField = {
        en: null,
        pt: null,
        es: 'Hola',
      };

      expect(getTranslatedField(field)).toBeNull();
    });
  });
});
