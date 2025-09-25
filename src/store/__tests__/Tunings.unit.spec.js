import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cloneDeep } from 'lodash';

import { useTuningsStore } from '@/store/Tunings';
import { useAlertStore } from '@/store/Alert';
import nexusaiAPI from '@/api/nexusaiAPI';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    router: {
      tunings: {
        listCredentials: vi.fn(),
        editCredentials: vi.fn(),
        getProgressiveFeedback: vi.fn(),
        getComponents: vi.fn(),
        editProgressiveFeedback: vi.fn(),
        editComponents: vi.fn(),
        createCredentials: vi.fn(),
      },
      profile: {
        read: vi.fn(),
        edit: vi.fn(),
      },
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'test-project-uuid' }),
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key) => key),
    },
  },
}));

describe('Tunings Store', () => {
  let store;
  let alertStore;

  const mockCredentialsData = {
    my_agents_credentials: [
      { name: 'my_agent_1', value: 'my_value_1' },
      { name: 'my_agent_2', value: '' },
    ],
    official_agents_credentials: [
      { name: 'official_agent_1', value: 'official_value_1' },
      { name: 'official_agent_2', value: 'official_value_2' },
    ],
  };

  const mockSettingsData = {
    team: {
      human_support: true,
      human_support_prompt: 'Test prompt',
    },
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useTuningsStore();
    alertStore = useAlertStore();

    vi.spyOn(alertStore, 'add').mockImplementation(() => {});

    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(store.credentials).toEqual({
        status: null,
        data: null,
      });
      expect(store.settings).toEqual({
        status: null,
        data: {
          components: false,
          progressiveFeedback: false,
          humanSupport: false,
          humanSupportPrompt: '',
        },
      });
      expect(store.initialCredentials).toBeNull();
      expect(store.initialSettings).toBeNull();
    });
  });

  describe('Computed Properties', () => {
    describe('isLoadingTunings', () => {
      it('should return true when credentials are loading', () => {
        store.credentials.status = 'loading';
        store.settings.status = 'success';
        expect(store.isLoadingTunings).toBe(true);
      });

      it('should return true when settings are loading', () => {
        store.credentials.status = 'success';
        store.settings.status = 'loading';
        expect(store.isLoadingTunings).toBe(true);
      });

      it('should return false when neither are loading', () => {
        store.credentials.status = 'success';
        store.settings.status = 'success';
        expect(store.isLoadingTunings).toBe(false);
      });
    });

    describe('isCredentialsValid', () => {
      beforeEach(() => {
        store.credentials.data = {
          myAgents: [
            { name: 'my_agent_1', value: 'my_value_1' },
            { name: 'my_agent_2', value: 'my_value_2' },
          ],
          officialAgents: [
            { name: 'official_agent_1', value: 'official_value_1' },
          ],
        };
        store.initialCredentials = {
          myAgents: [
            { name: 'my_agent_1', value: 'old_value_1' },
            { name: 'my_agent_2', value: 'old_value_2' },
          ],
          officialAgents: [
            { name: 'official_agent_1', value: 'old_official_value_1' },
          ],
        };
      });

      it('should return true when all credentials have values and have changes', () => {
        expect(store.isCredentialsValid).toBe(true);
      });

      it('should return false when some credentials are empty', () => {
        store.credentials.data.myAgents[0].value = '';
        expect(store.isCredentialsValid).toBe(false);
      });

      it('should return false when there are no changes', () => {
        store.credentials.data.myAgents[0].value = 'old_value_1';
        store.credentials.data.myAgents[1].value = 'old_value_2';
        store.credentials.data.officialAgents[0].value = 'old_official_value_1';
        expect(store.isCredentialsValid).toBe(false);
      });

      it('should return false when no credentials exist', () => {
        store.credentials.data = { myAgents: [], officialAgents: [] };
        expect(store.isCredentialsValid).toBe(false);
      });
    });

    describe('isSettingsValid', () => {
      beforeEach(() => {
        store.settings.data = {
          components: true,
          progressiveFeedback: false,
          humanSupport: true,
          humanSupportPrompt: 'New prompt',
        };
        store.initialSettings = {
          components: false,
          progressiveFeedback: false,
          humanSupport: false,
          humanSupportPrompt: '',
        };
      });

      it('should return true when settings have changed and humanSupport validation passes', () => {
        expect(store.isSettingsValid).toBe(true);
      });

      it('should return false when settings have not changed', () => {
        store.settings.data = cloneDeep(store.initialSettings);
        expect(store.isSettingsValid).toBe(false);
      });

      it('should return false when humanSupport is enabled but prompt is empty', () => {
        store.settings.data.humanSupportPrompt = '';
        expect(store.isSettingsValid).toBe(false);
      });

      it('should return true when humanSupport is disabled regardless of prompt', () => {
        store.settings.data.humanSupport = false;
        store.settings.data.humanSupportPrompt = '';
        expect(store.isSettingsValid).toBe(true);
      });

      it('should return false when initialSettings is null', () => {
        store.initialSettings = null;
        expect(store.isSettingsValid).toBe(false);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('getCredentialIndex', () => {
      beforeEach(() => {
        store.credentials.data = {
          myAgents: [
            { name: 'my_agent_1', value: 'value1' },
            { name: 'my_agent_2', value: 'value2' },
          ],
          officialAgents: [{ name: 'official_agent_1', value: 'value3' }],
        };
      });

      it('should return correct index and type for myAgents credential', () => {
        const [index, type] = store.getCredentialIndex('my_agent_2');
        expect(index).toBe(1);
        expect(type).toBe('myAgents');
      });

      it('should return correct index and type for officialAgents credential', () => {
        const [index, type] = store.getCredentialIndex('official_agent_1');
        expect(index).toBe(0);
        expect(type).toBe('officialAgents');
      });

      it('should return -1 and officialAgents for non-existent credential', () => {
        const [index, type] = store.getCredentialIndex('non_existent');
        expect(index).toBe(-1);
        expect(type).toBe('officialAgents');
      });

      it('should initialize data structure if not exists', () => {
        store.credentials.data = null;
        store.getCredentialIndex('test');
        expect(store.credentials.data).toEqual({
          myAgents: [],
          officialAgents: [],
        });
      });
    });

    describe('updateCredential', () => {
      beforeEach(() => {
        store.credentials.data = {
          myAgents: [{ name: 'my_agent_1', value: 'old_value' }],
          officialAgents: [],
        };
      });

      it('should update existing credential', () => {
        store.updateCredential({ name: 'my_agent_1', value: 'new_value' });
        expect(store.credentials.data.myAgents[0].value).toBe('new_value');
      });

      it('should create new credential if not exists', () => {
        store.updateCredential({ name: 'new_agent', value: 'new_value' });
        expect(store.credentials.data.officialAgents).toContainEqual({
          name: 'new_agent',
          value: 'new_value',
        });
      });
    });
  });

  describe('Actions', () => {
    describe('fetchCredentials', () => {
      it('should fetch credentials successfully', async () => {
        nexusaiAPI.router.tunings.listCredentials.mockResolvedValue({
          data: mockCredentialsData,
        });

        await store.fetchCredentials();

        expect(nexusaiAPI.router.tunings.listCredentials).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
        });
        expect(store.credentials.status).toBe('success');
        expect(store.credentials.data).toEqual({
          myAgents: mockCredentialsData.my_agents_credentials,
          officialAgents: mockCredentialsData.official_agents_credentials,
        });
        expect(store.initialCredentials).toEqual(store.credentials.data);
      });

      it('should handle fetch credentials error', async () => {
        const error = new Error('API Error');
        nexusaiAPI.router.tunings.listCredentials.mockRejectedValue(error);

        await store.fetchCredentials();

        expect(store.credentials.status).toBe('error');
        expect(alertStore.add).toHaveBeenCalledWith({
          text: 'router.tunings.credentials.get_error',
          type: 'error',
        });
      });

      it('should set loading status during fetch', () => {
        nexusaiAPI.router.tunings.listCredentials.mockImplementation(() => {
          expect(store.credentials.status).toBe('loading');
          return Promise.resolve({ data: mockCredentialsData });
        });

        store.fetchCredentials();
      });
    });

    describe('saveCredentials', () => {
      beforeEach(() => {
        store.credentials.data = {
          myAgents: [{ name: 'my_agent_1', value: 'value1' }],
          officialAgents: [{ name: 'official_agent_1', value: 'value2' }],
        };
      });

      it('should save credentials successfully', async () => {
        nexusaiAPI.router.tunings.editCredentials.mockResolvedValue();

        await store.saveCredentials();

        expect(nexusaiAPI.router.tunings.editCredentials).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          credentials: {
            my_agent_1: 'value1',
            official_agent_1: 'value2',
          },
          requestOptions: {
            hideGenericErrorAlert: true,
          },
        });
        expect(store.credentials.status).toBe('success');
        expect(store.initialCredentials).toEqual(store.credentials.data);
      });

      it('should handle save credentials error', async () => {
        const error = new Error('Save Error');
        nexusaiAPI.router.tunings.editCredentials.mockRejectedValue(error);

        await store.saveCredentials();

        expect(store.credentials.status).toBe('error');
      });
    });

    describe('fetchSettings', () => {
      it('should fetch settings successfully', async () => {
        nexusaiAPI.router.tunings.getProgressiveFeedback.mockResolvedValue({
          progressiveFeedback: true,
        });
        nexusaiAPI.router.tunings.getComponents.mockResolvedValue({
          components: true,
        });
        nexusaiAPI.router.profile.read.mockResolvedValue({
          data: mockSettingsData,
        });

        await store.fetchSettings();

        expect(store.settings.status).toBe('success');
        expect(store.settings.data).toEqual({
          components: true,
          progressiveFeedback: true,
          humanSupport: true,
          humanSupportPrompt: 'Test prompt',
        });
        expect(store.initialSettings).toEqual(store.settings.data);
      });

      it('should handle fetch settings error', async () => {
        nexusaiAPI.router.tunings.getProgressiveFeedback.mockRejectedValue(
          new Error('Error'),
        );

        await store.fetchSettings();

        expect(store.settings.status).toBe('error');
      });

      it('should handle missing team data gracefully', async () => {
        nexusaiAPI.router.tunings.getProgressiveFeedback.mockResolvedValue({
          progressiveFeedback: false,
        });
        nexusaiAPI.router.tunings.getComponents.mockResolvedValue({
          components: false,
        });
        nexusaiAPI.router.profile.read.mockResolvedValue({
          data: {},
        });

        await store.fetchSettings();

        expect(store.settings.data.humanSupport).toBe(false);
        expect(store.settings.data.humanSupportPrompt).toBe('');
      });
    });

    describe('saveSettings', () => {
      beforeEach(() => {
        store.settings.data = {
          components: true,
          progressiveFeedback: true,
          humanSupport: true,
          humanSupportPrompt: 'New prompt',
        };
        store.initialSettings = {
          components: false,
          progressiveFeedback: false,
          humanSupport: false,
          humanSupportPrompt: '',
        };
      });

      it('should save all changed settings successfully', async () => {
        nexusaiAPI.router.tunings.editProgressiveFeedback.mockResolvedValue();
        nexusaiAPI.router.tunings.editComponents.mockResolvedValue();
        nexusaiAPI.router.profile.edit.mockResolvedValue();

        const result = await store.saveSettings();

        expect(
          nexusaiAPI.router.tunings.editProgressiveFeedback,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          data: { progressiveFeedback: true },
          requestOptions: { hideGenericErrorAlert: true },
        });
        expect(nexusaiAPI.router.tunings.editComponents).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          data: { components: true },
          requestOptions: { hideGenericErrorAlert: true },
        });
        expect(nexusaiAPI.router.profile.edit).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          data: {
            team: {
              human_support: true,
              human_support_prompt: 'New prompt',
            },
          },
          requestOptions: { hideGenericErrorAlert: true },
        });
        expect(store.settings.status).toBe('success');
        expect(result).toBe(true);
      });

      it('should only save changed settings', async () => {
        store.settings.data.progressiveFeedback = false; // Same as initial
        store.settings.data.components = false; // Same as initial

        nexusaiAPI.router.profile.edit.mockResolvedValue();

        await store.saveSettings();

        expect(
          nexusaiAPI.router.tunings.editProgressiveFeedback,
        ).not.toHaveBeenCalled();
        expect(nexusaiAPI.router.tunings.editComponents).not.toHaveBeenCalled();
        expect(nexusaiAPI.router.profile.edit).toHaveBeenCalled();
      });

      it('should handle save settings error', async () => {
        nexusaiAPI.router.tunings.editProgressiveFeedback.mockRejectedValue(
          new Error('Error'),
        );

        const result = await store.saveSettings();

        expect(store.settings.status).toBe('error');
        expect(result).toBe(false);
      });

      it('should post message when human support status changes', async () => {
        const postMessageSpy = vi
          .spyOn(window.parent, 'postMessage')
          .mockImplementation(() => {});
        nexusaiAPI.router.profile.edit.mockResolvedValue();

        store.initialSettings.humanSupport = false;

        store.settings.data.progressiveFeedback = false;
        store.settings.data.humanSupport = true;

        await store.saveSettings();

        expect(postMessageSpy).toHaveBeenCalledWith(
          {
            event: 'change-human-service-status',
            value: JSON.stringify(true),
          },
          '*',
        );
      });
    });

    describe('createCredentials', () => {
      it('should create credentials successfully', async () => {
        const agentUuid = 'test-agent-uuid';
        const credentialsToCreate = { key: 'value' };
        nexusaiAPI.router.tunings.createCredentials.mockResolvedValue();

        await store.createCredentials(agentUuid, credentialsToCreate);

        expect(
          nexusaiAPI.router.tunings.createCredentials,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          credentials: credentialsToCreate,
          agent_uuid: agentUuid,
        });
        expect(store.credentials.status).toBe('success');
      });

      it('should handle create credentials error', async () => {
        nexusaiAPI.router.tunings.createCredentials.mockRejectedValue(
          new Error('Error'),
        );

        await store.createCredentials('test-uuid', {});

        expect(store.credentials.status).toBe('error');
      });
    });

    describe('saveTunings', () => {
      beforeEach(() => {
        store.credentials.data = {
          myAgents: [{ name: 'agent1', value: 'value1' }],
          officialAgents: [],
        };
        store.initialCredentials = {
          myAgents: [{ name: 'agent1', value: 'old_value1' }],
          officialAgents: [],
        };
        store.settings.data = {
          components: true,
          progressiveFeedback: false,
          humanSupport: false,
          humanSupportPrompt: '',
        };
        store.initialSettings = {
          components: false,
          progressiveFeedback: false,
          humanSupport: false,
          humanSupportPrompt: '',
        };
      });

      it('should save both credentials and settings successfully', async () => {
        nexusaiAPI.router.tunings.editCredentials.mockResolvedValue();
        nexusaiAPI.router.tunings.editComponents.mockResolvedValue();

        await store.saveTunings();

        expect(alertStore.add).toHaveBeenCalledWith({
          text: 'router.tunings.save_success',
          type: 'success',
        });
      });

      it('should show error for credentials failure', async () => {
        nexusaiAPI.router.tunings.editCredentials.mockRejectedValue(
          new Error('Error'),
        );
        nexusaiAPI.router.tunings.editComponents.mockResolvedValue();

        await store.saveTunings();

        expect(alertStore.add).toHaveBeenCalledWith({
          text: 'router.tunings.credentials.save_error',
          type: 'error',
        });
        expect(alertStore.add).not.toHaveBeenCalledWith({
          text: 'router.tunings.save_success',
          type: 'success',
        });
      });

      it('should show error for settings failure', async () => {
        nexusaiAPI.router.tunings.editCredentials.mockResolvedValue();
        nexusaiAPI.router.tunings.editComponents.mockRejectedValue(
          new Error('Error'),
        );

        await store.saveTunings();

        expect(alertStore.add).toHaveBeenCalledWith({
          text: 'router.tunings.settings.save_error',
          type: 'error',
        });
        expect(alertStore.add).not.toHaveBeenCalledWith({
          text: 'router.tunings.save_success',
          type: 'success',
        });
      });
    });
  });
});
