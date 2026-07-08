export type CustomAnalysisImprovementsStatus =
  | 'idle'
  | 'loading'
  | 'complete'
  | 'error';

export interface CustomAnalysisImprovement {
  uuid: string;
  title: string;
  conversationsCount: number;
}

export interface CustomAnalysisImprovementDetail {
  uuid: string;
  title: string;
  definition: string;
  exclusions: string;
  slug: string;
}

export interface CustomAnalysisCreatePayload {
  title: string;
  definition: string;
  exclusions: string;
}
