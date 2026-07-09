import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useImprovementsStore } from '@/store/Improvements';
import { DEFAULT_IMPROVEMENTS_TASK } from '@/store/types/Improvements.types';

import AnalysisInProgressDisclaimer from '../AnalysisInProgressDisclaimer.vue';

describe('AnalysisInProgressDisclaimer.vue', () => {
  let wrapper;
  let improvementsStore;

  const findDisclaimer = () =>
    wrapper.findComponent('[data-testid="analysis-in-progress-disclaimer"]');
  const findLoadingIcon = () =>
    wrapper.findComponent({ name: 'UnnnicIconLoading' });

  const createWrapper = (stateOverrides = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        Improvements: {
          analysis: {
            status: 'loading',
            task: {
              isRunning: true,
              progress: 10,
              total: 437,
            },
            ...(stateOverrides.analysis || {}),
          },
          improvements: {
            data: [],
            status: 'loading',
            ...(stateOverrides.improvements || {}),
          },
        },
      },
    });

    wrapper = shallowMount(AnalysisInProgressDisclaimer, {
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicDisclaimer: {
            name: 'UnnnicDisclaimer',
            template:
              '<div data-testid="analysis-in-progress-disclaimer"><slot name="icon" /></div>',
            props: ['type', 'description'],
          },
        },
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

  describe('Component rendering', () => {
    it('renders the disclaimer when the analysis task is running', () => {
      const disclaimer = findDisclaimer();

      expect(disclaimer.exists()).toBe(true);
      expect(disclaimer.props('type')).toBe('informational');
      expect(disclaimer.props('description')).toBe(
        i18n.global.t('audit.improvements.analysis_in_progress_disclaimer', {
          progress: 10,
          total: 437,
        }),
      );
    });

    it('renders the loading icon with the correct configuration', () => {
      const loadingIcon = findLoadingIcon();

      expect(loadingIcon.exists()).toBe(true);
      expect(loadingIcon.props('size')).toBe('sm');
      expect(loadingIcon.props('strokeWidth')).toBe('3');
    });

    it('does not render the disclaimer when the analysis task is not running', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: { isRunning: false, progress: 437, total: 437 },
        },
      });

      expect(findDisclaimer().exists()).toBe(false);
    });

    it('does not render the disclaimer when no analysis was performed', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: null,
          task: { ...DEFAULT_IMPROVEMENTS_TASK },
        },
      });

      expect(findDisclaimer().exists()).toBe(false);
    });

    it('uses zero for progress and total when task values are missing', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'loading',
          task: { isRunning: true },
        },
      });

      expect(findDisclaimer().props('description')).toBe(
        i18n.global.t('audit.improvements.analysis_in_progress_disclaimer', {
          progress: 0,
          total: 0,
        }),
      );
    });
  });

  describe('Store reactivity', () => {
    it('updates the description when progress changes', async () => {
      improvementsStore.analysis.task.progress = 25;

      await wrapper.vm.$nextTick();

      expect(findDisclaimer().props('description')).toBe(
        i18n.global.t('audit.improvements.analysis_in_progress_disclaimer', {
          progress: 25,
          total: 437,
        }),
      );
    });

    it('hides the disclaimer when the task stops running', async () => {
      improvementsStore.analysis.task.isRunning = false;

      await wrapper.vm.$nextTick();

      expect(findDisclaimer().exists()).toBe(false);
    });
  });
});
