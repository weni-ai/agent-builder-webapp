import { shallowMount } from '@vue/test-utils';

import ConversationRow from '@/views/Supervisor/SupervisorConversations/ConversationsTable/ConversationRow.vue';

describe('ConversationRow.vue', () => {
  let wrapper;

  const baseConversation = {
    username: 'Jane Doe',
    urn: 'whatsapp:123',
    status: 'in_progress',
    start: '2026-02-05T10:30:00Z',
    csat: null,
  };

  const createWrapper = (props = {}) => {
    wrapper = shallowMount(ConversationRow, {
      props: {
        conversation: baseConversation,
        ...props,
      },
    });
  };

  afterEach(() => {
    wrapper?.unmount();
  });

  const findRow = () => wrapper.find('[data-testid="conversation-row"]');

  it('adds the divider class when showDivider is true', () => {
    createWrapper({ showDivider: true });

    const row = findRow();

    expect(row.exists()).toBe(true);
    expect(row.classes()).toContain('conversation-row--with-divider');
  });

  it('does not add the divider class when showDivider is false', () => {
    createWrapper({ showDivider: false });

    const row = findRow();

    expect(row.exists()).toBe(true);
    expect(row.classes()).not.toContain('conversation-row--with-divider');
  });
});
