export const MOCK_ENGINE_SOURCE_DATA = {
  current: null,
  providers: [
    {
      id: 'openai',
      label: 'OpenAI',
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      crendentials: [
        {
          type: 'PASSWORD',
          label: 'API Key',
          value: '',
          id: 'openai_api_key',
        },
        {
          type: 'TEXT',
          label: 'Organization ID',
          value: '',
          id: 'openai_org_id',
        },
      ],
    },
    {
      id: 'gemini',
      label: 'Gemini',
      models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
      crendentials: [
        {
          type: 'PASSWORD',
          label: 'API Key',
          value: '',
          id: 'gemini_api_key',
        },
      ],
    },
    {
      id: 'anthropic',
      label: 'Anthropic',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      crendentials: [
        {
          type: 'PASSWORD',
          label: 'API Key',
          value: '',
          id: 'anthropic_api_key',
        },
        {
          type: 'TEXTAREA',
          label: 'Credentials (JSON)',
          value: '',
          id: 'anthropic_custom_config',
        },
      ],
    },
  ],
};
