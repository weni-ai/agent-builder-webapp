export const ComponentsAdapter = {
  fromApi(apiData) {
    const { use_components, ...rest } = apiData;
    return {
      ...rest,
      components: use_components,
    };
  },

  toApi(storeData) {
    const { components, ...rest } = storeData;
    return {
      ...rest,
      use_components: components,
    };
  },
};
