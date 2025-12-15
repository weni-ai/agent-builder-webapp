import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PreviewAgentCard from '../PreviewAgentCard.vue';

describe('PreviewAgentCard.vue', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(PreviewAgentCard, {
      props: {
        type: 'agent',
        name: 'Test Agent',
        active: false,
        currentTask: 'Processing',
        ...props,
      },
      global: {
        stubs: {
          AgentIcon: true,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const agentCard = () => wrapper.find('[data-testid="preview-agent-card"]');
  const agentCardIcon = () =>
    wrapper.findComponent('[data-testid="preview-agent-card-icon-agent"]');
  const managerCardIcon = () =>
    wrapper.findComponent('[data-testid="preview-agent-card-icon-manager"]');
  const agentCardName = () =>
    wrapper.find('[data-testid="preview-agent-card-name"]');
  const agentCardStatus = () =>
    wrapper.find('[data-testid="preview-agent-card-status"]');

  it('should render correctly with required props', () => {
    expect(wrapper.exists()).toBe(true);
    expect(agentCard().exists()).toBe(true);
  });

  it('should display the correct name', () => {
    const name = 'Test Agent Name';
    wrapper = createWrapper({ name });
    expect(agentCardName().text()).toBe(name);
  });

  it('should display currentTask when provided', () => {
    const currentTask = 'Analyzing data';
    wrapper = createWrapper({ currentTask });
    expect(agentCardStatus().text()).toBe(currentTask);
  });

  it('should display empty string when no currentTask is active', () => {
    wrapper = createWrapper({ currentTask: '' });
    expect(agentCardStatus().text()).toBe('');
  });

  describe('icon rendering', () => {
    it('should not render any icon when type is manager', () => {
      wrapper = createWrapper({ type: 'manager' });

      expect(managerCardIcon().exists()).toBe(false);
      expect(agentCardIcon().exists()).toBe(false);
    });

    it('should not show any icon when type is agent and not active', () => {
      wrapper = createWrapper({ type: 'agent', active: false });

      expect(managerCardIcon().exists()).toBe(false);
      expect(agentCardIcon().isVisible()).toBe(false);
    });

    it('should render agent icon when type is agent and active', () => {
      wrapper = createWrapper({ type: 'agent', active: true });

      expect(managerCardIcon().exists()).toBe(false);
      expect(agentCardIcon().exists()).toBe(true);
    });
  });

  it('should apply active class when active prop is true', () => {
    wrapper = createWrapper({ active: true });
    expect(agentCard().classes()).toContain('preview-agent-card--active');
  });

  it('should apply standby class when active prop is false', () => {
    wrapper = createWrapper({ active: false });
    expect(agentCard().classes()).toContain('preview-agent-card--standby');
  });

  it('should apply animated class for active agents', () => {
    wrapper = createWrapper({ active: true, type: 'agent' });
    expect(agentCard().classes()).toContain('preview-agent-card--animated');
  });

  it('should not apply animated class for active managers', () => {
    wrapper = createWrapper({ active: true, type: 'manager' });
    expect(agentCard().classes()).not.toContain('preview-agent-card--animated');
  });
});
