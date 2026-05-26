import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import TextDetailBody from '@/components/Knowledge/NewContentText/TextDetailBody.vue';
import i18n from '@/utils/plugins/i18n';

const elements = {
  textarea: '[data-testid="text-detail-body-textarea"]',
};

const createWrapper = (props = {}) =>
  mount(TextDetailBody, {
    props: {
      modelValue: '',
      autofocus: false,
      ...props,
    },
    attachTo: document.body,
  });

describe('TextDetailBody.vue', () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the textarea', () => {
      wrapper = createWrapper();

      expect(wrapper.find(elements.textarea).exists()).toBe(true);
    });

    it('renders the localized placeholder', () => {
      wrapper = createWrapper();

      expect(wrapper.find(elements.textarea).attributes('placeholder')).toBe(
        i18n.global.t('content_bases.new_text.write_or_paste_placeholder'),
      );
    });

    it('renders the textarea with the modelValue as its value', () => {
      wrapper = createWrapper({ modelValue: 'Hello body' });

      expect(wrapper.find(elements.textarea).element.value).toBe('Hello body');
    });
  });

  describe('v-model', () => {
    it('emits update:modelValue with the new value when the user types', async () => {
      wrapper = createWrapper({ modelValue: '' });

      await wrapper.find(elements.textarea).setValue('Typed body');

      expect(wrapper.emitted('update:modelValue')).toEqual([['Typed body']]);
    });

    it('reflects an updated modelValue prop into the textarea value', async () => {
      wrapper = createWrapper({ modelValue: 'Initial' });

      await wrapper.setProps({ modelValue: 'Updated' });

      expect(wrapper.find(elements.textarea).element.value).toBe('Updated');
    });
  });

  describe('autofocus', () => {
    it('focuses the textarea on mount when autofocus is true', async () => {
      wrapper = createWrapper({ autofocus: true });

      await wrapper.vm.$nextTick();

      expect(document.activeElement).toBe(
        wrapper.find(elements.textarea).element,
      );
    });

    it('does not focus the textarea on mount when autofocus is false', async () => {
      wrapper = createWrapper({ autofocus: false });

      await wrapper.vm.$nextTick();

      expect(document.activeElement).not.toBe(
        wrapper.find(elements.textarea).element,
      );
    });
  });
});
