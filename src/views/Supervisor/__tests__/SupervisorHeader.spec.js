import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SupervisorHeader from '../SupervisorHeader.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';
import { createTestingPinia } from '@pinia/testing';

const pinia = createTestingPinia({
  initialState: {
    supervisor: {
      filters: {
        start: '',
        end: '',
      },
    },
    featureFlags: {
      flags: {
        supervisorExport: false,
      },
    },
  },
});

vi.mock('@/composables/useAgentBuilderViews', () => {
  return {
    default: vi.fn(() => {
      return {
        value: [
          {
            title: 'Test Route',
            description: 'Test Description',
            page: 'test-page',
            icon: 'test-icon',
          },
        ],
      };
    }),
  };
});

vi.mock('vue-router', () => {
  return {
    useRoute: vi.fn(() => ({
      name: 'test-page',
      query: {
        start: '2025-01-01',
        end: '2025-01-31',
        search: '',
        type: '',
        conversationId: '',
      },
    })),
  };
});

describe('SupervisorHeader', () => {
  let wrapper;
  let featureFlagsStore;

  beforeEach(() => {
    wrapper = mount(SupervisorHeader, {
      global: {
        plugins: [pinia],
      },
    });

    featureFlagsStore = useFeatureFlagsStore();
  });

  it('should render the component correctly', () => {
    expect(wrapper.find('[data-testid="export-button"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="export-modal"]').exists()).toBe(false);
  });

  it('should not show export button when supervisorExport flag is false', () => {
    featureFlagsStore.flags.supervisorExport = false;

    expect(
      wrapper.findComponent('[data-testid="export-button"]').exists(),
    ).toBe(false);
    expect(wrapper.findComponent('[data-testid="export-modal"]').exists()).toBe(
      false,
    );
  });
});
