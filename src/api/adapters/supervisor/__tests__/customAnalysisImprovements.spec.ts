import { describe, expect, it } from 'vitest';

import { CustomAnalysisImprovementsAdapter } from '../customAnalysisImprovements';

describe('Supervisor custom analysis improvements adapter', () => {
  describe('fromApiList', () => {
    it('transforms API list data to frontend format', () => {
      const result = CustomAnalysisImprovementsAdapter.fromApiList([
        {
          uuid: 'custom-analysis-uuid-1',
          title: 'Unrealistic delivery deadlines',
          conversations_count: 5,
        },
      ]);

      expect(result).toEqual([
        {
          uuid: 'custom-analysis-uuid-1',
          title: 'Unrealistic delivery deadlines',
          conversationsCount: 5,
        },
      ]);
    });

    it('returns an empty array when API data is missing', () => {
      expect(CustomAnalysisImprovementsAdapter.fromApiList()).toEqual([]);
    });

    it('filters items with invalid or incomplete data', () => {
      const result = CustomAnalysisImprovementsAdapter.fromApiList([
        {
          uuid: 'valid-uuid',
          title: 'Valid custom analysis',
          conversations_count: 2,
        },
        {
          uuid: 'missing-title',
          conversations_count: 1,
        },
        {
          title: 'Missing uuid',
          conversations_count: 3,
        },
      ]);

      expect(result).toEqual([
        {
          uuid: 'valid-uuid',
          title: 'Valid custom analysis',
          conversationsCount: 2,
        },
      ]);
    });

    it('defaults conversationsCount to zero when count is missing', () => {
      const result = CustomAnalysisImprovementsAdapter.fromApiList([
        {
          uuid: 'uuid-1',
          title: 'Custom analysis without count',
        },
      ]);

      expect(result[0].conversationsCount).toBe(0);
    });
  });

  describe('fromApiDetail', () => {
    it('transforms API detail data to frontend format', () => {
      const result = CustomAnalysisImprovementsAdapter.fromApiDetail({
        uuid: 'custom-analysis-uuid-1',
        title: 'Unrealistic delivery deadlines',
        definition: 'The agent is providing unrealistic delivery deadlines',
        exclusions: '',
        slug: 'unrealistic-delivery-deadlines',
      });

      expect(result).toEqual({
        uuid: 'custom-analysis-uuid-1',
        title: 'Unrealistic delivery deadlines',
        definition: 'The agent is providing unrealistic delivery deadlines',
        exclusions: '',
        slug: 'unrealistic-delivery-deadlines',
      });
    });

    it('returns null when required fields are missing', () => {
      expect(
        CustomAnalysisImprovementsAdapter.fromApiDetail({
          uuid: 'custom-analysis-uuid-1',
        }),
      ).toBeNull();
    });

    it('defaults optional fields to empty strings', () => {
      const result = CustomAnalysisImprovementsAdapter.fromApiDetail({
        uuid: 'custom-analysis-uuid-1',
        title: 'Unrealistic delivery deadlines',
      });

      expect(result).toEqual({
        uuid: 'custom-analysis-uuid-1',
        title: 'Unrealistic delivery deadlines',
        definition: '',
        exclusions: '',
        slug: '',
      });
    });
  });

  describe('toApiCreate', () => {
    it('transforms frontend payload to API format', () => {
      expect(
        CustomAnalysisImprovementsAdapter.toApiCreate({
          title: 'Unrealistic delivery deadlines',
          definition: 'The agent is providing unrealistic delivery deadlines',
          exclusions: '',
        }),
      ).toEqual({
        title: 'Unrealistic delivery deadlines',
        definition: 'The agent is providing unrealistic delivery deadlines',
        exclusions: '',
      });
    });
  });
});
