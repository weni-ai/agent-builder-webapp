import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import Radio from '../Radio.vue';

const mockGetSystemObject = vi.fn();

vi.mock('@/composables/useAgentSystems', () => ({
  default: () => ({
    getSystemObject: mockGetSystemObject,
  }),
}));

describe('Radio', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    wrapper = shallowMount(Radio, {
      props: {
        selected: false,
        label: 'Concierge',
        description: 'Handles concierge flows',
        ...props,
      },
    });
  };

  const findRoot = () =>
    wrapper.find('[data-testid="modal-assign-agent-radio"]');
  const findTitle = () =>
    wrapper.find('[data-testid="modal-assign-agent-radio-title"]');
  const findDescription = () =>
    wrapper.find('[data-testid="modal-assign-agent-radio-description"]');
  const findIcon = () =>
    wrapper.find('[data-testid="modal-assign-agent-radio-icon"]');

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
    mockGetSystemObject.mockReset();
  });

  it('renders label and description', () => {
    createWrapper();

    expect(findTitle().text()).toBe('Concierge');
    expect(findDescription().text()).toBe('Handles concierge flows');
  });

  it('applies body description variant class when requested', () => {
    createWrapper({ descriptionVariant: 'body' });

    expect(findDescription().classes()).toContain(
      'modal-assign-agent__radio-description--body',
    );
  });

  it('emits update:selected when selecting a non-selected radio', async () => {
    createWrapper({ selected: false });

    await findRoot().trigger('click');

    expect(wrapper.emitted('update:selected')).toEqual([[true]]);
  });

  it('does not emit update when already selected', async () => {
    createWrapper({ selected: true });

    await findRoot().trigger('click');

    expect(wrapper.emitted('update:selected')).toBeUndefined();
  });

  it('renders the system icon and alt text when available', () => {
    mockGetSystemObject.mockReturnValue({
      icon: 'synerise-icon.svg',
      name: 'Synerise',
    });

    createWrapper({ system: 'SYNERISE' });

    const icon = findIcon();

    expect(icon.exists()).toBe(true);
    expect(icon.attributes('src')).toBe('synerise-icon.svg');
    expect(icon.attributes('alt')).toBe('Synerise logo');
    expect(mockGetSystemObject).toHaveBeenCalledWith('SYNERISE');
  });
});
