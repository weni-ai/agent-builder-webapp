import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import NewContentText from '@/views/Knowledge/NewContentText.vue';
import { useKnowledgeStore } from '@/store/Knowledge';
import i18n from '@/utils/plugins/i18n';

const mockRoute = { params: {} };
const mockRouter = { push: vi.fn(), replace: vi.fn() };

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}));

const elements = {
  root: '[data-testid="new-content-text"]',
  loading: '[data-testid="new-content-text-loading"]',
  header: '[data-testid="new-content-text-header"]',
  textarea: '[data-testid="new-content-text-textarea"]',
};

const createWrapper = ({
  getContentTextMock,
  patchContentTextMock,
  createContentTextMock,
} = {}) => {
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
  if (patchContentTextMock) {
    knowledgeStore.patchContentText = patchContentTextMock;
  }
  if (createContentTextMock) {
    knowledgeStore.createContentText = createContentTextMock;
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
      expect(wrapper.findComponent(elements.textarea).props('modelValue')).toBe(
        '',
      );
    });

    it('renders the body with autofocus enabled', () => {
      expect(wrapper.findComponent(elements.textarea).props('autofocus')).toBe(
        true,
      );
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
      expect(wrapper.findComponent(elements.textarea).props('modelValue')).toBe(
        item.text,
      );
    });

    it('renders the body with autofocus disabled in edit mode', async () => {
      const getContentTextMock = vi.fn().mockResolvedValue(item);

      wrapper = createWrapper({ getContentTextMock });
      await flushPromises();

      expect(wrapper.findComponent(elements.textarea).props('autofocus')).toBe(
        false,
      );
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

  describe('onSave in create mode', () => {
    beforeEach(() => {
      mockRoute.params = {};
    });

    it('calls createContentText with the current draft and replaces the route on success', async () => {
      const created = {
        uuid: 'created-uuid',
        title: 'Created title',
        text: 'Created body',
        last_updated_at: '2024-06-01T00:00:00Z',
      };
      const createContentTextMock = vi.fn().mockResolvedValue(created);

      wrapper = createWrapper({ createContentTextMock });
      await flushPromises();

      wrapper
        .findComponent(elements.textarea)
        .vm.$emit('update:modelValue', 'Drafted body');
      await flushPromises();

      wrapper.findComponent(elements.header).vm.$emit('save');
      await flushPromises();

      expect(createContentTextMock).toHaveBeenCalledTimes(1);
      expect(createContentTextMock).toHaveBeenCalledWith({
        text: 'Drafted body',
        title: i18n.global.t('content_bases.new_text.default_title'),
      });

      expect(mockRouter.replace).toHaveBeenCalledWith({
        name: 'content-text',
        params: { uuid: created.uuid },
      });
    });

    it('toggles saveLoading on the header while the create request is pending', async () => {
      let resolveCreate;
      const createContentTextMock = vi.fn(
        () =>
          new Promise((resolve) => {
            resolveCreate = resolve;
          }),
      );

      wrapper = createWrapper({ createContentTextMock });
      await flushPromises();

      wrapper
        .findComponent(elements.textarea)
        .vm.$emit('update:modelValue', 'Drafted body');
      await flushPromises();

      wrapper.findComponent(elements.header).vm.$emit('save');
      await flushPromises();

      expect(wrapper.findComponent(elements.header).props('saveLoading')).toBe(
        true,
      );

      resolveCreate({
        uuid: 'created-uuid',
        title: 'Title',
        text: 'Drafted body',
        last_updated_at: '2024-06-01T00:00:00Z',
      });
      await flushPromises();

      expect(wrapper.findComponent(elements.header).props('saveLoading')).toBe(
        false,
      );
    });

    it('does not replace the route when create fails', async () => {
      const createContentTextMock = vi
        .fn()
        .mockRejectedValue(new Error('boom'));

      wrapper = createWrapper({ createContentTextMock });
      await flushPromises();

      wrapper
        .findComponent(elements.textarea)
        .vm.$emit('update:modelValue', 'Drafted body');
      await flushPromises();

      wrapper.findComponent(elements.header).vm.$emit('save');
      await flushPromises();

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(wrapper.findComponent(elements.header).props('saveLoading')).toBe(
        false,
      );
    });

    it('does not call createContentText when the textarea is empty', async () => {
      const createContentTextMock = vi.fn();

      wrapper = createWrapper({ createContentTextMock });
      await flushPromises();

      wrapper.findComponent(elements.header).vm.$emit('save');
      await flushPromises();

      expect(createContentTextMock).not.toHaveBeenCalled();
    });
  });

  describe('onSave in edit mode', () => {
    const item = {
      uuid: 'text-uuid-1',
      title: 'Existing title',
      text: 'Existing body',
      last_updated_at: '2024-05-01T00:00:00Z',
    };

    beforeEach(() => {
      mockRoute.params = { uuid: item.uuid };
    });

    it('calls patchContentText with the updated body and disables the save button after success', async () => {
      const getContentTextMock = vi.fn().mockResolvedValue(item);
      const patchContentTextMock = vi.fn().mockResolvedValue({
        ...item,
        text: 'Updated body',
        last_updated_at: '2024-06-01T00:00:00Z',
      });

      wrapper = createWrapper({ getContentTextMock, patchContentTextMock });
      await flushPromises();

      wrapper
        .findComponent(elements.textarea)
        .vm.$emit('update:modelValue', 'Updated body');
      await flushPromises();

      expect(wrapper.findComponent(elements.header).props('saveDisabled')).toBe(
        false,
      );

      wrapper.findComponent(elements.header).vm.$emit('save');
      await flushPromises();

      expect(patchContentTextMock).toHaveBeenCalledTimes(1);
      expect(patchContentTextMock).toHaveBeenCalledWith(item.uuid, {
        text: 'Updated body',
      });

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(wrapper.findComponent(elements.header).props('saveDisabled')).toBe(
        true,
      );
    });

    it('keeps the save button enabled when the patch fails so the user can retry', async () => {
      const getContentTextMock = vi.fn().mockResolvedValue(item);
      const patchContentTextMock = vi.fn().mockRejectedValue(new Error('boom'));

      wrapper = createWrapper({ getContentTextMock, patchContentTextMock });
      await flushPromises();

      wrapper
        .findComponent(elements.textarea)
        .vm.$emit('update:modelValue', 'Updated body');
      await flushPromises();

      wrapper.findComponent(elements.header).vm.$emit('save');
      await flushPromises();

      expect(wrapper.findComponent(elements.header).props('saveDisabled')).toBe(
        false,
      );
      expect(wrapper.findComponent(elements.header).props('saveLoading')).toBe(
        false,
      );
    });
  });
});
