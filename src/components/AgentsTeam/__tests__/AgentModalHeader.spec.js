import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import i18n from '@/utils/plugins/i18n';
import AgentModalHeader from '../AgentModalHeader.vue';

const defaultAgent = {
  name: 'Test Agent',
  icon: 'https://example.com/agent-icon.svg',
  is_official: false,
};

describe('AgentModalHeader.vue', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    wrapper = shallowMount(AgentModalHeader, {
      props: {
        agent: defaultAgent,
        ...props,
      },
    });
  };

  const findIcon = () => wrapper.findComponent('[data-testid="agent-icon"]');
  const findTitle = () =>
    wrapper.find('[data-testid="agent-modal-header-title"]');
  const findTag = () => wrapper.findComponent('[data-testid="agent-tag"]');

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders agent icon with agent icon prop', () => {
    createWrapper();

    expect(findIcon().exists()).toBe(true);
    expect(findIcon().props('icon')).toBe(defaultAgent.icon);
  });

  it('renders agent name as title', () => {
    createWrapper({ agent: { ...defaultAgent, name: 'Custom Name' } });

    expect(findTitle().exists()).toBe(true);
    expect(findTitle().text()).toBe('Custom Name');
  });

  it('renders official tag when agent is official', () => {
    createWrapper({
      agent: { ...defaultAgent, is_official: true },
    });

    expect(findTag().exists()).toBe(true);
    expect(findTag().props('text')).toBe(
      i18n.global.t('router.agents_team.card.official'),
    );
    expect(findTag().props('scheme')).toBe('teal');
  });

  it('renders custom tag when agent is not official', () => {
    createWrapper();

    expect(findTag().exists()).toBe(true);
    expect(findTag().props('text')).toBe(
      i18n.global.t('router.agents_team.card.custom'),
    );
    expect(findTag().props('scheme')).toBe('purple');
  });
});
