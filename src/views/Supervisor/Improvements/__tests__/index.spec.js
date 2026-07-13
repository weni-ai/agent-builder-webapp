import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import { useImprovementsStore } from '@/store/Improvements';
import { DEFAULT_IMPROVEMENTS_TASK } from '@/store/types/Improvements.types';

import AnalysisInProgressDisclaimer from '@/components/ConversationsImprovements/AnalysisInProgressDisclaimer.vue';
import ImprovementsHeader from '@/components/ConversationsImprovements/ImprovementsHeader.vue';
import ImprovementsList from '@/components/ConversationsImprovements/ImprovementsList.vue';
import NoAnalysisPerformed from '@/components/ConversationsImprovements/NoAnalysisPerformed.vue';
import NoImprovementIdentified from '@/components/ConversationsImprovements/NoImprovementIdentified.vue';
import InsufficientConversationsVolume from '@/components/ConversationsImprovements/InsufficientConversationsVolume.vue';
import RunningAnalysis from '@/components/ConversationsImprovements/RunningAnalysis.vue';

import Improvements from '@/views/Supervisor/Improvements/index.vue';

describe('Improvements view', () => {
  let wrapper;
  let improvementsStore;

  const findSection = () =>
    wrapper.find('[data-testid="conversations-improvements"]');
  const findNoAnalysisPerformed = () =>
    wrapper.findComponent(NoAnalysisPerformed);
  const findNoImprovementIdentified = () =>
    wrapper.findComponent(NoImprovementIdentified);
  const findInsufficientConversationsVolume = () =>
    wrapper.findComponent(InsufficientConversationsVolume);
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
            task: { ...DEFAULT_IMPROVEMENTS_TASK },
            yesterdayConversationsCount: 0,
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

  describe('InsufficientConversationsVolume state', () => {
    it('renders InsufficientConversationsVolume when volume is below minimum and no analysis was performed', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: { ...DEFAULT_IMPROVEMENTS_TASK },
          yesterdayConversationsCount: 10,
        },
      });

      expect(findInsufficientConversationsVolume().exists()).toBe(true);
      expect(findNoAnalysisPerformed().exists()).toBe(false);
    });

    it('does not render InsufficientConversationsVolume when volume meets minimum', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: { ...DEFAULT_IMPROVEMENTS_TASK },
          yesterdayConversationsCount: 15,
        },
      });

      expect(findInsufficientConversationsVolume().exists()).toBe(false);
      expect(findNoAnalysisPerformed().exists()).toBe(true);
    });
  });

  describe('NoAnalysisPerformed state', () => {
    it('renders the improvements section', () => {
      expect(findSection().exists()).toBe(true);
    });

    it('renders NoAnalysisPerformed when no analysis was performed', () => {
      expect(findNoAnalysisPerformed().exists()).toBe(true);
    });

    it('does not render NoAnalysisPerformed when analysis was performed', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: {
            isRunning: false,
            progress: 5,
            total: 5,
            createdAt: '2026-06-18T08:00:00Z',
          },
        },
      });

      expect(findNoAnalysisPerformed().exists()).toBe(false);
    });

    it('hides NoAnalysisPerformed after analysis is performed', async () => {
      expect(findNoAnalysisPerformed().exists()).toBe(true);

      improvementsStore.analysis.task = {
        isRunning: true,
        progress: 0,
        total: 3,
        createdAt: '2026-06-18T08:00:00Z',
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
          task: {
            isRunning: true,
            progress: 0,
            total: 437,
            createdAt: '2026-06-18T08:00:00Z',
          },
        },
      });

      expect(findRunningAnalysis().exists()).toBe(true);
      expect(findNoAnalysisPerformed().exists()).toBe(false);
    });

    it('does not render RunningAnalysis when no analysis was performed', () => {
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
            createdAt: '2026-06-18T08:00:00Z',
          },
        },
      });

      expect(findRunningAnalysis().exists()).toBe(false);
      expect(findNoImprovementIdentified().exists()).toBe(true);
    });

    it('does not render RunningAnalysis when improvements data is available', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'loading',
          task: {
            isRunning: true,
            progress: 10,
            total: 437,
            createdAt: '2026-06-18T08:00:00Z',
          },
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

    it('shows RunningAnalysis after the analysis starts running', async () => {
      improvementsStore.analysis.task = {
        isRunning: true,
        progress: 0,
        total: 437,
        createdAt: '2026-06-18T08:00:00Z',
      };

      await wrapper.vm.$nextTick();

      expect(findRunningAnalysis().exists()).toBe(true);
      expect(findNoAnalysisPerformed().exists()).toBe(false);
    });
  });

  describe('NoImprovementIdentified state', () => {
    it('renders header and NoImprovementIdentified when analysis finished with no improvements', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: {
            isRunning: false,
            progress: 5,
            total: 5,
            createdAt: '2026-06-18T08:00:00Z',
          },
        },
        improvements: {
          data: [],
          status: 'complete',
        },
      });

      expect(findImprovementsHeader().exists()).toBe(true);
      expect(findNoImprovementIdentified().exists()).toBe(true);
      expect(findNoAnalysisPerformed().exists()).toBe(false);
      expect(findRunningAnalysis().exists()).toBe(false);
      expect(findImprovementsList().exists()).toBe(false);
    });

    it('does not render NoImprovementIdentified when improvements exist', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: {
            isRunning: false,
            progress: 5,
            total: 5,
            createdAt: '2026-06-18T08:00:00Z',
          },
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
          status: 'complete',
        },
      });

      expect(findNoImprovementIdentified().exists()).toBe(false);
      expect(findImprovementsList().exists()).toBe(true);
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
            createdAt: '2026-06-18T08:00:00Z',
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
          task: {
            isRunning: true,
            progress: 10,
            total: 437,
            createdAt: '2026-06-18T08:00:00Z',
          },
        },
        improvements: {
          data: [improvementItem],
          status: 'loading',
        },
      });

      expect(findAnalysisInProgressDisclaimer().exists()).toBe(true);
      expect(findImprovementsHeader().exists()).toBe(false);
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
            createdAt: '2026-06-18T08:00:00Z',
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
        createdAt: '2026-06-18T08:00:00Z',
      };
      improvementsStore.improvements.data = [improvementItem];

      await wrapper.vm.$nextTick();

      expect(findAnalysisInProgressDisclaimer().exists()).toBe(true);
      expect(findImprovementsHeader().exists()).toBe(false);
      expect(findImprovementsList().exists()).toBe(true);
      expect(findRunningAnalysis().exists()).toBe(false);
    });
  });
});
