import { describe, expect, it } from 'vitest';

import { ImprovementsAdapter } from '../improvements';

describe('Supervisor improvements adapter', () => {
  describe('fromApi', () => {
    it('transforms API data to frontend format', () => {
      const result = ImprovementsAdapter.fromApi({
        improvements_task: {
          is_running: true,
          progress: 2,
          total: 5,
        },
        improvements: [
          {
            uuid: 'improvement-uuid-1',
            text: 'Sample improvement text',
            type: 'brand_voice_mismatch',
            conversations_count: 12,
          },
        ],
      });

      expect(result).toEqual({
        task: {
          isRunning: true,
          progress: 2,
          total: 5,
        },
        improvements: [
          {
            uuid: 'improvement-uuid-1',
            text: 'Sample improvement text',
            type: 'brand_voice_mismatch',
            conversationsCount: 12,
          },
        ],
      });
    });

    it('returns safe defaults when API fields are missing', () => {
      expect(ImprovementsAdapter.fromApi()).toEqual({
        task: {
          isRunning: false,
          progress: 0,
          total: 0,
        },
        improvements: [],
      });
    });

    it('filters improvements with invalid or incomplete data', () => {
      const result = ImprovementsAdapter.fromApi({
        improvements_task: {
          is_running: false,
          progress: 5,
          total: 5,
        },
        improvements: [
          {
            uuid: 'valid-uuid',
            text: 'Valid improvement',
            type: 'amazing_conversation',
            conversations_count: 3,
          },
          {
            uuid: 'missing-text',
            type: 'brand_voice_mismatch',
            conversations_count: 1,
          },
          {
            uuid: 'invalid-type',
            text: 'Invalid type',
            type: 'unknown_type',
            conversations_count: 2,
          },
        ],
      });

      expect(result.improvements).toEqual([
        {
          uuid: 'valid-uuid',
          text: 'Valid improvement',
          type: 'amazing_conversation',
          conversationsCount: 3,
        },
      ]);
    });

    it('defaults conversationsCount to zero when count is missing', () => {
      const result = ImprovementsAdapter.fromApi({
        improvements: [
          {
            uuid: 'uuid-1',
            text: 'Improvement without count',
            type: 'catalog_search_mismatch',
          },
        ],
      });

      expect(result.improvements[0].conversationsCount).toBe(0);
    });
  });
});
