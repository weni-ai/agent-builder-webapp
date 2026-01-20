import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import Credentials from '../Credentials.vue';

const fetchCredentialsMock = vi.fn();
const getCredentialIndexMock = vi.fn();

let tuningsStore;

vi.mock('@/store/Tunings', () => ({
  useTuningsStore: () => tuningsStore,
}));

const credentialsFixture = [
  {
    name: 'client_id',
    label: 'Client ID',
    placeholder: 'Enter client id',
  },
  {
    name: 'client_secret',
    label: 'Client Secret',
    placeholder: 'Enter client secret',
    is_confidential: true,
  },
];

function createtuningsStore() {
  return {
    credentials: { data: null, status: 'idle' },
    initialCredentials: {
      mock_credential: [{ name: 'client_id', value: 'stored-client-id' }],
    },
    fetchCredentials: fetchCredentialsMock,
    getCredentialIndex: getCredentialIndexMock,
  };
}

function createWrapper(props = {}) {
  return shallowMount(Credentials, {
    props: {
      credentials: credentialsFixture,
      credentialValues: {},
      ...props,
    },
  });
}

describe('Credentials', () => {
  let wrapper;

  beforeEach(() => {
    fetchCredentialsMock.mockReset();
    getCredentialIndexMock.mockReset();
    getCredentialIndexMock.mockImplementation((name) =>
      name === 'client_id' ? [0, 'mock_credential'] : [-1, 'mock_credential'],
    );
    tuningsStore = createtuningsStore();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  const findCredentialsSection = () =>
    wrapper.find('[data-testid="concierge-credentials"]');
  const findDisclaimer = () =>
    wrapper.find('[data-testid="concierge-credentials-disclaimer"]');
  const findEmptyMessage = () =>
    wrapper.find('[data-testid="concierge-credentials-empty"]');
  const findFields = () =>
    wrapper.findAll('[data-testid="concierge-credentials-field"]');
  describe('rendering states', () => {
    it('shows empty state when there are no credentials', () => {
      wrapper = createWrapper({ credentials: [] });

      expect(findCredentialsSection().exists()).toBe(false);
      expect(findEmptyMessage().exists()).toBe(true);
    });

    it('renders fields for credentials without stored values and shows disclaimer for used ones', () => {
      wrapper = createWrapper({
        credentials: credentialsFixture,
        credentialValues: { client_secret: '' },
      });

      expect(findCredentialsSection().exists()).toBe(true);
      const fields = findFields();
      expect(fields).toHaveLength(1);
      expect(findDisclaimer().exists()).toBe(true);
    });

    it('hides disclaimer when there are no stored credentials', () => {
      tuningsStore.initialCredentials = { mock_credential: [] };
      getCredentialIndexMock.mockReturnValue([-1, 'mock_credential']);
      wrapper = createWrapper({
        credentials: credentialsFixture,
        credentialValues: { client_secret: '' },
      });

      expect(findDisclaimer().exists()).toBe(false);
    });
  });

  describe('interactions', () => {
    it('emits updated credential values when user types', async () => {
      wrapper = createWrapper({
        credentials: credentialsFixture,
        credentialValues: { client_secret: '' },
      });

      await wrapper.vm.handleInputChange(credentialsFixture[1], 'new-secret');
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('update:credentialValues')).toEqual([
        [{ client_id: 'stored-client-id', client_secret: 'new-secret' }],
      ]);
    });
  });

  describe('lifecycle behaviour', () => {
    it('prefills credential values with stored entries', async () => {
      wrapper = createWrapper();

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.credentialValues.client_id).toBe('stored-client-id');
    });

    it('fetches credentials on mount when store has no data and is idle', async () => {
      wrapper = createWrapper();

      await wrapper.vm.$nextTick();

      expect(fetchCredentialsMock).toHaveBeenCalledTimes(1);
    });

    it('does not fetch credentials when store is already loading', async () => {
      tuningsStore.credentials.status = 'loading';
      wrapper = createWrapper();

      await wrapper.vm.$nextTick();

      expect(fetchCredentialsMock).not.toHaveBeenCalled();
    });
  });
});
