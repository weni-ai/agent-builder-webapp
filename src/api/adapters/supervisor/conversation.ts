import { isArray } from 'lodash';
import { Conversation } from '@/store/types/Conversations.types';

interface ApiConversation {
  uuid: string;
  contact_urn: string;
  contact_name: string;
  status: string;
  resolution: number;
  start_date: string;
  end_date: string;
  channel_uuid: string;
  has_chats_room: boolean;
  csat: string | null;
  nps: string | null;
  created_at: string;
  classification: string | null;
  topic?: string | null;
  is_amazing?: boolean;
}

interface ApiData {
  results?: ApiConversation[];
  count?: number;
  next?: string | null;
}

interface ConversationResponse {
  results: Conversation[];
  count?: number;
  next?: string | null;
}

interface FilterData {
  page: number;
  start: string;
  end: string;
  search: string;
  status: string[];
  csat: string[];
  topics: string[];
}

interface ApiParams {
  page: number;
  start_date: string;
  end_date: string;
  search?: string;
  resolution?: number[];
  csat?: number[];
  topics?: string[];
}

const STATUS_BY_RESOLUTION: Record<number, string> = {
  0: 'optimized_resolution',
  1: 'other_conclusion',
  2: 'in_progress',
  3: 'unclassified',
  4: 'transferred_to_human_support',
};

const CSAT_BY_SCORE: Record<string, string> = {
  1: 'very_dissatisfied',
  2: 'dissatisfied',
  3: 'neutral',
  4: 'satisfied',
  5: 'very_satisfied',
};

const RESOLUTION_BY_STATUS: Record<string, number> = {
  optimized_resolution: 0,
  other_conclusion: 1,
  in_progress: 2,
  unclassified: 3,
  transferred_to_human_support: 4,
};

const SCORE_BY_CSAT: Record<string, number> = {
  very_dissatisfied: 1,
  dissatisfied: 2,
  neutral: 3,
  satisfied: 4,
  very_satisfied: 5,
};

export const ConversationAdapter = {
  /**
   * Transform API response data to frontend format
   */
  fromApi(apiData: ApiData): ConversationResponse {
    if (!apiData.results) {
      return { results: [] };
    }

    return {
      ...apiData,
      results: apiData.results.map(
        (result): Conversation => ({
          uuid: result.uuid,
          id: result.uuid,
          start: result.start_date,
          end: result.end_date,
          username: result.contact_name,
          urn: result.contact_urn,
          status: STATUS_BY_RESOLUTION[result.resolution] || 'in_progress',
          csat:
            result.csat !== null
              ? {
                  score: parseInt(result.csat, 10),
                  id: CSAT_BY_SCORE[result.csat],
                }
              : null,
          topics: result.topic ?? '',
          isAmazing: Boolean(result.is_amazing),
        }),
      ),
    };
  },

  /**
   * Transform frontend filter parameters to API format
   */
  toApi(filterData: FilterData): ApiParams {
    const {
      page,
      start,
      end,
      search,
      status = [],
      csat = [],
      topics = [],
    } = filterData;

    return {
      page,
      start_date: start,
      end_date: end,
      ...(search && { search }),
      ...(isArray(status) &&
        status.length > 0 && {
          resolution: status.map(
            (statusItem) => RESOLUTION_BY_STATUS[statusItem],
          ),
        }),
      ...(isArray(csat) &&
        csat.length > 0 && {
          csat: csat.map((csatItem) => SCORE_BY_CSAT[csatItem]),
        }),
      ...(isArray(topics) && topics.length > 0 && { topics }),
    };
  },
};
