interface ConversationMessageResponse {
  id: number;
  uuid: string;
  text: string;
  source?: 'incoming' | 'outgoing'; // v2 endpoint
  source_type?: 'user' | 'agent'; // legacy endpoint
  created_at: string;
}

interface ConversationMessage {
  id: number;
  uuid: string;
  text: string;
  type: 'user' | 'agent';
  created_at: string;
}

interface ConversationMessagesResponseV2 {
  messages: {
    results: ConversationMessageResponse[];
    next: string | null;
  };
}

interface ConversationMessagesResponseLegacy {
  next: string | null;
  previous: string | null;
  results: ConversationMessageResponse[];
}

interface FilterData {
  start: string;
  end: string;
  urn: string;
}

interface ApiParams {
  start: string;
  end: string;
  contact_urn: string;
}

export const ConversationMessageAdapter = {
  /**
   * Transform API response data to frontend format
   * @param {Object} apiData - Raw API response data
   * @returns {Object} Transformed data for frontend use
   */
  fromApi(
    apiData:
      | ConversationMessagesResponseV2
      | ConversationMessagesResponseLegacy,
  ): {
    results: ConversationMessage[];
    next: string | null;
  } {
    const messages =
      'messages' in apiData ? apiData.messages?.results : apiData.results;
    const next =
      'messages' in apiData ? apiData.messages?.next : apiData?.next || null;

    const results = (messages ?? []).map((result) => ({
      id: result.id,
      uuid: result.uuid,
      text: result.text,
      type:
        result.source_type || (result.source === 'incoming' ? 'user' : 'agent'),
      created_at: result.created_at,
    }));

    return { results, next };
  },

  /**
   * Transform frontend filter parameters to API format
   * @param {Object} filterData - Frontend filter parameters
   * @returns {Object} Transformed parameters for API request
   */
  toApiLegacy(filterData: FilterData): ApiParams {
    const { start, end, urn } = filterData;
    return {
      start,
      end,
      contact_urn: urn,
    };
  },
};
