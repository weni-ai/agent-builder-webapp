import { mount, flushPromises } from '@vue/test-utils';
import RouterContentBase from '@/components/Knowledge/RouterContentBase.vue';
import ContentFiles from '@/components/Knowledge/ContentFiles.vue';
import ContentSites from '@/components/Knowledge/ContentSites.vue';
import ListContentTexts from '@/components/Knowledge/ListContentTexts/index.vue';
import { createTestingPinia } from '@pinia/testing';
import { expect, vi } from 'vitest';
import { reactive } from 'vue';

const mockRoute = reactive({ name: 'knowledge', query: {} });
const mockRouter = { push: vi.fn(), replace: vi.fn() };

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}));

const pinia = createTestingPinia({
  initialState: {
    alert: {
      text: '',
      type: '',
    },
  },
});

describe('RouterContentBase', () => {
  let wrapper;

  const mockFilesProp = {
    status: 'complete',
    data: [{ name: 'File 1' }, { name: 'File 2' }],
  };

  const mockSitesProp = {
    data: [{ name: 'Site 1' }, { name: 'Site 2' }],
  };

  beforeEach(() => {
    mockRouter.push.mockReset();
    mockRouter.replace.mockReset();
    mockRoute.query = {};

    wrapper = mount(RouterContentBase, {
      props: {
        filesProp: mockFilesProp,
        sitesProp: mockSitesProp,
      },
      global: {
        plugins: [pinia],
        components: {
          ContentFiles,
          ContentSites,
          ListContentTexts,
        },
      },
    });
  });

  test('renders correctly with initial props', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent(ContentFiles).exists()).toBe(true);
  });

  test('displays skeleton loader when files are loading and contentStyle is not accordion', async () => {
    await wrapper.setProps({
      filesProp: { status: 'loading', data: [] },
    });
    wrapper.vm.contentStyle = 'list';
    await flushPromises();

    expect(
      wrapper.findComponent({ name: 'UnnnicSkeletonLoading' }).exists(),
    ).toBe(true);
  });

  test('does not display skeleton loader when contentStyle is accordion', async () => {
    await wrapper.setProps({
      filesProp: { status: 'loading', data: [] },
    });
    wrapper.vm.contentStyle = 'accordion';
    await flushPromises();

    expect(
      wrapper
        .findComponent('.repository-base-edit__wrapper__card-content')
        .exists(),
    ).toBe(false);
  });

  test('changes activeTab and renders the correct component', async () => {
    expect(wrapper.vm.activeTab).toBe('files');
    expect(wrapper.findComponent(ContentFiles).exists()).toBe(true);

    wrapper.vm.onTabChange('sites');
    await flushPromises();

    expect(wrapper.vm.activeTab).toBe('sites');
    expect(wrapper.findComponent(ContentSites).exists()).toBe(true);
    expect(wrapper.findComponent(ContentFiles).exists()).toBe(false);

    wrapper.vm.onTabChange('text');
    await flushPromises();

    expect(wrapper.vm.activeTab).toBe('text');
    expect(wrapper.findComponent(ListContentTexts).exists()).toBe(true);
    expect(wrapper.findComponent(ContentSites).exists()).toBe(false);
  });

  test('renders ListContentTexts based on activeTab', async () => {
    expect(wrapper.findComponent(ListContentTexts).exists()).toBe(false);

    wrapper.vm.onTabChange('text');
    await flushPromises();

    expect(wrapper.findComponent(ListContentTexts).exists()).toBe(true);
  });

  test('applies correct classes for different contentStyle values', async () => {
    const styles = ['accordion', 'list', 'grid'];

    for (const style of styles) {
      wrapper.vm.contentStyle = style;
      await flushPromises();

      expect(
        wrapper.find(`.content-base__content-tab--shape-${style}`).exists(),
      ).toBe(true);
    }
  });

  test('renders ContentSites with correct items', async () => {
    await wrapper.setProps({
      sitesProp: { data: [{ name: 'Site 3' }, { name: 'Site 4' }] },
    });
    wrapper.vm.onTabChange('sites');
    await flushPromises();

    const sitesComponent = wrapper.findComponent(ContentSites);
    expect(sitesComponent.exists()).toBe(true);
    expect(sitesComponent.props('items')).toEqual({
      data: [{ name: 'Site 3' }, { name: 'Site 4' }],
    });
  });

  describe('route query sync', () => {
    const remountWithQuery = (query) => {
      mockRoute.query = query;

      wrapper = mount(RouterContentBase, {
        props: {
          filesProp: mockFilesProp,
          sitesProp: mockSitesProp,
          textProp: mockTextProp,
        },
        global: {
          plugins: [pinia],
          components: { ContentFiles, ContentSites, ContentText },
        },
      });
    };

    test.each(['files', 'sites', 'text'])(
      'reads "%s" from route.query.tab on mount',
      (tab) => {
        remountWithQuery({ tab });

        expect(wrapper.vm.activeTab).toBe(tab);
      },
    );

    test('falls back to the files tab when route.query.tab is invalid', () => {
      remountWithQuery({ tab: 'invalid' });

      expect(wrapper.vm.activeTab).toBe('files');
    });

    test('pushes the new tab into the route query when onTabChange is called', async () => {
      wrapper.vm.onTabChange('text');
      await flushPromises();

      expect(mockRouter.replace).toHaveBeenCalledWith({
        name: 'knowledge',
        query: { tab: 'text' },
      });
    });

    test('preserves other query params when changing tabs', async () => {
      remountWithQuery({ other: '1' });

      wrapper.vm.onTabChange('sites');
      await flushPromises();

      expect(mockRouter.replace).toHaveBeenCalledWith({
        name: 'knowledge',
        query: { other: '1', tab: 'sites' },
      });
    });

    test('syncs the active tab when route.query.tab changes externally', async () => {
      mockRoute.query.tab = 'text';
      await flushPromises();

      expect(wrapper.vm.activeTab).toBe('text');
    });
  });
});
