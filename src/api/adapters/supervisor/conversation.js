import { isArray } from 'lodash';

export const ConversationAdapter = {
  /**
   * Transform API response data to frontend format
   * @param {Object} apiData - Raw API response data
   * @returns {Object} Transformed data for frontend use
   */
  fromApi(apiData) {
    const statusMap = {
      0: 'optimized_resolution',
      1: 'other_conclusion',
      2: 'in_progress',
      3: 'unclassified',
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
        results: apiData.results.map((result) => ({
          uuid: result.uuid,
          id: result.external_id,
          start: result.start_date,
          end: result.end_date,
          username: result.name,
          urn: result.urn,
          status: statusMap[result.resolution] || 'in_progress',
          csat: csatMap[result.csat] || null,
          transferred_to_human_support: result.has_chats_room,
          topics: result.topic,
        })),
      };
    }

    return apiData;
  },

  /**
   * Transform frontend filter parameters to API format
   * @param {Object} filterData - Frontend filter parameters
   * @returns {Object} Transformed parameters for API request
   */
  toApi(filterData) {
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
      ...(status.includes('transferred_to_human_support') && {
        has_chats_room: true,
      }),
    };

    return params;
  },
};
