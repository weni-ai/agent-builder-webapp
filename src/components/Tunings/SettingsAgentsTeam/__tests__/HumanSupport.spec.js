import { mount, shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import HumanSupport from '../HumanSupport.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';
import { useTuningsStore } from '@/store/Tunings';
import i18n from '@/utils/plugins/i18n';
import Unnnic from '@weni/unnnic-system';

describe('HumanSupport.vue', () => {
  let wrapper;
  let store;

  const titleText = () => wrapper.findComponent('[data-testid="title"]');
  const settingsField = () => wrapper.findComponent('[data-testid="field"]');
  const formElement = () =>
    wrapper.findComponent('[data-testid="form-element"]');
  const textArea = () => wrapper.findComponent('[data-testid="textarea"]');
  const loadingElement = () =>
    wrapper.findComponent('[data-testid="form-loading"]');

  beforeEach(() => {
    wrapper = mount(HumanSupport, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          UnnnicIntelligenceText: Text,
        },
      },
    });

    store = useTuningsStore();
    store.settings.status = true;
    store.settings.data.humanSupport = false;
    store.settings.data.humanSupportPrompt = '';
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders the title with correct translation and styling', () => {
      const title = titleText();

      expect(title.props('tag')).toBe('p');
      expect(title.props('family')).toBe('secondary');
      expect(title.props('color')).toBe('neutral-darkest');
      expect(title.props('weight')).toBe('bold');
      expect(title.props('size')).toBe('body-lg');
      expect(title.text()).toBe(i18n.global.t('profile.human_support.title'));
    });
  });

  describe('Loading state', () => {
    it('shows loading element when store status is falsy', async () => {
      store.settings.status = false;
      await wrapper.vm.$nextTick();

      expect(loadingElement().exists()).toBe(true);
      expect(settingsField().exists()).toBe(false);
      expect(formElement().exists()).toBe(false);
      expect(textArea().exists()).toBe(false);
    });

    it('shows form content when store status is truthy', () => {
      store.settings.status = true;

      expect(loadingElement().exists()).toBe(false);
      expect(settingsField().exists()).toBe(true);
    });

    it('configures loading element correctly', async () => {
      store.settings.status = false;
      await wrapper.vm.$nextTick();

      const loading = loadingElement();
      expect(loading.props('label')).toBe(true);
      expect(loading.props('element')).toBe('textarea');
    });
  });

  describe('Settings field configuration', () => {
    it('configures human support toggle correctly', () => {
      const field = settingsField();

      expect(field.props('modelValue')).toBe(false);
      expect(field.props('textRight')).toBe(
        i18n.global.t('profile.human_support.title'),
      );
      expect(field.props('description')).toBe(
        i18n.global.t('router.tunings.settings.human_support.description'),
      );
    });

    it('updates when human support is enabled', async () => {
      store.settings.data.humanSupport = true;
      await wrapper.vm.$nextTick();

      expect(settingsField().props('modelValue')).toBe(true);
    });
  });

  describe('Form element configuration', () => {
    it('configures form element correctly when human support is disabled', () => {
      store.settings.data.humanSupport = false;

      const form = formElement();
      expect(form.props('label')).toBe(
        i18n.global.t('profile.human_support.fields.rules.title'),
      );
      expect(form.props('disabled')).toBe(true);
    });

    it('enables form element when human support is enabled', async () => {
      store.settings.data.humanSupport = true;
      await wrapper.vm.$nextTick();

      expect(formElement().props('disabled')).toBe(false);
    });

    it('shows error when human support is enabled but prompt is empty', async () => {
      store.settings.data.humanSupport = true;
      store.settings.data.humanSupportPrompt = '';
      await wrapper.vm.$nextTick();

      expect(formElement().props('error')).toBe(
        i18n.global.t('profile.invalid_field'),
      );
    });
  });

  describe('Textarea configuration', () => {
    it('configures textarea correctly when human support is disabled', async () => {
      store.settings.data.humanSupport = false;
      await wrapper.vm.$nextTick();

      const textarea = textArea();

      expect(textarea.props('modelValue')).toBe('');
      expect(textarea.props('placeholder')).toBe(
        i18n.global.t('profile.human_support.fields.rules.placeholder'),
      );
      expect(textarea.props('type')).toBe('normal');
      expect(textarea.props('disabled')).toBe(true);
    });

    it('enables textarea when human support is enabled', async () => {
      store.settings.data.humanSupport = true;
      await wrapper.vm.$nextTick();

      expect(textArea().props('disabled')).toBe(false);
    });

    it('shows error type when there is an error', async () => {
      store.settings.data.humanSupport = true;
      store.settings.data.humanSupportPrompt = '';
      await wrapper.vm.$nextTick();

      expect(textArea().props('type')).toBe('error');
    });

    it('shows normal type when there is no error', async () => {
      store.settings.data.humanSupport = true;
      store.settings.data.humanSupportPrompt = 'Some text';
      await wrapper.vm.$nextTick();

      expect(textArea().props('type')).toBe('normal');
    });

    it('binds to correct store property', async () => {
      store.settings.data.humanSupportPrompt = 'Test prompt';
      await wrapper.vm.$nextTick();

      expect(textArea().props('modelValue')).toBe('Test prompt');
    });
  });

  describe('Computed properties', () => {
    describe('error computed', () => {
      it('returns false when human support is disabled', () => {
        store.settings.data.humanSupport = false;
        store.settings.data.humanSupportPrompt = '';

        expect(wrapper.vm.error).toBe(false);
      });

      it('returns true when human support is enabled but prompt is empty', async () => {
        store.settings.data.humanSupport = true;
        store.settings.data.humanSupportPrompt = '';
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.error).toBe(true);
      });

      it('returns false when human support is enabled and prompt is provided', async () => {
        store.settings.data.humanSupport = true;
        store.settings.data.humanSupportPrompt = 'Some prompt';
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.error).toBe(false);
      });
    });
  });

  describe('Store integration', () => {
    it('updates store when human support toggle changes', async () => {
      const field = settingsField();

      await field.vm.$emit('update:modelValue', true);

      expect(store.settings.data.humanSupport).toBe(true);
    });

    it('updates store when textarea value changes', async () => {
      const textarea = textArea();

      await textarea.vm.$emit('update:modelValue', 'New prompt text');

      expect(store.settings.data.humanSupportPrompt).toBe('New prompt text');
    });

    it('reflects store changes in component state', async () => {
      store.settings.data.humanSupport = true;
      store.settings.data.humanSupportPrompt = 'Updated prompt';
      await wrapper.vm.$nextTick();

      expect(settingsField().props('modelValue')).toBe(true);
      expect(textArea().props('modelValue')).toBe('Updated prompt');
    });
  });
});
