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
  template: `<button v-bind="$attrs" :data-active="active" @click="$emit('click')"><slot>{{ label }}</slot></button>`,
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
  const findOption = (name) =>
    wrapper.find(`[data-testid="suggested-category-option-${name}"]`);

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
              suggested_category: 'Personality',
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

  describe('Suggested category section', () => {
    it('renders the AI-suggested category as the suggested option', () => {
      expect(find('suggestedOption').exists()).toBe(true);
      expect(find('suggestedOption').text()).toContain('Personality');
    });

    it('does not render the suggested section when there is no suggested category', () => {
      wrapper = createWrapper({
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
      });

      expect(find('suggestedOption').exists()).toBe(false);
    });

    it('shows the New tag when the suggested category does not exist yet', () => {
      expect(find('suggestedNewTag').exists()).toBe(true);
      expect(find('suggestedNewTag').text()).toBe(categoryT('new_badge'));
    });

    it('does not show the New tag when the suggested category already exists', () => {
      wrapper = createWrapper({
        instructionSuggestedByAI: {
          data: {
            instruction: '',
            classification: [],
            suggestion: '',
            suggested_category: 'Sales',
          },
          suggestionApplied: '',
          status: 'complete',
        },
      });

      expect(find('suggestedNewTag').exists()).toBe(false);
    });

    it('marks the suggested option as active when it is the selected category', () => {
      wrapper = createWrapper({
        newInstruction: {
          text: 'My instruction',
          category: { id: null, name: 'Personality' },
          status: null,
        },
      });

      expect(find('suggestedOption').attributes('data-active')).toBe('true');
    });

    it('selects the suggested category when the suggested option is clicked', async () => {
      await find('suggestedOption').trigger('click');

      expect(store.newInstruction.category).toEqual({
        id: null,
        name: 'Personality',
      });
    });
  });

  describe('Other categories section', () => {
    it('renders the categories excluding the suggested one', () => {
      const options = wrapper.findAll(
        '[data-testid^="suggested-category-option-"]',
      );

      expect(options.map((option) => option.text())).toEqual([
        'Sales',
        'Support',
      ]);
    });

    it('marks an option as active when it is the selected category', () => {
      expect(findOption('Sales').attributes('data-active')).toBe('true');
      expect(findOption('Support').attributes('data-active')).toBe('false');
    });

    it('updates the selected category in the store when an option is clicked', async () => {
      await findOption('Support').trigger('click');

      expect(store.newInstruction.category).toEqual({ id: 2, name: 'Support' });
    });

    it('renders the create category action', () => {
      expect(find('createAction').exists()).toBe(true);
      expect(find('createAction').text()).toBe(categoryT('create_action'));
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
