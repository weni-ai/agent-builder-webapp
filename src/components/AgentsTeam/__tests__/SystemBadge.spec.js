import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SystemBadge from '../SystemBadge.vue';

const getSystemObjectMock = vi.fn();

vi.mock('@/composables/useAgentSystems', () => ({
  default: () => ({
    getSystemObject: getSystemObjectMock,
  }),
}));

describe('SystemBadge.vue', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the resolved name and icon when the system is known', () => {
    getSystemObjectMock.mockReturnValue({
      name: 'VTEX',
      icon: 'https://example.com/vtex.svg',
    });

    const wrapper = mount(SystemBadge, {
      props: { system: 'vtex' },
    });

    const icon = wrapper.find('[data-testid="system-badge-icon"]');
    expect(icon.exists()).toBe(true);
    expect(icon.attributes('src')).toBe('https://example.com/vtex.svg');

    const name = wrapper.find('[data-testid="system-badge-name"]');
    expect(name.text()).toBe('VTEX');

    expect(getSystemObjectMock).toHaveBeenCalledWith('vtex');
  });

  it('falls back to the slug as name and hides the icon when the system is unknown', () => {
    getSystemObjectMock.mockReturnValue(undefined);

    const wrapper = mount(SystemBadge, {
      props: { system: 'unknown_system' },
    });

    expect(wrapper.find('[data-testid="system-badge-icon"]').exists()).toBe(
      false,
    );
    expect(wrapper.find('[data-testid="system-badge-name"]').text()).toBe(
      'unknown_system',
    );
  });
});
