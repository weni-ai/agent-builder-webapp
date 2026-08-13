import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import SafetyGuardrailsManipulationAttempts from '../SafetyGuardrailsManipulationAttempts.vue';
import i18n from '@/utils/plugins/i18n.js';

describe('SafetyGuardrailsManipulationAttempts.vue', () => {
  let wrapper;

  const createWrapper = (props = {}) =>
    shallowMount(SafetyGuardrailsManipulationAttempts, {
      props: {
        modelValue: true,
        ...props,
      },
    });

  const findTitle = () =>
    wrapper.find(
      '[data-testid="safety-guardrails-manipulation-attempts-title"]',
    );
  const findSwitch = () =>
    wrapper.findComponent(
      '[data-testid="safety-guardrails-manipulation-attempts-switch"]',
    );
  const findStatus = () =>
    wrapper.find(
      '[data-testid="safety-guardrails-manipulation-attempts-status"]',
    );

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders title, switch label, helper, and blocked status when enabled', () => {
    wrapper = createWrapper({ modelValue: true });

    expect(findTitle().text()).toBe(
      i18n.global.t(
        'agents.instructions.safety_guardrails.manipulation_attempts.title',
      ),
    );
    expect(findSwitch().props('textRight')).toBe(
      i18n.global.t(
        'agents.instructions.safety_guardrails.manipulation_attempts.prompt_injection.name',
      ),
    );
    expect(findSwitch().props('helper')).toBe(
      i18n.global.t(
        'agents.instructions.safety_guardrails.manipulation_attempts.prompt_injection.description',
      ),
    );
    expect(findSwitch().props('modelValue')).toBe(true);
    expect(findStatus().text()).toBe(
      i18n.global.t('agents.instructions.safety_guardrails.blocked'),
    );
  });

  it('renders allowed status when disabled', () => {
    wrapper = createWrapper({ modelValue: false });

    expect(findStatus().text()).toBe(
      i18n.global.t('agents.instructions.safety_guardrails.allowed'),
    );
  });

  it('emits update:modelValue when the switch changes', async () => {
    wrapper = createWrapper({ modelValue: true });

    await findSwitch().vm.$emit('update:model-value', false);

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });
});
