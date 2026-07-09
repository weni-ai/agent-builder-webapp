import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import Improvements from '@/views/Supervisor/Improvements/index.vue';
import { useImprovementsStore } from '@/store/Improvements';

describe('Improvements view', () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders the improvements section', () => {
    wrapper = shallowMount(Improvements, {
      global: {
        plugins: [createTestingPinia()],
      },
    });

    expect(wrapper.find('.conversations-improvements').exists()).toBe(true);
  });

  it('loads improvements when the view mounts', () => {
    wrapper = shallowMount(Improvements, {
      global: {
        plugins: [createTestingPinia()],
      },
    });

    const improvementsStore = useImprovementsStore();

    expect(improvementsStore.fetchImprovements).toHaveBeenCalledTimes(1);
  });
});
