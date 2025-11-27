import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import AgentsTeam from '@/views/AgentsTeam/index.vue';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

describe('AgentsTeam.vue', () => {
  let wrapper;
  let agentsTeamStore;

  const agentBuilderHeader = () =>
    wrapper.findComponent('[data-testid="agents-team-header"]');
  const activeTeam = () => wrapper.findComponent('[data-testid="active-team"]');
  const agentsGalleryModal = () =>
    wrapper.findComponent('[data-testid="agents-gallery-modal"]');
  const assignAgentsButton = () =>
    wrapper.findComponent('[data-testid="assign-agents-button"]');

  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
    });

    wrapper = shallowMount(AgentsTeam, {
      global: {
        plugins: [pinia],
        stubs: {
          AgentBuilderHeader: {
            template: '<div><slot name="actions"/></div>',
          },
        },
      },
    });

    agentsTeamStore = useAgentsTeamStore();
  });

  describe('Component rendering', () => {
    it('renders correctly', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('renders the AgentBuilderHeader component', () => {
      expect(agentBuilderHeader().exists()).toBe(true);
    });

    it('renders the ActiveTeam component', () => {
      expect(activeTeam().exists()).toBe(true);
    });

    it('renders the AgentsGalleryModal component', () => {
      expect(agentsGalleryModal().exists()).toBe(true);
    });
  });

  describe('User interactions', () => {
    it('opens agents gallery modal when assign agents button is clicked', async () => {
      await assignAgentsButton().trigger('click');
      expect(agentsTeamStore.isAgentsGalleryOpen).toBe(true);
    });
  });
});
