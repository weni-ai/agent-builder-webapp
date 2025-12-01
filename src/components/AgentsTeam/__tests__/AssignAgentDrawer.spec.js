import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { useTuningsStore } from '@/store/Tunings';

import AssignAgentDrawer from '../AssignAgentDrawer.vue';

describe('AssignAgentDrawer.vue', () => {
  const mockAgent = {
    uuid: 'test-uuid',
    name: 'Test Agent',
    credentials: [
      {
        name: 'API_KEY',
        label: 'API Key',
        placeholder: 'Enter API key',
      },
      {
        name: 'BASE_URL',
        label: 'Base URL',
        placeholder: 'Enter base URL',
      },
    ],
  };

  const mockData = {
    myAgents: [
      {
        name: 'API_KEY',
        value: '',
        label: 'API Key',
        placeholder: 'Enter API key',
      },
      {
        name: 'BASE_URL',
        value: 'https://example.com',
        label: 'Base URL',
        placeholder: 'Enter base URL',
      },
    ],
    officialAgents: [],
  };

  const initialState = {
    Tunings: {
      credentials: {
        data: mockData,
        status: 'success',
      },
      initialCredentials: mockData,
    },
  };

  let wrapper = null;
  let tuningsStore;

  const drawer = () =>
    wrapper.findComponent('[data-testid="assign-agent-drawer"]');
  const input = () =>
    wrapper.findComponent('input[data-testid="assign-agent-drawer-input"]');
  const credentialsWithValueSection = () =>
    wrapper.find('[data-testid="assign-agent-drawer-credentials"]');
  const credentialsWithoutValue = () =>
    wrapper.findAllComponents(
      '[data-testid="assign-agent-drawer-form-element"]',
    );
  const sharedInfoSection = () =>
    wrapper.find('[data-testid="assign-agent-drawer-shared-info"]');
  const sharedInfoIcon = () =>
    wrapper.findComponent(
      '[data-testid="assign-agent-drawer-shared-info-icon"]',
    );
  const sharedInfoText = () =>
    wrapper.findComponent(
      '[data-testid="assign-agent-drawer-shared-info-text"]',
    );

  beforeEach(() => {
    const pinia = createTestingPinia({
      initialState,
    });

    tuningsStore = useTuningsStore(pinia);

    tuningsStore.getCredentialIndex = vi.fn((name) => {
      if (name === 'API_KEY') return [0, 'myAgents'];
      if (name === 'BASE_URL') return [1, 'myAgents'];
      return [-1, ''];
    });

    wrapper = mount(AssignAgentDrawer, {
      props: {
        modelValue: true,
        agent: mockAgent,
        isAssigning: false,
      },
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicIcon: true,
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('should render correctly with required props', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('should render the drawer component', () => {
      expect(drawer().exists()).toBe(true);
    });

    it('should not render when agent has no credentials', async () => {
      await wrapper.setProps({
        agent: { ...mockAgent, credentials: [] },
      });
      expect(drawer().exists()).toBe(false);
    });

    it('should render credentials with value section', () => {
      expect(credentialsWithValueSection().exists()).toBe(true);
    });

    it('should render credentials without value section', () => {
      expect(credentialsWithoutValue().length).toBe(1); // Only API_KEY should be shown (no value)
    });
  });

  describe('Form interaction', () => {
    it('should update credential value when input changes', async () => {
      await input().vm.$emit('update:model-value', 'new-api-key');
      expect(tuningsStore.updateCredential).toHaveBeenCalled();
    });

    it('should disable primary button when credentials are not filled', () => {
      expect(drawer().props('disabledPrimaryButton')).toBe(true);
    });

    it('should use credential.label as placeholder when credential.placeholder is not provided', async () => {
      const agentWithNoPlaceholder = {
        ...mockAgent,
        credentials: [
          {
            name: 'TEST_CRED',
            label: 'Test Credential',
          },
        ],
      };

      await wrapper.setProps({
        agent: agentWithNoPlaceholder,
      });

      expect(input().attributes('placeholder')).toBe('Test Credential');
    });
  });

  describe('Modal events', () => {
    it('should emit update:modelValue when close is called', async () => {
      await drawer().vm.$emit('close');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('should call toggleAgentAssignment when primary button is clicked', async () => {
      tuningsStore.createCredentials.mockResolvedValue();

      await drawer().vm.$emit('primary-button-click');

      expect(wrapper.emitted('assign')).toBeTruthy();
    });
  });

  describe('toggleAgentAssignment', () => {
    beforeEach(() => {
      tuningsStore.createCredentials.mockResolvedValue();
    });

    it('should call createCredentials with correct arguments', async () => {
      tuningsStore.initialCredentials = { myAgents: [], officialAgents: [] };

      wrapper.vm.toggleAgentAssignment();

      expect(tuningsStore.createCredentials).toHaveBeenCalledWith(
        mockAgent.uuid,
        [
          {
            name: 'API_KEY',
            value: '',
            label: 'API Key',
            placeholder: 'Enter API key',
          },
          {
            label: 'Base URL',
            name: 'BASE_URL',
            placeholder: 'Enter base URL',
            value: 'https://example.com',
          },
        ],
      );
    });

    it('should emit assign when credentials are filled', async () => {
      await wrapper.vm.toggleAgentAssignment();

      expect(wrapper.emitted('assign')).toBeTruthy();
    });

    it('should call console.error when credentials request fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      tuningsStore.createCredentials.mockRejectedValue(new Error('Error'));

      await wrapper.vm.toggleAgentAssignment();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Shared Info Section', () => {
    it('should render shared info section', () => {
      expect(sharedInfoSection().exists()).toBe(true);
    });

    it('should render shared info icon with correct props', () => {
      const icon = sharedInfoIcon();
      expect(icon.exists()).toBe(true);
      expect(icon.props('scheme')).toBe('neutral-cleanest');
      expect(icon.props('icon')).toBe('info');
      expect(icon.props('size')).toBe('sm');
      expect(icon.props('filled')).toBe(true);
    });

    it('should render shared info text with correct props', () => {
      const text = sharedInfoText();
      expect(text.exists()).toBe(true);
      expect(text.props('tag')).toBe('p');
      expect(text.props('family')).toBe('secondary');
      expect(text.props('size')).toBe('body-md');
      expect(text.props('color')).toBe('neutral-clean');
    });
  });
});
