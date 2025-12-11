import { mount } from '@vue/test-utils';

import ConversationDate from '@/views/Supervisor/SupervisorConversations/ConversationsTable/ConversationDate.vue';
import { formatTimestamp } from '@/utils/formatters';

vi.mock('@/utils/formatters', () => ({
  formatTimestamp: vi.fn().mockReturnValue('00/00/00 00:00'),
}));

describe('ConversationDate.vue', () => {
  let wrapper;
  const mockDate = '2023-05-15T14:30:00Z';

  beforeEach(() => {
    wrapper = mount(ConversationDate, {
      props: {
        date: mockDate,
      },
    });
  });

  test('renders the component correctly', () => {
    expect(
      wrapper.findComponent('[data-testid="conversation-date"]').exists(),
    ).toBe(true);
  });

  test('formats the date correctly', () => {
    const expectedFormattedDate = formatTimestamp(mockDate);
    expect(wrapper.text()).toBe(expectedFormattedDate);
  });
});
