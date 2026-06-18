import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import { useImprovementsStore } from '@/store/Improvements';

import NoAnalysisPerformed from '@/components/ConversationsImprovements/NoAnalysisPerformed.vue';
import RunningAnalysis from '@/components/ConversationsImprovements/RunningAnalysis.vue';

import Improvements from '@/views/Supervisor/Improvements/index.vue';

describe('Improvements view', () => {
  let wrapper;
  let improvementsStore;

  const findSection = () =>
    wrapper.find('[data-testid="conversations-improvements"]');
  const findNoAnalysisPerformed = () =>
    wrapper.findComponent(NoAnalysisPerformed);
  const findRunningAnalysis = () => wrapper.findComponent(RunningAnalysis);

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

  describe('NoAnalysisPerformed state', () => {
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
  });

  describe('RunningAnalysis state', () => {
    it('renders RunningAnalysis when the task is running and there are no improvements', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'loading',
          task: { isRunning: true, progress: 0, total: 437 },
        },
      });

      expect(findRunningAnalysis().exists()).toBe(true);
      expect(findNoAnalysisPerformed().exists()).toBe(false);
    });

    it('does not render RunningAnalysis when there is no analysis task', () => {
      expect(findRunningAnalysis().exists()).toBe(false);
    });

    it('does not render RunningAnalysis when the task is not running', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: { isRunning: false, progress: 437, total: 437 },
        },
      });

      expect(findRunningAnalysis().exists()).toBe(false);
    });

    it('does not render RunningAnalysis when improvements data is available', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'loading',
          task: { isRunning: true, progress: 10, total: 437 },
        },
        improvements: {
          data: [
            {
              uuid: 'improvement-1',
              text: 'Improve response time',
              type: 'instruction_non_compliance',
              conversationsCount: 5,
            },
          ],
          status: 'loading',
        },
      });

      expect(findRunningAnalysis().exists()).toBe(false);
    });

    it('shows RunningAnalysis after the analysis task starts running', async () => {
      expect(findRunningAnalysis().exists()).toBe(false);

      improvementsStore.analysis.task = {
        isRunning: true,
        progress: 0,
        total: 437,
      };

      await wrapper.vm.$nextTick();

      expect(findRunningAnalysis().exists()).toBe(true);
      expect(findNoAnalysisPerformed().exists()).toBe(false);
    });
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
