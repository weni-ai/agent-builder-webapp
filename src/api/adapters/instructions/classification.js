export const InstructionClassificationAdapter = {
  fromApi({
    classification = [],
    suggestion = '',
    suggested_category = '',
  } = {}) {
    return {
      classification,
      suggestion,
      suggestedCategory: suggested_category ?? '',
    };
  },
};
