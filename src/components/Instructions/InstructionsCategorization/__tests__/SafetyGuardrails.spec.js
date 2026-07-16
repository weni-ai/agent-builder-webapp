import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import SafetyGuardrails from '../SafetyGuardrails.vue';

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
    expect(findTitle().text()).toBe('Safety guardrails');
    expect(findDescription().text()).toBe(
      "Sensitive topics Manager won't discuss",
    );
    expect(findConfigure().props('text')).toBe('Configure');
  });
});
