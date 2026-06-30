import { describe, expect, it } from 'vitest';

import { getImprovementTypeTag } from '@/utils/improvements/getImprovementTypeTag';

import type { ImprovementType } from '@/store/types/Improvements.types';

describe('getImprovementTypeTag', () => {
  it.each([
    {
      type: 'many_questions_before_answering',
      category: 'behavior',
      scheme: 'blue',
    },
    {
      type: 'wrong_behavior_due_to_instructions',
      category: 'behavior',
      scheme: 'blue',
    },
    {
      type: 'personality_deviation',
      category: 'behavior',
      scheme: 'blue',
    },
    {
      type: 'repetitive_response',
      category: 'behavior',
      scheme: 'blue',
    },
    {
      type: 'missing_static_knowledge',
      category: 'knowledge',
      scheme: 'purple',
    },
    {
      type: 'poor_product_search_results',
      category: 'technical_issue',
      scheme: 'orange',
    },
    {
      type: 'custom_analysis',
      category: 'custom_analysis',
      scheme: 'yellow',
    },
  ] as const)(
    'maps $type to $category with $scheme scheme',
    ({ type, category, scheme }) => {
      expect(getImprovementTypeTag(type)).toEqual({
        category,
        scheme,
      });
    },
  );

  it('uses the same scheme for all types in the same category', () => {
    const behaviorTypes: ImprovementType[] = [
      'many_questions_before_answering',
      'wrong_behavior_due_to_instructions',
      'personality_deviation',
      'repetitive_response',
    ];

    const schemes = behaviorTypes.map(
      (type) => getImprovementTypeTag(type).scheme,
    );

    expect(new Set(schemes).size).toBe(1);
    expect(schemes[0]).toBe('blue');
  });
});
