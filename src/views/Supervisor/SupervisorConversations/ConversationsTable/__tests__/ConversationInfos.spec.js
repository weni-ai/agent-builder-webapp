import { expect } from 'vitest';
import { mount } from '@vue/test-utils';

import ConversationInfos from '@/views/AgentBuilder/Supervisor/SupervisorConversations/ConversationsTable/ConversationInfos.vue';

describe('ConversationInfos.vue', () => {
  let wrapper;
  const mockUsername = 'John Doe';
  const mockUrn = 'conversation-123';

  const conversationsUsername = () =>
    wrapper.findComponent('[data-testid="conversation-username"]');
  const conversationsUrn = () =>
    wrapper.findComponent('[data-testid="conversation-urn"]');

  beforeEach(() => {
    wrapper = mount(ConversationInfos, {
      props: {
        username: mockUsername,
        urn: mockUrn,
      },
    });
  });

  it('renders the component correctly', () => {
    expect(conversationsUrn().exists()).toBe(true);
    expect(conversationsUsername().exists()).toBe(true);
  });

  it('displays the urn correctly', () => {
    expect(conversationsUrn().text()).toBe(mockUrn);
  });

  it('displays the username correctly', () => {
    expect(conversationsUsername().text()).toBe(mockUsername);
  });
});
