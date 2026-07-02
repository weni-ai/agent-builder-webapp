import type { ImprovementType } from '@/store/types/Improvements.types';

export type ImprovementTagCategory =
  | 'behavior'
  | 'custom_analysis'
  | 'knowledge'
  | 'technical_issue';

export interface ImprovementTypeTag {
  category: ImprovementTagCategory;
  scheme: string;
}

const IMPROVEMENT_TYPE_CATEGORY_MAP: Record<
  ImprovementType,
  ImprovementTagCategory
> = {
  many_questions_before_answering: 'behavior',
  wrong_behavior_due_to_instructions: 'behavior',
  missing_static_knowledge: 'knowledge',
  personality_deviation: 'behavior',
  poor_product_search_results: 'technical_issue',
  repetitive_response: 'behavior',
  custom_analysis: 'custom_analysis',
};

const IMPROVEMENT_TAG_SCHEME_MAP: Record<ImprovementTagCategory, string> = {
  behavior: 'blue',
  knowledge: 'purple',
  technical_issue: 'orange',
  custom_analysis: 'yellow',
};

export function getImprovementTypeTag(
  type: ImprovementType,
): ImprovementTypeTag {
  const category = IMPROVEMENT_TYPE_CATEGORY_MAP[type];

  return {
    category,
    scheme: IMPROVEMENT_TAG_SCHEME_MAP[category],
  };
}
