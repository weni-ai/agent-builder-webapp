import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import ModalAssignAgentGroup from '../index.vue';

const conciergeAgent = {
  name: 'Concierge',
  description: 'Handles concierge flows',
  type: 'PLUG_IN_PLAY',
  category: 'PRODUCT_DISCOVERY_AND_RECOMMENDATIONS',
  group: 'CONCIERGE',
  variants: [],
  MCPs: [],
  systems: ['VTEX'],
  assigned: false,
  icon: 'concierge-icon',
  is_official: true,
};

describe('ModalAssignAgentGroup', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    wrapper = shallowMount(ModalAssignAgentGroup, {
      props: {
        open: true,
        agent: conciergeAgent,
        ...props,
      },
    });
  };

  const modalHeader = () => wrapper.find('[data-testid="modal-header"]');
  const startComponent = () =>
    wrapper.find('[data-testid="modal-start-component"]');
  const groupComponent = () =>
    wrapper.find('[data-testid="modal-group-component"]');
  const nextButton = () => wrapper.find('[data-testid="next-button"]');

  const openGroupModal = async () => {
    await nextButton().trigger('click');
    await nextTick();
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders header and start step by default', () => {
    createWrapper();

    expect(modalHeader().exists()).toBe(true);
    expect(startComponent().exists()).toBe(true);
    expect(groupComponent().exists()).toBe(false);
  });

  it('opens the group modal when clicking the start button', async () => {
    createWrapper();

    await openGroupModal();

    expect(groupComponent().exists()).toBe(true);
    expect(startComponent().exists()).toBe(false);
  });

  it('emits close event and resets the group modal component', async () => {
    vi.useFakeTimers();
    createWrapper();

    await openGroupModal();

    wrapper.vm.closeAgentModal();

    expect(wrapper.emitted('update:open')).toEqual([[false]]);

    vi.runAllTimers();
    await nextTick();

    expect(groupComponent().exists()).toBe(false);
    expect(startComponent().exists()).toBe(true);

    vi.useRealTimers();
  });
});
