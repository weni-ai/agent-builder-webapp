import { describe, expect, it } from 'vitest';

import { includesNormalized, normalizeText } from '@/utils/strings';

describe('strings utils', () => {
  describe('normalizeText', () => {
    it('lowercases the value', () => {
      expect(normalizeText('POLICY')).toBe('policy');
    });

    it('strips diacritics', () => {
      expect(normalizeText('Política')).toBe('politica');
    });

    it('returns an empty string for null or undefined', () => {
      expect(normalizeText(null)).toBe('');
      expect(normalizeText(undefined)).toBe('');
    });
  });

  describe('includesNormalized', () => {
    it('matches ignoring case and accents', () => {
      expect(includesNormalized('Política de troca', 'politica')).toBe(true);
    });

    it('matches accented terms against unaccented text', () => {
      expect(includesNormalized('Politica de troca', 'política')).toBe(true);
    });

    it('matches partial substrings', () => {
      expect(includesNormalized('Refund policy', 'pol')).toBe(true);
    });

    it('returns false when the term is not present', () => {
      expect(includesNormalized('Refund policy', 'shipping')).toBe(false);
    });

    it('returns true for an empty term', () => {
      expect(includesNormalized('Anything', '')).toBe(true);
    });

    it('handles null or undefined inputs', () => {
      expect(includesNormalized(null, 'a')).toBe(false);
      expect(includesNormalized('abc', null)).toBe(true);
    });
  });
});
