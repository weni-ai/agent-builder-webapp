import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import AgentsTeam from '@/views/AgentsTeam/index.vue';
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { usePreviewStore } from '@/store/Preview';

describe('AgentsTeam.vue', () => {
  let wrapper;
  let agentsTeamStore;
  let previewStore;

  const agentsHeader = () =>
    wrapper.findComponent('[data-testid="agents-header"]');
  const assignedAgents = () =>
    wrapper.findComponent('[data-testid="assigned-agents"]');
  const agentsGalleryModal = () =>
    wrapper.findComponent('[data-testid="agents-gallery-modal"]');
  const previewDrawer = () =>
    wrapper.findComponent('[data-testid="preview-drawer"]');
  const assignAgentsButton = () =>
    wrapper.findComponent('[data-testid="assign-agents-button"]');
  const previewButton = () =>
    wrapper.findComponent('[data-testid="preview-button"]');

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
          PreviewDrawer: true,
        },
      },
    });

    agentsTeamStore = useAgentsTeamStore();
    previewStore = usePreviewStore();
  });

  describe('Component rendering', () => {
    it('renders correctly', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('renders the structure correctly', () => {
      expect(agentsHeader().exists()).toBe(true);
      expect(assignedAgents().exists()).toBe(true);
      expect(agentsGalleryModal().exists()).toBe(true);
      expect(previewDrawer().exists()).toBe(true);
    });

    it('renders assign agents button only when there are agents', async () => {
      expect(assignAgentsButton().exists()).toBe(true);

      agentsTeamStore.activeTeam.data.agents = [];
      await wrapper.vm.$nextTick();

      expect(assignAgentsButton().exists()).toBe(false);
    });
  });

  describe('User interactions', () => {
    it('opens agents gallery modal when assign agents button is clicked', async () => {
      await assignAgentsButton().trigger('click');
      expect(agentsTeamStore.isAgentsGalleryOpen).toBe(true);
    });

    it('opens preview drawer when preview button is clicked', async () => {
      await previewButton().trigger('click');

      expect(previewDrawer().props('modelValue')).toBe(true);
    });
  });

  describe('Component lifecycle', () => {
    it('disconnects WebSocket and clears logs on unmount', async () => {
      previewStore.ws = true;

      wrapper.unmount();

      expect(previewStore.disconnectWS).toHaveBeenCalled();
      expect(previewStore.clearLogs).toHaveBeenCalled();
    });
  });
});
