import type {
  AffectedInstruction,
  Improvement,
  ImprovementDetail,
  ImprovementDetailStatus,
  ImprovementType,
  ImprovementsAnalysis,
  ImprovementsTask,
  InstructionChangeType,
} from '@/store/types/Improvements.types';
import { DEFAULT_IMPROVEMENTS_TASK } from '@/store/types/Improvements.types';

export interface ImprovementsTaskApi {
  is_running?: boolean;
  progress?: number;
  total?: number;
  created_at?: string | null;
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

export interface AffectedInstructionApi {
  instruction_id?: number;
  change_type?: string;
  was_changed?: boolean;
}

export interface ImprovementDetailApi {
  uuid?: string;
  text?: string;
  type?: string;
  description?: string;
  suggested_change?: string | null;
  status?: string;
  affected_instructions?: AffectedInstructionApi[];
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

function parseTask(task?: ImprovementsTaskApi | null): ImprovementsTask {
  if (!task) {
    return { ...DEFAULT_IMPROVEMENTS_TASK };
  }

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

const IMPROVEMENT_DETAIL_STATUSES: ImprovementDetailStatus[] = [
  'pending',
  'resolved',
  'ignored',
];

const INSTRUCTION_CHANGE_TYPES: InstructionChangeType[] = [
  'fix',
  'add',
  'remove',
];

function isImprovementDetailStatus(
  value: unknown,
): value is ImprovementDetailStatus {
  return IMPROVEMENT_DETAIL_STATUSES.includes(value as ImprovementDetailStatus);
}

function isInstructionChangeType(
  value: unknown,
): value is InstructionChangeType {
  return INSTRUCTION_CHANGE_TYPES.includes(value as InstructionChangeType);
}

function parseAffectedInstruction(
  item: AffectedInstructionApi = {},
): AffectedInstruction | null {
  const id = Number(item.instruction_id);

  if (!id || !isInstructionChangeType(item.change_type)) {
    return null;
  }

  return {
    id,
    changeType: item.change_type,
    wasChanged: Boolean(item.was_changed),
  };
}

function parseImprovementDetail(
  apiData: ImprovementDetailApi = {},
): ImprovementDetail | null {
  if (!apiData.uuid || !apiData.text || !isImprovementType(apiData.type)) {
    return null;
  }

  return {
    uuid: apiData.uuid,
    text: apiData.text,
    type: apiData.type,
    description: apiData.description ?? '',
    suggestedSolution: apiData.suggested_change ?? null,
    status: isImprovementDetailStatus(apiData.status)
      ? apiData.status
      : 'pending',
    affectedInstructions: (apiData.affected_instructions ?? [])
      .map(parseAffectedInstruction)
      .filter((item): item is AffectedInstruction => item !== null),
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

  fromDetailApi(apiData: ImprovementDetailApi = {}): ImprovementDetail | null {
    return parseImprovementDetail(apiData);
  },
};
