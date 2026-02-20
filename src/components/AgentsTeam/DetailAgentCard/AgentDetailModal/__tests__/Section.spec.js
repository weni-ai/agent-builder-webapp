import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import AgentDetailSection from '../AgentDetailSection.vue';

describe('AgentDetailModal Section', () => {
  const mountSection = (props = {}, slots = {}) =>
    shallowMount(AgentDetailSection, {
      props: {
        title: 'Section title',
        ...props,
      },
      slots,
    });

  it('renders title and description when provided', () => {
    const description = 'Section description';
    const wrapper = mountSection({ description });

    expect(
      wrapper.find('[data-testid="agent-detail-section-title"]').text(),
    ).toBe('Section title');

    expect(
      wrapper.find('[data-testid="agent-detail-section-description"]').text(),
    ).toBe(description);
  });

  it('hides the description paragraph when description is missing', () => {
    const wrapper = mountSection({ description: undefined });

    expect(
      wrapper.find('[data-testid="agent-detail-section-description"]').exists(),
    ).toBe(false);
  });

  it('renders default slot content', () => {
    const slotText = 'Slot content';
    const wrapper = mountSection({}, { default: () => slotText });

    expect(
      wrapper.find('[data-testid="agent-detail-section"]').text(),
    ).toContain(slotText);
  });
});
