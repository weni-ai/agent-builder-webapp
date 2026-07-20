import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  formatListToReadable,
  formatWhatsappUrn,
  formatLongDate,
  formatMonthDayDate,
  formatTime,
  getYesterdayFormattedDate,
} from '@/utils/formatters';
import i18n from '@/utils/plugins/i18n';

describe('formatters', () => {
  describe('formatListToReadable', () => {
    it('should handle empty array', () => {
      expect(formatListToReadable([])).toBe('');
    });

    it('should handle single item', () => {
      expect(formatListToReadable(['item1'])).toBe('item1');
    });

    it('should handle multiple items', () => {
      expect(formatListToReadable(['item1', 'item2', 'item3'])).toBe(
        'item1, item2 and item3',
      );
    });

    it('should handle non-array input', () => {
      expect(formatListToReadable(null)).toBe('');
      expect(formatListToReadable(undefined)).toBe('');
      expect(formatListToReadable('string')).toBe('');
    });
  });

  describe('formatWhatsappUrn', () => {
    const validWhatsAppFormats = [
      {
        input: 'whatsapp:5511999887766',
        expected: '+55 (11) 99988-7766',
        description: '9-digit mobile number',
      },
      {
        input: 'whatsapp:551188776655',
        expected: '+55 (11) 8877-6655',
        description: '8-digit landline number',
      },
      {
        input: 'whatsapp:br.27078165145141541',
        expected: 'BR.27078165145141541',
        description: 'BSUID with lowercase country code',
      },
      {
        input: 'whatsapp:US.13491208655302741918',
        expected: 'US.13491208655302741918',
        description: 'BSUID with uppercase country code',
      },
      {
        input: 'whatsapp:us.ent.11815799212886844830',
        expected: 'US.ENT.11815799212886844830',
        description: 'parent BSUID',
      },
    ];

    validWhatsAppFormats.forEach(({ input, expected, description }) => {
      it(`should format ${description} correctly`, () => {
        expect(formatWhatsappUrn(input)).toBe(expected);
      });
    });

    const nonWhatsAppUrns = [
      {
        input: 'telegram:123456789',
        description: 'telegram URN',
      },
      {
        input: 'mailto:user@example.com',
        description: 'email URN',
      },
      {
        input: 'simple-urn-123',
        description: 'plain text URN',
      },
    ];

    nonWhatsAppUrns.forEach(({ input, description }) => {
      it(`should return ${description} unchanged`, () => {
        expect(formatWhatsappUrn(input)).toBe(input);
      });
    });

    const edgeCases = [
      {
        input: 'whatsapp:123',
        expected: 'whatsapp:123',
        description: 'phone number too short',
      },
      {
        input: 'whatsapp:123456789',
        expected: 'whatsapp:123456789',
        description:
          'phone number with exactly 9 digits (less than DDI+DDD+number)',
      },
      {
        input: 'whatsapp:',
        expected: 'whatsapp:',
        description: 'WhatsApp URN with only prefix',
      },
      {
        input: '',
        expected: '',
        description: 'empty string URN',
      },
    ];

    edgeCases.forEach(({ input, expected, description }) => {
      it(`should handle ${description} gracefully`, () => {
        expect(formatWhatsappUrn(input)).toBe(expected);
      });
    });
  });

  describe('formatLongDate', () => {
    const TIMESTAMP = '2026-05-13T15:15:00';

    afterEach(() => {
      i18n.global.locale.value = 'en';
    });

    it('formats the long date', () => {
      expect(formatLongDate(TIMESTAMP)).toBe('May 13, 2026');
    });

    it('falls back to the en pattern for an unmapped locale', () => {
      i18n.global.locale.value = 'unmapped';
      expect(formatLongDate(TIMESTAMP)).toBe('May 13, 2026');
    });

    it('returns an empty string for an invalid date', () => {
      expect(formatLongDate('not-a-date')).toBe('');
    });
  });

  describe('formatMonthDayDate', () => {
    const TIMESTAMP = '2026-05-18T15:15:00';

    afterEach(() => {
      i18n.global.locale.value = 'en';
    });

    it('formats the month and day without the year', () => {
      expect(formatMonthDayDate(TIMESTAMP)).toBe('May 18');
    });

    it('falls back to the en pattern for an unmapped locale', () => {
      i18n.global.locale.value = 'unmapped';
      expect(formatMonthDayDate(TIMESTAMP)).toBe('May 18');
    });

    it('returns an empty string for an invalid date', () => {
      expect(formatMonthDayDate('not-a-date')).toBe('');
    });
  });

  describe('getYesterdayFormattedDate', () => {
    afterEach(() => {
      vi.useRealTimers();
      i18n.global.locale.value = 'en';
    });

    it('formats yesterday relative to the current date', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-18T15:15:00'));

      expect(getYesterdayFormattedDate()).toBe('May 17');
    });

    it('formats yesterday across month boundaries', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-01T15:15:00'));

      expect(getYesterdayFormattedDate()).toBe('April 30');
    });

    it('falls back to the en pattern for an unmapped locale', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-18T15:15:00'));
      i18n.global.locale.value = 'unmapped';

      expect(getYesterdayFormattedDate()).toBe('May 17');
    });
  });

  describe('formatTime', () => {
    const TIMESTAMP = '2026-05-13T15:15:00';

    afterEach(() => {
      i18n.global.locale.value = 'en';
    });

    it('formats the time', () => {
      expect(formatTime(TIMESTAMP)).toBe('3:15 p.m.');
    });

    it('falls back to the en pattern for an unmapped locale', () => {
      i18n.global.locale.value = 'unmapped';
      expect(formatTime(TIMESTAMP)).toBe('3:15 p.m.');
    });

    it('returns an empty string for an invalid date', () => {
      expect(formatTime('not-a-date')).toBe('');
    });
  });
});
