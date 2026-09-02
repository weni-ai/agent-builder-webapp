import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import DetailsTable from '../Table.vue';
import i18n from '@/utils/plugins/i18n';

describe('DetailsTable', () => {
  let wrapper;

  const createWrapper = ({ topics, isCollapsed = true } = {}) => {
    wrapper = shallowMount(DetailsTable, {
      props: { isCollapsed },
      global: {
        plugins: [
          i18n,
          createTestingPinia({
            initialState: {
              Supervisor: {
                selectedConversation: {
                  urn: 'whatsapp:5511999999999',
                  topics,
                  csat: null,
                },
              },
            },
          }),
        ],
      },
    });
  };

  const findTopicRow = () =>
    wrapper.findComponent('[data-testid="conversation-details-topic"]');

  afterEach(() => {
    wrapper?.unmount();
  });

  it('shows the topic name when the conversation has a matching topic', () => {
    createWrapper({ topics: 'Delivery' });

    expect(findTopicRow().props('data')).toBe('Delivery');
  });

  it('shows no matching topic when the conversation is unclassified', () => {
    createWrapper({ topics: 'unclassified' });

    expect(findTopicRow().props('data')).toBe('No matching topic');
  });

  it('shows could not classify when topic classification failed', () => {
    createWrapper({ topics: null });

    expect(findTopicRow().props('data')).toBe("Couldn't classify");
  });

  it('shows could not classify when the topic list is empty', () => {
    createWrapper({ topics: [] });

    expect(findTopicRow().props('data')).toBe("Couldn't classify");
  });

  it('formats a list of topics into readable text', () => {
    createWrapper({ topics: ['Billing', 'Support'] });

    expect(findTopicRow().props('data')).toBe('Billing and Support');
  });
});
