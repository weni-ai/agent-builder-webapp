import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import { usePreviewStore } from '@/store/Preview';
import { useFlowPreviewStore } from '@/store/FlowPreview';
import WS from '@/websocket/setup';
import i18n from '@/utils/plugins/i18n';

import PreviewDrawer from '../PreviewDrawer.vue';

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

describe('PreviewDrawer.vue', () => {
  let wrapper;
  let WSMock;
  let connectMock;

  const previewStore = usePreviewStore();
  const flowPreviewStore = useFlowPreviewStore();
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
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const previewDrawer = () => wrapper.find('[data-testid="preview-drawer"]');
  const previewDrawerHeader = () =>
    wrapper.find('[data-testid="preview-drawer-header"]');
  const previewDrawerTitle = () =>
    wrapper.find('[data-testid="preview-drawer-title"]');
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

  it('should display correct title', () => {
    expect(previewDrawerTitle().text()).toBe(
      i18n.global.t('router.preview.agents_preview'),
    );
  });

  it('should emit update:modelValue when drawer is closed', async () => {
    await wrapper.findComponent({ name: 'UnnnicDrawer' }).vm.$emit('close');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });

  it('should connect websocket when drawer is opened', async () => {
    await wrapper.setProps({ modelValue: false });
    await wrapper.setProps({ modelValue: true });
    expect(previewStore.connectWS).toHaveBeenCalled();
  });

  it('should have refresh action in header actions', () => {
    const actions = wrapper.vm.previewHeaderActions;
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      scheme: 'neutral-dark',
      icon: 'refresh',
      text: i18n.global.t('router.preview.options.refresh'),
    });
  });

  it('should refresh preview when refresh action is clicked', async () => {
    await wrapper.vm.previewHeaderActions[0].onClick();

    expect(previewStore.clearLogs).toHaveBeenCalled();
    expect(flowPreviewStore.clearMessages).toHaveBeenCalled();
  });
});
