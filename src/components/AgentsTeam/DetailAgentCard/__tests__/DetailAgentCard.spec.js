import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import DetailAgentCard from '../index.vue';
import AgentCard from '../../AgentCard.vue';
import AgentDetailModal from '../AgentDetailModal/index.vue';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

const getSystemsObjectsMock = vi.fn();

vi.mock('@/composables/useAgentSystems', () => ({
  default: () => ({
    getSystemsObjects: getSystemsObjectsMock,
  }),
}));

function createAgent(overrides = {}) {
  return {
    uuid: 'agent-uuid',
    name: 'Agent Name',
    systems: ['VTEX'],
    ...overrides,
  };
}

function mountDetailAgentCard({ props = {} } = {}) {
  const pinia = createTestingPinia({ stubActions: false });

  return shallowMount(DetailAgentCard, {
    props: {
      agent: createAgent(),
      loading: false,
      ...props,
    },
    global: {
      plugins: [pinia],
    },
  });
}

describe('DetailAgentCard', () => {
  let systemsTags;
  let wrapper;
  let agentsTeamStore;

  beforeEach(() => {
    systemsTags = [{ name: 'VTEX' }];
    getSystemsObjectsMock.mockReset();
    getSystemsObjectsMock.mockReturnValue(systemsTags);

    wrapper = mountDetailAgentCard();

    agentsTeamStore = useAgentsTeamStore();
  });

  const card = () => wrapper.findComponent('[data-testid="detail-agent-card"]');
  const modal = () =>
    wrapper.findComponent('[data-testid="detail-agent-modal"]');

  it('passes the expected props to AgentCard', async () => {
    const agent = createAgent({
      uuid: 'agent-1',
      systems: ['VTEX', 'SYNERISE'],
    });

    await wrapper.setProps({ agent, loading: true });
    agentsTeamStore.newAgentAssigned = { uuid: 'agent-1' };
    await nextTick();

    expect(getSystemsObjectsMock).toHaveBeenLastCalledWith(agent.systems);

    const agentCard = card();
    expect(agentCard.props('agent')).toStrictEqual(agent);
    expect(agentCard.props('loading')).toBe(true);
    expect(agentCard.props('tags')).toBe(systemsTags);
    expect(agentCard.props('newAgentHighlight')).toBe(true);
  });

  it('disables the highlight when the assigned agent does not match', async () => {
    const agent = createAgent({ uuid: 'agent-2' });
    await wrapper.setProps({ agent });
    agentsTeamStore.newAgentAssigned = { uuid: 'other-agent' };
    await nextTick();

    expect(card().props('newAgentHighlight')).toBe(false);
  });

  it('falls back to an empty array when systems are missing', async () => {
    getSystemsObjectsMock.mockReturnValue([]);
    await wrapper.setProps({ agent: createAgent({ systems: undefined }) });

    expect(getSystemsObjectsMock).toHaveBeenLastCalledWith([]);

    expect(card().props('tags')).toStrictEqual([]);
  });

  it('opens the detail modal when the card is clicked', async () => {
    expect(modal().props('open')).toBe(false);

    await card().trigger('click');

    expect(modal().props('open')).toBe(true);
  });

  it('closes the detail modal when it emits update:open', async () => {
    await card().trigger('click');
    expect(modal().props('open')).toBe(true);

    await modal().vm.$emit('update:open', false);
    await wrapper.vm.$nextTick();

    expect(modal().props('open')).toBe(false);
  });

  it('forwards the agent prop to the detail modal', async () => {
    const agent = createAgent({ uuid: 'modal-agent' });
    await wrapper.setProps({ agent });

    expect(modal().props('agent')).toStrictEqual(agent);
  });
});
