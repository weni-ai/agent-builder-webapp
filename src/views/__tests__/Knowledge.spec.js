import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import Knowledge from '@/views/Knowledge.vue';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: {
      contentBaseUuid: 'test-uuid',
    },
  })),
}));

const pinia = createTestingPinia({
  initialState: {
    Project: {
      details: {
        contentBaseUuid: 'fallback-uuid',
      },
    },
    Knowledge: {
      contentText: {
        uuid: null,
        current: '',
        old: '',
      },
    },
  },
});

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    intelligences: {
      contentBases: {
        texts: {
          list: vi.fn().mockResolvedValue({
            data: {
              results: [
                {
                  uuid: 'text-uuid',
                  text: 'Sample text content',
                },
              ],
            },
          }),
        },
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

  const header = () =>
    wrapper.findComponent('[data-testid="knowledge-header"]');
  const routerContentBase = () =>
    wrapper.findComponent('[data-testid="router-content-base"]');

  beforeEach(() => {
    wrapper = shallowMount(Knowledge, {
      global: {
        plugins: [pinia],
      },
    });
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
      expect(props.textProp).toEqual({
        open: true,
        status: null,
        uuid: 'text-uuid',
        oldValue: 'Sample text content',
        value: 'Sample text content',
      });
      expect(props.textLoading).toBe(false);
    });
  });

  describe('Component lifecycle', () => {
    it('loads text, files and sites on mount', () => {
      expect(wrapper.vm.text.uuid).toBe('text-uuid');
      expect(wrapper.vm.text.value).toBe('Sample text content');
      expect(wrapper.vm.text.oldValue).toBe('Sample text content');
      expect(wrapper.vm.text.status).toBeNull();
      expect(wrapper.vm.files.loadNext).toHaveBeenCalled();
      expect(wrapper.vm.sites.loadNext).toHaveBeenCalled();
    });
  });
});
