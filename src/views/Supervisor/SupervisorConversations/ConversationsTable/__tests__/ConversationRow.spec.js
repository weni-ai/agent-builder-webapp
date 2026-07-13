import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import ConversationRow from '@/views/Supervisor/SupervisorConversations/ConversationsTable/ConversationRow.vue';
import ConversationInfos from '@/views/Supervisor/SupervisorConversations/ConversationsTable/ConversationInfos.vue';
import {
  formatConversationDate,
  formatConversationTime,
} from '@/utils/formatters';

describe('ConversationRow.vue', () => {
  let wrapper;

  const baseConversation = {
    username: 'Jane Doe',
    urn: 'whatsapp:123',
    status: 'in_progress',
    start: '2026-02-05T10:30:00Z',
    csat: null,
    isAmazing: false,
  };

  const createWrapper = (props = {}) => {
    wrapper = mount(ConversationRow, {
      props: {
        conversation: baseConversation,
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
        stubs: {
          UnnnicTableRow: {
            template: '<tr v-bind="$attrs"><slot /></tr>',
          },
          UnnnicTableCell: {
            template: '<td><slot /></td>',
          },
          UnnnicToolTip: {
            template: '<div><slot /></div>',
          },
        },
      },
    });
  };

  const elements = {
    row: () => wrapper.find('[data-testid="conversation-row"]'),
    feedback: () => wrapper.find('[data-testid="conversation-row-feedback"]'),
    date: () => wrapper.find('[data-testid="conversation-row-date"]'),
    time: () => wrapper.find('[data-testid="conversation-row-time"]'),
    conversationInfos: () => wrapper.findComponent(ConversationInfos),
    statusTag: () => wrapper.findComponent({ name: 'UnnnicTag' }),
  };

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders the row', () => {
    createWrapper();

    expect(elements.row().exists()).toBe(true);
  });

  it('adds the selected class when isSelected is true', () => {
    createWrapper({ isSelected: true });

    expect(elements.row().classes()).toContain('conversation-row--selected');
  });

  it('does not add the selected class when isSelected is false', () => {
    createWrapper({ isSelected: false });

    expect(elements.row().classes()).not.toContain(
      'conversation-row--selected',
    );
  });

  it('passes contact data to ConversationInfos', () => {
    createWrapper();

    const conversationInfos = elements.conversationInfos();

    expect(conversationInfos.props('username')).toBe(baseConversation.username);
    expect(conversationInfos.props('urn')).toBe(baseConversation.urn);
    expect(conversationInfos.props('isAmazing')).toBe(
      baseConversation.isAmazing,
    );
  });

  it('passes isAmazing as true when conversation is amazing', () => {
    createWrapper({
      conversation: {
        ...baseConversation,
        isAmazing: true,
      },
    });

    expect(elements.conversationInfos().props('isAmazing')).toBe(true);
  });

  it('renders the status tag', () => {
    createWrapper();

    expect(elements.statusTag().props('scheme')).toBe('blue');
    expect(elements.statusTag().props('text')).toBe('In progress');
  });

  it('renders "-" when there is no csat feedback', () => {
    createWrapper();

    expect(elements.feedback().text()).toBe('-');
  });

  it('renders csat feedback when csat is available', () => {
    createWrapper({
      conversation: {
        ...baseConversation,
        csat: {
          id: 'satisfied',
          score: 4,
        },
      },
    });

    expect(elements.feedback().text()).toBe('😃 Satisfied | CSAT: 4');
  });

  it('renders formatted date and time', () => {
    createWrapper();

    expect(elements.date().text()).toBe(
      formatConversationDate(baseConversation.start),
    );
    expect(elements.time().text()).toBe(
      formatConversationTime(baseConversation.start),
    );
  });
});
