import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import AgentsTeam from '@/views/AgentsTeam/index.vue';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

describe('AgentsTeam.vue', () => {
  let wrapper;
  let agentsTeamStore;

  const agentsHeader = () =>
    wrapper.findComponent('[data-testid="agents-header"]');
  const assignedAgents = () =>
    wrapper.findComponent('[data-testid="assigned-agents"]');
  const agentsGalleryModal = () =>
    wrapper.findComponent('[data-testid="agents-gallery-modal"]');
  const assignAgentsButton = () =>
    wrapper.findComponent('[data-testid="assign-agents-button"]');

  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        AgentsTeam: {
          activeTeam: {
            status: null,
            data: {
              manager: null,
              agents: [
                {
                  uuid: 'uuid-1',
                  name: 'Agent 1',
                },
              ],
            },
          },
        },
      },
    });

    wrapper = mount(AgentsTeam, {
      global: {
        plugins: [pinia],
        stubs: {
          AssignedAgents: true,
          AgentsGalleryModal: true,
        },
      },
    });

    agentsTeamStore = useAgentsTeamStore();
  });

  describe('Component rendering', () => {
    it('renders correctly', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('renders the structure correctly', () => {
      expect(agentsHeader().exists()).toBe(true);
      expect(assignedAgents().exists()).toBe(true);
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
