import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import Improvements from '@/views/Supervisor/Improvements/index.vue';

describe('Improvements view', () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders the improvements section', () => {
    wrapper = shallowMount(Improvements);

    expect(wrapper.find('.conversations-improvements').exists()).toBe(true);
  });
});
