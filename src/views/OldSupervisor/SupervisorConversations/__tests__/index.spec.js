import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';

import SupervisorConversations from '../index.vue';

describe('SupervisorConversations', () => {
  let wrapper;

  const supervisorPerformance = () =>
    wrapper.find('[data-testid="supervisor-performance"]');
  const conversationsTable = () =>
    wrapper.find('[data-testid="conversations-table"]');

  beforeEach(() => {
    wrapper = shallowMount(SupervisorConversations);
  });

  describe('Component rendering', () => {
    it('renders the SupervisorPerformance component', () => {
      expect(supervisorPerformance().exists()).toBe(true);
    });

    it('renders the ConversationsTable component', () => {
      expect(conversationsTable().exists()).toBe(true);
    });
  });
});
