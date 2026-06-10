import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import List from '@/components/Knowledge/ListContentTexts/List.vue';
import ModalDeleteText from '@/components/Knowledge/NewContentText/ModalDeleteText.vue';
import { useKnowledgeStore } from '@/store/Knowledge';

const pushMock = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const buildItem = ({ uuid, title, created_at, last_updated_at }) => ({
  uuid,
  title,
  text: `Body of ${uuid}`,
  created_at: created_at ?? last_updated_at,
  last_updated_at,
});

const elements = {
  list: '[data-testid="list-content-texts-list"]',
  item: '[data-testid="list-content-texts-item"]',
  loadingItem: '[data-testid="list-content-texts-loading-item"]',
  noResults: '[data-testid="list-content-texts-no-results"]',
};

const createWrapper = ({ contentTexts } = {}) =>
  shallowMount(List, {
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

const stubContainerDimensions = (
  containerWrapper,
  { scrollTop = 0, clientHeight, scrollHeight },
) => {
  Object.defineProperty(containerWrapper.element, 'scrollTop', {
    configurable: true,
    value: scrollTop,
  });
  Object.defineProperty(containerWrapper.element, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  });
  Object.defineProperty(containerWrapper.element, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
};

describe('ListContentTexts/List.vue', () => {
  let wrapper;

  beforeEach(() => {
    pushMock.mockReset();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders 8 placeholders and no items while loading the first page', () => {
      wrapper = createWrapper({
        contentTexts: { data: [], status: 'loading', next: null },
      });

      expect(wrapper.findAll(elements.loadingItem)).toHaveLength(8);
      expect(wrapper.findAll(elements.item)).toHaveLength(0);
    });

    it('renders 4 placeholders next to existing items while loading the next page', () => {
      const items = [
        buildItem({
          uuid: 'uuid-1',
          title: 'First',
          last_updated_at: '2024-03-01T00:00:00Z',
        }),
      ];

      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'loading',
          next: 'http://nexus.example.com/?cursor=page-2',
        },
      });

      expect(wrapper.findAll(elements.item)).toHaveLength(items.length);
      expect(wrapper.findAll(elements.loadingItem)).toHaveLength(4);
    });
  });

  describe('item rendering', () => {
    const items = [
      buildItem({
        uuid: 'uuid-1',
        title: 'Edited text',
        created_at: '2024-01-01T00:00:00Z',
        last_updated_at: '2024-03-01T00:00:00Z',
      }),
      buildItem({
        uuid: 'uuid-2',
        title: 'Created only text',
        created_at: '2024-02-01T00:00:00Z',
      }),
    ];

    beforeEach(() => {
      wrapper = createWrapper({
        contentTexts: { data: items, status: 'complete', next: null },
      });
    });

    it('renders one ContentItem per stored text', () => {
      const itemComponents = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => !c.props('loading'));

      expect(itemComponents).toHaveLength(items.length);
    });

    it('maps an edited text to the edited label and surfaces the last_updated_at date', () => {
      const editedItem = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => !c.props('loading'))[0];

      expect(editedItem.props('file')).toEqual({
        uuid: 'uuid-1',
        created_file_name: 'Edited text',
        created_at: '2024-03-01T00:00:00Z',
        extension_file: 'text',
        status: 'uploaded',
      });
      expect(editedItem.props('timeAgoLabelKey')).toBe('time_ago_edited');
    });

    it('maps a never-edited text to the created label and surfaces the created_at date', () => {
      const createdOnlyItem = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => !c.props('loading'))[1];

      expect(createdOnlyItem.props('file')).toEqual({
        uuid: 'uuid-2',
        created_file_name: 'Created only text',
        created_at: '2024-02-01T00:00:00Z',
        extension_file: 'text',
        status: 'uploaded',
      });
      expect(createdOnlyItem.props('timeAgoLabelKey')).toBe('time_ago_created');
    });

    it('navigates to the content-text route when an item is clicked', async () => {
      const firstItem = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => !c.props('loading'))[0];

      await firstItem.vm.$emit('click');

      expect(pushMock).toHaveBeenCalledWith({
        name: 'content-text',
        params: { uuid: 'uuid-1' },
      });
    });
  });

  describe('delete flow', () => {
    const items = [
      buildItem({
        uuid: 'uuid-1',
        title: 'First text',
        last_updated_at: '2024-03-01T00:00:00Z',
      }),
      buildItem({
        uuid: 'uuid-2',
        title: 'Second text',
        last_updated_at: '2024-02-01T00:00:00Z',
      }),
    ];

    beforeEach(() => {
      wrapper = createWrapper({
        contentTexts: { data: items, status: 'complete', next: null },
      });
    });

    it('does not render the ModalDeleteText until a remove is triggered', () => {
      expect(wrapper.findComponent(ModalDeleteText).exists()).toBe(false);
    });

    it('opens the ModalDeleteText with the selected text when an item emits remove', async () => {
      const firstItem = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => !c.props('loading'))[0];

      await firstItem.vm.$emit('remove');

      const modal = wrapper.findComponent(ModalDeleteText);

      expect(modal.exists()).toBe(true);
      expect(modal.props('modelValue')).toBe(true);
      expect(modal.props('text')).toEqual(items[0]);
    });

    it('passes the matching text to the modal when a different item emits remove', async () => {
      const secondItem = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => !c.props('loading'))[1];

      await secondItem.vm.$emit('remove');

      expect(wrapper.findComponent(ModalDeleteText).props('text')).toEqual(
        items[1],
      );
    });

    it('closes the modal when the dialog requests to close', async () => {
      const firstItem = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => !c.props('loading'))[0];

      await firstItem.vm.$emit('remove');

      const modal = wrapper.findComponent(ModalDeleteText);
      await modal.vm.$emit('update:modelValue', false);

      expect(wrapper.findComponent(ModalDeleteText).props('modelValue')).toBe(
        false,
      );
    });

    it('removes the item from the rendered list after the deletion is confirmed in the store', async () => {
      const knowledgeStore = useKnowledgeStore();

      const firstItem = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => !c.props('loading'))[0];

      await firstItem.vm.$emit('remove');

      knowledgeStore.contentTexts.data = items.filter(
        (item) => item.uuid !== 'uuid-1',
      );
      await flushPromises();

      const renderedItems = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => !c.props('loading'));

      expect(renderedItems).toHaveLength(1);
      expect(renderedItems[0].props('file').uuid).toBe('uuid-2');
    });
  });

  describe('pagination', () => {
    const items = [
      buildItem({
        uuid: 'uuid-1',
        title: 'First',
        last_updated_at: '2024-03-01T00:00:00Z',
      }),
    ];

    const createPaginatableWrapper = (overrides = {}) =>
      createWrapper({
        contentTexts: {
          data: items,
          status: 'complete',
          next: 'http://nexus.example.com/?cursor=page-2',
          ...overrides,
        },
      });

    it('loads the next page on mount when the rendered items do not fill the container', async () => {
      wrapper = createPaginatableWrapper();
      const knowledgeStore = useKnowledgeStore();
      await flushPromises();

      expect(knowledgeStore.loadNextContentTexts).toHaveBeenCalledTimes(1);
    });

    it('keeps auto-loading subsequent pages while the viewport stays unfilled, until the cursor is exhausted', async () => {
      wrapper = createPaginatableWrapper();
      const knowledgeStore = useKnowledgeStore();
      await flushPromises();
      expect(knowledgeStore.loadNextContentTexts).toHaveBeenCalledTimes(1);

      knowledgeStore.contentTexts.data = [
        ...items,
        buildItem({
          uuid: 'uuid-2',
          title: 'Second',
          last_updated_at: '2024-04-01T00:00:00Z',
        }),
      ];
      await flushPromises();
      expect(knowledgeStore.loadNextContentTexts).toHaveBeenCalledTimes(2);

      knowledgeStore.contentTexts.next = null;
      knowledgeStore.contentTexts.data = [
        ...knowledgeStore.contentTexts.data,
        buildItem({
          uuid: 'uuid-3',
          title: 'Third',
          last_updated_at: '2024-05-01T00:00:00Z',
        }),
      ];
      await flushPromises();
      expect(knowledgeStore.loadNextContentTexts).toHaveBeenCalledTimes(2);
    });

    it('loads the next page when the user scrolls to the bottom of a scrollable container', async () => {
      wrapper = createPaginatableWrapper();
      const knowledgeStore = useKnowledgeStore();
      await flushPromises();
      knowledgeStore.loadNextContentTexts.mockClear();

      const container = wrapper.find(elements.list);
      stubContainerDimensions(container, {
        scrollTop: 400,
        clientHeight: 600,
        scrollHeight: 1000,
      });
      await container.trigger('scroll');

      expect(knowledgeStore.loadNextContentTexts).toHaveBeenCalledTimes(1);
    });

    it('does not load the next page when the user has not reached the bottom', async () => {
      wrapper = createPaginatableWrapper();
      const knowledgeStore = useKnowledgeStore();
      await flushPromises();
      knowledgeStore.loadNextContentTexts.mockClear();

      const container = wrapper.find(elements.list);
      stubContainerDimensions(container, {
        scrollTop: 0,
        clientHeight: 600,
        scrollHeight: 1000,
      });
      await container.trigger('scroll');

      expect(knowledgeStore.loadNextContentTexts).not.toHaveBeenCalled();
    });

    it('does not load when there is no next cursor', async () => {
      wrapper = createPaginatableWrapper({ next: null });
      const knowledgeStore = useKnowledgeStore();
      await flushPromises();

      expect(knowledgeStore.loadNextContentTexts).not.toHaveBeenCalled();
    });

    it('does not load while another request is already in flight', async () => {
      wrapper = createPaginatableWrapper({ status: 'loading' });
      const knowledgeStore = useKnowledgeStore();
      await flushPromises();

      expect(knowledgeStore.loadNextContentTexts).not.toHaveBeenCalled();
    });
  });

  describe('search filtering', () => {
    const items = [
      buildItem({
        uuid: 'uuid-1',
        title: 'Onboarding guide',
        last_updated_at: '2024-03-01T00:00:00Z',
      }),
      buildItem({
        uuid: 'uuid-2',
        title: 'Refund policy',
        last_updated_at: '2024-02-01T00:00:00Z',
      }),
      buildItem({
        uuid: 'uuid-3',
        title: 'Shipping FAQ',
        last_updated_at: '2024-01-01T00:00:00Z',
      }),
    ];

    it('filters items by title case-insensitively', () => {
      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'complete',
          next: null,
          searchTerm: 'REFUND',
        },
      });

      const renderedItems = wrapper.findAll(elements.item);

      expect(renderedItems).toHaveLength(1);
      expect(
        wrapper
          .findAllComponents({ name: 'ContentItem' })
          .filter((c) => !c.props('loading'))[0]
          .props('file').created_file_name,
      ).toBe('Refund policy');
    });

    it('matches partial substrings inside titles', () => {
      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'complete',
          next: null,
          searchTerm: 'po',
        },
      });

      expect(wrapper.findAll(elements.item)).toHaveLength(1);
    });

    it('matches titles ignoring accents', () => {
      wrapper = createWrapper({
        contentTexts: {
          data: [
            buildItem({
              uuid: 'uuid-accent',
              title: 'Política de troca',
              last_updated_at: '2024-04-01T00:00:00Z',
            }),
          ],
          status: 'complete',
          next: null,
          searchTerm: 'politica',
        },
      });

      expect(wrapper.findAll(elements.item)).toHaveLength(1);
    });

    it('ignores leading and trailing whitespace in the search term', () => {
      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'complete',
          next: null,
          searchTerm: '  shipping  ',
        },
      });

      expect(wrapper.findAll(elements.item)).toHaveLength(1);
    });

    it('renders all items when the search term is empty', () => {
      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'complete',
          next: null,
          searchTerm: '',
        },
      });

      expect(wrapper.findAll(elements.item)).toHaveLength(items.length);
      expect(wrapper.find(elements.noResults).exists()).toBe(false);
    });
  });

  describe('no results message', () => {
    const items = [
      buildItem({
        uuid: 'uuid-1',
        title: 'Onboarding guide',
        last_updated_at: '2024-03-01T00:00:00Z',
      }),
    ];

    it('shows the no results message when there are no matches and no more pages to fetch', () => {
      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'complete',
          next: null,
          searchTerm: 'no-match',
        },
      });

      expect(wrapper.find(elements.noResults).exists()).toBe(true);
      expect(wrapper.findAll(elements.item)).toHaveLength(0);
      expect(wrapper.findAll(elements.loadingItem)).toHaveLength(0);
    });

    it('does not show the no results message while another page is still loading', () => {
      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'loading',
          next: 'http://nexus.example.com/?cursor=page-2',
          searchTerm: 'no-match',
        },
      });

      expect(wrapper.find(elements.noResults).exists()).toBe(false);
      expect(wrapper.findAll(elements.loadingItem).length).toBeGreaterThan(0);
    });

    it('does not show the no results message while pagination is in progress (next cursor exists)', () => {
      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'complete',
          next: 'http://nexus.example.com/?cursor=page-2',
          searchTerm: 'no-match',
        },
      });

      expect(wrapper.find(elements.noResults).exists()).toBe(false);
    });

    it('does not show the no results message when the search term is empty', () => {
      wrapper = createWrapper({
        contentTexts: {
          data: [],
          status: 'complete',
          next: null,
          searchTerm: '',
        },
      });

      expect(wrapper.find(elements.noResults).exists()).toBe(false);
    });

    it('triggers loadNextContentTexts while searching with no matches and a next cursor is available', async () => {
      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'complete',
          next: 'http://nexus.example.com/?cursor=page-2',
          searchTerm: '',
        },
      });

      const knowledgeStore = useKnowledgeStore();

      knowledgeStore.contentTexts.searchTerm = 'no-match';
      await wrapper.vm.$nextTick();

      expect(knowledgeStore.loadNextContentTexts).toHaveBeenCalledTimes(1);
    });

    it('does not trigger loadNextContentTexts when searching with no matches but the cursor is exhausted', async () => {
      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'complete',
          next: null,
          searchTerm: '',
        },
      });

      const knowledgeStore = useKnowledgeStore();

      knowledgeStore.contentTexts.searchTerm = 'no-match';
      await wrapper.vm.$nextTick();

      expect(knowledgeStore.loadNextContentTexts).not.toHaveBeenCalled();
    });
  });
});
