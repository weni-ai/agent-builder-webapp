export type ImprovementType =
  | 'custom_analysis'
  | 'many_questions_before_answering'
  | 'missing_static_knowledge'
  | 'personality_deviation'
  | 'poor_product_search_results'
  | 'repetitive_response'
  | 'wrong_behavior_due_to_instructions';

export type ImprovementsStatus = null | 'loading' | 'complete' | 'error';

export type RunAnalysisBlockReason =
  | 'insufficient_volume'
  | 'already_run_today'
  | null;

export type ImprovementStatus = 'ignored' | 'resolved';

export type ImprovementDetailStatus = 'pending' | 'resolved' | 'ignored';

export type InstructionChangeType = 'fix' | 'add' | 'remove';

export interface AffectedInstruction {
  id: number;
  changeType: InstructionChangeType;
  wasChanged: boolean;
}

export interface ImprovementDetail {
  uuid: string;
  text: string;
  type: ImprovementType;
  description: string;
  suggestedSolution: string | null;
  status: ImprovementDetailStatus;
  affectedInstructions: AffectedInstruction[];
}

export interface ImprovementsTask {
  isRunning: boolean;
  progress: number;
  total: number;
  createdAt: string | null;
}

export interface Improvement {
  uuid: string;
  text: string;
  type: ImprovementType;
  conversationsCount: number;
}

export interface ImprovementsAnalysis {
  yesterdayConversationsCount: number;
  task: ImprovementsTask | null;
  improvements: Improvement[];
}
