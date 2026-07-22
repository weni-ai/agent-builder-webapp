import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';
import { format, subDays } from 'date-fns';

import FilterDate from '../FilterDate.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import i18n from '@/utils/plugins/i18n';

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({
    query: {
      start: '2023-01-01',
      end: '2023-01-31',
    },
  }),
}));

describe('FilterDate.vue', () => {
  let wrapper;
  let store;

  const datePicker = () => wrapper.findComponent('[data-testid="date-picker"]');
  const disclaimer = () =>
    wrapper.findComponent('[data-testid="date-filter-disclaimer"]');

  const createWrapper = () => {
    const pinia = createTestingPinia({
      initialState: {
        Supervisor: {
          temporaryFilters: {
            start: '2023-01-01',
            end: '2023-01-31',
          },
        },
      },
    });

    wrapper = shallowMount(FilterDate, {
      global: {
        plugins: [pinia],
        // shallowMount stubs skip slots by default; keep only what forwards them
        stubs: {
          UnnnicFormElement: { template: '<div><slot /></div>' },
          UnnnicInputDatePicker: {
            props: ['modelValue', 'position', 'minDate', 'maxDate', 'options'],
            template: '<div><slot name="footer" /></div>',
          },
        },
      },
    });

    store = useSupervisorStore();
  };

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders UnnnicInputDatePicker with correct props', () => {
      const expectedToday = format(new Date(), 'yyyy-MM-dd');
      const expectedMinDate = format(subDays(new Date(), 90), 'yyyy-MM-dd');

      expect(datePicker().exists()).toBe(true);
      expect(datePicker().props('position')).toBe('right');
      expect(datePicker().props('maxDate')).toBe(expectedToday);
      expect(datePicker().props('minDate')).toBe(expectedMinDate);
    });

    it('passes limited period options to the date picker', () => {
      expect(datePicker().props('options')).toEqual([
        {
          name: i18n.global.t(
            'audit.conversations.filters.period.options.last_7_days',
          ),
          id: 'last-7-days',
        },
        {
          name: i18n.global.t(
            'audit.conversations.filters.period.options.last_14_days',
          ),
          id: 'last-14-days',
        },
        {
          name: i18n.global.t(
            'audit.conversations.filters.period.options.last_30_days',
          ),
          id: 'last-30-days',
        },
        {
          name: i18n.global.t(
            'audit.conversations.filters.period.options.last_90_days',
          ),
          id: 'last-90-days',
        },
        {
          name: i18n.global.t(
            'audit.conversations.filters.period.options.current_month',
          ),
          id: 'current-month',
        },
        {
          name: i18n.global.t(
            'audit.conversations.filters.period.options.custom',
          ),
          id: 'custom',
        },
      ]);
    });

    it('renders the archive retention disclaimer', () => {
      expect(disclaimer().exists()).toBe(true);
      expect(disclaimer().props('type')).toBe('neutral');
      expect(disclaimer().props('description')).toBe(
        i18n.global.t('audit.conversations.filters.period.disclaimer'),
      );
    });

    it('initializes with store date values', () => {
      expect(datePicker().props('modelValue')).toEqual({
        start: '2023-01-01',
        end: '2023-01-31',
      });
    });
  });

  describe('Date picker functionality', () => {
    it('updates local date filter when date picker changes', async () => {
      const newDateRange = {
        start: '2023-02-01',
        end: '2023-02-28',
      };

      await datePicker().vm.$emit('update:modelValue', newDateRange);
      await nextTick();

      expect(datePicker().props('modelValue')).toEqual(newDateRange);
    });

    it('updates store temporary filters when date changes', async () => {
      const newDateRange = {
        start: '2023-03-01',
        end: '2023-03-31',
      };

      await datePicker().vm.$emit('update:modelValue', newDateRange);
      await nextTick();

      expect(store.temporaryFilters.start).toBe('2023-03-01');
      expect(store.temporaryFilters.end).toBe('2023-03-31');
    });
  });
});
