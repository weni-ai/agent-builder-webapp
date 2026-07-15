import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import AgentsTeamView from '@/views/AgentsTeam/index.vue';
import HomeHeaderActions from '@/components/AgentsTeam/HomeHeaderActions.vue';
import InstructionsHeaderActions from '@/components/Instructions/InstructionsHeaderActions.vue';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';
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

vi.mock('@/store/FeatureFlags', () => ({
  useFeatureFlagsStore: vi.fn(),
}));

describe('AgentsTeam view', () => {
  let wrapper;
  let tSpy;

  const getHeaderState = () => ({
    title: wrapper.vm.headerTitle?.value ?? wrapper.vm.headerTitle,
    description:
      wrapper.vm.headerDescription?.value ?? wrapper.vm.headerDescription,
    actions: wrapper.vm.headerActions?.value ?? wrapper.vm.headerActions,
  });

  const createWrapper = ({ categorizationOfInstructions = false } = {}) => {
    useFeatureFlagsStore.mockReturnValue({
      flags: { categorizationOfInstructions },
    });
    wrapper = shallowMount(AgentsTeamView);
  };

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
    createWrapper();

    expect(wrapper.find('[data-testid="agents-header"]').exists()).toBe(true);

    const headerState = getHeaderState();

    expect(headerState.title).toBe('agents.title');
    expect(headerState.description).toBe('agents.description');
    expect(headerState.actions).toBe(HomeHeaderActions);
  });

  it('updates header copy for assign route', () => {
    mockRoute.name = 'agents-assign';

    createWrapper();

    const headerState = getHeaderState();

    expect(headerState.title).toBe('agents.assign_agents.title');
    expect(headerState.description).toBe('agents.assign_agents.description');
    expect(headerState.actions).toBe(null);
  });

  it('injects header actions when they are available', () => {
    mockRoute.name = 'agents-team';

    createWrapper();

    const headerState = getHeaderState();

    expect(headerState.actions).toBe(HomeHeaderActions);
  });

  it('always renders the nested router view outlet', () => {
    createWrapper();

    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true);
  });

  describe('instructions route', () => {
    beforeEach(() => {
      mockRoute.name = 'instructions';
    });

    it('sets the correct title and description', () => {
      createWrapper();

      const headerState = getHeaderState();

      expect(headerState.title).toBe('agents.instructions.title');
      expect(headerState.description).toBe('agents.instructions.description');
    });

    it('shows InstructionsHeaderActions when categorizationOfInstructions flag is on', () => {
      createWrapper({ categorizationOfInstructions: true });

      expect(getHeaderState().actions).toBe(InstructionsHeaderActions);
    });

    it('shows no header actions when categorizationOfInstructions flag is off', () => {
      createWrapper({ categorizationOfInstructions: false });

      expect(getHeaderState().actions).toBe(null);
    });
  });
});
