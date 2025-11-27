import { shallowMount } from '@vue/test-utils';
import { describe, beforeEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import SupervisorFilters from '../index.vue';
import Unnnic from '@weni/unnnic-system';
import { useSupervisorStore } from '@/store/Supervisor';
import i18n from '@/utils/plugins/i18n';

describe('SupervisorFilters.vue', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    const pinia = createTestingPinia({
      initialState: {
        Supervisor: {
          filters: {
            start: '',
            end: '',
            search: '',
            type: '',
          },
        },
      },
    });

    wrapper = shallowMount(SupervisorFilters, {
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicDrawerNext: false,
        },
      },
    });

    store = useSupervisorStore();
  });

  const findComponent = (dataTestId) =>
    wrapper.findComponent(`[data-testid="${dataTestId}"]`);
  const filterText = () => findComponent('filter-text');
  const buttonFilter = () => findComponent('button-filter');
  const drawerFilter = () => findComponent('drawer-filter');
  const filterDate = () => findComponent('filter-date');
  const filterStatus = () => findComponent('filter-status');
  const filterCsat = () => findComponent('filter-csat');
  const filterTopics = () => findComponent('filter-topics');

  describe('Component rendering', () => {
    it('renders filter text', () => {
      expect(filterText().exists()).toBe(true);
    });

    it('renders button filter', () => {
      expect(buttonFilter().exists()).toBe(true);
    });

    it('renders drawer', () => {
      expect(drawerFilter().exists()).toBe(true);
    });
  });

  describe('Filter drawer', () => {
    beforeEach(() => {
      wrapper.vm.openFilterDrawer();
    });

    it('renders all filters', () => {
      expect(filterDate().exists()).toBe(true);
      expect(filterStatus().exists()).toBe(true);
      expect(filterCsat().exists()).toBe(true);
      expect(filterTopics().exists()).toBe(true);
    });
  });

  describe('Filter button', () => {
    it('opens filter drawer', () => {
      buttonFilter().trigger('click');
      expect(wrapper.vm.isFilterDrawerOpen).toBe(true);
    });

    it('not show count of applied filters when no filters are applied', () => {
      expect(buttonFilter().props('text')).toBe(
        i18n.global.t('agent_builder.supervisor.filters.filter_conversations'),
      );
    });

    it('show count of applied filters when filters are applied', async () => {
      const countTranslation = (count) =>
        i18n.global.t(
          'agent_builder.supervisor.filters.count_applied_filters',
          {
            count,
          },
        );

      store.filters.status = ['status'];
      await wrapper.vm.$nextTick();

      expect(buttonFilter().props('text')).toContain(countTranslation(1));

      store.filters.status = ['status', 'status2'];
      store.filters.csat = ['csat'];
      await wrapper.vm.$nextTick();

      expect(buttonFilter().props('text')).toContain(countTranslation(3));
    });

    beforeEach(() => {
      wrapper.vm.openFilterDrawer();
    });
    it('closes filter drawer', async () => {
      await drawerFilter().vm.$emit('close');
      expect(wrapper.vm.isFilterDrawerOpen).toBe(false);
    });

    it('applies filters', async () => {
      await drawerFilter().vm.$emit('primary-button-click');
      expect(store.updateFilters).toHaveBeenCalled();
      expect(wrapper.vm.isFilterDrawerOpen).toBe(false);
    });

    it('clears filters', async () => {
      await drawerFilter().vm.$emit('secondary-button-click');
      expect(store.resetFilters).toHaveBeenCalled();
      expect(wrapper.vm.isFilterDrawerOpen).toBe(false);
    });

    it('disable primary button when filters no have changes', async () => {
      store.temporaryFilters = store.filters;
      await wrapper.vm.$nextTick();
      expect(drawerFilter().props('disabledPrimaryButton')).toBe(true);
    });

    it('enable primary button when filters have changes', async () => {
      store.temporaryFilters = { ...store.filters, status: ['status'] };
      await wrapper.vm.$nextTick();
      expect(drawerFilter().props('disabledPrimaryButton')).toBe(false);
    });

    it('disable secondary button when filters is equal to default filters', async () => {
      store.temporaryFilters = store.defaultFilters;
      await wrapper.vm.$nextTick();
      expect(drawerFilter().props('disabledSecondaryButton')).toBe(true);
    });

    it('enable secondary button when filters have changes', async () => {
      store.temporaryFilters = { ...store.filters, status: ['status'] };
      await wrapper.vm.$nextTick();
      expect(drawerFilter().props('disabledSecondaryButton')).toBe(false);
    });
  });

  describe('Get topics', () => {
    it('gets topics', async () => {
      expect(store.getTopics).toHaveBeenCalled();
    });
  });
});
