import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import SafetyGuardrailsBlockMessage from '../SafetyGuardrailsBlockMessage.vue';

describe('SafetyGuardrailsBlockMessage.vue', () => {
  let wrapper;

  const createWrapper = (props = {}) =>
    shallowMount(SafetyGuardrailsBlockMessage, {
      props: {
        modelValue: 'Não posso falar sobre esse tópico.',
        ...props,
      },
    });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders the textarea with label, helper, and max length', () => {
    wrapper = createWrapper();

    const textarea = wrapper.findComponent(
      '[data-testid="safety-guardrails-block-message"]',
    );

    expect(textarea.props('modelValue')).toBe(
      'Não posso falar sobre esse tópico.',
    );
    expect(textarea.props('label')).toBe('Block message');
    expect(textarea.props('message')).toBe(
      'Displayed to customers when Manager refuses a blocked topic',
    );
    expect(textarea.props('maxLength')).toBe(250);
  });

  it('emits update:modelValue when the textarea changes', async () => {
    wrapper = createWrapper();

    const textarea = wrapper.findComponent(
      '[data-testid="safety-guardrails-block-message"]',
    );

    await textarea.vm.$emit('update:modelValue', 'Updated message');

    expect(wrapper.emitted('update:modelValue')).toEqual([['Updated message']]);
  });
});
