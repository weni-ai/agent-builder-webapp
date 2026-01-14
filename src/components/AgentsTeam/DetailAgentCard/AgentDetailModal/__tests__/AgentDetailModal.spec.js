import { beforeEach, describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import AgentDetailModal from '../index.vue';

function createAgent(overrides = {}) {
  return {
    uuid: 'agent-uuid',
    name: 'Agent Name',
    description: 'Agent description',
    ...overrides,
  };
}

describe('AgentDetailModal', () => {
  let wrapper;
  let agent;

  beforeEach(() => {
    agent = createAgent();
    wrapper = shallowMount(AgentDetailModal, {
      props: {
        agent,
        open: true,
      },
    });
  });

  it('passes props to the dialog and child components', async () => {
    const dialog = wrapper.findComponent('[data-testid="agent-detail-dialog"]');

    expect(dialog.props('open')).toBe(true);

    await wrapper.setProps({ open: false });
    expect(dialog.props('open')).toBe(false);

    expect(
      wrapper
        .findComponent('[data-testid="agent-detail-header"]')
        .props('agent'),
    ).toStrictEqual(agent);

    const viewOptions = wrapper.findComponent(
      '[data-testid="agent-detail-view-options"]',
    );
    expect(viewOptions.props('agent')).toStrictEqual(agent);
  });

  it('renders the about section with the agent description', () => {
    const aboutSection = wrapper.findComponent(
      '[data-testid="agent-detail-about-section"]',
    );

    expect(aboutSection.props('description')).toBe(agent.description);
  });

  it('emits update:open when the dialog emits update:open', async () => {
    const dialog = wrapper.findComponent('[data-testid="agent-detail-dialog"]');

    await dialog.vm.$emit('update:open', false);

    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('closes the modal when the view options emit agent-removed', async () => {
    const viewOptions = wrapper.findComponent(
      '[data-testid="agent-detail-view-options"]',
    );

    await viewOptions.vm.$emit('agent-removed');

    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });
});
