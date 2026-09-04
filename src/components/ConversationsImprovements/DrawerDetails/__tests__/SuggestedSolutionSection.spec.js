import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useImprovementsStore } from '@/store/Improvements';
import { useProfileStore } from '@/store/Profile';
import { redirectInParent } from '@/utils/parentRedirect';

import SuggestedSolutionSection from '../SuggestedSolutionSection.vue';

vi.mock('@/utils/parentRedirect', () => ({
  redirectInParent: vi.fn(),
}));

describe('SuggestedSolutionSection.vue', () => {
  let wrapper;
  let improvementsStore;
  let profileStore;

  const createWrapper = ({ profileInstructions = [] } = {}) => {
    const pinia = createTestingPinia({
      stubActions: true,
    });

    improvementsStore = useImprovementsStore(pinia);
    profileStore = useProfileStore(pinia);
    profileStore.instructions.current = profileInstructions;

    wrapper = mount(SuggestedSolutionSection, {
      global: {
        plugins: [pinia],
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  const elements = {
    cta: () => wrapper.findComponent('[data-testid="suggested-solution-cta"]'),
    affectedInstructionsTitle: () =>
      wrapper.find(
        '[data-testid="suggested-solution-affected-instructions-title"]',
      ),
    affectedInstructionsList: () =>
      wrapper.find(
        '[data-testid="suggested-solution-affected-instructions-list"]',
      ),
    affectedInstructions: () =>
      wrapper.findAll(
        '[data-testid="suggested-solution-affected-instruction"]',
      ),
  };

  it('opens the knowledge base in a new tab when the CTA is clicked', async () => {
    createWrapper();

    improvementsStore.improvementDetail.data = {
      type: 'missing_static_knowledge',
      suggestedSolution: 'Add missing knowledge',
      affectedInstructions: [],
    };

    await wrapper.vm.$nextTick();

    expect(elements.cta().props('text')).toBe(
      i18n.global.t('audit.improvements.drawer.go_to_knowledge_base'),
    );

    await elements.cta().trigger('click');

    expect(redirectInParent).toHaveBeenCalledWith({
      path: 'aiBuild:knowledge',
      openInNew: true,
    });
  });

  it('opens instructions in a new tab when the CTA is clicked', async () => {
    createWrapper();

    improvementsStore.improvementDetail.data = {
      type: 'wrong_behavior_due_to_instructions',
      suggestedSolution: 'Update instructions',
      affectedInstructions: [],
    };

    await wrapper.vm.$nextTick();

    expect(elements.cta().props('text')).toBe(
      i18n.global.t('audit.improvements.drawer.go_to_instructions'),
    );

    await elements.cta().trigger('click');

    expect(redirectInParent).toHaveBeenCalledWith({
      path: 'aiAgents:agents/instructions',
      openInNew: true,
    });
  });

  it('emits open-contact-support for technical issue CTAs', async () => {
    createWrapper();

    improvementsStore.improvementDetail.data = {
      type: 'poor_product_search_results',
      suggestedSolution: 'Contact support',
      affectedInstructions: [],
    };

    await wrapper.vm.$nextTick();

    await elements.cta().trigger('click');

    expect(wrapper.emitted('open-contact-support')).toEqual([[]]);
    expect(redirectInParent).not.toHaveBeenCalled();
  });

  describe('affected instructions title', () => {
    const affectedInstructions = [
      { id: 1, changeType: 'fix', wasChanged: false },
    ];
    const profileInstructions = [
      { id: 1, instruction: 'Use a formal tone in refund conversations' },
    ];

    it.each([
      {
        recommendedAction: 'fix_instruction',
        localeKey: 'audit.improvements.drawer.edit_instructions_below',
      },
      {
        recommendedAction: 'remove_instruction',
        localeKey: 'audit.improvements.drawer.remove_instructions_below',
      },
    ])(
      'renders the $recommendedAction title',
      async ({ recommendedAction, localeKey }) => {
        createWrapper({ profileInstructions });

        improvementsStore.improvementDetail.data = {
          type: 'wrong_behavior_due_to_instructions',
          suggestedSolution: 'Update instructions',
          recommendedAction,
          affectedInstructions,
        };

        await wrapper.vm.$nextTick();

        expect(elements.affectedInstructionsTitle().text()).toBe(
          i18n.global.t(localeKey),
        );
      },
    );

    it('does not render a title when recommendedAction is missing', async () => {
      createWrapper({ profileInstructions });

      improvementsStore.improvementDetail.data = {
        type: 'wrong_behavior_due_to_instructions',
        suggestedSolution: 'Update instructions',
        recommendedAction: null,
        affectedInstructions,
      };

      await wrapper.vm.$nextTick();

      expect(elements.affectedInstructionsTitle().exists()).toBe(false);
    });
  });

  describe('affected instructions list', () => {
    it('renders instructions that have text', async () => {
      createWrapper({
        profileInstructions: [
          { id: 1, instruction: 'Use a formal tone' },
          { id: 2, instruction: 'Ask for the order number' },
        ],
      });

      improvementsStore.improvementDetail.data = {
        type: 'wrong_behavior_due_to_instructions',
        suggestedSolution: 'Update instructions',
        affectedInstructions: [
          { id: 1, changeType: 'fix', wasChanged: false },
          { id: 2, changeType: 'fix', wasChanged: false },
        ],
      };

      await wrapper.vm.$nextTick();

      const items = elements.affectedInstructions();

      expect(items).toHaveLength(2);
      expect(items[0].text()).toContain('Use a formal tone');
      expect(items[1].text()).toContain('Ask for the order number');
    });

    it('does not render empty, missing, or whitespace-only instructions', async () => {
      createWrapper({
        profileInstructions: [
          { id: 1, instruction: 'Use a formal tone' },
          { id: 2, instruction: '' },
          { id: 3, instruction: '   ' },
        ],
      });

      improvementsStore.improvementDetail.data = {
        type: 'wrong_behavior_due_to_instructions',
        suggestedSolution: 'Update instructions',
        affectedInstructions: [
          { id: 1, changeType: 'fix', wasChanged: false },
          { id: 2, changeType: 'fix', wasChanged: false },
          { id: 3, changeType: 'fix', wasChanged: false },
          { id: 4, changeType: 'fix', wasChanged: false },
        ],
      };

      await wrapper.vm.$nextTick();

      const items = elements.affectedInstructions();

      expect(items).toHaveLength(1);
      expect(items[0].text()).toContain('Use a formal tone');
    });

    it('does not render the list when all instructions are empty', async () => {
      createWrapper({
        profileInstructions: [{ id: 1, instruction: '' }],
      });

      improvementsStore.improvementDetail.data = {
        type: 'wrong_behavior_due_to_instructions',
        suggestedSolution: 'Update instructions',
        recommendedAction: 'fix_instruction',
        affectedInstructions: [
          { id: 1, changeType: 'fix', wasChanged: false },
        ],
      };

      await wrapper.vm.$nextTick();

      expect(elements.affectedInstructionsList().exists()).toBe(false);
      expect(elements.affectedInstructionsTitle().exists()).toBe(false);
    });
  });
});
