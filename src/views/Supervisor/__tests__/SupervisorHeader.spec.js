import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import SupervisorHeader from '../SupervisorHeader.vue';
import SupervisorHeaderDetails from '@/components/Supervisor/SupervisorHeaderDetails.vue';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';
import i18n from '@/utils/plugins/i18n';

const mockRoute = reactive({ name: 'conversations' });
const mockReplace = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const pinia = createTestingPinia({
  initialState: {
    featureFlags: {
      activeFeatures: ['improvements'],
      flags: {
        supervisorExport: false,
      },
    },
  },
});

describe('SupervisorHeader', () => {
  let wrapper;
  let featureFlagsStore;

  const findPageTitle = () => wrapper.find('[data-testid="page-title"]');
  const findPageDescription = () =>
    wrapper.find('[data-testid="page-description"]');
  const findExportButton = () => wrapper.find('[data-testid="export-button"]');
  const findExportModal = () => wrapper.find('[data-testid="export-modal"]');
  const findTabs = () => wrapper.findComponent({ name: 'UnnnicTabs' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.name = 'conversations';

    wrapper = mount(SupervisorHeader, {
      global: {
        plugins: [pinia],
      },
    });

    featureFlagsStore = useFeatureFlagsStore();
    featureFlagsStore.activeFeatures = ['improvements'];
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('should render the component correctly', () => {
    expect(findPageTitle().exists()).toBe(true);
    expect(findPageDescription().exists()).toBe(true);
    expect(findExportButton().exists()).toBe(false);
    expect(findExportModal().exists()).toBe(false);
  });

  it('should not show export button when supervisorExport flag is false', () => {
    featureFlagsStore.flags.supervisorExport = false;

    expect(findExportButton().exists()).toBe(false);
    expect(findExportModal().exists()).toBe(false);
  });

  it('should render conversations and improvements tabs when conversationsImprovements flag is enabled', () => {
    const { t } = i18n.global;

    expect(findTabs().exists()).toBe(true);
    expect(wrapper.text()).toContain(t('audit.conversations.title'));
    expect(wrapper.text()).toContain(t('audit.improvements.title'));
  });

  it('should not render tabs when conversationsImprovements flag is disabled', async () => {
    featureFlagsStore.activeFeatures = [];
    await wrapper.unmount();

    wrapper = mount(SupervisorHeader, {
      global: {
        plugins: [pinia],
      },
    });

    expect(findTabs().exists()).toBe(false);
  });

  it('should show header details only on conversations tab', async () => {
    expect(wrapper.findComponent(SupervisorHeaderDetails).exists()).toBe(true);

    mockRoute.name = 'improvements';
    await wrapper.unmount();

    wrapper = mount(SupervisorHeader, {
      global: {
        plugins: [pinia],
      },
    });

    expect(wrapper.findComponent(SupervisorHeaderDetails).exists()).toBe(false);
  });

  it('should navigate to the selected tab route', async () => {
    await findTabs().vm.$emit('update:modelValue', 'improvements');

    expect(mockReplace).toHaveBeenCalledWith({ name: 'improvements' });
  });
});
