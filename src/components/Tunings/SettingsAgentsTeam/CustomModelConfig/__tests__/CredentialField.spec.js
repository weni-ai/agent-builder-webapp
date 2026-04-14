import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import CredentialField from '../CredentialField.vue';

describe('CredentialField.vue', () => {
  let wrapper;

  const createWrapper = (credential) => {
    wrapper = shallowMount(CredentialField, {
      props: { credential },
    });
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('TEXT type', () => {
    const textCredential = {
      type: 'TEXT',
      label: 'Organization ID',
      value: 'org-123',
      id: 'org_id',
    };

    beforeEach(() => {
      createWrapper(textCredential);
    });

    it('renders an UnnnicInput with nativeType text', () => {
      const input = wrapper.findComponent(
        '[data-testid="credential-field-input-org_id"]',
      );
      expect(input.exists()).toBe(true);
      expect(input.props('nativeType')).toBe('text');
    });

    it('passes the correct label and value', () => {
      const input = wrapper.findComponent(
        '[data-testid="credential-field-input-org_id"]',
      );
      expect(input.props('label')).toBe('Organization ID');
      expect(input.props('modelValue')).toBe('org-123');
    });

    it('emits update:value with id and new value on input', () => {
      const input = wrapper.findComponent(
        '[data-testid="credential-field-input-org_id"]',
      );
      input.vm.$emit('update:model-value', 'org-456');
      expect(wrapper.emitted('update:value')).toEqual([['org_id', 'org-456']]);
    });
  });

  describe('PASSWORD type', () => {
    const passwordCredential = {
      type: 'PASSWORD',
      label: 'API Key',
      value: 'sk-secret',
      id: 'api_key',
    };

    beforeEach(() => {
      createWrapper(passwordCredential);
    });

    it('renders an UnnnicInput with nativeType password', () => {
      const input = wrapper.findComponent(
        '[data-testid="credential-field-input-api_key"]',
      );
      expect(input.exists()).toBe(true);
      expect(input.props('nativeType')).toBe('password');
    });

    it('emits update:value with id and new value on input', () => {
      const input = wrapper.findComponent(
        '[data-testid="credential-field-input-api_key"]',
      );
      input.vm.$emit('update:model-value', 'sk-new');
      expect(wrapper.emitted('update:value')).toEqual([['api_key', 'sk-new']]);
    });
  });

  describe('TEXTAREA type', () => {
    const textareaCredential = {
      type: 'TEXTAREA',
      label: 'Custom Config',
      value: '{"key": "val"}',
      id: 'custom_config',
    };

    beforeEach(() => {
      createWrapper(textareaCredential);
    });

    it('renders an UnnnicTextArea instead of UnnnicInput', () => {
      const textarea = wrapper.findComponent(
        '[data-testid="credential-field-textarea-custom_config"]',
      );
      expect(textarea.exists()).toBe(true);

      const input = wrapper.findComponent(
        '[data-testid="credential-field-input-custom_config"]',
      );
      expect(input.exists()).toBe(false);
    });

    it('passes the correct label and value', () => {
      const textarea = wrapper.findComponent(
        '[data-testid="credential-field-textarea-custom_config"]',
      );
      expect(textarea.props('label')).toBe('Custom Config');
      expect(textarea.props('modelValue')).toBe('{"key": "val"}');
    });

    it('emits update:value with id and new value on input', () => {
      const textarea = wrapper.findComponent(
        '[data-testid="credential-field-textarea-custom_config"]',
      );
      textarea.vm.$emit('update:model-value', '{"updated": true}');
      expect(wrapper.emitted('update:value')).toEqual([
        ['custom_config', '{"updated": true}'],
      ]);
    });
  });
});
