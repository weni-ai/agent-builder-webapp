import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import ViewOptions from '../ViewOptions.vue';

function createAgent(overrides = {}) {
  return {
    uuid: 'agent-uuid',
    group: null,
    ...overrides,
  };
}

function createGroupAgent(overrides = {}) {
  return {
    uuid: 'group-uuid',
    group: 'CONCIERGE',
    ...overrides,
  };
}

describe('ViewOptions', () => {
  let wrapper;
  let agentsTeamStore;

  const createWrapper = (props = {}) => {
    const pinia = createTestingPinia({ stubActions: true });
    agentsTeamStore = useAgentsTeamStore(pinia);
    agentsTeamStore.toggleAgentAssignment = vi
      .fn()
      .mockResolvedValue({ status: 'success' });

    wrapper = shallowMount(ViewOptions, {
      props: {
        agent: createAgent(),
        ...props,
      },
      global: {
        plugins: [pinia],
      },
    });
  };

  const findRoot = () => wrapper.find('[data-testid="agent-view-options"]');
  const findTrigger = () =>
    wrapper.find('[data-testid="agent-view-options-trigger"]');
  const findIcon = () =>
    wrapper.find('[data-testid="agent-view-options-icon"]');
  const findActions = () =>
    wrapper.find('[data-testid="agent-view-options-actions"]');
  const findRemove = () =>
    wrapper.findComponent('[data-testid="agent-view-options-remove"]');

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders collapsed by default', () => {
    createWrapper();

    expect(findRoot().exists()).toBe(true);
    expect(findActions().exists()).toBe(false);
    expect(findTrigger().attributes('aria-expanded')).toBe('false');
    expect(findIcon().classes()).not.toContain(
      'agent-detail-modal__view-options-icon--expanded',
    );
  });

  it('toggles expanded state when the trigger is clicked', async () => {
    createWrapper();

    await findTrigger().trigger('click');

    expect(findTrigger().attributes('aria-expanded')).toBe('true');
    expect(findActions().exists()).toBe(true);
    expect(findIcon().classes()).toContain(
      'agent-detail-modal__view-options-icon--expanded',
    );
  });

  it('removes the agent and emits when the store responds with success', async () => {
    createWrapper();

    await findTrigger().trigger('click');
    await findRemove().trigger('click');
    await flushPromises();

    expect(agentsTeamStore.toggleAgentAssignment).toHaveBeenCalledWith({
      uuid: 'agent-uuid',
      is_assigned: false,
    });
    expect(wrapper.emitted('agent-removed')).toHaveLength(1);
  });

  it('passes group assignments to the store', async () => {
    createWrapper({ agent: createGroupAgent() });

    await findTrigger().trigger('click');
    await findRemove().trigger('click');
    await flushPromises();

    expect(agentsTeamStore.toggleAgentAssignment).toHaveBeenCalledWith({
      uuid: 'group-uuid',
      is_assigned: false,
    });
  });

  it('does not attempt removal when the agent uuid is missing', async () => {
    createWrapper({ agent: createAgent({ uuid: undefined }) });

    await findTrigger().trigger('click');
    await findRemove().trigger('click');

    expect(agentsTeamStore.toggleAgentAssignment).not.toHaveBeenCalled();
    expect(wrapper.emitted('agent-removed')).toBeUndefined();
  });

  it('prevents multiple removals while a request is in flight', async () => {
    const deferred = {};
    deferred.promise = new Promise((resolve) => {
      deferred.resolve = resolve;
    });

    createWrapper();
    agentsTeamStore.toggleAgentAssignment.mockReturnValue(deferred.promise);

    await findTrigger().trigger('click');
    await findRemove().trigger('click');
    await findRemove().trigger('click');

    expect(agentsTeamStore.toggleAgentAssignment).toHaveBeenCalledTimes(1);
    expect(findRemove().props('loading')).toBe(true);

    deferred.resolve({ status: 'success' });
    await flushPromises();

    expect(findRemove().props('loading')).toBe(false);
  });
});
