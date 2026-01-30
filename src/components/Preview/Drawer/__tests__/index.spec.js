import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import { usePreviewStore } from '@/store/Preview';
import WS from '@/websocket/setup';

import PreviewDrawer from '../index.vue';

const pinia = createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    preview: {
      ws: null,
    },
    Project: {
      details: {
        contentBaseUuid: '123',
      },
    },
  },
});

vi.mock('@/websocket/setup', () => ({
  default: vi.fn(() => ({
    connect: vi.fn(),
  })),
}));

describe('PreviewDrawer/index.vue', () => {
  let wrapper;
  let WSMock;
  let connectMock;

  const previewStore = usePreviewStore();
  beforeEach(() => {
    previewStore.ws = null;
    connectMock = vi.fn();
    WSMock = vi.fn(() => ({
      connect: connectMock,
    }));
    WS.mockImplementation(WSMock);

    wrapper = mount(PreviewDrawer, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [pinia],
        stubs: {
          PreviewDetails: true,
          Preview: true,
          UnnnicDrawerNext: false,
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const previewDrawer = () =>
    wrapper.findComponent({ name: 'UnnnicDrawerNext' });
  const previewDrawerHeader = () =>
    wrapper.find('[data-testid="preview-drawer-header"]');
  const previewDrawerContent = () =>
    wrapper.find('[data-testid="preview-drawer-content"]');
  const previewDrawerPreview = () =>
    wrapper.find('[data-testid="preview-drawer-preview"]');
  const previewDrawerDetails = () =>
    wrapper.find('[data-testid="preview-drawer-details"]');

  it('should render correctly with required props', () => {
    expect(previewDrawer().exists()).toBe(true);
    expect(previewDrawerHeader().exists()).toBe(true);
    expect(previewDrawerContent().exists()).toBe(true);
  });

  it('should render preview and details sections', () => {
    expect(previewDrawerPreview().exists()).toBe(true);
    expect(previewDrawerDetails().exists()).toBe(true);
  });

  it('should emit update:modelValue when drawer is closed', async () => {
    previewDrawer().vm.$emit('update:open', false);
    await nextTick();
    const modelValueUpdates = wrapper.emitted('update:modelValue');
    expect(modelValueUpdates).toBeTruthy();
    expect(modelValueUpdates[modelValueUpdates.length - 1]).toEqual([false]);
  });

  it('should connect websocket when drawer is opened', async () => {
    await wrapper.setProps({ modelValue: false });
    await wrapper.setProps({ modelValue: true });
    expect(previewStore.connectWS).toHaveBeenCalled();
  });
});
