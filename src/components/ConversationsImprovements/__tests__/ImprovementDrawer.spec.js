import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useImprovementsStore } from '@/store/Improvements';

import ImprovementDrawer from '../ImprovementDrawer.vue';

describe('ImprovementDrawer.vue', () => {
  let wrapper;
  let improvementsStore;

  const baseImprovement = {
    uuid: 'improvement-uuid-1',
    text: 'The agent tone does not match the configured brand voice in refund conversations.',
    type: 'personality_deviation',
    conversationsCount: 18,
  };

  const baseImprovementDetail = {
    uuid: 'improvement-uuid-1',
    text: baseImprovement.text,
    type: baseImprovement.type,
    description: 'The agent tone does not match the configured brand voice.',
    suggestedChange: 'Update the tone instruction in refund conversations.',
    status: 'pending',
    affectedInstructions: [],
  };

  const createWrapper = (props = {}, { improvementDetail = null } = {}) => {
    const pinia = createTestingPinia({
      stubActions: false,
    });

    improvementsStore = useImprovementsStore(pinia);
    vi.spyOn(improvementsStore, 'fetchImprovementDetail').mockResolvedValue();
    vi.spyOn(improvementsStore, 'resetImprovementDetail');

    if (improvementDetail) {
      improvementsStore.improvementDetail.data = improvementDetail;
      improvementsStore.improvementDetail.status = 'complete';
    }

    wrapper = mount(ImprovementDrawer, {
      props: {
        open: true,
        improvement: baseImprovement,
        ...props,
      },
      global: {
        plugins: [pinia],
        stubs: {
          ImprovementStatusDialog: {
            template:
              '<div data-testid="improvement-status-dialog-stub" :data-status="status" :data-open="String(open)"><button data-testid="emit-success" @click="$emit(\'success\')" /></div>',
            props: ['status', 'improvementUuid', 'open'],
            emits: ['success'],
          },
          UnnnicDrawerContent: {
            template: '<div><slot /></div>',
          },
          UnnnicDrawerHeader: {
            template: '<div><slot /></div>',
          },
          UnnnicDrawerTitle: {
            template: '<div><slot /></div>',
          },
          UnnnicDrawerFooter: {
            template:
              '<div data-testid="improvement-drawer-footer"><slot /></div>',
          },
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const elements = {
    drawer: () => wrapper.find('[data-testid="improvement-drawer"]'),
    title: () => wrapper.find('[data-testid="improvement-drawer-title"]'),
    typeTag: () =>
      wrapper.findComponent('[data-testid="improvement-drawer-type"]'),
    conversationsCount: () =>
      wrapper.find('[data-testid="improvement-drawer-conversations-count"]'),
    ignoreButton: () =>
      wrapper.findComponent('[data-testid="improvement-drawer-ignore-button"]'),
    markResolvedButton: () =>
      wrapper.findComponent(
        '[data-testid="improvement-drawer-mark-resolved-button"]',
      ),
    footer: () => wrapper.find('[data-testid="improvement-drawer-footer"]'),
    statusDialog: () =>
      wrapper.find('[data-testid="improvement-status-dialog-stub"]'),
    content: () => wrapper.find('[data-testid="improvement-drawer-content"]'),
    diagnosisSection: () =>
      wrapper.find('[data-testid="improvement-drawer-diagnosis-section"]'),
    diagnosisTitle: () =>
      wrapper.find('[data-testid="improvement-drawer-diagnosis-title"]'),
    diagnosisDescription: () =>
      wrapper.find('[data-testid="improvement-drawer-diagnosis-description"]'),
    suggestedSolutionSection: () =>
      wrapper.find(
        '[data-testid="improvement-drawer-suggested-solution-section"]',
      ),
    suggestedSolutionTitle: () =>
      wrapper.find(
        '[data-testid="improvement-drawer-suggested-solution-title"]',
      ),
    affectedConversationsSection: () =>
      wrapper.find(
        '[data-testid="improvement-drawer-affected-conversations-section"]',
      ),
    affectedConversationsTitle: () =>
      wrapper.find(
        '[data-testid="improvement-drawer-affected-conversations-title"]',
      ),
  };

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('detail loading', () => {
    it('fetches improvement detail when the drawer opens', async () => {
      createWrapper();

      await nextTick();

      expect(improvementsStore.fetchImprovementDetail).toHaveBeenCalledWith(
        baseImprovement.uuid,
      );
    });

    it('resets improvement detail when the drawer closes', async () => {
      createWrapper();

      await wrapper.setProps({ open: false });
      await nextTick();

      expect(improvementsStore.resetImprovementDetail).toHaveBeenCalled();
    });

    it('does not fetch improvement detail when improvement is null', async () => {
      createWrapper({ improvement: null });

      await nextTick();

      expect(improvementsStore.fetchImprovementDetail).not.toHaveBeenCalled();
    });
  });

  describe('header', () => {
    it('renders the drawer', () => {
      createWrapper();

      expect(elements.drawer().exists()).toBe(true);
    });

    it('renders the improvement text as the drawer title', () => {
      createWrapper();

      expect(elements.title().text()).toBe(baseImprovement.text);
    });

    it('renders the affected conversations count with pluralization', () => {
      createWrapper();

      expect(elements.conversationsCount().text()).toBe(
        i18n.global.t(
          'audit.improvements.drawer.affected_conversations_count',
          {
            count: baseImprovement.conversationsCount,
          },
        ),
      );
    });

    it('renders zero affected conversations when improvement is null', () => {
      createWrapper({ improvement: null });

      expect(elements.title().text()).toBe('');
      expect(elements.conversationsCount().text()).toBe(
        i18n.global.t(
          'audit.improvements.drawer.affected_conversations_count',
          {
            count: 0,
          },
        ),
      );
    });

    describe('type tag mapping', () => {
      it.each([
        {
          type: 'many_questions_before_answering',
          scheme: 'blue',
          category: 'behavior',
        },
        {
          type: 'wrong_behavior_due_to_instructions',
          scheme: 'blue',
          category: 'behavior',
        },
        {
          type: 'personality_deviation',
          scheme: 'blue',
          category: 'behavior',
        },
        {
          type: 'repetitive_response',
          scheme: 'blue',
          category: 'behavior',
        },
        {
          type: 'missing_static_knowledge',
          scheme: 'purple',
          category: 'knowledge',
        },
        {
          type: 'poor_product_search_results',
          scheme: 'orange',
          category: 'technical_issue',
        },
        {
          type: 'custom_analysis',
          scheme: 'yellow',
          category: 'custom_analysis',
        },
      ])(
        'renders $category tag with $scheme scheme for $type',
        ({ type, scheme, category }) => {
          createWrapper({
            improvement: {
              ...baseImprovement,
              type,
            },
          });

          const typeTag = elements.typeTag();

          expect(typeTag.props('scheme')).toBe(scheme);
          expect(typeTag.props('text')).toBe(
            i18n.global.t(`audit.improvements.types.${category}`),
          );
        },
      );
    });
  });

  describe('content sections', () => {
    it('renders the drawer content container', () => {
      createWrapper();

      expect(elements.content().exists()).toBe(true);
    });

    it.each([
      {
        section: 'diagnosis',
        findSection: () => elements.diagnosisSection(),
        findTitle: () => elements.diagnosisTitle(),
        localeKey: 'audit.improvements.drawer.diagnosis_title',
      },
      {
        section: 'suggested solution',
        findSection: () => elements.suggestedSolutionSection(),
        findTitle: () => elements.suggestedSolutionTitle(),
        localeKey: 'audit.improvements.drawer.suggested_solution_title',
      },
      {
        section: 'affected conversations',
        findSection: () => elements.affectedConversationsSection(),
        findTitle: () => elements.affectedConversationsTitle(),
        localeKey: 'audit.improvements.drawer.affected_conversations_title',
      },
    ])(
      'renders the $section section title',
      ({ findSection, findTitle, localeKey }) => {
        createWrapper();

        expect(findSection().exists()).toBe(true);
        expect(findTitle().text()).toBe(i18n.global.t(localeKey));
      },
    );

    it('renders the diagnosis description from improvement detail', () => {
      createWrapper({}, { improvementDetail: baseImprovementDetail });

      expect(elements.diagnosisDescription().text()).toBe(
        baseImprovementDetail.description,
      );
    });

    it('renders an empty diagnosis description when improvement detail is unavailable', () => {
      createWrapper();

      expect(elements.diagnosisDescription().text()).toBe('');
    });
  });

  describe('footer', () => {
    it('renders the drawer footer', () => {
      createWrapper();

      expect(elements.footer().exists()).toBe(true);
    });

    it('renders the ignore improvement button with tertiary type', () => {
      createWrapper();

      const ignoreButton = elements.ignoreButton();

      expect(ignoreButton.exists()).toBe(true);
      expect(ignoreButton.props('type')).toBe('tertiary');
      expect(ignoreButton.props('text')).toBe(
        i18n.global.t('audit.improvements.drawer.ignore_improvement'),
      );
    });

    it('renders the mark as resolved button with primary type', () => {
      createWrapper();

      const markResolvedButton = elements.markResolvedButton();

      expect(markResolvedButton.exists()).toBe(true);
      expect(markResolvedButton.props('type')).toBe('primary');
      expect(markResolvedButton.props('text')).toBe(
        i18n.global.t('audit.improvements.drawer.mark_as_resolved'),
      );
    });

    it('opens the ignore status dialog when the ignore button is clicked', async () => {
      createWrapper();

      await elements.ignoreButton().trigger('click');

      const statusDialog = elements.statusDialog();

      expect(statusDialog.attributes('data-open')).toBe('true');
      expect(statusDialog.attributes('data-status')).toBe('ignored');
    });

    it('opens the resolved status dialog when the mark as resolved button is clicked', async () => {
      createWrapper();

      await elements.markResolvedButton().trigger('click');

      const statusDialog = elements.statusDialog();

      expect(statusDialog.attributes('data-open')).toBe('true');
      expect(statusDialog.attributes('data-status')).toBe('resolved');
    });

    it('closes the drawer when the status dialog emits success', async () => {
      createWrapper();

      await wrapper.find('[data-testid="emit-success"]').trigger('click');
      await nextTick();

      expect(wrapper.emitted('update:open')).toEqual([[false]]);
    });
  });
});
