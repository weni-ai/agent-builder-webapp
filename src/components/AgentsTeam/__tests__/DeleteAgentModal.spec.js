import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';

import { createTestingPinia } from '@pinia/testing';
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import i18n from '@/utils/plugins/i18n';

import DeleteAgentModal from '../DeleteAgentModal.vue';

const defaultAgent = {
  uuid: 'agent-uuid',
  name: 'Test Agent',
};

describe('DeleteAgentModal.vue', () => {
  let wrapper;
  let pinia;
  let deleteAgentMock;

  const createWrapper = (props = {}) => {
    deleteAgentMock = vi.fn().mockResolvedValue(undefined);
    pinia = createTestingPinia({ initialState: { AgentsTeam: {} } });
    const store = useAgentsTeamStore(pinia);
    store.deleteAgent = deleteAgentMock;

    wrapper = shallowMount(DeleteAgentModal, {
      props: {
        agent: defaultAgent,
        modelValue: true,
        ...props,
      },
      global: {
        plugins: [pinia],
      },
    });
  };

  const findModal = () => wrapper.findComponent('[data-testid="modal"]');
  const findDescription = () => wrapper.find('[data-testid="description"]');

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders modal with description containing agent name', () => {
    createWrapper();

    expect(findModal().exists()).toBe(true);
    expect(findDescription().exists()).toBe(true);
    expect(findDescription().text()).toContain(defaultAgent.name);
  });

  it('renders modal with translated description', () => {
    createWrapper();

    const expectedDescription = i18n.global.t(
      'router.agents_team.modal_delete_agent.description',
      { agent_name: defaultAgent.name },
    );
    expect(findDescription().text()).toBe(expectedDescription);
  });

  it('emits update:modelValue false when secondary button is clicked', async () => {
    createWrapper();

    await findModal().vm.$emit('secondary-button-click');

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('emits update:modelValue false when modal emits update:model-value', async () => {
    createWrapper();

    await findModal().vm.$emit('update:model-value', false);

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('calls store deleteAgent and closes when primary button is clicked', async () => {
    createWrapper();

    await findModal().vm.$emit('primary-button-click');
    await flushPromises();

    expect(deleteAgentMock).toHaveBeenCalledWith(defaultAgent);
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('passes the correct agent to deleteAgent when agent prop differs', async () => {
    const agent = { uuid: 'other-uuid', name: 'Other Agent' };
    createWrapper({ agent });

    await findModal().vm.$emit('primary-button-click');
    await flushPromises();

    expect(deleteAgentMock).toHaveBeenCalledWith(agent);
  });

  it('shows loading on primary button while delete is in progress', async () => {
    let resolveDelete;
    deleteAgentMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve;
        }),
    );
    pinia = createTestingPinia({ initialState: { AgentsTeam: {} } });
    const store = useAgentsTeamStore(pinia);
    store.deleteAgent = deleteAgentMock;

    wrapper = shallowMount(DeleteAgentModal, {
      props: { agent: defaultAgent, modelValue: true },
      global: { plugins: [pinia] },
    });

    const modal = findModal();
    expect(modal.props('primaryButtonProps').loading).toBe(false);

    await modal.vm.$emit('primary-button-click');
    await nextTick();

    expect(modal.props('primaryButtonProps').loading).toBe(true);

    resolveDelete();
    await flushPromises();
    await nextTick();

    expect(modal.props('primaryButtonProps').loading).toBe(false);
  });
});
