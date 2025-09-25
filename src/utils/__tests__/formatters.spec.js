import { describe, it, expect } from 'vitest';
import { formatListToReadable, formatWhatsappUrn } from '@/utils/formatters';

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
});
