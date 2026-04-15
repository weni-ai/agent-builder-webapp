import { describe, expect, it } from 'vitest';
import { mapLegacyPersonality } from '@/utils/mapLegacyPersonality';

describe('mapLegacyPersonality', () => {
  describe('maps legacy values to new keys', () => {
    const legacyMappings = [
      { legacy: 'Amigável', expected: 'friendly' },
      { legacy: 'Cooperativo', expected: 'friendly' },
      { legacy: 'Generoso', expected: 'friendly' },
      { legacy: 'Organizado', expected: 'systematic' },
      { legacy: 'Sistemático', expected: 'systematic' },
      { legacy: 'Intelectual', expected: 'analytical' },
      { legacy: 'Criativo', expected: 'creative' },
      { legacy: 'Inovador', expected: 'creative' },
      { legacy: 'Extrovertido', expected: 'casual' },
      { legacy: 'Relaxado', expected: 'casual' },
    ];

    legacyMappings.forEach(({ legacy, expected }) => {
      it(`maps "${legacy}" to "${expected}"`, () => {
        expect(mapLegacyPersonality(legacy)).toBe(expected);
      });
    });
  });

  describe('case-insensitive matching', () => {
    it('maps uppercase input correctly', () => {
      expect(mapLegacyPersonality('AMIGÁVEL')).toBe('friendly');
    });

    it('maps lowercase input correctly', () => {
      expect(mapLegacyPersonality('amigável')).toBe('friendly');
    });

    it('maps mixed-case input correctly', () => {
      expect(mapLegacyPersonality('sIsTemÁtIcO')).toBe('systematic');
    });
  });

  describe('trims whitespace', () => {
    it('handles leading and trailing spaces', () => {
      expect(mapLegacyPersonality('  Criativo  ')).toBe('creative');
    });
  });

  describe('passes through non-legacy values', () => {
    const newKeys = [
      'friendly',
      'systematic',
      'analytical',
      'creative',
      'casual',
    ];

    newKeys.forEach((key) => {
      it(`passes through new key "${key}" unchanged`, () => {
        expect(mapLegacyPersonality(key)).toBe(key);
      });
    });

    it('passes through unknown strings unchanged', () => {
      expect(mapLegacyPersonality('unknown-value')).toBe('unknown-value');
    });
  });

  describe('handles falsy and empty values', () => {
    it('returns empty string as-is', () => {
      expect(mapLegacyPersonality('')).toBe('');
    });
  });
});
