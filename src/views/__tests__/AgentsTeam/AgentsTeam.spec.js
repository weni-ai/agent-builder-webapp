import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import AgentsTeamView from '@/views/AgentsTeam/index.vue';
import HomeHeaderActions from '@/components/AgentsTeam/HomeHeaderActions.vue';
import i18n from '@/utils/plugins/i18n';

const mockRoute = {
  name: 'agents-team',
};

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');

  return {
    ...actual,
    useRoute: vi.fn(() => mockRoute),
  };
});

describe('AgentsTeam view', () => {
  let wrapper;
  let tSpy;

  const getHeaderState = () => ({
    title: wrapper.vm.headerTitle?.value ?? wrapper.vm.headerTitle,
    description:
      wrapper.vm.headerDescription?.value ?? wrapper.vm.headerDescription,
    actions: wrapper.vm.headerActions?.value ?? wrapper.vm.headerActions,
  });

  const mountView = () => shallowMount(AgentsTeamView);

  beforeEach(() => {
    mockRoute.name = 'agents-team';
    tSpy = vi.spyOn(i18n.global, 't').mockImplementation((key) => key);
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    tSpy?.mockRestore();
    vi.clearAllMocks();
  });

  it('renders default header content for agents-team route', () => {
    wrapper = mountView();

    expect(wrapper.find('[data-testid="agents-header"]').exists()).toBe(true);

    const headerState = getHeaderState();

    expect(headerState.title).toBe('agents.title');
    expect(headerState.description).toBe('agents.description');
    expect(headerState.actions).toBe(HomeHeaderActions);
  });

  it('updates header copy for assign route', () => {
    mockRoute.name = 'agents-assign';

    wrapper = mountView();

    const headerState = getHeaderState();

    expect(headerState.title).toBe('agents.assign_agents.title');
    expect(headerState.description).toBe('agents.assign_agents.description');
    expect(headerState.actions).toBe(null);
  });

  it('injects header actions when they are available', () => {
    mockRoute.name = 'agents-team';

    wrapper = mountView();

    const headerState = getHeaderState();

    expect(headerState.actions).toBe(HomeHeaderActions);
  });

  it('always renders the nested router view outlet', () => {
    wrapper = mountView();

    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true);
  });
});
