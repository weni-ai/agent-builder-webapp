import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import SupervisorConversations from '../index.vue';

describe('SupervisorConversations', () => {
  let wrapper;
  let pinia;

  const conversationsTable = () =>
    wrapper.find('[data-testid="conversations-table"]');

  beforeEach(() => {
    pinia = createTestingPinia({
      initialState: {
        Supervisor: {
          conversations: {
            data: {
              results: [],
            },
          },
        },
      },
    });

    wrapper = shallowMount(SupervisorConversations, {
      global: {
        plugins: [pinia],
      },
    });
  });

  describe('Component rendering', () => {
    it('renders the ConversationsTable component', () => {
      expect(conversationsTable().exists()).toBe(true);
    });
  });
});
