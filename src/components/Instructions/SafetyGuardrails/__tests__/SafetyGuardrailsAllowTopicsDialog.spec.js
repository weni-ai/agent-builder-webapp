import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import SafetyGuardrailsAllowTopicsDialog from '../SafetyGuardrailsAllowTopicsDialog.vue';

describe('SafetyGuardrailsAllowTopicsDialog.vue', () => {
  let wrapper;

  const createWrapper = (props = {}) =>
    shallowMount(SafetyGuardrailsAllowTopicsDialog, {
      props: {
        open: true,
        topicNames: ['Beliefs'],
        ...props,
      },
    });

  const findTitle = () =>
    wrapper.find('[data-testid="safety-guardrails-allow-topics-dialog-title"]');
  const findDescription = () =>
    wrapper.find(
      '[data-testid="safety-guardrails-allow-topics-dialog-description"]',
    );
  const findAllow = () =>
    wrapper.findComponent(
      '[data-testid="safety-guardrails-allow-topics-dialog-allow"]',
    );

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders single-topic title and description', () => {
    wrapper = createWrapper();

    expect(findTitle().text()).toBe('Allow Beliefs');
    expect(findDescription().text()).toBe(
      'Manager will be able to answer questions about Beliefs. You can turn this guardrail back on at any time.',
    );
  });

  it('renders multiple-topics title and description', () => {
    wrapper = createWrapper({
      topicNames: ['Beliefs', 'Politics', 'Religion'],
    });

    expect(findTitle().text()).toBe('Allow 3 topics');
    expect(findDescription().text()).toBe(
      'Manager will be able to answer questions about Beliefs, Politics and Religion. You can turn these guardrails back on at any time.',
    );
  });

  it('emits confirm when Allow is clicked', async () => {
    wrapper = createWrapper();

    await findAllow().trigger('click');

    expect(wrapper.emitted('confirm')).toEqual([[]]);
  });

  it('passes loading to the Allow button', async () => {
    wrapper = createWrapper({ loading: true });
    await nextTick();

    expect(findAllow().props('loading')).toBe(true);
  });
});
