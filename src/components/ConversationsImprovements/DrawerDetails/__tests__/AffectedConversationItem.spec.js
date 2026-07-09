import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';

import AffectedConversationItem from '../AffectedConversationItem.vue';
import QuestionAndAnswer from '@/views/Supervisor/SupervisorConversations/Conversation/QuestionAndAnswer/index.vue';

describe('AffectedConversationItem.vue', () => {
  let wrapper;

  const baseConversation = {
    uuid: 'conversation-uuid-1',
    contactUrn: 'whatsapp:5511999999999',
    contactName: 'Alessandra',
    messages: [
      {
        uuid: 'message-uuid-1',
        id: '1',
        text: 'Do you deliver to my ZIP code?',
        source: 'incoming',
        createdAt: '2026-06-23T09:44:26-03:00',
      },
      {
        uuid: 'message-uuid-2',
        id: '2',
        text: 'I need your CPF first.',
        source: 'outgoing',
        createdAt: '2026-06-23T09:45:00-03:00',
      },
    ],
  };

  const createWrapper = (props = {}) => {
    wrapper = mount(AffectedConversationItem, {
      props: {
        conversation: baseConversation,
        isExpanded: false,
        isFirst: true,
        isLast: false,
        ...props,
      },
      global: {
        plugins: [createTestingPinia()],
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  const elements = {
    label: () =>
      wrapper.find(
        '[data-testid="affected-conversation-item-label-conversation-uuid-1"]',
      ),
    icon: () =>
      wrapper.findComponent(
        '[data-testid="affected-conversation-item-icon-conversation-uuid-1"]',
      ),
    toggle: () =>
      wrapper.find(
        '[data-testid="affected-conversation-item-toggle-conversation-uuid-1"]',
      ),
    content: () =>
      wrapper.find(
        '[data-testid="affected-conversation-item-content-conversation-uuid-1"]',
      ),
    questionAndAnswerMessages: () =>
      wrapper.findAllComponents(QuestionAndAnswer),
    viewFullButton: () =>
      wrapper.findComponent(
        '[data-testid="affected-conversation-item-view-full-conversation-uuid-1"]',
      ),
  };

  it('renders the contact name as the row label', () => {
    createWrapper();

    expect(elements.label().text()).toBe('Alessandra');
  });

  it('falls back to contact urn when contact name is empty', () => {
    createWrapper({
      conversation: {
        ...baseConversation,
        contactName: '',
      },
    });

    expect(elements.label().text()).toBe('whatsapp:5511999999999');
  });

  it('renders chevron_forward when collapsed', () => {
    createWrapper({ isExpanded: false });

    expect(elements.icon().props('icon')).toBe('chevron_forward');
    expect(elements.content().exists()).toBe(false);
  });

  it('renders QuestionAndAnswer messages and view full button when expanded', () => {
    createWrapper({ isExpanded: true });

    const messages = elements.questionAndAnswerMessages();

    expect(elements.icon().props('icon')).toBe('keyboard_arrow_down');
    expect(elements.content().exists()).toBe(true);
    expect(messages).toHaveLength(2);
    expect(messages[0].props('data')).toEqual({
      id: '1',
      uuid: 'message-uuid-1',
      text: 'Do you deliver to my ZIP code?',
      type: 'user',
      createdAt: '2026-06-23T09:44:26-03:00',
      username: 'Alessandra',
    });
    expect(messages[1].props('data')).toEqual({
      id: '2',
      uuid: 'message-uuid-2',
      text: 'I need your CPF first.',
      type: 'agent',
      createdAt: '2026-06-23T09:45:00-03:00',
      username: 'Alessandra',
    });
    expect(
      messages.every((message) => message.props('isLoading') === false),
    ).toBe(true);
    expect(
      messages.every((message) => message.props('showViewLogs') === false),
    ).toBe(true);
    expect(
      messages.every((message) => message.props('showDate') === false),
    ).toBe(true);
    expect(messages[0].props('scheme')).toBe('improvement-incoming');
    expect(messages[1].props('scheme')).toBe('improvement-outgoing');
    expect(wrapper.find('[data-testid="view-logs-button"]').exists()).toBe(
      false,
    );
    expect(elements.viewFullButton().props('text')).toBe(
      i18n.global.t('audit.improvements.drawer.view_full_conversation'),
    );
  });

  it('emits toggle when the header is clicked', async () => {
    createWrapper();

    await elements.toggle().trigger('click');

    expect(wrapper.emitted('toggle')).toEqual([[]]);
  });

  it('emits view-full when the view full button is clicked', async () => {
    createWrapper({ isExpanded: true });

    await elements.viewFullButton().trigger('click');

    expect(wrapper.emitted('view-full')).toEqual([[]]);
  });
});
