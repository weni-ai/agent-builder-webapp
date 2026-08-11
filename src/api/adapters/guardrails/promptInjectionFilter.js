export const PromptInjectionFilterAdapter = {
  fromApi(apiData = {}) {
    return {
      enabled: Boolean(apiData.enabled),
    };
  },

  toApi({ enabled } = {}) {
    return { enabled };
  },
};
