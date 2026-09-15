import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';
import SupervisorConversations from '../index.vue';

describe('SupervisorConversations', () => {
  let wrapper;

  const conversationsTable = () =>
    wrapper.find('[data-testid="conversations-table"]');
  const conversationsCount = () =>
    wrapper.find('[data-testid="conversations-count"]');

  const createWrapper = ({
    conversationsData = {},
    conversationsCounter = false,
  } = {}) => {
    const pinia = createTestingPinia({
      stubActions: false,
      initialState: {
        Supervisor: {
          conversations: {
            data: {
              results: [],
              count: 0,
              ...conversationsData,
            },
          },
        },
        FeatureFlags: {
          activeFeatures: conversationsCounter ? ['conversations_counter'] : [],
        },
      },
    });

    const featureFlagsStore = useFeatureFlagsStore(pinia);
    featureFlagsStore.activeFeatures = conversationsCounter
      ? ['conversations_counter']
      : [];
    featureFlagsStore.flags.conversationsCounter = conversationsCounter;

    wrapper = shallowMount(SupervisorConversations, {
      global: {
        plugins: [pinia],
      },
    });
  };

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component rendering', () => {
    it('renders the ConversationsTable component', () => {
      createWrapper();

      expect(conversationsTable().exists()).toBe(true);
    });

    it('renders the conversations count when the conversationsCounter flag is enabled', () => {
      createWrapper({
        conversationsData: {
          results: [{ uuid: '1' }],
          count: 512,
        },
        conversationsCounter: true,
      });

      expect(conversationsCount().text()).toBe(
        i18n.global.t('audit.conversations.conversations_count', {
          count: 512,
        }),
      );
    });

    it('does not render the conversations count when the conversationsCounter flag is disabled', () => {
      createWrapper({
        conversationsData: {
          results: [{ uuid: '1' }],
          count: 512,
        },
      });

      expect(conversationsCount().exists()).toBe(false);
    });
  });
});
