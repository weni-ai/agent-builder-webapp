export const ProjectDetailsAdapter = {
  fromApi(apiData) {
    const {
      indexed_database,
      agents_backend,
      manager_foundation_model,
      integrated_agents,
      instruction_character_count,
    } = apiData;
    const backend = indexed_database || agents_backend;
    const agentsModels =
      integrated_agents?.map((ag) => ({
        ...ag,
        model: ag.foundation_model,
      })) || [];

    return {
      backend,
      agentsModels: manager_foundation_model
        ? [
            { name: 'Manager', model: manager_foundation_model },
            ...agentsModels,
          ]
        : null,
      charactersCount:
        backend.toLowerCase().includes('bedrock') &&
        Number.isInteger(instruction_character_count)
          ? instruction_character_count
          : null,
    };
  },
};
