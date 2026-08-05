import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import SafetyGuardrailsAllowTopicsDialog from '../SafetyGuardrailsAllowTopicsDialog.vue';
import i18n from '@/utils/plugins/i18n.js';
import { formatListToReadable } from '@/utils/formatters';

describe('SafetyGuardrailsAllowTopicsDialog.vue', () => {
  let wrapper;

  const allowTopicsT = (key, params) =>
    i18n.global.t(
      `agents.instructions.safety_guardrails.allow_topics.${key}`,
      params ?? {},
    );

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

    expect(findTitle().text()).toBe(
      allowTopicsT('title_single', { topic: 'Beliefs' }),
    );
    expect(findDescription().text()).toBe(
      allowTopicsT('description_single', { topic: 'Beliefs' }),
    );
  });

  it('renders multiple-topics title and description', () => {
    const topicNames = ['Beliefs', 'Politics', 'Religion'];

    wrapper = createWrapper({ topicNames });

    expect(findTitle().text()).toBe(
      allowTopicsT('title_multiple', { count: topicNames.length }),
    );
    expect(findDescription().text()).toBe(
      allowTopicsT('description_multiple', {
        topics: formatListToReadable(topicNames),
      }),
    );
  });

  it('emits confirm when confirm button is clicked', async () => {
    wrapper = createWrapper();

    await findAllow().trigger('click');

    expect(wrapper.emitted('confirm')).toEqual([[]]);
  });

  it('passes loading to the confirm button', async () => {
    wrapper = createWrapper({ loading: true });
    await nextTick();

    expect(findAllow().props('loading')).toBe(true);
  });
});
