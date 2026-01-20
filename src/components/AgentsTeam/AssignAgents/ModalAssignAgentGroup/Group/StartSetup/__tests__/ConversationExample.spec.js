import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import ConversationExample from '../ConversationExample.vue';

const mockT = vi.fn((key) => key);

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT,
  }),
}));

function createWrapper(props = {}) {
  return shallowMount(ConversationExample, {
    props: {
      agentName: 'Product Concierge',
      conversationExample: [
        { direction: 'incoming', text: 'Text of the customer' },
        { direction: 'outgoing', text: 'Text of the agent' },
        { direction: 'outgoing', text: 'Text 2' },
      ],
      ...props,
    },
  });
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
  const findIncomingBubble = () =>
    wrapper.find('[data-testid="conversation-example-bubble-incoming"]');
  const findOutgoingBubbles = () =>
    wrapper.findAll('[data-testid="conversation-example-bubble-outgoing"]');

  it('renders the conversation title and bubbles', () => {
    wrapper = createWrapper();

    expect(findRoot().exists()).toBe(true);
    expect(findTitle().text()).toBe(
      'agents.assign_agents.setup.conversation_example.title',
    );
    expect(findIncomingBubble().exists()).toBe(true);
    expect(findOutgoingBubbles()).toHaveLength(2);
  });

  it('displays conversation messages with customer and agent labels', () => {
    wrapper = createWrapper();

    expect(findIncomingBubble().text()).toContain('Customer');
    expect(findIncomingBubble().text()).toContain('Text of the customer');

    const outgoingBubbles = findOutgoingBubbles();
    expect(outgoingBubbles[0].text()).toContain('Product Concierge');
    expect(outgoingBubbles[0].text()).toContain('Text of the agent');
    expect(outgoingBubbles[1].text()).toContain('Product Concierge');
    expect(outgoingBubbles[1].text()).toContain('Text 2');
  });
});
