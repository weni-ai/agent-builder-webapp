import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useEngineSourceStore } from '@/store/EngineSource';
import { useAlertStore } from '@/store/Alert';
import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/utils/env', () => ({
  default: (name) => {
    if (name === 'PROVIDERS_WITHOUT_COMPONENTS') return 'OpenAI';
    return '';
  },
}));

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    router: {
      tunings: {
        engine_source: {
          read: vi.fn(),
          edit: vi.fn(),
          delete: vi.fn(),
          readSource: vi.fn(),
        },
      },
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'test-project-uuid' }),
}));

const mockProviders = [
  {
    uuid: 'openai',
    label: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini'],
    credentials: [
      { type: 'PASSWORD', label: 'API Key', value: '', id: 'openai_api_key' },
      { type: 'TEXT', label: 'Org ID', value: '', id: 'openai_org_id' },
    ],
  },
  {
    uuid: 'anthropic',
    label: 'Anthropic',
    models: ['claude-3-opus', 'claude-3-sonnet'],
    credentials: [
      {
        type: 'PASSWORD',
        label: 'API Key',
        value: '',
        id: 'anthropic_api_key',
      },
    ],
  },
];

const mockApiResponseNoCurrent = {
  data: {
    current: null,
    providers: mockProviders,
  },
};

const mockApiResponseWithCurrent = {
  data: {
    current: {
      uuid: 'openai',
      label: 'OpenAI',
      model: 'gpt-4o',
      credentials: [
        {
          type: 'PASSWORD',
          label: 'API Key',
          value: 'sk-existing-key',
          id: 'openai_api_key',
        },
        {
          type: 'TEXT',
          label: 'Org ID',
          value: 'org-123',
          id: 'openai_org_id',
        },
      ],
    },
    providers: mockProviders,
  },
};

const mockSourceStandard = {
  data: { engine_source: 'STANDARD' },
};

const mockSourceOwn = {
  data: { engine_source: 'OWN' },
};

describe('EngineSource Store', () => {
  let store;
  let alertStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useEngineSourceStore();
    alertStore = useAlertStore();

    vi.spyOn(alertStore, 'add').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(store.engineType).toBe('native');
      expect(store.providers).toEqual([]);
      expect(store.current).toBeNull();
      expect(store.selectedProviderId).toBe('');
      expect(store.selectedModel).toBe('');
      expect(store.credentials).toEqual([]);
      expect(store.status).toBe('idle');
      expect(store.saveStatus).toBe('idle');
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      store.providers = JSON.parse(JSON.stringify(mockProviders));
    });

    describe('selectedProvider', () => {
      it('should return the provider matching selectedProviderId', () => {
        store.selectedProviderId = 'openai';
        expect(store.selectedProvider.uuid).toBe('openai');
        expect(store.selectedProvider.label).toBe('OpenAI');
      });

      it('should return undefined when no provider is selected', () => {
        store.selectedProviderId = '';
        expect(store.selectedProvider).toBeUndefined();
      });
    });

    describe('availableModels', () => {
      it('should return models for the selected provider', () => {
        store.selectedProviderId = 'openai';
        expect(store.availableModels).toEqual(['gpt-4o', 'gpt-4o-mini']);
      });

      it('should return empty array when no provider is selected', () => {
        store.selectedProviderId = '';
        expect(store.availableModels).toEqual([]);
      });
    });

    describe('providerOptions', () => {
      it('should format providers for UnnnicSelect', () => {
        expect(store.providerOptions).toEqual([
          { label: 'OpenAI', value: 'openai' },
          { label: 'Anthropic', value: 'anthropic' },
        ]);
      });
    });

    describe('modelOptions', () => {
      it('should format models for UnnnicSelect', () => {
        store.selectedProviderId = 'anthropic';
        expect(store.modelOptions).toEqual([
          { label: 'claude-3-opus', value: 'claude-3-opus' },
          { label: 'claude-3-sonnet', value: 'claude-3-sonnet' },
        ]);
      });

      it('should return empty array when no provider is selected', () => {
        expect(store.modelOptions).toEqual([]);
      });
    });

    describe('isValid', () => {
      it('should return true when engine type is native', () => {
        store.engineType = 'native';
        expect(store.isValid).toBe(true);
      });

      it('should return true when custom with all fields filled', () => {
        store.engineType = 'custom';
        store.selectedProviderId = 'openai';
        store.selectedModel = 'gpt-4o';
        store.credentials = [
          { id: 'key', value: 'sk-123' },
          { id: 'org', value: 'org-1' },
        ];
        expect(store.isValid).toBe(true);
      });

      it('should return false when custom and provider is missing', () => {
        store.engineType = 'custom';
        store.selectedProviderId = '';
        store.selectedModel = 'gpt-4o';
        store.credentials = [{ id: 'key', value: 'sk-123' }];
        expect(store.isValid).toBe(false);
      });

      it('should return false when custom and model is missing', () => {
        store.engineType = 'custom';
        store.selectedProviderId = 'openai';
        store.selectedModel = '';
        store.credentials = [{ id: 'key', value: 'sk-123' }];
        expect(store.isValid).toBe(false);
      });

      it('should return false when custom and a credential is empty', () => {
        store.engineType = 'custom';
        store.selectedProviderId = 'openai';
        store.selectedModel = 'gpt-4o';
        store.credentials = [
          { id: 'key', value: 'sk-123' },
          { id: 'org', value: '' },
        ];
        expect(store.isValid).toBe(false);
      });
    });

    describe('selectedProviderAcceptsComponents', () => {
      it('should return true when no provider is selected', () => {
        expect(store.selectedProviderAcceptsComponents).toBe(true);
      });

      it('should return false when selected provider is in PROVIDERS_WITHOUT_COMPONENTS', () => {
        store.selectedProviderId = 'openai';
        expect(store.selectedProviderAcceptsComponents).toBe(false);
      });

      it('should return true when selected provider is not in PROVIDERS_WITHOUT_COMPONENTS', () => {
        store.selectedProviderId = 'anthropic';
        expect(store.selectedProviderAcceptsComponents).toBe(true);
      });
    });

    describe('hasChanges', () => {
      it('should return false when no snapshot has been taken', () => {
        expect(store.hasChanges).toBe(false);
      });

      it('should return false when state matches the snapshot', async () => {
        nexusaiAPI.router.tunings.engine_source.read.mockResolvedValue(
          JSON.parse(JSON.stringify(mockApiResponseNoCurrent)),
        );
        nexusaiAPI.router.tunings.engine_source.readSource.mockResolvedValue(
          mockSourceStandard,
        );
        await store.loadEngineSource();
        expect(store.hasChanges).toBe(false);
      });

      it('should return true when engine type changes after snapshot', async () => {
        nexusaiAPI.router.tunings.engine_source.read.mockResolvedValue(
          JSON.parse(JSON.stringify(mockApiResponseNoCurrent)),
        );
        nexusaiAPI.router.tunings.engine_source.readSource.mockResolvedValue(
          mockSourceStandard,
        );
        await store.loadEngineSource();
        store.engineType = 'custom';
        expect(store.hasChanges).toBe(true);
      });

      it('should return true when provider changes after snapshot', async () => {
        nexusaiAPI.router.tunings.engine_source.read.mockResolvedValue(
          JSON.parse(JSON.stringify(mockApiResponseWithCurrent)),
        );
        nexusaiAPI.router.tunings.engine_source.readSource.mockResolvedValue(
          mockSourceOwn,
        );
        await store.loadEngineSource();
        store.selectedProviderId = 'anthropic';
        expect(store.hasChanges).toBe(true);
      });
    });
  });

  describe('Actions', () => {
    describe('setEngineType', () => {
      it('should update engine type', () => {
        store.setEngineType('custom');
        expect(store.engineType).toBe('custom');
      });
    });

    describe('setProvider', () => {
      beforeEach(() => {
        store.providers = JSON.parse(JSON.stringify(mockProviders));
      });

      it('should update selectedProviderId and populate credentials', () => {
        store.setProvider('openai');
        expect(store.selectedProviderId).toBe('openai');
        expect(store.credentials).toHaveLength(2);
        expect(store.credentials[0].id).toBe('openai_api_key');
        expect(store.credentials[1].id).toBe('openai_org_id');
      });

      it('should reset selectedModel when provider changes', () => {
        store.selectedModel = 'gpt-4o';
        store.setProvider('anthropic');
        expect(store.selectedModel).toBe('');
      });

      it('should set empty credentials for unknown provider', () => {
        store.setProvider('unknown');
        expect(store.credentials).toEqual([]);
      });
    });

    describe('setModel', () => {
      it('should update selected model', () => {
        store.setModel('gpt-4o');
        expect(store.selectedModel).toBe('gpt-4o');
      });
    });

    describe('updateCredential', () => {
      beforeEach(() => {
        store.credentials = [
          { id: 'api_key', value: '', type: 'PASSWORD', label: 'API Key' },
          { id: 'org_id', value: '', type: 'TEXT', label: 'Org ID' },
        ];
      });

      it('should update the value of an existing credential', () => {
        store.updateCredential('api_key', 'sk-new-value');
        expect(store.credentials[0].value).toBe('sk-new-value');
      });

      it('should not modify anything for a non-existent credential id', () => {
        store.updateCredential('non_existent', 'value');
        expect(store.credentials[0].value).toBe('');
        expect(store.credentials[1].value).toBe('');
      });
    });

    describe('loadEngineSource', () => {
      it('should load data and set status to success when engine source is STANDARD', async () => {
        nexusaiAPI.router.tunings.engine_source.read.mockResolvedValue(
          JSON.parse(JSON.stringify(mockApiResponseNoCurrent)),
        );
        nexusaiAPI.router.tunings.engine_source.readSource.mockResolvedValue(
          mockSourceStandard,
        );

        await store.loadEngineSource();

        expect(store.status).toBe('success');
        expect(store.providers).toHaveLength(2);
        expect(store.engineType).toBe('native');
        expect(store.current).toBeNull();
      });

      it('should load data and set custom state when engine source is OWN', async () => {
        nexusaiAPI.router.tunings.engine_source.read.mockResolvedValue(
          JSON.parse(JSON.stringify(mockApiResponseWithCurrent)),
        );
        nexusaiAPI.router.tunings.engine_source.readSource.mockResolvedValue(
          mockSourceOwn,
        );

        await store.loadEngineSource();

        expect(store.status).toBe('success');
        expect(store.engineType).toBe('custom');
        expect(store.selectedProviderId).toBe('openai');
        expect(store.selectedModel).toBe('gpt-4o');
        expect(store.credentials).toHaveLength(2);
        expect(store.credentials[0].value).toBe('sk-existing-key');
      });

      it('should not reload if already loading', async () => {
        store.status = 'loading';
        await store.loadEngineSource();
        expect(
          nexusaiAPI.router.tunings.engine_source.read,
        ).not.toHaveBeenCalled();
      });

      it('should not reload if already loaded successfully', async () => {
        store.status = 'success';
        await store.loadEngineSource();
        expect(
          nexusaiAPI.router.tunings.engine_source.read,
        ).not.toHaveBeenCalled();
      });

      it('should set status to error and show alert on failure', async () => {
        nexusaiAPI.router.tunings.engine_source.read.mockRejectedValue(
          new Error('Network error'),
        );
        nexusaiAPI.router.tunings.engine_source.readSource.mockResolvedValue(
          mockSourceStandard,
        );

        await store.loadEngineSource();

        expect(store.status).toBe('error');
        expect(alertStore.add).toHaveBeenCalledWith({
          text: i18n.global.t(
            'agent_builder.tunings.engine_source.load_error',
          ),
          type: 'error',
        });
      });

      it('should set loading status during fetch', () => {
        nexusaiAPI.router.tunings.engine_source.read.mockImplementation(() => {
          expect(store.status).toBe('loading');
          return Promise.resolve(
            JSON.parse(JSON.stringify(mockApiResponseNoCurrent)),
          );
        });
        nexusaiAPI.router.tunings.engine_source.readSource.mockResolvedValue(
          mockSourceStandard,
        );

        store.loadEngineSource();
      });
    });

    describe('saveEngineSource', () => {
      it('should call DELETE and return true when engine type is native', async () => {
        store.engineType = 'native';
        nexusaiAPI.router.tunings.engine_source.delete.mockResolvedValue({
          data: {},
        });

        const result = await store.saveEngineSource();

        expect(result).toBe(true);
        expect(store.saveStatus).toBe('success');
        expect(
          nexusaiAPI.router.tunings.engine_source.delete,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
        });
        expect(
          nexusaiAPI.router.tunings.engine_source.edit,
        ).not.toHaveBeenCalled();
      });

      it('should call POST with provider, model and credentials when engine type is custom', async () => {
        store.engineType = 'custom';
        store.selectedProviderId = 'openai';
        store.selectedModel = 'gpt-4o';
        store.credentials = [
          {
            id: 'openai_api_key',
            value: 'sk-123',
            type: 'PASSWORD',
            label: 'API Key',
          },
        ];
        nexusaiAPI.router.tunings.engine_source.edit.mockResolvedValue({
          data: {},
        });

        const result = await store.saveEngineSource();

        expect(result).toBe(true);
        expect(store.saveStatus).toBe('success');
        expect(
          nexusaiAPI.router.tunings.engine_source.edit,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          payload: {
            provider_uuid: 'openai',
            model: 'gpt-4o',
            credentials: [{ id: 'openai_api_key', value: 'sk-123' }],
          },
        });
        expect(
          nexusaiAPI.router.tunings.engine_source.delete,
        ).not.toHaveBeenCalled();
      });

      it('should return false and set error status on failure', async () => {
        store.engineType = 'custom';
        nexusaiAPI.router.tunings.engine_source.edit.mockRejectedValue(
          new Error('Save error'),
        );

        const result = await store.saveEngineSource();

        expect(result).toBe(false);
        expect(store.saveStatus).toBe('error');
      });

      it('should take a new snapshot after successful save', async () => {
        nexusaiAPI.router.tunings.engine_source.read.mockResolvedValue(
          JSON.parse(JSON.stringify(mockApiResponseNoCurrent)),
        );
        nexusaiAPI.router.tunings.engine_source.readSource.mockResolvedValue(
          mockSourceStandard,
        );
        await store.loadEngineSource();

        store.setEngineType('custom');
        expect(store.hasChanges).toBe(true);

        nexusaiAPI.router.tunings.engine_source.delete.mockResolvedValue({
          data: {},
        });
        store.setEngineType('native');
        await store.saveEngineSource();

        expect(store.hasChanges).toBe(false);
      });
    });
  });
});
