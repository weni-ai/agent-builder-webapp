import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import { useProfileStore } from '@/store/Profile';
import i18n from '@/utils/plugins/i18n';

import SidebarHeader from '../SidebarHeader.vue';

const pinia = createTestingPinia({
  initialState: {
    profile: {
      status: null,
      name: {
        current: 'Test Agent',
        old: 'Test Agent',
      },
    },
  },
});

describe('SidebarHeader.vue', () => {
  let wrapper;
  let profileStore;

  const elements = {
    sidebarHeader: '[data-testid="sidebar-header"]',
    title: '[data-testid="sidebar-header-title"]',
    description: '[data-testid="sidebar-header-description"]',
    skeletonLoadings: '[data-testid="sidebar-header-skeleton"]',
    editManagerProfileDrawer: '[data-testid="edit-manager-profile-drawer"]',
  };

  beforeEach(() => {
    wrapper = mount(SidebarHeader, {
      global: {
        plugins: [i18n, pinia],
        stubs: ['UnnnicSkeletonLoading', 'EditManagerProfileDrawer'],
      },
    });

    profileStore = useProfileStore();
  });

  describe('Component structure', () => {
    it('renders the main section element', () => {
      const headerSection = wrapper.find(elements.sidebarHeader);

      expect(headerSection.exists()).toBe(true);
      expect(headerSection.element.tagName).toBe('SECTION');
    });

    it('renders the title as an h1 element', () => {
      const titleElement = wrapper.find(elements.title);

      expect(titleElement.exists()).toBe(true);
      expect(titleElement.element.tagName).toBe('H1');
    });

    it('renders the description as a p element', () => {
      const descriptionElement = wrapper.find(elements.description);

      expect(descriptionElement.exists()).toBe(true);
      expect(descriptionElement.element.tagName).toBe('P');
    });
  });

  describe('Content rendering', () => {
    it('displays the profile agent name in the title', () => {
      const titleElement = wrapper.find(elements.title);
      const expectedText = profileStore.name.old;

      expect(titleElement.text()).toBe(expectedText);
    });

    it('displays the translated description text', () => {
      const descriptionElement = wrapper.find(elements.description);
      const expectedText = i18n.global.t('profile.edit_manager_profile');

      expect(descriptionElement.text()).toBe(expectedText);
    });
  });

  describe('CSS classes and styling', () => {
    it('applies the correct CSS class to the main section', () => {
      const headerSection = wrapper.find(elements.sidebarHeader);

      expect(headerSection.classes()).toContain('sidebar-header');
    });

    it('applies the correct CSS class to the title', () => {
      const titleElement = wrapper.find(elements.title);

      expect(titleElement.classes()).toContain('sidebar-header__title');
    });

    it('applies the correct CSS class to the description', () => {
      const descriptionElement = wrapper.find(elements.description);

      expect(descriptionElement.classes()).toContain(
        'sidebar-header__description',
      );
    });
  });

  describe('Loading state', () => {
    it('shows skeleton loading components when profile is loading', async () => {
      profileStore.status = 'loading';
      await wrapper.vm.$nextTick();

      const skeletonLoadings = wrapper.findAllComponents(
        elements.skeletonLoadings,
      );
      expect(skeletonLoadings).toHaveLength(2);
    });

    it('applies loading CSS class when profile is loading', async () => {
      profileStore.status = 'loading';
      await wrapper.vm.$nextTick();

      const headerSection = wrapper.find(elements.sidebarHeader);
      expect(headerSection.classes()).toContain('sidebar-header--loading');
    });

    it('removes loading CSS class when profile is not loading', async () => {
      profileStore.status = 'complete';
      await wrapper.vm.$nextTick();

      const headerSection = wrapper.find(elements.sidebarHeader);
      expect(headerSection.classes()).not.toContain('sidebar-header--loading');
    });

    it('transitions from loading to loaded state correctly', async () => {
      // Start in loading state
      profileStore.status = 'loading';
      await wrapper.vm.$nextTick();

      let headerSection = wrapper.find(elements.sidebarHeader);
      let skeletonLoadings = wrapper.findAll(elements.skeletonLoadings);
      let titleElement = wrapper.find(elements.title);

      expect(headerSection.classes()).toContain('sidebar-header--loading');
      expect(skeletonLoadings).toHaveLength(2);
      expect(titleElement.exists()).toBe(false);

      // Transition to loaded state
      profileStore.status = 'complete';
      await wrapper.vm.$nextTick();

      headerSection = wrapper.find(elements.sidebarHeader);
      skeletonLoadings = wrapper.findAll(elements.skeletonLoadings);
      titleElement = wrapper.find(elements.title);
      const descriptionElement = wrapper.find(elements.description);

      expect(headerSection.classes()).not.toContain('sidebar-header--loading');
      expect(skeletonLoadings).toHaveLength(0);
      expect(titleElement.exists()).toBe(true);
      expect(descriptionElement.exists()).toBe(true);
    });
  });

  describe('Drawer functionality', () => {
    it('renders the edit manager profile drawer', async () => {
      wrapper.vm.isOpenEditManagerProfileDrawer = true;
      await wrapper.vm.$nextTick();

      const drawer = wrapper.findComponent(elements.editManagerProfileDrawer);
      expect(drawer.exists()).toBe(true);
    });

    it('opens drawer when header is clicked', async () => {
      const header = wrapper.find(elements.sidebarHeader);
      await header.trigger('click');

      const drawer = wrapper.findComponent(elements.editManagerProfileDrawer);
      expect(drawer.props('modelValue')).toBe(true);
    });

    it('does not open drawer when header is clicked during loading', async () => {
      profileStore.status = 'loading';
      await wrapper.vm.$nextTick();

      const header = wrapper.find(elements.sidebarHeader);
      await header.trigger('click');

      const drawer = wrapper.findComponent(elements.editManagerProfileDrawer);
      expect(drawer.props('modelValue')).toBe(false);
    });

    it('closes drawer when model value changes', async () => {
      const drawer = wrapper.findComponent(elements.editManagerProfileDrawer);

      // Open drawer first
      wrapper.vm.isOpenEditManagerProfileDrawer = true;
      await wrapper.vm.$nextTick();
      expect(drawer.props('modelValue')).toBe(true);

      // Close drawer
      wrapper.vm.isOpenEditManagerProfileDrawer = false;
      await wrapper.vm.$nextTick();
      expect(drawer.props('modelValue')).toBe(false);
    });
  });
});
