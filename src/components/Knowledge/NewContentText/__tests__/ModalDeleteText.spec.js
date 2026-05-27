import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ModalDeleteText from '@/components/Knowledge/NewContentText/ModalDeleteText.vue';
import { useKnowledgeStore } from '@/store/Knowledge';
import { useAlertStore } from '@/store/Alert';
import i18n from '@/utils/plugins/i18n';

const defaultText = {
  uuid: 'text-1',
  title: 'Onboarding guide',
};

const elements = {
  modal: '[data-testid="modal-delete-text"]',
  title: '[data-testid="modal-delete-text-title"]',
  description: '[data-testid="modal-delete-text-description"]',
  descriptionName: '[data-testid="modal-delete-text-description-name"]',
  cancel: '[data-testid="modal-delete-text-cancel"]',
  confirm: '[data-testid="modal-delete-text-confirm"]',
};

const createWrapper = ({ text = defaultText, deleteContentTextMock } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: { Knowledge: {} },
  });

  const knowledgeStore = useKnowledgeStore(pinia);
  if (deleteContentTextMock) {
    knowledgeStore.deleteContentText = deleteContentTextMock;
  }

  const alertStore = useAlertStore(pinia);

  const wrapper = shallowMount(ModalDeleteText, {
    props: {
      text,
      modelValue: true,
    },
    global: {
      plugins: [pinia],
      stubs: {
        UnnnicDialogClose: { template: '<div><slot /></div>' },
        'i18n-t': {
          inheritAttrs: false,
          template: '<p v-bind="$attrs"><slot name="name" /></p>',
        },
      },
    },
  });

  return { wrapper, knowledgeStore, alertStore };
};

describe('ModalDeleteText.vue', () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the dialog with the translated title', () => {
      ({ wrapper } = createWrapper());

      expect(wrapper.find(elements.modal).exists()).toBe(true);
      expect(wrapper.find(elements.title).text()).toBe(
        i18n.global.t('content_bases.new_text.delete.title'),
      );
    });

    it('renders the description with the text title inside a bold tag', () => {
      ({ wrapper } = createWrapper());

      const description = wrapper.find(elements.description);
      expect(description.exists()).toBe(true);

      const boldName = wrapper.find(elements.descriptionName);
      expect(boldName.exists()).toBe(true);
      expect(boldName.element.tagName).toBe('B');
      expect(boldName.text()).toBe(defaultText.title);
    });

    it('falls back to the default title when the text has no title', () => {
      ({ wrapper } = createWrapper({
        text: { uuid: 'text-1', title: '' },
      }));

      const expectedFallback = i18n.global.t(
        'content_bases.new_text.default_title',
      );

      expect(wrapper.find(elements.descriptionName).text()).toBe(
        expectedFallback,
      );
    });

    it('renders both cancel and confirm buttons', () => {
      ({ wrapper } = createWrapper());

      expect(wrapper.find(elements.cancel).exists()).toBe(true);
      expect(wrapper.find(elements.confirm).exists()).toBe(true);
    });
  });

  describe('closing the modal', () => {
    it('emits update:modelValue=false when the cancel button is clicked', async () => {
      ({ wrapper } = createWrapper());

      await wrapper.find(elements.cancel).trigger('click');

      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('emits update:modelValue=false when the dialog requests to close', async () => {
      ({ wrapper } = createWrapper());

      await wrapper
        .findComponent(elements.modal)
        .vm.$emit('update:open', false);

      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('does not call the store when the modal is just closed', async () => {
      let knowledgeStore;
      ({ wrapper, knowledgeStore } = createWrapper());

      await wrapper.find(elements.cancel).trigger('click');
      await flushPromises();

      expect(knowledgeStore.deleteContentText).not.toHaveBeenCalled();
    });
  });

  describe('confirming the deletion', () => {
    it('calls deleteContentText with the text uuid', async () => {
      const deleteContentTextMock = vi.fn().mockResolvedValue(undefined);
      ({ wrapper } = createWrapper({ deleteContentTextMock }));

      await wrapper.findComponent(elements.confirm).vm.$emit('click');
      await flushPromises();

      expect(deleteContentTextMock).toHaveBeenCalledWith(defaultText.uuid);
    });

    it('dispatches a success alert and emits confirm + close on success', async () => {
      const deleteContentTextMock = vi.fn().mockResolvedValue(undefined);
      let alertStore;
      ({ wrapper, alertStore } = createWrapper({ deleteContentTextMock }));

      await wrapper.findComponent(elements.confirm).vm.$emit('click');
      await flushPromises();

      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'success',
        text: i18n.global.t('content_bases.new_text.delete.success'),
      });

      expect(wrapper.emitted('confirm')).toHaveLength(1);
      expect(wrapper.emitted('confirm')[0][0]).toEqual(defaultText);
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('dispatches an error alert and keeps the modal open on failure', async () => {
      const deleteContentTextMock = vi
        .fn()
        .mockRejectedValue(new Error('boom'));
      let alertStore;
      ({ wrapper, alertStore } = createWrapper({ deleteContentTextMock }));

      await wrapper.findComponent(elements.confirm).vm.$emit('click');
      await flushPromises();

      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'error',
        text: i18n.global.t('content_bases.new_text.delete.error'),
        description: i18n.global.t('content_bases.new_text.delete.error_hint'),
      });

      expect(wrapper.emitted('confirm')).toBeUndefined();
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('shows loading on the confirm button while the deletion is in flight', async () => {
      let resolveDelete;
      const deleteContentTextMock = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve;
          }),
      );
      ({ wrapper } = createWrapper({ deleteContentTextMock }));

      const confirmButton = wrapper.findComponent(elements.confirm);

      expect(confirmButton.props('loading')).toBe(false);

      await confirmButton.vm.$emit('click');
      await nextTick();

      expect(confirmButton.props('loading')).toBe(true);

      resolveDelete();
      await flushPromises();
      await nextTick();

      expect(confirmButton.props('loading')).toBe(false);
    });

    it('disables the cancel button while the deletion is in flight', async () => {
      let resolveDelete;
      const deleteContentTextMock = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve;
          }),
      );
      ({ wrapper } = createWrapper({ deleteContentTextMock }));

      const cancelButton = wrapper.findComponent(elements.cancel);
      expect(cancelButton.props('disabled')).toBe(false);

      await wrapper.findComponent(elements.confirm).vm.$emit('click');
      await nextTick();

      expect(cancelButton.props('disabled')).toBe(true);

      resolveDelete();
      await flushPromises();
      await nextTick();

      expect(cancelButton.props('disabled')).toBe(false);
    });

    it('ignores further confirm clicks while the deletion is in flight', async () => {
      let resolveDelete;
      const deleteContentTextMock = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve;
          }),
      );
      ({ wrapper } = createWrapper({ deleteContentTextMock }));

      const confirmButton = wrapper.findComponent(elements.confirm);

      await confirmButton.vm.$emit('click');
      await confirmButton.vm.$emit('click');
      await confirmButton.vm.$emit('click');
      await nextTick();

      expect(deleteContentTextMock).toHaveBeenCalledTimes(1);

      resolveDelete();
      await flushPromises();
    });
  });
});
