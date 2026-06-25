export const ApiErrorMessageAdapter = {
  fromApi(apiData) {
    const { error_message, ...rest } = apiData;

    return {
      ...rest,
      errorMessage: error_message,
    };
  },

  toApi(storeData) {
    const { errorMessage, ...rest } = storeData;
    const trimmed =
      typeof errorMessage === 'string' ? errorMessage.trim() : errorMessage;

    return {
      ...rest,
      error_message: trimmed === '' || trimmed == null ? null : trimmed,
    };
  },
};
