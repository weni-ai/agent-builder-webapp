import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import ListMessages from '../ListMessages.vue';

describe('ListMessages.vue', () => {
  let wrapper;

  const listItems = () => wrapper.findAll('[data-testid="list-item"]');
  const firstListItem = () => listItems().at(0);
  const firstListItemTitle = () =>
    firstListItem().find('[data-testid="list-item-title"]');
  const firstListItemDescription = () =>
    firstListItem().find('[data-testid="list-item-description"]');

  const mockMessage = {
    list_message: {
      list_items: [
        { title: 'Item 1', description: 'Description 1' },
        { title: 'Item 2', description: 'Description 2' },
      ],
    },
  };

  beforeEach(() => {
    wrapper = mount(ListMessages, {
      props: {
        message: mockMessage,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders list items from the message prop', () => {
      expect(listItems().length).toBe(2);
    });

    it('displays no items when list is empty', async () => {
      await wrapper.setProps({
        message: {
          list_message: {
            list_items: [],
          },
        },
      });

      expect(listItems().length).toBe(0);
    });

    it('displays the correct title and description for each item', () => {
      expect(firstListItemTitle().text()).toBe('Item 1');
      expect(firstListItemDescription().text()).toBe('Description 1');
    });
  });

  describe('User interactions', () => {
    it('emits send-message event with item title when clicked', async () => {
      await firstListItem().trigger('click');

      expect(wrapper.emitted('send-message')).toBeTruthy();
      expect(wrapper.emitted('send-message')[0]).toEqual(['Item 1']);
    });
  });
});
