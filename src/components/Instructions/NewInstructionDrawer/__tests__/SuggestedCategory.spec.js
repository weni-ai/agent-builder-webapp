import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import SuggestedCategory from '../SuggestedCategory.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'test-project-uuid' }),
}));

vi.mock('@/store/FeatureFlags', () => ({
  useFeatureFlagsStore: () => ({
    flags: { categorizationOfInstructions: true },
  }),
}));

const passThroughStub = {
  template: '<div><slot /></div>',
};

const optionStub = {
  props: ['label', 'active', 'icon', 'scheme'],
  template: `<button v-bind="$attrs" @click="$emit('click')"><slot>{{ label }}</slot></button>`,
};

const tagStub = {
  props: ['text'],
  template: '<span v-bind="$attrs">{{ text }}</span>',
};

const iconStub = {
  template: '<i />',
};

const createFormStub = {
  name: 'CategoryCreateForm',
  template: `<div v-bind="$attrs">
    <button data-testid="stub-back" @click="$emit('back')">back</button>
    <button data-testid="stub-create" @click="$emit('create', 'Marketing')">create</button>
  </div>`,
};

const categoryT = (key) =>
  i18n.global.t(
    `agents.instructions.new_instruction_drawer.ai_analysis.category.${key}`,
  );

describe('NewInstructionDrawer/SuggestedCategory.vue', () => {
  let wrapper;
  let store;

  const SELECTORS = {
    trigger: '[data-testid="suggested-category-trigger"]',
    value: '[data-testid="suggested-category-value"]',
    newTag: '[data-testid="suggested-category-new-tag"]',
    suggestedOption: '[data-testid="suggested-category-suggested-option"]',
    suggestedNewTag: '[data-testid="suggested-category-suggested-new-tag"]',
    createAction: '[data-testid="suggested-category-create-action"]',
    createForm: '[data-testid="suggested-category-create-form"]',
  };

  const find = (selector) => wrapper.find(SELECTORS[selector]);

  const createWrapper = (initialState = {}) => {
    const pinia = createTestingPinia({
      stubActions: false,
      initialState: {
        Instructions: {
          categories: [
            { id: 1, name: 'Sales' },
            { id: 2, name: 'Support' },
          ],
          sessionCategories: [],
          newInstruction: {
            text: 'My instruction',
            category: { id: 1, name: 'Sales' },
            status: null,
          },
          instructionSuggestedByAI: {
            data: {
              instruction: '',
              classification: [],
              suggestion: '',
              suggested_category: '',
            },
            suggestionApplied: '',
            status: 'complete',
          },
          ...initialState,
        },
      },
    });

    store = useInstructionsStore(pinia);

    return mount(SuggestedCategory, {
      global: {
        plugins: [pinia],
        // UnnnicPopoverTrigger/Content have no `name`, so they can only be
        // replaced by overriding the global registration.
        components: {
          UnnnicPopoverTrigger: passThroughStub,
          UnnnicPopoverContent: passThroughStub,
        },
        stubs: {
          UnnnicPopover: passThroughStub,
          UnnnicPopoverOption: optionStub,
          UnnnicTag: tagStub,
          UnnnicIcon: iconStub,
          CategoryCreateForm: createFormStub,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Field rendering', () => {
    it('renders the selected category name in the field', () => {
      expect(find('value').text()).toBe('Sales');
    });

    it('does not show the New tag when the selected category has an id', () => {
      expect(find('newTag').exists()).toBe(false);
    });

    it('shows the New tag when the selected category is new', () => {
      wrapper = createWrapper({
        newInstruction: {
          text: 'My instruction',
          category: { id: null, name: 'Brand new' },
          status: null,
        },
      });

      expect(find('newTag').exists()).toBe(true);
      expect(find('newTag').text()).toBe(categoryT('new_badge'));
    });

    it('falls back to the placeholder when no category is selected', () => {
      wrapper = createWrapper({
        newInstruction: { text: 'My instruction', category: null, status: null },
      });

      expect(find('value').text()).toBe(categoryT('placeholder'));
    });
  });

  describe('Options list', () => {
    it('renders the selected category as the suggested option', () => {
      expect(find('suggestedOption').exists()).toBe(true);
      expect(find('suggestedOption').text()).toContain('Sales');
    });

    it('does not render the suggested option when no category is selected', () => {
      wrapper = createWrapper({
        newInstruction: { text: 'My instruction', category: null, status: null },
      });

      expect(find('suggestedOption').exists()).toBe(false);
    });

    it('shows the New tag inside the suggested option when the category is new', () => {
      wrapper = createWrapper({
        newInstruction: {
          text: 'My instruction',
          category: { id: null, name: 'Brand new' },
          status: null,
        },
      });

      expect(find('suggestedNewTag').exists()).toBe(true);
      expect(find('suggestedNewTag').text()).toBe(categoryT('new_badge'));
    });

    it('renders the remaining categories excluding the selected one', () => {
      const options = wrapper.findAll(
        '[data-testid^="suggested-category-option-"]',
      );

      expect(options).toHaveLength(1);
      expect(options[0].text()).toBe('Support');
    });

    it('renders the create category action', () => {
      expect(find('createAction').exists()).toBe(true);
      expect(find('createAction').text()).toBe(categoryT('create_action'));
    });

    it('updates the selected category in the store when an option is clicked', async () => {
      await wrapper
        .find('[data-testid="suggested-category-option-Support"]')
        .trigger('click');

      expect(store.newInstruction.category).toEqual({ id: 2, name: 'Support' });
    });
  });

  describe('Create category flow', () => {
    it('shows the create form when the create action is clicked', async () => {
      await find('createAction').trigger('click');

      expect(find('createForm').exists()).toBe(true);
    });

    it('creates the category and selects it when the form emits create', async () => {
      await find('createAction').trigger('click');

      await wrapper.find('[data-testid="stub-create"]').trigger('click');

      expect(store.sessionCategories).toContain('Marketing');
      expect(store.newInstruction.category).toEqual({
        id: null,
        name: 'Marketing',
      });
      expect(store.selectedCategoryIsNew).toBe(true);
    });

    it('returns to the list when the form emits back', async () => {
      await find('createAction').trigger('click');
      expect(find('createForm').exists()).toBe(true);

      await wrapper.find('[data-testid="stub-back"]').trigger('click');

      expect(find('createForm').exists()).toBe(false);
      expect(find('createAction').exists()).toBe(true);
    });
  });
});
