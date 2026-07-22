interface ConversationMessageResponse {
  id: number;
  uuid: string;
  text: string;
  source?: 'incoming' | 'outgoing';
  created_at: string;
}

interface ConversationMessage {
  id: number;
  uuid: string;
  text: string;
  type: 'user' | 'agent';
  createdAt: string;
}

interface ConversationMessagesResponse {
  messages: {
    results: ConversationMessageResponse[];
    next: string | null;
  };
}

export const ConversationMessageAdapter = {
  /**
   * Transform API response data to frontend format
   * @param {Object} apiData - Raw API response data
   * @returns {Object} Transformed data for frontend use
   */
  fromApi(apiData: ConversationMessagesResponse): {
    results: ConversationMessage[];
    next: string | null;
  } {
    const messages = apiData.messages?.results ?? [];
    const next = apiData.messages?.next ?? null;

    const results = messages.map((result) => ({
      id: result.id,
      uuid: result.uuid,
      text: result.text,
      type: result.source === 'incoming' ? 'user' : 'agent',
      createdAt: result.created_at,
    }));

    return { results, next };
  },
};
