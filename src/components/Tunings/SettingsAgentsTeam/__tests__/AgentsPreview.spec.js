import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import AgentsPreview from '../AgentsPreview.vue';
import SettingsField from '../SettingsField.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';
import { useTuningsStore } from '@/store/Tunings';
import i18n from '@/utils/plugins/i18n';

describe('AgentsPreview.vue', () => {
  let wrapper;
  let store;

  const titleText = () => wrapper.findComponent('[data-testid="title"]');
  const settingsFields = () => wrapper.findAllComponents(SettingsField);
  const progressiveFeedbackField = () =>
    wrapper.findComponent('[data-testid="progressive-feedback"]');
  const multipleMessageFormatField = () =>
    wrapper.findComponent('[data-testid="components"]');

  beforeEach(() => {
    wrapper = shallowMount(AgentsPreview, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          UnnnicIntelligenceText: Text,
          SettingsField,
        },
      },
    });

    store = useTuningsStore();
    store.settings.data.components = true;
    store.settings.data.progressiveFeedback = false;
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
      expect(title.props('size')).toBe('body-lg');
      expect(title.props('color')).toBe('neutral-darkest');
      expect(title.props('weight')).toBe('bold');
      expect(title.text()).toBe(
        i18n.global.t('router.tunings.settings.agents_preview.title'),
      );
    });

    it('renders exactly two settings fields', () => {
      expect(settingsFields()).toHaveLength(2);
    });
  });

  describe('Settings fields configuration', () => {
    it('configures progressive feedback field correctly', () => {
      const field = progressiveFeedbackField();

      expect(field.props('modelValue')).toBe(false);
      expect(field.props('textRight')).toBe(
        i18n.global.t(
          'router.tunings.settings.agents_preview.agents_progressive_feedback.title',
        ),
      );
      expect(field.props('description')).toBe(
        i18n.global.t(
          'router.tunings.settings.agents_preview.agents_progressive_feedback.description',
        ),
      );
    });

    it('configures multiple message format field correctly', async () => {
      const field = multipleMessageFormatField();

      expect(field.props('modelValue')).toBe(true);
      expect(field.props('textRight')).toBe(
        i18n.global.t(
          'router.tunings.settings.agents_preview.multiple_message_format.title',
        ),
      );
      expect(field.props('description')).toBe(
        i18n.global.t(
          'router.tunings.settings.agents_preview.multiple_message_format.description',
        ),
      );
    });

    it('binds fields to correct store properties', async () => {
      store.settings.data.progressiveFeedback = true;
      store.settings.data.components = false;

      await wrapper.vm.$nextTick();

      expect(progressiveFeedbackField().props('modelValue')).toBe(true);
      expect(multipleMessageFormatField().props('modelValue')).toBe(false);
    });
  });

  describe('Store integration', () => {
    it('updates store when progressive feedback field changes', async () => {
      const field = progressiveFeedbackField();

      await field.vm.$emit('update:modelValue', true);

      expect(store.settings.data.progressiveFeedback).toBe(true);
    });

    it('updates store when multiple message format field changes', async () => {
      const field = multipleMessageFormatField();

      await field.vm.$emit('update:modelValue', false);

      expect(store.settings.data.components).toBe(false);
    });

    it('reflects store changes in field values', async () => {
      expect(progressiveFeedbackField().props('modelValue')).toBe(false);
      expect(multipleMessageFormatField().props('modelValue')).toBe(true);

      store.settings.data.progressiveFeedback = true;
      store.settings.data.components = false;
      await wrapper.vm.$nextTick();

      expect(progressiveFeedbackField().props('modelValue')).toBe(true);
      expect(multipleMessageFormatField().props('modelValue')).toBe(false);
    });
  });

  describe('Form interactions', () => {
    it('handles multiple field updates correctly', async () => {
      const progressiveField = progressiveFeedbackField();
      const messageFormatField = multipleMessageFormatField();

      await progressiveField.vm.$emit('update:modelValue', true);
      await messageFormatField.vm.$emit('update:modelValue', false);

      expect(store.settings.data.progressiveFeedback).toBe(true);
      expect(store.settings.data.components).toBe(false);
    });

    it('maintains independent field states', async () => {
      await progressiveFeedbackField().vm.$emit('update:modelValue', true);

      expect(store.settings.data.progressiveFeedback).toBe(true);
      expect(store.settings.data.components).toBe(true);
    });
  });

  describe('Store reactivity', () => {
    it('responds to external store changes', async () => {
      expect(progressiveFeedbackField().props('modelValue')).toBe(false);

      store.settings.data.progressiveFeedback = true;
      await wrapper.vm.$nextTick();

      expect(progressiveFeedbackField().props('modelValue')).toBe(true);
    });

    it('maintains two-way data binding with store', async () => {
      store.settings.data.components = false;
      await wrapper.vm.$nextTick();

      expect(multipleMessageFormatField().props('modelValue')).toBe(false);

      await multipleMessageFormatField().vm.$emit('update:modelValue', true);
      expect(store.settings.data.components).toBe(true);
    });
  });
});
