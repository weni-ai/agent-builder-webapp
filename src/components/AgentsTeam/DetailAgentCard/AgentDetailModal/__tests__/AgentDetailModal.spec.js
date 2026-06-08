import { beforeEach, describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import AgentDetailModal from '../index.vue';

function createAgent(overrides = {}) {
  return {
    uuid: 'agent-uuid',
    name: 'Agent Name',
    about: { en: 'Agent description', pt: null, es: null },
    mcps: [],
    ...overrides,
  };
}

describe('AgentDetailModal', () => {
  let wrapper;
  let agent;

  beforeEach(() => {
    const pinia = createTestingPinia({
      initialState: {
        AgentsTeam: {
          availableSystems: [],
        },
      },
    });

    agent = createAgent();
    wrapper = shallowMount(AgentDetailModal, {
      global: {
        plugins: [pinia],
      },
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

  it('renders the about section with the translated about text', () => {
    const aboutSection = wrapper.findComponent(
      '[data-testid="agent-detail-about-section"]',
    );

    expect(aboutSection.props('description')).toBe(agent.about.en);
  });

  it('does not pass lastUpdated when the agent has no last_updated', () => {
    const aboutSection = wrapper.findComponent(
      '[data-testid="agent-detail-about-section"]',
    );

    expect(aboutSection.props('lastUpdated')).toBeUndefined();
  });

  it('passes the formatted last updated label when the agent has last_updated', async () => {
    await wrapper.setProps({
      agent: createAgent({ last_updated: '2026-05-13T15:15:00' }),
    });

    const aboutSection = wrapper.findComponent(
      '[data-testid="agent-detail-about-section"]',
    );

    expect(aboutSection.props('lastUpdated')).toBe(
      'Updated on May 13, 2026, at 3:15 p.m.',
    );
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
