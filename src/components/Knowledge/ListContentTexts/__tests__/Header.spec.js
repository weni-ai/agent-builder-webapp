import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import Header from '@/components/Knowledge/ListContentTexts/Header.vue';
import { useKnowledgeStore } from '@/store/Knowledge';

const pushMock = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const elements = {
  searchInput: '[data-testid="list-content-texts-search-input"]',
  newTextButton: '[data-testid="list-content-texts-new-text-button"]',
};

const createWrapper = ({ contentTexts } = {}) =>
  shallowMount(Header, {
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

describe('ListContentTexts/Header.vue', () => {
  let wrapper;

  beforeEach(() => {
    pushMock.mockReset();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders the search input bound to the store searchTerm', () => {
    wrapper = createWrapper({ contentTexts: { searchTerm: 'initial term' } });

    const searchInput = wrapper.findComponent(elements.searchInput);

    expect(searchInput.exists()).toBe(true);
    expect(searchInput.props('modelValue')).toBe('initial term');
  });

  it('renders the search input with the search icon on the left', () => {
    wrapper = createWrapper();

    expect(wrapper.findComponent(elements.searchInput).props('iconLeft')).toBe(
      'search',
    );
  });

  it('updates the store searchTerm when the search input value changes', async () => {
    wrapper = createWrapper();
    const knowledgeStore = useKnowledgeStore();

    await wrapper
      .findComponent(elements.searchInput)
      .vm.$emit('update:modelValue', 'first text');

    expect(knowledgeStore.contentTexts.searchTerm).toBe('first text');
  });

  it('navigates to the new-content-text route when the new text button is clicked', async () => {
    wrapper = createWrapper();

    await wrapper.findComponent(elements.newTextButton).vm.$emit('click');

    expect(pushMock).toHaveBeenCalledWith({ name: 'new-content-text' });
  });
});
