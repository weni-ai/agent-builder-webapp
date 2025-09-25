import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import AgentsTeam from '@/views/AgentsTeam/index.vue';
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { usePreviewStore } from '@/store/Preview';

describe('AgentsTeam.vue', () => {
  let wrapper;
  let agentsTeamStore;
  let previewStore;

  const agentBuilderHeader = () =>
    wrapper.findComponent('[data-testid="agents-team-header"]');
  const activeTeam = () => wrapper.findComponent('[data-testid="active-team"]');
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
    previewStore = usePreviewStore();
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

    it('renders the PreviewDrawer component', () => {
      expect(previewDrawer().exists()).toBe(true);
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
