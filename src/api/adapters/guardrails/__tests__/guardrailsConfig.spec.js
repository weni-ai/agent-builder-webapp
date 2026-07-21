import { describe, expect, it } from 'vitest';

import { GuardrailsConfigAdapter } from '@/api/adapters/guardrails/guardrailsConfig';

describe('GuardrailsConfigAdapter', () => {
  describe('fromApi', () => {
    it('maps snake_case config to camelCase store shape', () => {
      expect(
        GuardrailsConfigAdapter.fromApi({
          categories: [
            {
              slug: 'politics',
              name: 'Politics',
              description: 'Political topics',
              blocked: true,
            },
            {
              slug: 'hate',
              name: 'Hate',
              description: 'Hate speech',
              blocked: false,
            },
          ],
          blocking_message: 'Blocked message',
          writable: true,
        }),
      ).toEqual({
        topics: [
          { id: 'politics', enabled: true },
          { id: 'hate', enabled: false },
        ],
        blockingMessage: 'Blocked message',
        writable: true,
      });
    });

    it('defaults missing fields', () => {
      expect(GuardrailsConfigAdapter.fromApi({})).toEqual({
        topics: [],
        blockingMessage: '',
        writable: false,
      });
    });
  });

  describe('toApi', () => {
    it('maps camelCase update fields to snake_case payload', () => {
      expect(
        GuardrailsConfigAdapter.toApi({
          categoryStates: { politics: false },
          blockingMessage: 'Updated message',
        }),
      ).toEqual({
        category_states: { politics: false },
        blocking_message: 'Updated message',
      });
    });

    it('omits fields that were not provided', () => {
      expect(
        GuardrailsConfigAdapter.toApi({
          categoryStates: { hate: true },
        }),
      ).toEqual({
        category_states: { hate: true },
      });
    });
  });
});
