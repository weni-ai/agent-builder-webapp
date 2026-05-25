import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
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

describe('ListContentTexts/List.vue', () => {
  let wrapper;

  beforeEach(() => {
    pushMock.mockReset();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('initial loading', () => {
    beforeEach(() => {
      wrapper = createWrapper({
        contentTexts: { data: [], status: 'loading', next: null },
      });
    });

    it('renders 6 loading placeholders while loading the first page', () => {
      expect(wrapper.findAll(elements.loadingItem)).toHaveLength(6);
    });

    it('does not render any data items while loading the first page', () => {
      expect(wrapper.findAll(elements.item)).toHaveLength(0);
    });

    it('passes loading=true and compressed=true to each placeholder ContentItem', () => {
      const placeholders = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => c.props('loading'));

      expect(placeholders).toHaveLength(6);
      placeholders.forEach((placeholder) => {
        expect(placeholder.props('loading')).toBe(true);
        expect(placeholder.props('compressed')).toBe(true);
      });
    });
  });

  describe('rendering items', () => {
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

    it('renders one ContentItem per stored text', () => {
      expect(wrapper.findAll(elements.item)).toHaveLength(items.length);
    });

    it('does not render loading placeholders when the request is complete', () => {
      expect(wrapper.findAll(elements.loadingItem)).toHaveLength(0);
    });

    it('passes the expected file shape and timeAgoLabelKey to each item', () => {
      const itemComponents = wrapper
        .findAllComponents({ name: 'ContentItem' })
        .filter((c) => !c.props('loading'));

      expect(itemComponents[0].props('file')).toEqual({
        uuid: 'uuid-1',
        created_file_name: 'First text',
        created_at: '2024-03-01T00:00:00Z',
        extension_file: 'text',
        status: 'uploaded',
      });
      expect(itemComponents[0].props('timeAgoLabelKey')).toBe('time_ago_edited');
      expect(itemComponents[0].props('clickable')).toBe(true);
      expect(itemComponents[0].props('compressed')).toBe(true);
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

  describe('infinite scroll', () => {
    const items = [
      buildItem({
        uuid: 'uuid-1',
        title: 'First',
        last_updated_at: '2024-03-01T00:00:00Z',
      }),
    ];

    let knowledgeStore;

    const triggerScrollWith = async ({
      scrollTop,
      clientHeight,
      scrollHeight,
    }) => {
      const container = wrapper.find(elements.list);

      Object.defineProperty(container.element, 'scrollTop', {
        configurable: true,
        value: scrollTop,
      });
      Object.defineProperty(container.element, 'clientHeight', {
        configurable: true,
        value: clientHeight,
      });
      Object.defineProperty(container.element, 'scrollHeight', {
        configurable: true,
        value: scrollHeight,
      });

      await container.trigger('scroll');
    };

    beforeEach(() => {
      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'complete',
          next: 'http://nexus.example.com/?cursor=page-2',
        },
      });

      knowledgeStore = useKnowledgeStore();
    });

    it('calls loadNextContentTexts when the user scrolls to the bottom and a next cursor exists', async () => {
      await triggerScrollWith({
        scrollTop: 400,
        clientHeight: 600,
        scrollHeight: 1000,
      });

      expect(knowledgeStore.loadNextContentTexts).toHaveBeenCalledTimes(1);
    });

    it('does not call loadNextContentTexts when the bottom has not been reached', async () => {
      await triggerScrollWith({
        scrollTop: 0,
        clientHeight: 600,
        scrollHeight: 1000,
      });

      expect(knowledgeStore.loadNextContentTexts).not.toHaveBeenCalled();
    });

    it('does not call loadNextContentTexts when there is no next cursor', async () => {
      knowledgeStore.contentTexts.next = null;

      await triggerScrollWith({
        scrollTop: 400,
        clientHeight: 600,
        scrollHeight: 1000,
      });

      expect(knowledgeStore.loadNextContentTexts).not.toHaveBeenCalled();
    });

    it('does not call loadNextContentTexts when a request is already loading', async () => {
      knowledgeStore.contentTexts.status = 'loading';

      await triggerScrollWith({
        scrollTop: 400,
        clientHeight: 600,
        scrollHeight: 1000,
      });

      expect(knowledgeStore.loadNextContentTexts).not.toHaveBeenCalled();
    });

    it('renders 2 loading placeholders next to the existing items while loading the next page', () => {
      wrapper.unmount();
      wrapper = createWrapper({
        contentTexts: {
          data: items,
          status: 'loading',
          next: 'http://nexus.example.com/?cursor=page-2',
        },
      });

      expect(wrapper.findAll(elements.item)).toHaveLength(items.length);
      expect(wrapper.findAll(elements.loadingItem)).toHaveLength(2);
    });
  });
});
