import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import i18n from '@/utils/plugins/i18n.js';

import SafetyGuardrails from '../SafetyGuardrails.vue';
import SafetyGuardrailsDrawer from '@/components/Instructions/SafetyGuardrails/SafetyGuardrailsDrawer.vue';

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
  const findDrawer = () => wrapper.findComponent(SafetyGuardrailsDrawer);

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

  it('opens the drawer when Configure is clicked', async () => {
    wrapper = createWrapper();

    expect(findDrawer().props('modelValue')).toBe(false);

    await findConfigure().trigger('click');

    expect(findDrawer().props('modelValue')).toBe(true);
  });
});
