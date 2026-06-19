import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import { useImprovementsStore } from '@/store/Improvements';

import AnalysisInProgressDisclaimer from '@/components/ConversationsImprovements/AnalysisInProgressDisclaimer.vue';
import ImprovementsHeader from '@/components/ConversationsImprovements/ImprovementsHeader.vue';
import ImprovementsList from '@/components/ConversationsImprovements/ImprovementsList.vue';
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
  const findAnalysisInProgressDisclaimer = () =>
    wrapper.findComponent(AnalysisInProgressDisclaimer);
  const findImprovementsHeader = () =>
    wrapper.findComponent(ImprovementsHeader);
  const findImprovementsList = () => wrapper.findComponent(ImprovementsList);

  const createWrapper = (stateOverrides = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        Improvements: {
          analysis: {
            status: null,
            task: null,
            conversationsCount: 0,
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

  describe('on mount', () => {
    it('loads improvements when the view mounts', () => {
      expect(improvementsStore.fetchImprovements).toHaveBeenCalledTimes(1);
    });
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
          task: { isRunning: false, progress: 5, total: 5, createdAt: null },
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
        createdAt: null,
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
          task: { isRunning: true, progress: 0, total: 437, createdAt: null },
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
          task: {
            isRunning: false,
            progress: 437,
            total: 437,
            createdAt: null,
          },
        },
      });

      expect(findRunningAnalysis().exists()).toBe(false);
    });

    it('does not render RunningAnalysis when improvements data is available', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'loading',
          task: { isRunning: true, progress: 10, total: 437, createdAt: null },
        },
        improvements: {
          data: [
            {
              uuid: 'improvement-1',
              text: 'Improve response time',
              type: 'wrong_behavior_due_to_instructions',
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
        createdAt: null,
      };

      await wrapper.vm.$nextTick();

      expect(findRunningAnalysis().exists()).toBe(true);
      expect(findNoAnalysisPerformed().exists()).toBe(false);
    });
  });

  describe('Improvements list state', () => {
    const improvementItem = {
      uuid: 'improvement-1',
      text: 'Improve response time',
      type: 'wrong_behavior_due_to_instructions',
      conversationsCount: 5,
    };

    it('renders the improvements header and list when improvements data is available', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: {
            isRunning: false,
            progress: 437,
            total: 437,
            createdAt: null,
          },
        },
        improvements: {
          data: [improvementItem],
          status: 'complete',
        },
      });

      expect(findImprovementsHeader().exists()).toBe(true);
      expect(findImprovementsList().exists()).toBe(true);
      expect(findNoAnalysisPerformed().exists()).toBe(false);
      expect(findRunningAnalysis().exists()).toBe(false);
    });

    it('renders AnalysisInProgressDisclaimer when improvements exist and the task is running', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'loading',
          task: { isRunning: true, progress: 10, total: 437, createdAt: null },
        },
        improvements: {
          data: [improvementItem],
          status: 'loading',
        },
      });

      expect(findAnalysisInProgressDisclaimer().exists()).toBe(true);
      expect(findImprovementsHeader().exists()).toBe(true);
      expect(findImprovementsList().exists()).toBe(true);
      expect(findRunningAnalysis().exists()).toBe(false);
    });

    it('does not render AnalysisInProgressDisclaimer when the task is not running', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: {
            isRunning: false,
            progress: 437,
            total: 437,
            createdAt: null,
          },
        },
        improvements: {
          data: [improvementItem],
          status: 'complete',
        },
      });

      expect(findAnalysisInProgressDisclaimer().exists()).toBe(false);
    });

    it('does not render improvements content when there is no improvements data', () => {
      expect(findImprovementsHeader().exists()).toBe(false);
      expect(findImprovementsList().exists()).toBe(false);
      expect(findAnalysisInProgressDisclaimer().exists()).toBe(false);
    });

    it('shows AnalysisInProgressDisclaimer after improvements load while the task is running', async () => {
      improvementsStore.analysis.task = {
        isRunning: true,
        progress: 5,
        total: 437,
        createdAt: null,
      };
      improvementsStore.improvements.data = [improvementItem];

      await wrapper.vm.$nextTick();

      expect(findAnalysisInProgressDisclaimer().exists()).toBe(true);
      expect(findImprovementsHeader().exists()).toBe(true);
      expect(findImprovementsList().exists()).toBe(true);
      expect(findRunningAnalysis().exists()).toBe(false);
    });
  });
});
