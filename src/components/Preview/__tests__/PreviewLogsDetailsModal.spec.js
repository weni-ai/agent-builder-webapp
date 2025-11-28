import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';

import PreviewLogsDetailsModal from '../PreviewLogsDetailsModal.vue';

describe('PreviewLogsDetailsModal.vue', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(PreviewLogsDetailsModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
        trace: { key: 'value' },
        ...props,
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const modal = () =>
    wrapper.findComponent('[data-testid="preview-logs-details-modal"]');
  const modalTrace = () =>
    wrapper.find('[data-testid="preview-logs-details-trace"]');

  it('should render correctly with required props', () => {
    expect(modal().exists()).toBe(true);
    expect(modalTrace().exists()).toBe(true);
  });

  it('should display the correct title', () => {
    const title = 'Custom Title';
    wrapper = createWrapper({ title });
    expect(modal().props('title')).toBe(title);
  });

  it('should format JSON trace correctly', () => {
    const log = { data: { test: 'data', nested: { key: 'value' } } };
    wrapper = createWrapper({ log });
    const expectedOutput = JSON.stringify(log.data, null, '\t');
    expect(modalTrace().text()).toBe(expectedOutput);
  });

  it('should emit update:modelValue when modal is closed', async () => {
    await wrapper
      .findComponent('[data-testid="preview-logs-details-modal"]')
      .vm.$emit('update:model-value', false);
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });
});
