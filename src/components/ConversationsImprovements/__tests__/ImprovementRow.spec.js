import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import i18n from '@/utils/plugins/i18n';

import ImprovementRow from '../ImprovementRow.vue';

describe('ImprovementRow.vue', () => {
  let wrapper;

  const baseImprovement = {
    uuid: 'improvement-uuid-1',
    text: 'The agent tone does not match the configured brand voice in refund conversations.',
    type: 'personality_deviation',
    conversationsCount: 18,
  };

  const createWrapper = (props = {}) => {
    wrapper = mount(ImprovementRow, {
      props: {
        improvement: baseImprovement,
        ...props,
      },
      global: {
        stubs: {
          UnnnicTableRow: {
            template: '<tr v-bind="$attrs"><slot /></tr>',
          },
          UnnnicTableCell: {
            template: '<td><slot /></td>',
          },
        },
      },
    });
  };

  const elements = {
    row: () => wrapper.find('[data-testid="improvement-row"]'),
    text: () => wrapper.find('[data-testid="improvement-row-text"]'),
    conversationsCount: () =>
      wrapper.find('[data-testid="improvement-row-conversations-count"]'),
    typeTag: () => wrapper.findComponent({ name: 'UnnnicTag' }),
  };

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders the row', () => {
    createWrapper();

    expect(elements.row().exists()).toBe(true);
  });

  it('renders the improvement text', () => {
    createWrapper();

    expect(elements.text().text()).toBe(baseImprovement.text);
  });

  it('renders the affected conversations count', () => {
    createWrapper();

    expect(elements.conversationsCount().text()).toBe(
      String(baseImprovement.conversationsCount),
    );
  });

  it('adds the selected class when isSelected is true', () => {
    createWrapper({ isSelected: true });

    expect(elements.row().classes()).toContain('improvement-row--selected');
  });

  it('does not add the selected class when isSelected is false', () => {
    createWrapper({ isSelected: false });

    expect(elements.row().classes()).not.toContain('improvement-row--selected');
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
