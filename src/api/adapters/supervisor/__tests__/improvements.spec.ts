import { describe, expect, it } from 'vitest';

import { ImprovementsAdapter } from '../improvements';

describe('Supervisor improvements adapter', () => {
  describe('fromApi', () => {
    it('transforms API data to frontend format', () => {
      const result = ImprovementsAdapter.fromApi({
        yesterday_conversations_count: 42,
        improvements_task: {
          is_running: true,
          progress: 2,
          total: 5,
          created_at: '2026-06-23T12:00:00Z',
        },
        improvements: [
          {
            uuid: 'improvement-uuid-1',
            text: 'Sample improvement text',
            type: 'personality_deviation',
            conversations_count: 12,
          },
        ],
      });

      expect(result).toEqual({
        yesterdayConversationsCount: 42,
        task: {
          isRunning: true,
          progress: 2,
          total: 5,
          createdAt: '2026-06-23T12:00:00Z',
        },
        improvements: [
          {
            uuid: 'improvement-uuid-1',
            text: 'Sample improvement text',
            type: 'personality_deviation',
            conversationsCount: 12,
          },
        ],
      });
    });

    it('returns safe defaults when API fields are missing', () => {
      expect(ImprovementsAdapter.fromApi()).toEqual({
        yesterdayConversationsCount: 0,
        task: null,
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
            type: 'repetitive_response',
            conversations_count: 3,
          },
          {
            uuid: 'missing-text',
            type: 'personality_deviation',
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
          type: 'repetitive_response',
          conversationsCount: 3,
        },
      ]);
    });

    it('defaults improvement conversationsCount to zero when count is missing', () => {
      const result = ImprovementsAdapter.fromApi({
        improvements: [
          {
            uuid: 'uuid-1',
            text: 'Improvement without count',
            type: 'poor_product_search_results',
          },
        ],
      });

      expect(result.improvements[0].conversationsCount).toBe(0);
    });
  });
});
