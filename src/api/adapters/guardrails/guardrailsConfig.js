export const GuardrailsConfigAdapter = {
  fromApi(apiData = {}) {
    return {
      topics: (apiData.categories || []).map(({ slug, blocked }) => ({
        id: slug,
        enabled: blocked,
      })),
      blockingMessage: apiData.blocking_message || '',
      writable: Boolean(apiData.writable),
    };
  },

  toApi({ categoryStates, blockingMessage } = {}) {
    const payload = {};

    if (categoryStates) {
      payload.category_states = categoryStates;
    }

    if (typeof blockingMessage === 'string') {
      payload.blocking_message = blockingMessage;
    }

    return payload;
  },
};
