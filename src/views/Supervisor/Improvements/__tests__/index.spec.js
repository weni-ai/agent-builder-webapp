import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import { useImprovementsStore } from '@/store/Improvements';

import NoAnalysisPerformed from '@/components/ConversationsImprovements/NoAnalysisPerformed.vue';
import Improvements from '@/views/Supervisor/Improvements/index.vue';

describe('Improvements view', () => {
  let wrapper;
  let improvementsStore;

  const findSection = () =>
    wrapper.find('[data-testid="conversations-improvements"]');
  const findNoAnalysisPerformed = () =>
    wrapper.findComponent(NoAnalysisPerformed);

  const createWrapper = (stateOverrides = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        Improvements: {
          analysis: {
            status: null,
            task: null,
            ...(stateOverrides.analysis || {}),
          },
          improvements: {
            data: [],
            status: null,
            ...(stateOverrides.improvements || {}),
          },
        },
      },
    });

    wrapper = shallowMount(Improvements, {
      global: {
        plugins: [pinia],
      },
    });

    improvementsStore = useImprovementsStore(pinia);

    return wrapper;
  };

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders the improvements section', () => {
    expect(findSection().exists()).toBe(true);
  });

  it('renders NoAnalysisPerformed when there is no analysis task', () => {
    expect(findNoAnalysisPerformed().exists()).toBe(true);
  });

  it('does not render NoAnalysisPerformed when an analysis task exists', () => {
    wrapper.unmount();
    createWrapper({
      analysis: {
        status: 'complete',
        task: { isRunning: false, progress: 5, total: 5 },
      },
    });

    expect(findNoAnalysisPerformed().exists()).toBe(false);
  });

  it('hides NoAnalysisPerformed after the analysis task is set', async () => {
    expect(findNoAnalysisPerformed().exists()).toBe(true);

    improvementsStore.analysis.task = {
      isRunning: true,
      progress: 0,
      total: 3,
    };

    await wrapper.vm.$nextTick();

    expect(findNoAnalysisPerformed().exists()).toBe(false);
  });

  it('loads improvements when the view mounts', () => {
    wrapper = shallowMount(Improvements, {
      global: {
        plugins: [createTestingPinia()],
      },
    });

    const improvementsStore = useImprovementsStore();

    expect(improvementsStore.fetchImprovements).toHaveBeenCalledTimes(1);
  });
});
