import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia } from 'pinia';
import Unnnic from '@weni/unnnic-system';

import { usePreviewStore } from '@/store/Preview';

import PreviewLogs from '@/components/Preview/PreviewLogs.vue';
import PreviewDetails from '../PreviewDetails.vue';

vi.mock('@/components/Preview/PreviewLogs.vue');
vi.mock('../PreviewVisualFlow.vue');

describe('PreviewDetails.vue', () => {
  let wrapper;
  let previewStore;
  let mockScrollTo;

  const pinia = createPinia();

  const createWrapper = (props = {}) => {
    return mount(PreviewDetails, {
      props: {
        ...props,
      },
      global: {
        plugins: [pinia],
      },
    });
  };

  const defineScroll = ({
    element = HTMLElement.prototype,
    scrollTo = vi.fn(),
    scrollHeight = 1000,
    scrollTop = 0,
    clientHeight = 500,
  } = {}) => {
    Object.defineProperty(element, 'scrollTo', {
      value: scrollTo,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(element, 'scrollHeight', {
      value: scrollHeight,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(element, 'scrollTop', {
      value: scrollTop,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(element, 'clientHeight', {
      value: clientHeight,
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    mockScrollTo = vi.fn();
    defineScroll({ scrollTo: mockScrollTo });

    wrapper = createWrapper();
    previewStore = usePreviewStore();
  });

  const previewDetails = () => wrapper.find('[data-testid="preview-details"]');
  const previewDetailsTabs = () =>
    wrapper.find('[data-testid="preview-details-tabs"]');
  const previewDetailsContent = () =>
    wrapper.find('[data-testid="preview-details-content"]');
  const previewDetailsVisualFlow = () =>
    wrapper.find('[data-testid="preview-details-visual-flow"]');
  const previewDetailsLogs = () =>
    wrapper.find('[data-testid="preview-details-logs"]');

  const switchToLogsTab = async () => {
    await wrapper.findComponent(Unnnic.unnnicTab).vm.$emit('change', 'logs');
    await wrapper.vm.$nextTick();
  };

  it('should render correctly with required props', () => {
    expect(previewDetails().exists()).toBe(true);
    expect(previewDetailsTabs().exists()).toBe(true);
    expect(previewDetailsContent().exists()).toBe(true);
  });

  it('should show visual flow by default', () => {
    expect(previewDetailsVisualFlow().exists()).toBe(true);
    expect(previewDetailsLogs().exists()).toBe(false);
  });

  it('should switch to logs when tab changes', async () => {
    await switchToLogsTab();

    expect(previewDetailsVisualFlow().exists()).toBe(false);
    expect(previewDetailsLogs().exists()).toBe(true);
  });

  it('should have correct tabs configuration', () => {
    expect(wrapper.vm.detailTabs).toEqual(['visual_flow', 'logs']);
  });

  it('should scroll content to bottom when logs component emits scroll event if it is near the bottom', async () => {
    await switchToLogsTab();

    await wrapper.findComponent(PreviewLogs).vm.$emit('scroll-to-bottom');

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 1000,
      behavior: 'smooth',
    });
  });

  it('should not scroll content to bottom when user is not near the bottom', async () => {
    await switchToLogsTab();

    defineScroll({
      element: wrapper.vm.$refs.contentRef || wrapper.vm.contentRef,
      scrollTop: 100,
      clientHeight: 200,
      scrollHeight: 1000,
    });

    mockScrollTo.mockClear();

    await wrapper.findComponent(PreviewLogs).vm.$emit('scroll-to-bottom');

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it('should scroll to bottom when tab changes', async () => {
    mockScrollTo.mockClear();

    await switchToLogsTab();
    await wrapper.vm.$nextTick();

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 1000,
      behavior: 'smooth',
    });
  });
});
