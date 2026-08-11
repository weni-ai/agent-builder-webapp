import { describe, expect, it } from 'vitest';

import { PromptInjectionFilterAdapter } from '@/api/adapters/guardrails/promptInjectionFilter';

describe('PromptInjectionFilterAdapter', () => {
  describe('fromApi', () => {
    it('maps enabled and strips writable', () => {
      expect(
        PromptInjectionFilterAdapter.fromApi({
          enabled: true,
          writable: true,
        }),
      ).toEqual({
        enabled: true,
      });
    });

    it('coerces enabled to boolean and defaults missing fields', () => {
      expect(PromptInjectionFilterAdapter.fromApi({})).toEqual({
        enabled: false,
      });
      expect(PromptInjectionFilterAdapter.fromApi({ enabled: 1 })).toEqual({
        enabled: true,
      });
    });
  });

  describe('toApi', () => {
    it('maps enabled to the API payload', () => {
      expect(PromptInjectionFilterAdapter.toApi({ enabled: false })).toEqual({
        enabled: false,
      });
    });
  });
});
