import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import TextDetailHeader from '@/components/Knowledge/NewContentText/TextDetailHeader.vue';
import { useKnowledgeStore } from '@/store/Knowledge';

const DEFAULT_TITLE = 'Untitled text';

const elements = {
  root: '[data-testid="text-detail-header"]',
  titleWrapper: '[data-testid="text-detail-header-title-wrapper"]',
  title: '[data-testid="text-detail-header-title"]',
  editIcon: '[data-testid="text-detail-header-edit-icon"]',
  input: '[data-testid="text-detail-header-input"]',
  hint: '[data-testid="text-detail-header-hint"]',
  saveButton: '[data-testid="text-detail-header-save-button"]',
  moreButton: '[data-testid="text-detail-header-cave-button"]',
};

const createWrapper = (props = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });

  return mount(TextDetailHeader, {
    props: {
      uuid: null,
      title: 'My text',
      defaultTitle: DEFAULT_TITLE,
      saveLoading: false,
      saveDisabled: true,
      ...props,
    },
    global: {
      plugins: [pinia],
    },
    attachTo: document.body,
  });
};

describe('TextDetailHeader.vue', () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the root page header', () => {
      wrapper = createWrapper();

      expect(wrapper.find(elements.root).exists()).toBe(true);
    });

    it('renders the title from the title prop', () => {
      wrapper = createWrapper({ title: 'My text' });

      expect(wrapper.find(elements.title).text()).toBe('My text');
    });

    it('falls back to the localized default title when the title prop is empty', () => {
      wrapper = createWrapper({ title: '' });

      expect(wrapper.find(elements.title).text()).toBe(DEFAULT_TITLE);
    });

    it('renders the edit icon with the edit_square icon (visibility controlled by CSS hover)', () => {
      wrapper = createWrapper();

      const icon = wrapper.findComponent(elements.editIcon);
      expect(icon.exists()).toBe(true);
      expect(icon.props('icon')).toBe('edit_square');
    });

    it('wraps the title with a tooltip showing the localized "Edit name" label', () => {
      wrapper = createWrapper();

      const tooltip = wrapper.findComponent({ name: 'UnnnicTooltip' });
      expect(tooltip.exists()).toBe(true);
      expect(tooltip.props('text')).toBe('Edit name');
    });

    it('does not render the tooltip while editing the title', async () => {
      wrapper = createWrapper();

      await wrapper.find(elements.titleWrapper).trigger('click');

      expect(wrapper.findComponent({ name: 'UnnnicTooltip' }).exists()).toBe(
        false,
      );
    });

    it('does not render the inline input when not editing', () => {
      wrapper = createWrapper();

      expect(wrapper.find(elements.input).exists()).toBe(false);
      expect(wrapper.find(elements.hint).exists()).toBe(false);
    });

    it('renders the save button with the localized save label', () => {
      wrapper = createWrapper();

      expect(wrapper.findComponent(elements.saveButton).props('text')).toBe(
        'Save changes',
      );
    });

    it('renders the more menu placeholder as a tertiary button with the more_vert icon', () => {
      wrapper = createWrapper();

      const moreButton = wrapper.findComponent(elements.moreButton);
      expect(moreButton.exists()).toBe(true);
      expect(moreButton.props('type')).toBe('tertiary');
      expect(moreButton.props('iconCenter')).toBe('more_vert');
    });
  });

  describe('entering edit mode', () => {
    it('shows the input with the current display title when clicking the title wrapper', async () => {
      wrapper = createWrapper({ title: 'My text' });

      await wrapper.find(elements.titleWrapper).trigger('click');

      expect(wrapper.find(elements.input).exists()).toBe(true);
      expect(wrapper.find(elements.input).element.value).toBe('My text');
    });

    it('shows the input with the default title when clicking the title wrapper while title is empty', async () => {
      wrapper = createWrapper({ title: '' });

      await wrapper.find(elements.titleWrapper).trigger('click');

      expect(wrapper.find(elements.input).element.value).toBe(DEFAULT_TITLE);
    });

    it('shows the helper hint with the localized message while editing', async () => {
      wrapper = createWrapper();

      await wrapper.find(elements.titleWrapper).trigger('click');

      expect(wrapper.find(elements.hint).text()).toBe(
        'Press ENTER to confirm or ESC to cancel',
      );
    });

    it('also enters edit mode when clicking the edit icon', async () => {
      wrapper = createWrapper();

      await wrapper.find(elements.editIcon).trigger('click');

      expect(wrapper.find(elements.input).exists()).toBe(true);
    });

    it('hides the static title once editing starts', async () => {
      wrapper = createWrapper();

      await wrapper.find(elements.titleWrapper).trigger('click');

      expect(wrapper.find(elements.title).exists()).toBe(false);
    });
  });

  describe('committing the title', () => {
    it('emits update:title and exits edit mode on Enter', async () => {
      wrapper = createWrapper({ title: 'My text' });

      await wrapper.find(elements.titleWrapper).trigger('click');
      const input = wrapper.find(elements.input);
      await input.setValue('New title');
      await input.trigger('keydown.enter');
      await flushPromises();

      expect(wrapper.emitted('update:title')).toEqual([['New title']]);
      expect(wrapper.find(elements.input).exists()).toBe(false);
    });

    it('emits update:title and exits edit mode on blur', async () => {
      wrapper = createWrapper({ title: 'My text' });

      await wrapper.find(elements.titleWrapper).trigger('click');
      const input = wrapper.find(elements.input);
      await input.setValue('Renamed by blur');
      await input.trigger('blur');
      await flushPromises();

      expect(wrapper.emitted('update:title')).toEqual([['Renamed by blur']]);
      expect(wrapper.find(elements.input).exists()).toBe(false);
    });

    it('does not emit update:title when the committed value equals the current title', async () => {
      wrapper = createWrapper({ title: 'My text' });

      await wrapper.find(elements.titleWrapper).trigger('click');
      const input = wrapper.find(elements.input);
      await input.setValue('My text');
      await input.trigger('keydown.enter');
      await flushPromises();

      expect(wrapper.emitted('update:title')).toBeUndefined();
    });

    it('emits the default title when the committed value is empty or whitespace', async () => {
      wrapper = createWrapper({ title: 'My text' });

      await wrapper.find(elements.titleWrapper).trigger('click');
      const input = wrapper.find(elements.input);
      await input.setValue('   ');
      await input.trigger('keydown.enter');
      await flushPromises();

      expect(wrapper.emitted('update:title')).toEqual([[DEFAULT_TITLE]]);
    });

    it('calls the store patchContentText with only the title when a uuid is provided', async () => {
      wrapper = createWrapper({ uuid: 'text-uuid-1', title: 'My text' });
      const knowledgeStore = useKnowledgeStore();
      knowledgeStore.patchContentText = vi.fn().mockResolvedValue({});

      await wrapper.find(elements.titleWrapper).trigger('click');
      const input = wrapper.find(elements.input);
      await input.setValue('Renamed');
      await input.trigger('keydown.enter');
      await flushPromises();

      expect(knowledgeStore.patchContentText).toHaveBeenCalledTimes(1);
      expect(knowledgeStore.patchContentText).toHaveBeenCalledWith(
        'text-uuid-1',
        { title: 'Renamed' },
      );

      const payload = knowledgeStore.patchContentText.mock.calls[0][1];
      expect(payload).not.toHaveProperty('text');
    });

    it('does not call patchContentText when no uuid is provided (create mode)', async () => {
      wrapper = createWrapper({ uuid: null, title: 'Draft' });
      const knowledgeStore = useKnowledgeStore();
      knowledgeStore.patchContentText = vi.fn().mockResolvedValue({});

      await wrapper.find(elements.titleWrapper).trigger('click');
      const input = wrapper.find(elements.input);
      await input.setValue('Renamed locally');
      await input.trigger('keydown.enter');
      await flushPromises();

      expect(knowledgeStore.patchContentText).not.toHaveBeenCalled();
      expect(wrapper.emitted('update:title')).toEqual([['Renamed locally']]);
    });
  });

  describe('cancelling the title edit', () => {
    it('exits edit mode without emitting update:title on Esc', async () => {
      wrapper = createWrapper({ title: 'My text' });

      await wrapper.find(elements.titleWrapper).trigger('click');
      const input = wrapper.find(elements.input);
      await input.setValue('Discarded');
      await input.trigger('keydown.esc');
      await flushPromises();

      expect(wrapper.emitted('update:title')).toBeUndefined();
      expect(wrapper.find(elements.input).exists()).toBe(false);
      expect(wrapper.find(elements.title).text()).toBe('My text');
    });

    it('does not call patchContentText when the edit is cancelled with Esc', async () => {
      wrapper = createWrapper({ uuid: 'text-uuid-1', title: 'My text' });
      const knowledgeStore = useKnowledgeStore();
      knowledgeStore.patchContentText = vi.fn().mockResolvedValue({});

      await wrapper.find(elements.titleWrapper).trigger('click');
      const input = wrapper.find(elements.input);
      await input.setValue('Discarded');
      await input.trigger('keydown.esc');
      await flushPromises();

      expect(knowledgeStore.patchContentText).not.toHaveBeenCalled();
    });
  });

  describe('save button', () => {
    it('is disabled when saveDisabled is true', () => {
      wrapper = createWrapper({ saveDisabled: true });

      expect(wrapper.findComponent(elements.saveButton).props('disabled')).toBe(
        true,
      );
    });

    it('is enabled when saveDisabled is false', () => {
      wrapper = createWrapper({ saveDisabled: false });

      expect(wrapper.findComponent(elements.saveButton).props('disabled')).toBe(
        false,
      );
    });

    it('forwards the saveLoading prop to the save button', () => {
      wrapper = createWrapper({ saveLoading: true });

      expect(wrapper.findComponent(elements.saveButton).props('loading')).toBe(
        true,
      );
    });

    it('emits the save event when the save button is clicked', async () => {
      wrapper = createWrapper({ saveDisabled: false });

      await wrapper.findComponent(elements.saveButton).trigger('click');

      expect(wrapper.emitted('save')).toHaveLength(1);
    });
  });

  describe('back navigation', () => {
    it('emits back when the page header back action fires', async () => {
      wrapper = createWrapper();

      wrapper.findComponent(elements.root).vm.$emit('back');
      await nextTick();

      expect(wrapper.emitted('back')).toHaveLength(1);
    });
  });
});
