import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import Unnnic from '@weni/unnnic-system';

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

  beforeEach(() => {
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

    wrapper = mount(FilterDate, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          UnnnicInputDatePicker: Unnnic.unnnicInputDatePicker,
        },
      },
    });

    store = useSupervisorStore();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders UnnnicInputDatePicker with correct props', () => {
      expect(datePicker().exists()).toBe(true);
      expect(datePicker().props('position')).toBe('right');
      expect(datePicker().props('maxDate')).toBeDefined();
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

    it('starts with filters from query', () => {
      expect(datePicker().props('modelValue')).toEqual({
        start: '2023-01-01',
        end: '2023-01-31',
      });
    });
  });
});
