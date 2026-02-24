import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import AgentDetailSection from '../AgentDetailSection.vue';

describe('AgentDetailSection.vue', () => {
  let wrapper;

  const createWrapper = (props = {}, slotContent = '') => {
    wrapper = shallowMount(AgentDetailSection, {
      props: {
        title: 'Section Title',
        ...props,
      },
      slots: slotContent ? { default: slotContent } : {},
    });
  };

  const findSection = () => wrapper.find('[data-testid="agent-detail-section"]');
  const findTitle = () =>
    wrapper.find('[data-testid="agent-detail-section-title"]');
  const findDescription = () =>
    wrapper.find('[data-testid="agent-detail-section-description"]');

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders the section with title', () => {
    createWrapper({ title: 'About' });

    expect(findSection().exists()).toBe(true);
    expect(findTitle().exists()).toBe(true);
    expect(findTitle().text()).toBe('About');
  });

  it('renders description when provided', () => {
    createWrapper({
      title: 'About',
      description: 'Agent description text',
    });

    expect(findDescription().exists()).toBe(true);
    expect(findDescription().text()).toBe('Agent description text');
  });

  it('does not render description when not provided', () => {
    createWrapper({ title: 'About' });

    expect(findDescription().exists()).toBe(false);
  });

  it('does not render description when empty string', () => {
    createWrapper({ title: 'About', description: '' });

    expect(findDescription().exists()).toBe(false);
  });

  it('renders default slot content', () => {
    createWrapper(
      { title: 'Details' },
      '<span data-testid="slot-content">Slot content</span>',
    );

    expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="slot-content"]').text()).toBe(
      'Slot content',
    );
  });
});
