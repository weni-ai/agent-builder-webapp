import { isArray } from 'lodash';
import { Conversation } from '@/store/types/Conversations.types';

interface ApiData {
  results: {
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
  }[];
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
  search: string;
  resolution: number[];
  csat: number[];
  topics: string[];
}

export const ConversationAdapter = {
  /**
   * Transform API response data to frontend format
   * @param {Object} apiData - Raw API response data
   * @returns {Object} Transformed data for frontend use
   */
  fromApi(apiData: ApiData): ConversationResponse {
    const statusMap = {
      0: 'optimized_resolution',
      1: 'other_conclusion',
      2: 'in_progress',
      3: 'unclassified',
      4: 'transferred_to_human_support',
    };

    const csatMap = {
      1: 'very_dissatisfied',
      2: 'dissatisfied',
      3: 'neutral',
      4: 'satisfied',
      5: 'very_satisfied',
    };

    if (apiData.results) {
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
            status: statusMap[result.resolution] || 'in_progress',
            csat:
              result.csat !== null
                ? {
                    score: parseInt(result.csat),
                    id: csatMap[result.csat],
                  }
                : null,
            topics: result.topic,
            isAmazing: Boolean(result.is_amazing),
          }),
        ),
      };
    }
  },

  /**
   * Transform frontend filter parameters to API format
   * @param {Object} filterData - Frontend filter parameters
   * @returns {Object} Transformed parameters for API request
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

    const statusMap = {
      optimized_resolution: 0,
      other_conclusion: 1,
      in_progress: 2,
      unclassified: 3,
      transferred_to_human_support: 4,
    };

    const csatMap = {
      very_dissatisfied: 1,
      dissatisfied: 2,
      neutral: 3,
      satisfied: 4,
      very_satisfied: 5,
    };

    const params = {
      page,
      start_date: start,
      end_date: end,
      ...(search && { search }),
      ...(isArray(status) &&
        status.length > 0 && {
          resolution: status.map((statusItem) => statusMap[statusItem]),
        }),
      ...(isArray(csat) &&
        csat.length > 0 && {
          csat: csat.map((csatItem) => csatMap[csatItem]),
        }),
      ...(isArray(topics) && topics.length > 0 && { topics }),
    };

    return params;
  },
};
