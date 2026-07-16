import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import SafetyGuardrailsDrawer from '../SafetyGuardrailsDrawer.vue';
import SafetyGuardrailsTopicList from '../SafetyGuardrailsTopicList.vue';

import { MOCK_GUARDRAILS_CONFIG } from '@/api/mocks/guardrailsConfig';
import i18n from '@/utils/plugins/i18n';

describe('SafetyGuardrailsDrawer.vue', () => {
  let wrapper;

  const createWrapper = (props = {}) =>
    mount(SafetyGuardrailsDrawer, {
      props: {
        modelValue: true,
        ...props,
      },
      global: {
        plugins: [i18n],
        stubs: {
          UnnnicDrawerNext: false,
          SafetyGuardrailsTopicList: true,
        },
      },
    });

  const findTitle = () =>
    wrapper.find('[data-testid="safety-guardrails-drawer-title"]');
  const findDescription = () =>
    wrapper.find('[data-testid="safety-guardrails-drawer-description"]');
  const findTopicList = () => wrapper.findComponent(SafetyGuardrailsTopicList);
  const findSave = () =>
    wrapper.findComponent('[data-testid="safety-guardrails-drawer-save"]');
  const findCancel = () =>
    wrapper.findComponent('[data-testid="safety-guardrails-drawer-cancel"]');

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders drawer title, description, and topics from mock', () => {
    wrapper = createWrapper();

    expect(findTitle().text()).toBe('Safety guardrails');
    expect(findDescription().text()).toBe(
      'When a topic is on, Manager refuses to discuss it. Turn off to allow',
    );
    expect(findTopicList().props('topics')).toEqual(
      MOCK_GUARDRAILS_CONFIG.topics,
    );
  });

  it('keeps Save disabled until a draft change is made', async () => {
    wrapper = createWrapper();

    expect(findSave().props('disabled')).toBe(true);

    findTopicList().vm.$emit('update:topic-enabled', {
      id: 'politics',
      enabled: false,
    });
    await nextTick();

    expect(findSave().props('disabled')).toBe(false);
  });

  it('emits update:modelValue false when Cancel is clicked', async () => {
    wrapper = createWrapper();

    await findCancel().trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });
});
