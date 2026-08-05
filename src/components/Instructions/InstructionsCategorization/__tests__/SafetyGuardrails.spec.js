import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import SafetyGuardrails from '../SafetyGuardrails.vue';
import i18n from '@/utils/plugins/i18n.js';

describe('SafetyGuardrails.vue', () => {
  let wrapper;

  const createWrapper = () => shallowMount(SafetyGuardrails);

  const findSection = () => wrapper.find('[data-testid="safety-guardrails"]');
  const findTitle = () =>
    wrapper.find('[data-testid="safety-guardrails-title"]');
  const findDescription = () =>
    wrapper.find('[data-testid="safety-guardrails-description"]');
  const findConfigure = () =>
    wrapper.findComponent('[data-testid="safety-guardrails-configure"]');

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders the section title, description, and configure button', () => {
    wrapper = createWrapper();

    expect(findSection().exists()).toBe(true);
    expect(findTitle().text()).toBe(
      i18n.global.t('agents.instructions.safety_guardrails.title'),
    );
    expect(findDescription().text()).toBe(
      i18n.global.t('agents.instructions.safety_guardrails.description'),
    );
    expect(findConfigure().props('text')).toBe(
      i18n.global.t('agents.instructions.safety_guardrails.configure'),
    );
  });
});
