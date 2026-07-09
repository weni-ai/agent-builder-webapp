import type {
  Improvement,
  ImprovementType,
  ImprovementsAnalysis,
  ImprovementsTask,
} from '@/store/types/Improvements.types';

export interface ImprovementsTaskApi {
  is_running?: boolean;
  progress?: number;
  total?: number;
  created_at?: string;
}

export interface ImprovementApi {
  uuid?: string;
  text?: string;
  type?: string;
  conversations_count?: number;
}

export interface ImprovementsAnalysisApi {
  yesterday_conversations_count?: number;
  improvements_task?: ImprovementsTaskApi;
  improvements?: ImprovementApi[];
}

const IMPROVEMENT_TYPES: ImprovementType[] = [
  'custom_analysis',
  'many_questions_before_answering',
  'missing_static_knowledge',
  'personality_deviation',
  'poor_product_search_results',
  'repetitive_response',
  'wrong_behavior_due_to_instructions',
];

function isImprovementType(value: unknown): value is ImprovementType {
  return IMPROVEMENT_TYPES.includes(value as ImprovementType);
}

function parseTask(task: ImprovementsTaskApi = {}): ImprovementsTask {
  return {
    isRunning: Boolean(task.is_running),
    progress: Number(task.progress) || 0,
    total: Number(task.total) || 0,
    createdAt: task.created_at ?? null,
  };
}

function parseImprovement(item: ImprovementApi = {}): Improvement | null {
  if (!item.uuid || !item.text || !isImprovementType(item.type)) {
    return null;
  }

  return {
    uuid: item.uuid,
    text: item.text,
    type: item.type,
    conversationsCount: Number(item.conversations_count) || 0,
  };
}

export const ImprovementsAdapter = {
  fromApi(apiData: ImprovementsAnalysisApi = {}): ImprovementsAnalysis {
    const improvements = (apiData.improvements ?? [])
      .map(parseImprovement)
      .filter((item): item is Improvement => item !== null);

    return {
      yesterdayConversationsCount:
        Number(apiData.yesterday_conversations_count) || 0,
      task: parseTask(apiData.improvements_task),
      improvements,
    };
  },
};
