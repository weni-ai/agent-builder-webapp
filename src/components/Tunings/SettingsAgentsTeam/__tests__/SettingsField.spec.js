import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import SettingsField from '../SettingsField.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';

describe('SettingsField.vue', () => {
  let wrapper;

  const switchComponent = () => wrapper.findComponent('[data-testid="switch"]');
  const descriptionText = () =>
    wrapper.findComponent('[data-testid="description"]');
  const fieldContainer = () => wrapper.find('[data-testid="field"]');

  const defaultProps = {
    modelValue: false,
    textRight: 'Enable feature',
    description: 'This is a test description for the setting field',
  };

  beforeEach(() => {
    wrapper = shallowMount(SettingsField, {
      props: defaultProps,
      global: {
        stubs: {
          UnnnicIntelligenceText: Text,
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders the switch component with correct props', () => {
      const switchComp = switchComponent();

      expect(switchComp.props('modelValue')).toBe(false);
      expect(switchComp.props('textRight')).toBe('Enable feature');
    });

    it('renders the description text with correct content and styling', () => {
      const description = descriptionText();

      expect(description.props('tag')).toBe('p');
      expect(description.props('family')).toBe('secondary');
      expect(description.props('size')).toBe('body-gt');
      expect(description.props('color')).toBe('neutral-clean');
      expect(description.text()).toBe(
        'This is a test description for the setting field',
      );
    });
  });

  describe('Props validation', () => {
    it('renders with modelValue as true', async () => {
      await wrapper.setProps({ modelValue: true });

      expect(switchComponent().props('modelValue')).toBe(true);
    });

    it('renders with different textRight value', async () => {
      const newTextRight = 'Disable feature';
      await wrapper.setProps({ textRight: newTextRight });

      expect(switchComponent().props('textRight')).toBe(newTextRight);
    });

    it('renders with different description', async () => {
      const newDescription = 'Updated description text';
      await wrapper.setProps({ description: newDescription });

      expect(descriptionText().text()).toBe(newDescription);
    });

    it('updates switch state when modelValue prop changes', async () => {
      expect(switchComponent().props('modelValue')).toBe(false);

      await wrapper.setProps({ modelValue: true });
      expect(switchComponent().props('modelValue')).toBe(true);

      await wrapper.setProps({ modelValue: false });
      expect(switchComponent().props('modelValue')).toBe(false);
    });
  });

  describe('User interactions', () => {
    it('emits update:modelValue event when switch is toggled', async () => {
      const switchComp = switchComponent();

      await switchComp.vm.$emit('update:model-value', true);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([true]);
    });

    it('emits update:modelValue event with correct value when toggled multiple times', async () => {
      const switchComp = switchComponent();

      await switchComp.vm.$emit('update:model-value', true);
      await switchComp.vm.$emit('update:model-value', false);

      const emittedEvents = wrapper.emitted('update:modelValue');
      expect(emittedEvents).toHaveLength(2);
      expect(emittedEvents[0]).toEqual([true]);
      expect(emittedEvents[1]).toEqual([false]);
    });

    it('handles switch toggle from enabled to disabled state', async () => {
      await wrapper.setProps({ modelValue: true });
      const switchComp = switchComponent();

      await switchComp.vm.$emit('update:model-value', false);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });
  });

  describe('Component integration', () => {
    it('maintains proper component structure and hierarchy', () => {
      const container = fieldContainer();
      const switchComp = switchComponent();
      const descriptionComp = descriptionText();

      expect(container.exists()).toBe(true);
      expect(switchComp.exists()).toBe(true);
      expect(descriptionComp.exists()).toBe(true);

      expect(container.element.contains(switchComp.element)).toBe(true);
      expect(container.element.contains(descriptionComp.element)).toBe(true);
    });

    it('renders all components in the correct order', () => {
      const container = fieldContainer();
      const children = container.element.children;

      expect(children).toHaveLength(2);
      expect(children[0].tagName.toLowerCase()).toBe('unnnic-switch-stub');
      expect(children[1].tagName.toLowerCase()).toBe('p');
    });
  });
});
