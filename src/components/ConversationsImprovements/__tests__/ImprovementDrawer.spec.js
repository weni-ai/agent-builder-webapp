import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import i18n from '@/utils/plugins/i18n';

import ImprovementDrawer from '../ImprovementDrawer.vue';

describe('ImprovementDrawer.vue', () => {
  let wrapper;

  const baseImprovement = {
    uuid: 'improvement-uuid-1',
    text: 'The agent tone does not match the configured brand voice in refund conversations.',
    type: 'personality_deviation',
    conversationsCount: 18,
  };

  const createWrapper = (props = {}) => {
    wrapper = mount(ImprovementDrawer, {
      props: {
        open: true,
        improvement: baseImprovement,
        ...props,
      },
      global: {
        stubs: {
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
          UnnnicDrawerClose: {
            template: '<div><slot /></div>',
          },
        },
      },
    });
  };

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
  };

  afterEach(() => {
    wrapper?.unmount();
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
  });
});
