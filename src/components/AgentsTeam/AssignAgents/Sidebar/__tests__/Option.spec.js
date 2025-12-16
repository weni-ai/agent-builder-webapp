import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import SidebarOption from '../Option.vue';

describe('SidebarOption', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SidebarOption, {
      props: {
        isActive: false,
        name: 'Mock option',
      },
    });
  });

  it('renders the provided option name', () => {
    expect(wrapper.find('[data-testid="sidebar-option-name"]').text()).toBe(
      'Mock option',
    );
  });

  it('applies the active modifier class when isActive is true', async () => {
    await wrapper.setProps({ isActive: true });

    expect(wrapper.find('[data-testid="sidebar-option"]').classes()).toContain(
      'assign-agents-sidebar__option--active',
    );
  });

  it('renders the icon when icon prop is provided', async () => {
    await wrapper.setProps({ icon: '/img/icon.svg', name: 'Option' });

    const icon = wrapper.find('[data-testid="sidebar-option-icon"]');
    expect(icon.exists()).toBe(true);
    expect(icon.attributes('src')).toBe('/img/icon.svg');
    expect(icon.attributes('alt')).toBe('Option');
  });

  it('does not render icon when icon prop is missing', async () => {
    await wrapper.setProps({ icon: undefined });

    expect(wrapper.find('[data-testid="sidebar-option-icon"]').exists()).toBe(
      false,
    );
  });
});
