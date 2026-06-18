export type ImprovementType =
  | 'brand_voice_mismatch'
  | 'many_questions_before_answering'
  | 'missing_static_knowledge'
  | 'instruction_non_compliance'
  | 'catalog_search_mismatch'
  | 'amazing_conversation';

export type ImprovementsStatus = null | 'loading' | 'complete' | 'error';

export interface ImprovementsTask {
  isRunning: boolean;
  progress: number;
  total: number;
}

export interface Improvement {
  uuid: string;
  text: string;
  type: ImprovementType;
  conversationsCount: number;
}

export interface ImprovementsAnalysis {
  task: ImprovementsTask;
  improvements: Improvement[];
}
