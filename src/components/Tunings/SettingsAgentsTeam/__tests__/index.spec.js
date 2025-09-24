import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import { useProjectStore } from '@/store/Project';

import SettingsAgentsTeam from '../index.vue';

describe('SettingsAgentsTeam/index.vue', () => {
  let wrapper;
  let pinia;
  let projectStore;

  const agentsPreviewComponent = () =>
    wrapper.findComponent('[data-testid="agents-preview"]');
  const humanSupportComponent = () =>
    wrapper.findComponent('[data-testid="human-support"]');
  const mainContainer = () =>
    wrapper.find('[data-testid="settings-agents-team"]');

  beforeEach(() => {
    pinia = createTestingPinia({
      initialState: {
        Project: {
          details: {
            backend: 'bedrock',
          },
        },
      },
    });

    wrapper = shallowMount(SettingsAgentsTeam, {
      global: {
        plugins: [pinia],
      },
    });

    projectStore = useProjectStore();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders the AgentsPreview component', () => {
      expect(agentsPreviewComponent().exists()).toBe(true);
    });

    it('renders the HumanSupport component', () => {
      expect(humanSupportComponent().exists()).toBe(true);
    });

    it('not renders the AgentsPreview component when backend is openai', async () => {
      projectStore.details.backend = 'openai';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.showAgentsPreview).toBe(false);
      expect(agentsPreviewComponent().exists()).toBe(false);
    });
  });

  describe('Component structure and layout', () => {
    it('renders components in correct order', () => {
      const container = mainContainer();
      const children = Array.from(container.element.children);

      expect(children).toHaveLength(2);
      expect(children[0].getAttribute('data-testid')).toBe('agents-preview');
      expect(children[1].getAttribute('data-testid')).toBe('human-support');
    });
  });
});
