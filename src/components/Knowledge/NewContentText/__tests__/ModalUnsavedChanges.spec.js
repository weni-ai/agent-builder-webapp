import { describe, it, expect, afterEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import ModalUnsavedChanges from '@/components/Knowledge/NewContentText/ModalUnsavedChanges.vue';
import i18n from '@/utils/plugins/i18n';

const elements = {
  root: '[data-testid="modal-unsaved-changes"]',
  title: '[data-testid="modal-unsaved-changes-title"]',
  description: '[data-testid="modal-unsaved-changes-description"]',
  keep: '[data-testid="modal-unsaved-changes-keep"]',
  discard: '[data-testid="modal-unsaved-changes-discard"]',
};

const createWrapper = (props = {}) =>
  shallowMount(ModalUnsavedChanges, {
    props: { open: true, ...props },
    global: {
      stubs: {
        UnnnicDialogClose: { template: '<div><slot /></div>' },
      },
    },
  });

describe('ModalUnsavedChanges.vue', () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the root dialog', () => {
      wrapper = createWrapper();

      expect(wrapper.find(elements.root).exists()).toBe(true);
    });

    it('forwards the open prop to the dialog', () => {
      wrapper = createWrapper({ open: false });

      expect(wrapper.findComponent(elements.root).props('open')).toBe(false);
    });

    it('renders the localized title', () => {
      wrapper = createWrapper();

      expect(wrapper.find(elements.title).text()).toBe(
        i18n.global.t('content_bases.new_text.unsaved.title'),
      );
    });

    it('renders the localized description', () => {
      wrapper = createWrapper();

      expect(wrapper.find(elements.description).text()).toBe(
        i18n.global.t('content_bases.new_text.unsaved.description'),
      );
    });

    it('renders the keep editing button as tertiary with the localized label', () => {
      wrapper = createWrapper();

      const keep = wrapper.findComponent(elements.keep);
      expect(keep.exists()).toBe(true);
      expect(keep.props('type')).toBe('tertiary');
      expect(keep.props('text')).toBe(
        i18n.global.t('content_bases.new_text.unsaved.keep'),
      );
    });

    it('renders the discard button as attention with the localized label', () => {
      wrapper = createWrapper();

      const discard = wrapper.findComponent(elements.discard);
      expect(discard.exists()).toBe(true);
      expect(discard.props('type')).toBe('attention');
      expect(discard.props('text')).toBe(
        i18n.global.t('content_bases.new_text.unsaved.discard'),
      );
    });
  });

  describe('emits', () => {
    it('emits keep when the keep button is clicked', async () => {
      wrapper = createWrapper();

      await wrapper.findComponent(elements.keep).trigger('click');

      expect(wrapper.emitted('keep')).toHaveLength(1);
      expect(wrapper.emitted('discard')).toBeUndefined();
    });

    it('emits discard when the discard button is clicked', async () => {
      wrapper = createWrapper();

      await wrapper.findComponent(elements.discard).trigger('click');

      expect(wrapper.emitted('discard')).toHaveLength(1);
      expect(wrapper.emitted('keep')).toBeUndefined();
    });

    it('emits keep when the dialog requests to close', async () => {
      wrapper = createWrapper();

      await wrapper.findComponent(elements.root).vm.$emit('update:open', false);

      expect(wrapper.emitted('keep')).toHaveLength(1);
    });

    it('does not emit keep when the dialog reports it has opened', async () => {
      wrapper = createWrapper({ open: false });

      await wrapper.findComponent(elements.root).vm.$emit('update:open', true);

      expect(wrapper.emitted('keep')).toBeUndefined();
    });
  });
});
