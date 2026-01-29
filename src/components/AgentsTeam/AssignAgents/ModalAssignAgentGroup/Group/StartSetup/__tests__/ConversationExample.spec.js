import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import ConversationExample from '../ConversationExample.vue';

const mockT = vi.fn((key) => key);

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT,
  }),
}));

function createWrapper() {
  return shallowMount(ConversationExample);
}

describe('ConversationExample', () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  const findRoot = () => wrapper.find('[data-testid="conversation-example"]');
  const findTitle = () =>
    wrapper.find('[data-testid="conversation-example-title"]');
  const findCustomerBubble = () =>
    wrapper.find('[data-testid="conversation-example-bubble-customer"]');
  const findConciergeBubble = () =>
    wrapper.find('[data-testid="conversation-example-bubble-concierge"]');

  it('renders the conversation title and bubbles', () => {
    wrapper = createWrapper();

    expect(findRoot().exists()).toBe(true);
    expect(findTitle().text()).toBe(
      'agents.assign_agents.setup.conversation_example.title',
    );
    expect(findCustomerBubble().exists()).toBe(true);
    expect(findConciergeBubble().exists()).toBe(true);
  });

  it('displays conversation messages and labels from translations', () => {
    wrapper = createWrapper();

    expect(findCustomerBubble().text()).toContain(
      'agents.assign_agents.setup.conversation_example.customer_label',
    );
    expect(findCustomerBubble().text()).toContain(
      'agents.assign_agents.setup.conversation_example.customer_message',
    );

    expect(findConciergeBubble().text()).toContain(
      'agents.assign_agents.setup.conversation_example.concierge_label',
    );
    expect(findConciergeBubble().text()).toContain(
      'agents.assign_agents.setup.conversation_example.concierge_message',
    );
  });
});
