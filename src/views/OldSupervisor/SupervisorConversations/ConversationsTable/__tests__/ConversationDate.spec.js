import { mount } from '@vue/test-utils';
import { format } from 'date-fns';

import ConversationDate from '@/views/AgentBuilder/OldSupervisor/SupervisorConversations/ConversationsTable/ConversationDate.vue';

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
    const expectedFormattedDate = `${format(new Date(mockDate), 'dd/MM/yyyy')} ${format(new Date(mockDate), 'HH:mm')}`;
    expect(wrapper.text()).toBe(expectedFormattedDate);
  });

  test('throws error when date prop is not provided', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      mount(ConversationDate);
    }).toThrow();

    errorSpy.mockRestore();
  });
});
