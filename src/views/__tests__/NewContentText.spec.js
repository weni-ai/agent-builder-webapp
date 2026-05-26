import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import NewContentText from '@/views/Knowledge/NewContentText.vue';
import { useKnowledgeStore } from '@/store/Knowledge';
import i18n from '@/utils/plugins/i18n';

const mockRoute = { params: {} };

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}));

const elements = {
  root: '[data-testid="new-content-text"]',
  loading: '[data-testid="new-content-text-loading"]',
  header: '[data-testid="new-content-text-header"]',
  textarea: '[data-testid="new-content-text-textarea"]',
};

const createWrapper = ({ getContentTextMock } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      Knowledge: {
        contentTexts: {
          data: [],
          status: null,
          next: null,
          searchTerm: '',
        },
      },
    },
  });

  const knowledgeStore = useKnowledgeStore(pinia);
  if (getContentTextMock) {
    knowledgeStore.getContentText = getContentTextMock;
  }

  return shallowMount(NewContentText, {
    global: {
      plugins: [pinia],
    },
  });
};

describe('views/Knowledge/NewContentText.vue', () => {
  let wrapper;

  beforeEach(() => {
    mockRoute.params = {};
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('create mode (no route uuid)', () => {
    beforeEach(async () => {
      wrapper = createWrapper();
      await flushPromises();
    });

    it('renders the root container', () => {
      expect(wrapper.find(elements.root).exists()).toBe(true);
    });

    it('does not render the loading state', () => {
      expect(wrapper.find(elements.loading).exists()).toBe(false);
    });

    it('initializes the page header title with the localized default title', () => {
      const defaultTitle = i18n.global.t(
        'content_bases.new_text.default_title',
      );

      expect(wrapper.findComponent(elements.header).props('title')).toBe(
        defaultTitle,
      );
    });

    it('initializes the text draft with an empty string', () => {
      expect(wrapper.find(elements.textarea).element.value).toBe('');
    });

    it('does not call getContentText on mount', () => {
      const knowledgeStore = useKnowledgeStore();
      expect(knowledgeStore.getContentText).not.toHaveBeenCalled();
    });
  });

  describe('edit mode (route uuid present)', () => {
    const item = {
      uuid: 'text-uuid-1',
      title: 'Existing title',
      text: 'Existing body',
      last_updated_at: '2024-05-01T00:00:00Z',
    };

    beforeEach(() => {
      mockRoute.params = { uuid: item.uuid };
    });

    it('shows the loading skeleton while the GET request is pending and hides the content', async () => {
      let resolveRead;
      const getContentTextMock = vi.fn(
        () =>
          new Promise((resolve) => {
            resolveRead = resolve;
          }),
      );

      wrapper = createWrapper({ getContentTextMock });
      await flushPromises();

      expect(wrapper.find(elements.loading).exists()).toBe(true);
      expect(wrapper.find(elements.header).exists()).toBe(false);
      expect(wrapper.find(elements.textarea).exists()).toBe(false);

      resolveRead(item);
      await flushPromises();
    });

    it('hides the loading skeleton and hydrates the drafts after the GET resolves', async () => {
      const getContentTextMock = vi.fn().mockResolvedValue(item);

      wrapper = createWrapper({ getContentTextMock });
      await flushPromises();

      expect(wrapper.find(elements.loading).exists()).toBe(false);
      expect(wrapper.findComponent(elements.header).props('title')).toBe(
        item.title,
      );
      expect(wrapper.find(elements.textarea).element.value).toBe(item.text);
    });

    it('calls getContentText with the uuid from the route on mount', async () => {
      const getContentTextMock = vi.fn().mockResolvedValue(item);

      wrapper = createWrapper({ getContentTextMock });
      await flushPromises();

      expect(getContentTextMock).toHaveBeenCalledTimes(1);
      expect(getContentTextMock).toHaveBeenCalledWith(item.uuid);
    });

    it('falls back to the localized default title when the loaded item has no title', async () => {
      const getContentTextMock = vi.fn().mockResolvedValue({
        ...item,
        title: '',
      });

      wrapper = createWrapper({ getContentTextMock });
      await flushPromises();

      const defaultTitle = i18n.global.t(
        'content_bases.new_text.default_title',
      );

      expect(wrapper.findComponent(elements.header).props('title')).toBe(
        defaultTitle,
      );
    });

    it('hides the loading skeleton even when the GET request fails', async () => {
      const getContentTextMock = vi.fn().mockRejectedValue(new Error('boom'));

      wrapper = createWrapper({ getContentTextMock });
      await flushPromises();

      expect(wrapper.find(elements.loading).exists()).toBe(false);
    });
  });
});
