import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import NewContentText from '@/views/Knowledge/NewContentText.vue';
import { useKnowledgeStore } from '@/store/Knowledge';
import { useAlertStore } from '@/store/Alert';
import i18n from '@/utils/plugins/i18n';

const mockRoute = { params: {} };
const mockRouter = { push: vi.fn(), replace: vi.fn() };
const routeLeaveGuards = [];
const onBeforeRouteLeaveMock = vi.fn((guard) => {
  routeLeaveGuards.push(guard);
});

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
  onBeforeRouteLeave: (guard) => onBeforeRouteLeaveMock(guard),
}));

const runRouteLeaveGuard = (to = { name: 'knowledge' }) => {
  const guard = routeLeaveGuards[routeLeaveGuards.length - 1];
  const next = vi.fn();
  guard?.(to, { name: 'content-text' }, next);
  return next;
};

const elements = {
  root: '[data-testid="new-content-text"]',
  header: '[data-testid="new-content-text-header"]',
  textarea: '[data-testid="new-content-text-textarea"]',
  unsavedModal: '[data-testid="new-content-text-unsaved-modal"]',
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
    routeLeaveGuards.length = 0;
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

    it('does not replace the route and preserves the draft when create fails', async () => {
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
      expect(wrapper.findComponent(elements.textarea).props('modelValue')).toBe(
        'Drafted body',
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

    it('calls patchContentText with only the updated body and disables the save button after success', async () => {
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

      const payload = patchContentTextMock.mock.calls[0][1];
      expect(payload).not.toHaveProperty('title');

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(wrapper.findComponent(elements.header).props('saveDisabled')).toBe(
        true,
      );
    });

    it('enables the save button when only the title changes and patches only the title', async () => {
      const getContentTextMock = vi.fn().mockResolvedValue(item);
      const patchContentTextMock = vi.fn().mockResolvedValue({
        ...item,
        title: 'Renamed title',
        last_updated_at: '2024-06-01T00:00:00Z',
      });

      wrapper = createWrapper({ getContentTextMock, patchContentTextMock });
      await flushPromises();

      expect(wrapper.findComponent(elements.header).props('saveDisabled')).toBe(
        true,
      );

      wrapper
        .findComponent(elements.header)
        .vm.$emit('update:title', 'Renamed title');
      await flushPromises();

      expect(patchContentTextMock).not.toHaveBeenCalled();
      expect(wrapper.findComponent(elements.header).props('saveDisabled')).toBe(
        false,
      );

      wrapper.findComponent(elements.header).vm.$emit('save');
      await flushPromises();

      expect(patchContentTextMock).toHaveBeenCalledTimes(1);
      expect(patchContentTextMock).toHaveBeenCalledWith(item.uuid, {
        title: 'Renamed title',
      });

      const payload = patchContentTextMock.mock.calls[0][1];
      expect(payload).not.toHaveProperty('text');

      expect(wrapper.findComponent(elements.header).props('saveDisabled')).toBe(
        true,
      );
    });

    it('patches both title and text when both have changed', async () => {
      const getContentTextMock = vi.fn().mockResolvedValue(item);
      const patchContentTextMock = vi.fn().mockResolvedValue({
        ...item,
        title: 'Renamed title',
        text: 'Updated body',
        last_updated_at: '2024-06-01T00:00:00Z',
      });

      wrapper = createWrapper({ getContentTextMock, patchContentTextMock });
      await flushPromises();

      wrapper
        .findComponent(elements.header)
        .vm.$emit('update:title', 'Renamed title');
      wrapper
        .findComponent(elements.textarea)
        .vm.$emit('update:modelValue', 'Updated body');
      await flushPromises();

      wrapper.findComponent(elements.header).vm.$emit('save');
      await flushPromises();

      expect(patchContentTextMock).toHaveBeenCalledTimes(1);
      expect(patchContentTextMock).toHaveBeenCalledWith(item.uuid, {
        text: 'Updated body',
        title: 'Renamed title',
      });
    });

    it('does not call patchContentText when only update:title is emitted by the header', async () => {
      const getContentTextMock = vi.fn().mockResolvedValue(item);
      const patchContentTextMock = vi.fn().mockResolvedValue({});

      wrapper = createWrapper({ getContentTextMock, patchContentTextMock });
      await flushPromises();

      wrapper
        .findComponent(elements.header)
        .vm.$emit('update:title', 'Renamed via header only');
      await flushPromises();

      expect(patchContentTextMock).not.toHaveBeenCalled();
    });

    it('keeps the save button enabled and preserves the draft when the patch fails so the user can retry', async () => {
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
      expect(wrapper.findComponent(elements.textarea).props('modelValue')).toBe(
        'Updated body',
      );
    });
  });

  describe('alerts on save', () => {
    const successAlert = {
      type: 'success',
      text: i18n.global.t('content_bases.new_text.save_success'),
    };

    const errorAlert = {
      type: 'error',
      text: i18n.global.t('content_bases.new_text.save_error'),
      description: i18n.global.t('content_bases.new_text.save_error_hint'),
    };

    describe('in create mode', () => {
      beforeEach(() => {
        mockRoute.params = {};
      });

      it('adds a success alert when the create request succeeds', async () => {
        const createContentTextMock = vi.fn().mockResolvedValue({
          uuid: 'created-uuid',
          title: 'Title',
          text: 'Drafted body',
          last_updated_at: '2024-06-01T00:00:00Z',
        });

        wrapper = createWrapper({ createContentTextMock });
        const alertStore = useAlertStore();
        await flushPromises();

        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', 'Drafted body');
        await flushPromises();

        wrapper.findComponent(elements.header).vm.$emit('save');
        await flushPromises();

        expect(alertStore.add).toHaveBeenCalledWith(successAlert);
      });

      it('adds an error alert with a hint and keeps the draft when create fails', async () => {
        const createContentTextMock = vi
          .fn()
          .mockRejectedValue(new Error('boom'));

        wrapper = createWrapper({ createContentTextMock });
        const alertStore = useAlertStore();
        await flushPromises();

        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', 'Drafted body');
        await flushPromises();

        wrapper.findComponent(elements.header).vm.$emit('save');
        await flushPromises();

        expect(alertStore.add).toHaveBeenCalledWith(errorAlert);
        expect(alertStore.add).not.toHaveBeenCalledWith(
          expect.objectContaining({ type: 'success' }),
        );
        expect(
          wrapper.findComponent(elements.textarea).props('modelValue'),
        ).toBe('Drafted body');
      });
    });

    describe('in edit mode', () => {
      const item = {
        uuid: 'text-uuid-1',
        title: 'Existing title',
        text: 'Existing body',
        last_updated_at: '2024-05-01T00:00:00Z',
      };

      beforeEach(() => {
        mockRoute.params = { uuid: item.uuid };
      });

      it('adds a success alert when only the body is patched', async () => {
        const getContentTextMock = vi.fn().mockResolvedValue(item);
        const patchContentTextMock = vi.fn().mockResolvedValue({
          ...item,
          text: 'Updated body',
          last_updated_at: '2024-06-01T00:00:00Z',
        });

        wrapper = createWrapper({ getContentTextMock, patchContentTextMock });
        const alertStore = useAlertStore();
        await flushPromises();

        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', 'Updated body');
        await flushPromises();

        wrapper.findComponent(elements.header).vm.$emit('save');
        await flushPromises();

        expect(alertStore.add).toHaveBeenCalledWith(successAlert);
      });

      it('adds a success alert when only the title is patched', async () => {
        const getContentTextMock = vi.fn().mockResolvedValue(item);
        const patchContentTextMock = vi.fn().mockResolvedValue({
          ...item,
          title: 'Renamed title',
          last_updated_at: '2024-06-01T00:00:00Z',
        });

        wrapper = createWrapper({ getContentTextMock, patchContentTextMock });
        const alertStore = useAlertStore();
        await flushPromises();

        wrapper
          .findComponent(elements.header)
          .vm.$emit('update:title', 'Renamed title');
        await flushPromises();

        wrapper.findComponent(elements.header).vm.$emit('save');
        await flushPromises();

        expect(alertStore.add).toHaveBeenCalledWith(successAlert);
      });

      it('adds a success alert when both title and body are patched', async () => {
        const getContentTextMock = vi.fn().mockResolvedValue(item);
        const patchContentTextMock = vi.fn().mockResolvedValue({
          ...item,
          title: 'Renamed title',
          text: 'Updated body',
          last_updated_at: '2024-06-01T00:00:00Z',
        });

        wrapper = createWrapper({ getContentTextMock, patchContentTextMock });
        const alertStore = useAlertStore();
        await flushPromises();

        wrapper
          .findComponent(elements.header)
          .vm.$emit('update:title', 'Renamed title');
        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', 'Updated body');
        await flushPromises();

        wrapper.findComponent(elements.header).vm.$emit('save');
        await flushPromises();

        expect(alertStore.add).toHaveBeenCalledWith(successAlert);
        expect(alertStore.add).toHaveBeenCalledTimes(1);
      });

      it('adds an error alert with a hint and keeps the draft body when a body patch fails', async () => {
        const getContentTextMock = vi.fn().mockResolvedValue(item);
        const patchContentTextMock = vi
          .fn()
          .mockRejectedValue(new Error('boom'));

        wrapper = createWrapper({ getContentTextMock, patchContentTextMock });
        const alertStore = useAlertStore();
        await flushPromises();

        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', 'Updated body');
        await flushPromises();

        wrapper.findComponent(elements.header).vm.$emit('save');
        await flushPromises();

        expect(alertStore.add).toHaveBeenCalledWith(errorAlert);
        expect(alertStore.add).not.toHaveBeenCalledWith(
          expect.objectContaining({ type: 'success' }),
        );
        expect(
          wrapper.findComponent(elements.textarea).props('modelValue'),
        ).toBe('Updated body');
      });

      it('adds an error alert with a hint and keeps the draft title when a title patch fails', async () => {
        const getContentTextMock = vi.fn().mockResolvedValue(item);
        const patchContentTextMock = vi
          .fn()
          .mockRejectedValue(new Error('boom'));

        wrapper = createWrapper({ getContentTextMock, patchContentTextMock });
        const alertStore = useAlertStore();
        await flushPromises();

        wrapper
          .findComponent(elements.header)
          .vm.$emit('update:title', 'Renamed title');
        await flushPromises();

        wrapper.findComponent(elements.header).vm.$emit('save');
        await flushPromises();

        expect(alertStore.add).toHaveBeenCalledWith(errorAlert);
        expect(alertStore.add).not.toHaveBeenCalledWith(
          expect.objectContaining({ type: 'success' }),
        );
        expect(wrapper.findComponent(elements.header).props('title')).toBe(
          'Renamed title',
        );
      });

      it('does not add any alert when only update:title is emitted without clicking save', async () => {
        const getContentTextMock = vi.fn().mockResolvedValue(item);

        wrapper = createWrapper({ getContentTextMock });
        const alertStore = useAlertStore();
        await flushPromises();

        wrapper
          .findComponent(elements.header)
          .vm.$emit('update:title', 'Renamed title');
        await flushPromises();

        expect(alertStore.add).not.toHaveBeenCalled();
      });
    });
  });

  describe('unsaved changes route guard', () => {
    describe('in create mode', () => {
      beforeEach(() => {
        mockRoute.params = {};
      });

      it('does not open the unsaved modal and lets navigation proceed when there is no draft text', async () => {
        wrapper = createWrapper();
        await flushPromises();

        const next = runRouteLeaveGuard();
        await flushPromises();

        expect(next).toHaveBeenCalledWith();
        expect(wrapper.findComponent(elements.unsavedModal).props('open')).toBe(
          false,
        );
      });

      it('does not open the unsaved modal when the draft only contains whitespace', async () => {
        wrapper = createWrapper();
        await flushPromises();

        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', '   \n  ');
        await flushPromises();

        const next = runRouteLeaveGuard();
        await flushPromises();

        expect(next).toHaveBeenCalledWith();
        expect(wrapper.findComponent(elements.unsavedModal).props('open')).toBe(
          false,
        );
      });

      it('opens the unsaved modal and pauses navigation when the draft has content', async () => {
        wrapper = createWrapper();
        await flushPromises();

        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', 'Drafted body');
        await flushPromises();

        const next = runRouteLeaveGuard();
        await flushPromises();

        expect(next).not.toHaveBeenCalled();
        expect(wrapper.findComponent(elements.unsavedModal).props('open')).toBe(
          true,
        );
      });
    });

    describe('in edit mode', () => {
      const item = {
        uuid: 'text-uuid-1',
        title: 'Existing title',
        text: 'Existing body',
        last_updated_at: '2024-05-01T00:00:00Z',
      };

      beforeEach(() => {
        mockRoute.params = { uuid: item.uuid };
      });

      it('does not open the unsaved modal when neither title nor body have changed', async () => {
        const getContentTextMock = vi.fn().mockResolvedValue(item);
        wrapper = createWrapper({ getContentTextMock });
        await flushPromises();

        const next = runRouteLeaveGuard();
        await flushPromises();

        expect(next).toHaveBeenCalledWith();
        expect(wrapper.findComponent(elements.unsavedModal).props('open')).toBe(
          false,
        );
      });

      it('opens the unsaved modal when the body has unsaved edits', async () => {
        const getContentTextMock = vi.fn().mockResolvedValue(item);
        wrapper = createWrapper({ getContentTextMock });
        await flushPromises();

        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', 'Edited body');
        await flushPromises();

        const next = runRouteLeaveGuard();
        await flushPromises();

        expect(next).not.toHaveBeenCalled();
        expect(wrapper.findComponent(elements.unsavedModal).props('open')).toBe(
          true,
        );
      });

      it('opens the unsaved modal when only the title has unsaved edits', async () => {
        const getContentTextMock = vi.fn().mockResolvedValue(item);
        wrapper = createWrapper({ getContentTextMock });
        await flushPromises();

        wrapper
          .findComponent(elements.header)
          .vm.$emit('update:title', 'Edited title');
        await flushPromises();

        const next = runRouteLeaveGuard();
        await flushPromises();

        expect(next).not.toHaveBeenCalled();
        expect(wrapper.findComponent(elements.unsavedModal).props('open')).toBe(
          true,
        );
      });
    });

    describe('modal actions', () => {
      beforeEach(() => {
        mockRoute.params = {};
      });

      it('cancels the navigation when the user keeps editing', async () => {
        wrapper = createWrapper();
        await flushPromises();

        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', 'Drafted body');
        await flushPromises();

        const next = runRouteLeaveGuard();
        await flushPromises();

        wrapper.findComponent(elements.unsavedModal).vm.$emit('keep');
        await flushPromises();

        expect(next).toHaveBeenCalledWith(false);
        expect(wrapper.findComponent(elements.unsavedModal).props('open')).toBe(
          false,
        );
      });

      it('resumes the navigation when the user discards the changes', async () => {
        wrapper = createWrapper();
        await flushPromises();

        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', 'Drafted body');
        await flushPromises();

        const next = runRouteLeaveGuard();
        await flushPromises();

        wrapper.findComponent(elements.unsavedModal).vm.$emit('discard');
        await flushPromises();

        expect(next).toHaveBeenCalledWith();
        expect(wrapper.findComponent(elements.unsavedModal).props('open')).toBe(
          false,
        );
      });

      it('allows further navigation after discarding without re-opening the modal', async () => {
        wrapper = createWrapper();
        await flushPromises();

        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', 'Drafted body');
        await flushPromises();

        runRouteLeaveGuard();
        await flushPromises();

        wrapper.findComponent(elements.unsavedModal).vm.$emit('discard');
        await flushPromises();

        const next = runRouteLeaveGuard();
        await flushPromises();

        expect(next).toHaveBeenCalledWith();
        expect(wrapper.findComponent(elements.unsavedModal).props('open')).toBe(
          false,
        );
      });
    });

    describe('beforeunload listener', () => {
      let addEventListenerSpy;
      let removeEventListenerSpy;

      beforeEach(() => {
        mockRoute.params = {};
        addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      });

      afterEach(() => {
        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
      });

      it('registers and removes the beforeunload handler on mount and unmount', async () => {
        wrapper = createWrapper();
        await flushPromises();

        const beforeunloadCalls = addEventListenerSpy.mock.calls.filter(
          ([eventName]) => eventName === 'beforeunload',
        );
        expect(beforeunloadCalls).toHaveLength(1);
        const handler = beforeunloadCalls[0][1];

        wrapper.unmount();
        wrapper = null;

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          'beforeunload',
          handler,
        );
      });

      it('prevents the default unload prompt when there are no unsaved changes', async () => {
        wrapper = createWrapper();
        await flushPromises();

        const handler = addEventListenerSpy.mock.calls.find(
          ([eventName]) => eventName === 'beforeunload',
        )[1];

        const event = { preventDefault: vi.fn(), returnValue: undefined };
        const result = handler(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
      });

      it('blocks the unload by setting returnValue when there are unsaved changes', async () => {
        wrapper = createWrapper();
        await flushPromises();

        wrapper
          .findComponent(elements.textarea)
          .vm.$emit('update:modelValue', 'Drafted body');
        await flushPromises();

        const handler = addEventListenerSpy.mock.calls.find(
          ([eventName]) => eventName === 'beforeunload',
        )[1];

        const event = { preventDefault: vi.fn(), returnValue: undefined };
        handler(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.returnValue).toBe('');
      });
    });
  });
});
