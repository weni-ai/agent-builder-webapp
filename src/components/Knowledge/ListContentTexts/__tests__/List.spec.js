import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import List from '@/components/Knowledge/ListContentTexts/List.vue';
import { useKnowledgeStore } from '@/store/Knowledge';

const pushMock = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const buildItem = ({ uuid, title, last_updated_at }) => ({
  uuid,
  title,
  text: `Body of ${uuid}`,
  last_updated_at,
});

const elements = {
  list: '[data-testid="list-content-texts-list"]',
  item: '[data-testid="list-content-texts-item"]',
  loadingItem: '[data-testid="list-content-texts-loading-item"]',
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

    it('renders one ContentItem per stored text with the expected mapped file shape', () => {
      const itemComponents = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => !c.props('loading'));

      expect(itemComponents).toHaveLength(items.length);
      expect(itemComponents[0].props('file')).toEqual({
        uuid: 'uuid-1',
        created_file_name: 'First text',
        created_at: '2024-03-01T00:00:00Z',
        extension_file: 'text',
        status: 'uploaded',
      });
      expect(itemComponents[0].props('timeAgoLabelKey')).toBe(
        'time_ago_edited',
      );
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
});
