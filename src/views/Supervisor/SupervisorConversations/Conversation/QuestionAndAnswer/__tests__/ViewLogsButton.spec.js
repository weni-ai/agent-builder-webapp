import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import Unnnic from '@weni/unnnic-system';

import ViewLogsButton from '../ViewLogsButton.vue';
import i18n from '@/utils/plugins/i18n';

describe('ViewLogsButton.vue', () => {
  let wrapper;

  const button = () => wrapper.find('[data-testid="view-logs-button"]');
  const iconLoading = () =>
    wrapper.findComponent('[data-testid="icon-loading"]');
  const iconVisibility = () =>
    wrapper.findComponent('[data-testid="icon-visibility"]');
  const buttonText = () => wrapper.findComponent('[data-testid="button-text"]');

  beforeEach(() => {
    wrapper = shallowMount(ViewLogsButton, {
      global: {
        stubs: {
          UnnnicIntelligenceText: {
            template: '<p ><slot /></p>',
          },
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders button element', () => {
      expect(button().exists()).toBe(true);
    });

    it('renders with default props', () => {
      expect(wrapper.props('disabled')).toBe(false);
      expect(wrapper.props('loading')).toBe(false);
      expect(wrapper.props('active')).toBe(false);
    });

    it('renders UnnnicIcon with correct props when inactive', () => {
      const icon = iconVisibility();
      expect(icon.exists()).toBe(true);
      expect(icon.props('icon')).toBe('visibility');
      expect(icon.props('size')).toBe('xs');
      expect(icon.props('scheme')).toBe('weni-300');
    });

    it('renders UnnnicIntelligenceText with correct props', () => {
      expect(buttonText().exists()).toBe(true);
      expect(buttonText().attributes('color')).toBe('weni-300');
      expect(buttonText().attributes('family')).toBe('secondary');
      expect(buttonText().attributes('size')).toBe('body-md');
      expect(buttonText().attributes('tag')).toBe('p');
    });
  });

  describe('Props validation and behavior', () => {
    it('handles disabled prop correctly', async () => {
      await wrapper.setProps({ disabled: true });

      expect(button().attributes('disabled')).toBeDefined();
      expect(button().classes()).toContain(
        'question-and-answer__view-logs-button',
      );
    });

    it('handles loading prop correctly', async () => {
      await wrapper.setProps({ loading: true });

      expect(button().attributes('disabled')).toBeDefined();
      expect(iconLoading().exists()).toBe(true);
    });

    it('handles active prop correctly', async () => {
      await wrapper.setProps({ active: true });

      expect(button().classes()).toContain(
        'question-and-answer__view-logs-button--active',
      );

      expect(iconVisibility().props('icon')).toBe('visibility_off');
    });

    it('disables button when both disabled and loading are true', async () => {
      await wrapper.setProps({ disabled: true, loading: true });

      expect(button().attributes('disabled')).toBeDefined();
    });
  });

  describe('Visual states', () => {
    it('shows correct icon when inactive', () => {
      expect(iconVisibility().props('icon')).toBe('visibility');
    });

    it('shows correct icon when active', async () => {
      await wrapper.setProps({ active: true });

      expect(iconVisibility().props('icon')).toBe('visibility_off');
    });

    it('shows loading icon when loading', async () => {
      await wrapper.setProps({ loading: true });

      expect(iconLoading().exists()).toBe(true);
      expect(iconLoading().props('size')).toBe('sm');
      expect(iconLoading().props('scheme')).toBe('weni-300');
    });

    it('does not show loading icon when not loading', () => {
      expect(iconLoading().exists()).toBe(false);
    });

    it('applies active class when active', async () => {
      await wrapper.setProps({ active: true });

      expect(button().classes()).toContain(
        'question-and-answer__view-logs-button--active',
      );
    });

    it('does not apply active class when inactive', () => {
      expect(button().classes()).not.toContain(
        'question-and-answer__view-logs-button--active',
      );
    });
  });

  describe('User interactions', () => {
    it('emits click event when clicked', async () => {
      await button().trigger('click');

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('does not emit click when disabled', async () => {
      await wrapper.setProps({ disabled: true });
      await button().trigger('click');

      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('does not emit click when loading', async () => {
      await wrapper.setProps({ loading: true });
      await button().trigger('click');

      expect(wrapper.emitted('click')).toBeFalsy();
    });
  });
});
