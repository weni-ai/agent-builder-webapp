import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ListContentTexts from '@/components/Knowledge/ListContentTexts/index.vue';
import { useKnowledgeStore } from '@/store/Knowledge';

const pushMock = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const elements = {
  emptyState: '[data-testid="list-content-texts-empty-state"]',
  emptyStateTitle: '[data-testid="list-content-texts-empty-state-title"]',
  emptyStateDescription:
    '[data-testid="list-content-texts-empty-state-description"]',
  emptyStateNewTextButton:
    '[data-testid="list-content-texts-empty-state-new-text-button"]',
  header: { name: 'NewContentTextHeader' },
  list: { name: 'List' },
};

const createWrapper = ({ contentTexts } = {}) =>
  shallowMount(ListContentTexts, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            Knowledge: {
              contentTexts: {
                data: [],
                status: null,
                next: null,
                searchTerm: '',
                ...contentTexts,
              },
            },
          },
          stubActions: true,
        }),
      ],
    },
  });

describe('ListContentTexts/index.vue', () => {
  let wrapper;

  beforeEach(() => {
    pushMock.mockReset();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('on mount', () => {
    it('triggers loadContentTexts when there is no data loaded yet', () => {
      wrapper = createWrapper();

      const knowledgeStore = useKnowledgeStore();

      expect(knowledgeStore.loadContentTexts).toHaveBeenCalledTimes(1);
    });

    it('does not trigger loadContentTexts when data is already loaded', () => {
      wrapper = createWrapper({
        contentTexts: {
          data: [{ uuid: 'uuid-1', title: 'Existing', last_updated_at: '' }],
          status: 'complete',
        },
      });

      const knowledgeStore = useKnowledgeStore();

      expect(knowledgeStore.loadContentTexts).not.toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    const emptyStateConditions = {
      data: [],
      status: 'complete',
      next: null,
      searchTerm: '',
    };

    it('renders the empty state when data is empty, status is complete, no search term and no next cursor', () => {
      wrapper = createWrapper({ contentTexts: emptyStateConditions });

      expect(wrapper.find(elements.emptyState).exists()).toBe(true);
      expect(wrapper.find(elements.emptyStateTitle).exists()).toBe(true);
      expect(wrapper.find(elements.emptyStateDescription).exists()).toBe(true);
      expect(wrapper.find(elements.emptyStateNewTextButton).exists()).toBe(
        true,
      );
    });

    it('hides the list header and the list when the empty state is shown', () => {
      wrapper = createWrapper({ contentTexts: emptyStateConditions });

      expect(wrapper.findComponent(elements.header).exists()).toBe(false);
      expect(wrapper.findComponent(elements.list).exists()).toBe(false);
    });

    it('does not render the empty state when the data list has items', () => {
      wrapper = createWrapper({
        contentTexts: {
          ...emptyStateConditions,
          data: [{ uuid: 'uuid-1', title: 'Existing', last_updated_at: '' }],
        },
      });

      expect(wrapper.find(elements.emptyState).exists()).toBe(false);
      expect(wrapper.findComponent(elements.header).exists()).toBe(true);
      expect(wrapper.findComponent(elements.list).exists()).toBe(true);
    });

    it('does not render the empty state when there is an active search term', () => {
      wrapper = createWrapper({
        contentTexts: {
          ...emptyStateConditions,
          searchTerm: 'anything',
        },
      });

      expect(wrapper.find(elements.emptyState).exists()).toBe(false);
      expect(wrapper.findComponent(elements.header).exists()).toBe(true);
      expect(wrapper.findComponent(elements.list).exists()).toBe(true);
    });

    it('does not render the empty state while the status is not complete', () => {
      wrapper = createWrapper({
        contentTexts: { ...emptyStateConditions, status: 'loading' },
      });

      expect(wrapper.find(elements.emptyState).exists()).toBe(false);
      expect(wrapper.findComponent(elements.header).exists()).toBe(true);
      expect(wrapper.findComponent(elements.list).exists()).toBe(true);
    });

    it('does not render the empty state while there are more pages to fetch', () => {
      wrapper = createWrapper({
        contentTexts: {
          ...emptyStateConditions,
          next: 'http://nexus.example.com/?cursor=page-2',
        },
      });

      expect(wrapper.find(elements.emptyState).exists()).toBe(false);
      expect(wrapper.findComponent(elements.header).exists()).toBe(true);
      expect(wrapper.findComponent(elements.list).exists()).toBe(true);
    });

    it('navigates to the new-content-text route when the empty state CTA is clicked', async () => {
      wrapper = createWrapper({ contentTexts: emptyStateConditions });

      await wrapper
        .findComponent(elements.emptyStateNewTextButton)
        .vm.$emit('click');

      expect(pushMock).toHaveBeenCalledWith({ name: 'new-content-text' });
    });
  });
});
