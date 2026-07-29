import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useImprovementsStore } from '@/store/Improvements';
import { redirectInParent } from '@/utils/parentRedirect';

import SuggestedSolutionSection from '../SuggestedSolutionSection.vue';

vi.mock('@/utils/parentRedirect', () => ({
  redirectInParent: vi.fn(),
}));

describe('SuggestedSolutionSection.vue', () => {
  let wrapper;
  let improvementsStore;

  const createWrapper = () => {
    const pinia = createTestingPinia({
      stubActions: true,
    });

    improvementsStore = useImprovementsStore(pinia);

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
});
