import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import Knowledge from '@/views/Knowledge/index.vue';

const mockRoute = { name: 'knowledge' };

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');

  return {
    ...actual,
    useRoute: vi.fn(() => mockRoute),
  };
});

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    knowledge: {
      files: {
        list: vi.fn().mockResolvedValue({
          data: {
            results: [
              {
                uuid: 'file-uuid',
                name: 'sample-file.pdf',
                status: 'success',
              },
            ],
          },
        }),
      },
      sites: {
        list: vi.fn().mockResolvedValue({
          data: [
            {
              uuid: 'site-uuid',
              link: 'https://example.com',
              status: 'success',
            },
          ],
        }),
      },
    },
  },
}));

vi.mock('@/composables/useFilesPagination', () => ({
  useFilesPagination: vi.fn(() => ({
    loadNext: vi.fn(),
  })),
}));

vi.mock('@/composables/useSitesPagination', () => ({
  useSitesPagination: vi.fn(() => ({
    loadNext: vi.fn(),
  })),
}));

describe('Knowledge.vue', () => {
  let wrapper;

  const createWrapper = () =>
    shallowMount(Knowledge, {
      global: {
        plugins: [createTestingPinia()],
      },
    });

  const header = () =>
    wrapper.findComponent('[data-testid="knowledge-header"]');
  const routerContentBase = () =>
    wrapper.findComponent('[data-testid="router-content-base"]');
  const routerView = () => wrapper.findComponent({ name: 'RouterView' });

  beforeEach(() => {
    mockRoute.name = 'knowledge';
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('renders correctly', () => {
      expect(wrapper.exists()).toBe(true);
      expect(header().exists()).toBe(true);
      expect(routerContentBase().exists()).toBe(true);
    });

    it('passes correct props to RouterContentBase', () => {
      const props = routerContentBase().props();

      expect(props.filesProp).toBeDefined();
      expect(props.sitesProp).toBeDefined();
    });

    it('renders the child route view when the active route is a knowledge child', () => {
      mockRoute.name = 'new-content-text';
      wrapper = createWrapper();

      expect(header().exists()).toBe(false);
      expect(routerContentBase().exists()).toBe(false);
      expect(routerView().exists()).toBe(true);
    });
  });

  describe('Component lifecycle', () => {
    it('loads files and sites on mount', () => {
      expect(wrapper.vm.files.loadNext).toHaveBeenCalled();
      expect(wrapper.vm.sites.loadNext).toHaveBeenCalled();
    });
  });
});
