import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import SafetyGuardrailsTopicList from '../SafetyGuardrailsTopicList.vue';

const topics = [
  { id: 'politics', enabled: true },
  { id: 'hate', enabled: false },
];

describe('SafetyGuardrailsTopicList.vue', () => {
  let wrapper;

  const createWrapper = (props = {}) =>
    shallowMount(SafetyGuardrailsTopicList, {
      props: {
        topics,
        ...props,
      },
    });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders a switch for each topic with Blocked or Allowed status', () => {
    wrapper = createWrapper();

    const politicsSwitch = wrapper.findComponent(
      '[data-testid="safety-guardrails-topic-switch-politics"]',
    );
    const hateSwitch = wrapper.findComponent(
      '[data-testid="safety-guardrails-topic-switch-hate"]',
    );

    expect(politicsSwitch.props('textRight')).toBe('Politics');
    expect(politicsSwitch.props('helper')).toBe(
      'Political opinions, parties, elections, or partisan topics',
    );
    expect(politicsSwitch.props('modelValue')).toBe(true);
    expect(
      wrapper
        .find('[data-testid="safety-guardrails-topic-status-politics"]')
        .text(),
    ).toBe('Blocked');

    expect(hateSwitch.props('modelValue')).toBe(false);
    expect(
      wrapper
        .find('[data-testid="safety-guardrails-topic-status-hate"]')
        .text(),
    ).toBe('Allowed');
  });

  it('emits update:topic-enabled when a switch changes', async () => {
    wrapper = createWrapper();

    const politicsSwitch = wrapper.findComponent(
      '[data-testid="safety-guardrails-topic-switch-politics"]',
    );

    await politicsSwitch.vm.$emit('update:model-value', false);

    expect(wrapper.emitted('update:topic-enabled')).toEqual([
      [{ id: 'politics', enabled: false }],
    ]);
  });

  it('renders skeleton placeholders while loading', () => {
    wrapper = createWrapper({ loading: true });

    expect(
      wrapper
        .find('[data-testid="safety-guardrails-topic-list-loading"]')
        .exists(),
    ).toBe(true);
    expect(
      wrapper.findAll('[data-testid^="safety-guardrails-topic-skeleton-"]'),
    ).toHaveLength(11);
    expect(
      wrapper.find('[data-testid="safety-guardrails-topic-list"]').exists(),
    ).toBe(false);
  });
});
