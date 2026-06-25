import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import SupervisorHeader from '../SupervisorHeader.vue';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';
import { createTestingPinia } from '@pinia/testing';

const pinia = createTestingPinia({
  initialState: {
    featureFlags: {
      flags: {
        supervisorExport: false,
      },
    },
  },
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

  afterEach(() => {
    wrapper?.unmount();
  });

  it('should render the component correctly', () => {
    expect(wrapper.find('[data-testid="page-title"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="page-description"]').exists()).toBe(true);
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
