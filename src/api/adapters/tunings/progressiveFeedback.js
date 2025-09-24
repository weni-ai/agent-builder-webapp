export const ProgressiveFeedbackAdapter = {
  fromApi(apiData) {
    const { rationale, ...rest } = apiData;
    return {
      ...rest,
      progressiveFeedback: rationale,
    };
  },

  toApi(storeData) {
    const { progressiveFeedback, ...rest } = storeData;
    return {
      ...rest,
      rationale: progressiveFeedback,
    };
  },
};
