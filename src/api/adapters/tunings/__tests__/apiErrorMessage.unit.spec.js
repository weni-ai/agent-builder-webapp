import { describe, it, expect } from 'vitest';

import { ApiErrorMessageAdapter } from '@/api/adapters/tunings/apiErrorMessage';

describe('ApiErrorMessageAdapter', () => {
  describe('fromApi', () => {
    it('maps error_message to errorMessage', () => {
      expect(
        ApiErrorMessageAdapter.fromApi({
          error_message: 'Custom error',
        }),
      ).toEqual({
        errorMessage: 'Custom error',
      });
    });
  });

  describe('toApi', () => {
    it('maps errorMessage to error_message', () => {
      expect(
        ApiErrorMessageAdapter.toApi({
          errorMessage: 'Custom error',
        }),
      ).toEqual({
        error_message: 'Custom error',
      });
    });

    it('normalizes empty string to null', () => {
      expect(
        ApiErrorMessageAdapter.toApi({
          errorMessage: '',
        }),
      ).toEqual({
        error_message: null,
      });
    });

    it('normalizes whitespace-only string to null', () => {
      expect(
        ApiErrorMessageAdapter.toApi({
          errorMessage: '   ',
        }),
      ).toEqual({
        error_message: null,
      });
    });

    it('trims surrounding whitespace before saving', () => {
      expect(
        ApiErrorMessageAdapter.toApi({
          errorMessage: '  Custom error  ',
        }),
      ).toEqual({
        error_message: 'Custom error',
      });
    });
  });
});
