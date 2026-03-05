import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import MyAgentsView from '@/views/AgentsTeam/MyAgents.vue';
import AssignedAgents from '@/components/AgentsTeam/MyAgents/AssignedAgents.vue';

describe('MyAgents.vue', () => {
  let wrapper;

  const createWrapper = () => {
    wrapper = shallowMount(MyAgentsView);
  };

  const findSection = () => wrapper.find('[data-testid="my-agents"]');

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders section with my-agents class', () => {
    createWrapper();

    expect(findSection().exists()).toBe(true);
    expect(findSection().classes()).toContain('my-agents');
  });

  it('renders AssignedAgents component', () => {
    createWrapper();

    expect(wrapper.findComponent(AssignedAgents).exists()).toBe(true);
  });
});
