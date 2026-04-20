import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import AgentsPreview from '../AgentsPreview.vue';
import SettingsField from '../SettingsField.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';
import { useTuningsStore } from '@/store/Tunings';
import { useManagerSelectorStore } from '@/store/ManagerSelector';
import i18n from '@/utils/plugins/i18n';
import { useProjectStore } from '@/store/Project';

describe('AgentsPreview.vue', () => {
  let wrapper;
  let store;
  let projectStore;
  let managerSelectorStore;

  const titleText = () => wrapper.find('[data-testid="title"]');
  const settingsFields = () => wrapper.findAllComponents(SettingsField);
  const progressiveFeedbackField = () =>
    wrapper.findComponent('[data-testid="progressive-feedback"]');
  const multipleMessageFormatField = () =>
    wrapper.findComponent('[data-testid="components"]');

  beforeEach(() => {
    wrapper = shallowMount(AgentsPreview, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              Project: {
                details: {
                  backend: 'bedrock',
                },
              },
            },
          }),
        ],
        stubs: {
          UnnnicIntelligenceText: Text,
          SettingsField,
        },
      },
    });

    store = useTuningsStore();
    projectStore = useProjectStore();
    managerSelectorStore = useManagerSelectorStore();
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

      expect(title.text()).toBe(
        i18n.global.t('router.tunings.settings.agents_preview.title'),
      );
    });

    it('renders exactly two settings fields', () => {
      expect(settingsFields()).toHaveLength(2);
    });

    it('not renders the progressive feedback field when backend is openai', async () => {
      projectStore.details.backend = 'openai';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.showProgressiveFeedback).toBe(false);
      expect(progressiveFeedbackField().exists()).toBe(false);
      expect(multipleMessageFormatField().exists()).toBe(true);
    });

    it('renders the progressive feedback field when backend is not openai', async () => {
      projectStore.details.backend = 'bedrock';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.showProgressiveFeedback).toBe(true);
      expect(progressiveFeedbackField().exists()).toBe(true);
      expect(multipleMessageFormatField().exists()).toBe(true);
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

  describe('Components disabled by manager', () => {
    it('disables the components field when the selected manager does not accept components', async () => {
      managerSelectorStore.options = {
        currentManager: 'manager-2.7',
        serverTime: '2026-01-08T13:00:00Z',
        managers: {
          new: {
            id: 'manager-2.7',
            label: 'Manager 2.7',
            accept_components: false,
          },
          legacy: null,
        },
      };
      managerSelectorStore.selectedManager = 'manager-2.7';
      await nextTick();

      expect(multipleMessageFormatField().props('disabled')).toBe(true);
    });

    it('does not disable the components field when the selected manager accepts components', async () => {
      managerSelectorStore.options = {
        currentManager: 'manager-2.8',
        serverTime: '2026-01-08T13:00:00Z',
        managers: {
          new: {
            id: 'manager-2.8',
            label: 'Manager 2.8',
          },
          legacy: null,
        },
      };
      managerSelectorStore.selectedManager = 'manager-2.8';
      await nextTick();

      expect(multipleMessageFormatField().props('disabled')).toBe(false);
    });

    it('does not disable the components field when a different manager is selected', async () => {
      managerSelectorStore.options = {
        currentManager: 'manager-2.6',
        serverTime: '2026-01-08T13:00:00Z',
        managers: {
          new: {
            id: 'manager-2.7',
            label: 'Manager 2.7',
            accept_components: false,
          },
          legacy: {
            id: 'manager-2.6',
            label: 'Manager 2.6',
            deprecation: '2026-04-15',
          },
        },
      };
      managerSelectorStore.selectedManager = 'manager-2.6';
      await nextTick();

      expect(multipleMessageFormatField().props('disabled')).toBe(false);
    });

    it('forces components to false when the disabled manager is selected', async () => {
      store.settings.data.components = true;

      managerSelectorStore.options = {
        currentManager: 'manager-2.7',
        serverTime: '2026-01-08T13:00:00Z',
        managers: {
          new: {
            id: 'manager-2.7',
            label: 'Manager 2.7',
            accept_components: false,
          },
          legacy: null,
        },
      };
      managerSelectorStore.selectedManager = 'manager-2.7';
      await nextTick();

      expect(store.settings.data.components).toBe(false);
    });
  });
});
