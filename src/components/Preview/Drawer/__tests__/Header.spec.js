import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';

import PreviewDrawerHeader from '../Header.vue';

const pinia = createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    Project: {
      uuid: '123',
    },
  },
});

describe('PreviewDrawer/Header.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(PreviewDrawerHeader, {
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicDrawerHeader: {
            template: '<div><slot /></div>',
          },
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const previewDrawerHeader = () =>
    wrapper.find('[data-testid="preview-drawer-header"]');
  const previewDrawerTitle = () =>
    wrapper.find('[data-testid="preview-drawer-title"]');
  const actionButtons = () =>
    wrapper.findComponent('[data-testid="preview-drawer-actions"]');

  it('should render header and title', () => {
    expect(previewDrawerHeader().exists()).toBe(true);
    expect(previewDrawerTitle().text()).toBe(
      i18n.global.t('router.preview.test_your_agents'),
    );
  });

  it('should pass refresh action to content item actions', async () => {
    expect(actionButtons().exists()).toBe(true);
    expect(actionButtons().props('actions')).toEqual([
      {
        scheme: 'gray-500',
        icon: 'refresh',
        onClick: wrapper.vm.refreshPreview,
        text: i18n.global.t('router.preview.options.refresh'),
      },
    ]);
  });
});
