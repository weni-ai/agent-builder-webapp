import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import ManagerSelector from '../index.vue';
import i18n from '@/utils/plugins/i18n';

describe('ManagerSelector.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(ManagerSelector);
  });

  const title = () => wrapper.find('[data-testid="manager-selector-title"]');

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  it('renders the title with correct translation and styling', () => {
    expect(title().text()).toBe(
      i18n.global.t('agent_builder.tunings.manager.title'),
    );
  });
});
