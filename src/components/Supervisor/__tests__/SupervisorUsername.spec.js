import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import SupervisorUsername from '@/components/Supervisor/SupervisorUsername.vue';

describe('SupervisorUsername.vue', () => {
  let wrapper;

  const createWrapper = (
    props = {},
    { conversationsImprovements = true } = {},
  ) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        FeatureFlags: {
          activeFeatures: conversationsImprovements ? ['improvements'] : [],
        },
      },
    });

    wrapper = mount(SupervisorUsername, {
      props: {
        username: 'Jane Doe',
        ...props,
      },
      global: {
        plugins: [pinia],
      },
    });
  };

  const elements = {
    username: () => wrapper.find('[data-testid="supervisor-username"]'),
    popover: () => wrapper.find('[data-testid="amazing-conversation-popover"]'),
    trigger: () => wrapper.find('[data-testid="amazing-conversation-trigger"]'),
    icon: () => wrapper.find('[data-testid="amazing-conversation-icon"]'),
    title: () => wrapper.find('[data-testid="amazing-conversation-title"]'),
    description: () =>
      wrapper.find('[data-testid="amazing-conversation-description"]'),
    popoverComponent: () => wrapper.findComponent({ name: 'UnnnicPopover' }),
  };

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders the username', () => {
    createWrapper();

    expect(elements.username().text()).toBe('Jane Doe');
  });

  it('renders the fallback when username is empty', () => {
    createWrapper({ username: '' });

    expect(elements.username().text()).toBe(
      `[${i18n.global.t('audit.conversations.unnamed_contact')}]`,
    );
  });

  it('applies the font class', () => {
    createWrapper({ font: 'display-2' });

    expect(elements.username().classes()).toContain(
      'supervisor-username__text--display-2',
    );
  });

  it('does not render the amazing conversation popover by default', () => {
    createWrapper();

    expect(elements.popover().exists()).toBe(false);
  });

  it('does not render the amazing conversation popover when the feature flag is disabled', () => {
    createWrapper({ isAmazing: true }, { conversationsImprovements: false });

    expect(elements.popover().exists()).toBe(false);
  });

  it('renders the amazing conversation popover when isAmazing is true and the feature flag is enabled', () => {
    createWrapper({ isAmazing: true });

    expect(elements.popover().exists()).toBe(true);
    expect(elements.trigger().exists()).toBe(true);
    expect(elements.icon().exists()).toBe(true);
    expect(elements.title().text()).toBe(
      i18n.global.t('audit.conversations.amazing_conversation.title'),
    );
    expect(elements.description().text()).toBe(
      i18n.global.t('audit.conversations.amazing_conversation.description'),
    );
  });

  it('opens the popover on trigger mouseenter and closes on mouseleave', async () => {
    createWrapper({ isAmazing: true });

    expect(elements.popoverComponent().props('open')).toBe(false);

    await elements.trigger().trigger('mouseenter');
    expect(elements.popoverComponent().props('open')).toBe(true);

    await elements.trigger().trigger('mouseleave');
    expect(elements.popoverComponent().props('open')).toBe(false);
  });
});
