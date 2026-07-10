import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ConversationInfos from '@/views/Supervisor/SupervisorConversations/ConversationsTable/ConversationInfos.vue';

describe('ConversationInfos.vue', () => {
  let wrapper;
  const mockUsername = 'John Doe';
  const mockUrn = 'conversation-123';

  const createWrapper = (props = {}) => {
    wrapper = mount(ConversationInfos, {
      props: {
        username: mockUsername,
        urn: mockUrn,
        ...props,
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            initialState: {
              FeatureFlags: {
                activeFeatures: ['improvements'],
              },
            },
          }),
        ],
      },
    });
  };

  const conversationsUsername = () =>
    wrapper.findComponent('[data-testid="conversation-username"]');
  const conversationsUrn = () =>
    wrapper.find('[data-testid="conversation-urn"]');

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders the component correctly', () => {
    createWrapper();

    expect(conversationsUrn().exists()).toBe(true);
    expect(conversationsUsername().exists()).toBe(true);
  });

  it('displays the urn correctly', () => {
    createWrapper();

    expect(conversationsUrn().text()).toBe(mockUrn);
  });

  it('displays the username correctly', () => {
    createWrapper();

    expect(conversationsUsername().text()).toBe(mockUsername);
  });

  it('passes isAmazing to SupervisorUsername', () => {
    createWrapper({ isAmazing: true });

    expect(conversationsUsername().props('isAmazing')).toBe(true);
  });

  it('defaults isAmazing to false', () => {
    createWrapper();

    expect(conversationsUsername().props('isAmazing')).toBe(false);
  });
});
