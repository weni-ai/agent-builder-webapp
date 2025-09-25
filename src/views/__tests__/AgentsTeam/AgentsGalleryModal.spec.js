import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

import AgentsGalleryModal from '@/views/AgentsTeam/AgentsGalleryModal.vue';

describe('AgentsGalleryModal.vue', () => {
  vi.stubGlobal('open', vi.fn());

  let wrapper;
  let agentsTeamStore;

  const mockAgents = [
    {
      uuid: 'uuid-1',
      name: 'Agent 1',
      description: 'Description 1',
      skills: [{ name: 'Skill 1', icon: '🛒' }],
    },
    {
      uuid: 'uuid-2',
      name: 'Agent 2',
      description: 'Description 2',
      skills: [{ name: 'Skill 2', icon: '🛒' }],
    },
  ];

  const modal = () =>
    wrapper.findComponent('[data-testid="agents-gallery-modal"]');
  const agentsGallery = () => wrapper.find('[data-testid="agents-gallery"]');
  const sidebarMenu = () => wrapper.find('[data-testid="sidebar-menu"]');
  const sidebarItems = () =>
    wrapper.findAllComponents('[data-testid="sidebar-item"]');
  const searchInput = () => wrapper.find('[data-testid="search-input"]');
  const loadingCards = () =>
    wrapper.findAllComponents('[data-testid="agent-card-loading"]');
  const assignAgentCards = () =>
    wrapper.findAllComponents('[data-testid="agent-card"]');
  const customAgentsSection = () =>
    wrapper.find('[data-testid="custom-agents-section"]');
  const cliDocumentationLink = () =>
    wrapper.find('[data-testid="weni-cli-documentation-link"]');
  const noAgentFoundText = () =>
    wrapper.findComponent('[data-testid="no-agent-found"]');

  beforeEach(() => {
    const pinia = createTestingPinia({
      initialState: {
        AgentsTeam: {
          isAgentsGalleryOpen: true,
          linkToCreateAgent: 'https://example.com/create-agent',
          officialAgents: {
            status: null,
            data: mockAgents,
          },
          myAgents: {
            status: null,
            data: mockAgents,
          },
        },
      },
    });

    agentsTeamStore = useAgentsTeamStore();

    wrapper = mount(AgentsGalleryModal, {
      global: {
        plugins: [pinia],
        stubs: {
          'i18n-t': {
            template: '<div><slot name="weni_cli_documentation" /></div>',
          },
          AssignAgentCard: true,
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly', () => {
      expect(wrapper.exists()).toBe(true);
      expect(agentsGallery().exists()).toBe(true);
    });

    it('renders the sidebar menu with the correct tabs', () => {
      expect(sidebarMenu().exists()).toBe(true);
      expect(sidebarItems().length).toBe(2);
      expect(sidebarItems()[0].props('active')).toBe(true);
      expect(sidebarItems()[1].props('active')).toBe(false);
    });

    it('renders the search input', () => {
      expect(searchInput().exists()).toBe(true);
    });

    it('renders agent cards', () => {
      expect(assignAgentCards().length).toBe(2);
    });
  });

  describe('Loading states', () => {
    it('renders loading state for official agents', async () => {
      agentsTeamStore.officialAgents.status = 'loading';
      await nextTick();

      expect(loadingCards().length).toBe(3);
    });

    it('renders loading state for my agents tab', async () => {
      wrapper.vm.activeTab = 'my-agents';
      agentsTeamStore.myAgents.status = 'loading';
      await nextTick();

      expect(loadingCards().length).toBe(3);
    });
  });

  describe('Tab switching', () => {
    it('changes the active tab when sidebar item is clicked', async () => {
      await sidebarItems()[1].trigger('click');

      expect(wrapper.vm.activeTab).toBe('my-agents');
      expect(sidebarItems()[0].props('active')).toBe(false);
      expect(sidebarItems()[1].props('active')).toBe(true);
    });

    it('changes the data when tab changes', async () => {
      expect(wrapper.vm.agentsData).toEqual(
        agentsTeamStore.officialAgents.data,
      );

      await sidebarItems()[1].trigger('click');

      expect(wrapper.vm.agentsData).toEqual(agentsTeamStore.myAgents.data);
    });

    it('does not reload my agents if already loaded', async () => {
      agentsTeamStore.myAgents.status = 'complete';
      vi.clearAllMocks();

      await sidebarItems()[1].trigger('click');

      expect(agentsTeamStore.loadMyAgents).not.toHaveBeenCalled();
    });
  });

  describe('Search functionality', () => {
    it('searches official agents when search input changes', async () => {
      vi.useFakeTimers();
      vi.clearAllMocks();

      await wrapper.find('input').setValue('Test Search');
      await vi.runAllTimersAsync();

      expect(agentsTeamStore.loadOfficialAgents).toHaveBeenCalledWith({
        search: 'Test Search',
      });
      vi.useRealTimers();
    });

    it('searches my agents when search input changes in my agents tab', async () => {
      vi.useFakeTimers();
      await sidebarItems()[1].trigger('click');
      vi.clearAllMocks();

      await wrapper.find('input').setValue('My Search');
      await vi.runAllTimersAsync();

      expect(agentsTeamStore.loadMyAgents).toHaveBeenCalledWith({
        search: 'My Search',
      });
      vi.useRealTimers();
    });

    it('shows "no agent found" message when search has no results', async () => {
      agentsTeamStore.officialAgents.data = [];
      agentsTeamStore.officialAgents.status = 'complete';
      wrapper.vm.search.official = 'No Results';
      wrapper.vm.updateSearchEmpty();
      await nextTick();

      expect(wrapper.vm.isSearchEmpty).toBe(true);
      expect(noAgentFoundText().exists()).toBe(true);
    });
  });

  describe('Empty states', () => {
    it('shows empty state for my agents when there are no agents', async () => {
      agentsTeamStore.myAgents.data = [];
      wrapper.vm.activeTab = 'my-agents';
      await nextTick();

      expect(wrapper.vm.isMyAgentsEmpty).toBe(true);
      expect(customAgentsSection().classes()).toContain(
        'agents-gallery__custom-agents--empty',
      );
      expect(searchInput().exists()).toBe(false);
    });

    it('does not show empty state for official agents when there are no agents', async () => {
      agentsTeamStore.officialAgents.data = [];
      await nextTick();

      expect(wrapper.vm.isMyAgentsEmpty).toBe(false);
      expect(searchInput().exists()).toBe(true);
    });
  });

  describe('User interactions', () => {
    beforeEach(async () => {
      agentsTeamStore.officialAgents.data = mockAgents;
      agentsTeamStore.isAgentsGalleryOpen = true;
      await nextTick();
    });

    it('closes modal when closeModal is called', async () => {
      wrapper.vm.closeModal();

      expect(agentsTeamStore.isAgentsGalleryOpen).toBe(false);
    });

    it('closes modal when agent is assigned', async () => {
      const assignAgentCard = assignAgentCards()[0];
      await assignAgentCard.vm.$emit('agent-assigned');

      expect(agentsTeamStore.isAgentsGalleryOpen).toBe(false);
    });

    it('closes modal when modal emits update:model-value', async () => {
      await modal().vm.$emit('update:model-value', false);

      expect(agentsTeamStore.isAgentsGalleryOpen).toBe(false);
    });

    it('opens CLI documentation in new tab when link is clicked', async () => {
      wrapper.vm.activeTab = 'my-agents';
      await nextTick();

      await cliDocumentationLink().trigger('click');

      expect(window.open).toHaveBeenCalledWith(
        agentsTeamStore.linkToCreateAgent,
        '_blank',
      );
    });
  });

  describe('Computed properties', () => {
    it('correctly computes isLoadingAgents based on store status', async () => {
      expect(wrapper.vm.isLoadingAgents).toBe(false);

      agentsTeamStore.officialAgents.status = 'loading';
      await nextTick();
      expect(wrapper.vm.isLoadingAgents).toBe(true);

      agentsTeamStore.officialAgents.status = 'complete';
      agentsTeamStore.myAgents.status = 'loading';
      await nextTick();
      expect(wrapper.vm.isLoadingAgents).toBe(true);

      agentsTeamStore.myAgents.status = 'complete';
      await nextTick();
      expect(wrapper.vm.isLoadingAgents).toBe(false);
    });

    it('correctly computes isMyAgentsEmpty in different scenarios', async () => {
      agentsTeamStore.myAgents.data = mockAgents;
      wrapper.vm.activeTab = 'my-agents';
      expect(wrapper.vm.isMyAgentsEmpty).toBe(false);

      agentsTeamStore.myAgents.data = [];
      await nextTick();
      expect(wrapper.vm.isMyAgentsEmpty).toBe(true);

      agentsTeamStore.myAgents.status = 'loading';
      await nextTick();
      expect(wrapper.vm.isMyAgentsEmpty).toBe(false);

      wrapper.vm.search['my-agents'] = 'search term';
      wrapper.vm.updateSearchEmpty();
      await nextTick();
      expect(wrapper.vm.isMyAgentsEmpty).toBe(false);
    });
  });
});
