import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import SystemMessages from '../SystemMessages.vue';
import { useTuningsStore } from '@/store/Tunings';
import i18n from '@/utils/plugins/i18n';

describe('SystemMessages.vue', () => {
  let wrapper;
  let store;

  const title = () => wrapper.find('[data-testid="system-messages-title"]');
  const field = () =>
    wrapper.findComponent('[data-testid="system-messages-field"]');
  const textarea = () =>
    wrapper.findComponent('[data-testid="system-messages-error-message"]');
  const skeleton = () =>
    wrapper.find('[data-testid="system-messages-skeleton"]');

  beforeEach(() => {
    wrapper = mount(SystemMessages, {
      global: {
        plugins: [createTestingPinia({ stubActions: false }), i18n],
      },
    });

    store = useTuningsStore();
    store.settings.data.errorMessage = 'Custom error message';
    store.settings.status = 'success';
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the section title', () => {
    expect(title().text()).toBe(
      i18n.global.t('agent_builder.tunings.system_messages.title'),
    );
  });

  it('renders the error message field with label and tooltip', () => {
    expect(field().exists()).toBe(true);
    expect(field().props('label')).toBe(
      i18n.global.t(
        'agent_builder.tunings.system_messages.error_message.label',
      ),
    );
    expect(field().props('tooltip')).toEqual({
      text: i18n.global.t(
        'agent_builder.tunings.system_messages.error_message.tooltip',
      ),
      side: 'bottom',
      maxWidth: '240px',
    });
  });

  it('binds the textarea to the store errorMessage', () => {
    expect(textarea().props('modelValue')).toBe('Custom error message');
    expect(textarea().props('maxLength')).toBe(1000);
  });

  it('updates the store when the textarea changes', async () => {
    await textarea().vm.$emit('update:modelValue', 'Updated error message');

    expect(store.settings.data.errorMessage).toBe('Updated error message');
  });

  it('shows loading skeleton while settings are loading', async () => {
    store.settings.status = 'loading';
    await nextTick();

    expect(skeleton().exists()).toBe(true);
    expect(field().exists()).toBe(false);
  });

  it('hides loading skeleton when settings are loaded', async () => {
    store.settings.status = 'success';
    await nextTick();

    expect(skeleton().exists()).toBe(false);
    expect(field().exists()).toBe(true);
  });
});
