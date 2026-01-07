import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import SidebarSection from '../Section.vue';

describe('SidebarSection', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SidebarSection, {
      props: {
        title: 'Mock title',
      },
      slots: {
        default: '<p data-testid="slot-content">Sidebar content</p>',
      },
    });
  });

  it('renders the provided title', () => {
    expect(
      wrapper
        .find('[data-testid="assign-agents-sidebar-section-title"]')
        .text(),
    ).toBe('Mock title');
  });

  it('renders the default slot content', () => {
    const slotContent = wrapper.find('[data-testid="slot-content"]');
    expect(slotContent.exists()).toBe(true);
    expect(slotContent.text()).toBe('Sidebar content');
  });

  it('wraps content inside the sidebar section element', () => {
    expect(
      wrapper.find('[data-testid="assign-agents-sidebar-section"]').exists(),
    ).toBe(true);
  });
});
