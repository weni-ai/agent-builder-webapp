import { isArray } from 'lodash';
import { Conversation, Csat } from '@/store/types/Conversations.types';

interface ApiDataLegacy {
  results: {
    urn: string;
    uuid: string;
    external_id: string | null;
    csat: string | null;
    nps: string | null;
    topic: string | null;
    start_date: string;
    end_date: string;
    resolution: string;
    name: string;
    is_amazing?: boolean;
  }[];
}

interface ApiDataV2 {
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
    is_amazing?: boolean;
  }[];
}

interface ConversationResponse {
  results: Conversation[];
}

/**
 * Root of the v2 conversation detail response. Every field is optional because
 * the same payload also serves message pagination, which omits contact data.
 */
interface ConversationDetailResponse {
  contact_name?: string;
  contact_urn?: string;
  start_date?: string;
  end_date?: string;
  resolution?: number;
  csat?: string | null;
  topic?: string | null;
  is_amazing?: boolean;
}

const RESOLUTION_TO_STATUS: Record<number, string> = {
  0: 'optimized_resolution',
  1: 'other_conclusion',
  2: 'in_progress',
  3: 'unclassified',
  4: 'transferred_to_human_support',
};

const CSAT_SCORE_TO_ID: Record<string, string> = {
  1: 'very_dissatisfied',
  2: 'dissatisfied',
  3: 'neutral',
  4: 'satisfied',
  5: 'very_satisfied',
};

function mapStatus(resolution?: number): string {
  return RESOLUTION_TO_STATUS[resolution] || 'in_progress';
}

function mapCsat(csat?: string | null): Csat | null {
  if (csat === null || csat === undefined) return null;

  return {
    score: parseInt(csat),
    id: CSAT_SCORE_TO_ID[csat],
  };
}

interface FilterData {
  page: number;
  start: string;
  end: string;
  search: string;
  status: string[];
  csat: string[];
  topics: string[];
  isAmazing?: boolean | null;
}

interface ApiParams {
  page: number;
  start_date: string;
  end_date: string;
  search: string;
  resolution: number[];
  csat: number[];
  topics: string[];
  is_amazing?: boolean;
}

export const ConversationAdapter = {
  /**
   * Transform API response data to frontend format
   * @param {Object} apiData - Raw API response data
   * @returns {Object} Transformed data for frontend use
   */
  fromApi(apiData: ApiDataLegacy | ApiDataV2): ConversationResponse {
    if (apiData.results) {
      return {
        ...apiData,
        results: apiData.results.map(
          (result): Conversation => ({
            uuid: result.uuid,
            id: result.external_id || result.uuid,
            start: result.start_date,
            end: result.end_date,
            username: result.name || result.contact_name,
            urn: result.urn || result.contact_urn,
            status: mapStatus(result.resolution),
            csat: mapCsat(result.csat),
            topics: result.topic,
            isAmazing: Boolean(result.is_amazing),
          }),
        ),
      };
    }
  },

  /**
   * Transform the v2 conversation detail root into the list row shape.
   * Only the fields present in the response are returned, so pagination
   * responses without contact data do not overwrite existing metadata.
   * @param {Object} apiData - Raw API response data
   * @returns {Object} Partial conversation for the frontend
   */
  fromDetailApi(
    apiData: ConversationDetailResponse = {},
  ): Partial<Conversation> {
    const {
      contact_name,
      contact_urn,
      start_date,
      end_date,
      resolution,
      csat,
      topic,
      is_amazing,
    } = apiData || {};

    return {
      ...(contact_name && { username: contact_name }),
      ...(contact_urn && { urn: contact_urn }),
      ...(start_date && { start: start_date }),
      ...(end_date && { end: end_date }),
      ...(topic && { topics: topic }),
      ...(resolution !== undefined && { status: mapStatus(resolution) }),
      ...(csat !== undefined && { csat: mapCsat(csat) }),
      ...(is_amazing !== undefined && { isAmazing: Boolean(is_amazing) }),
    };
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
      isAmazing,
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
      ...(isAmazing === true && { is_amazing: true }),
    };

    return params;
  },
};
