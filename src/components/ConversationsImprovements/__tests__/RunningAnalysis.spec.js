import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useImprovementsStore } from '@/store/Improvements';
import { DEFAULT_IMPROVEMENTS_TASK } from '@/store/types/Improvements.types';

import RunningAnalysis from '../RunningAnalysis.vue';

describe('RunningAnalysis.vue', () => {
  let wrapper;
  let improvementsStore;

  const findSection = () => wrapper.find('[data-testid="running-analysis"]');
  const findTitle = () =>
    wrapper.find('[data-testid="running-analysis-title"]');
  const findDescription = () =>
    wrapper.find('[data-testid="running-analysis-description"]');
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
              progress: 0,
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

    wrapper = shallowMount(RunningAnalysis, {
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

  describe('Component rendering', () => {
    it('renders the running analysis section', () => {
      expect(findSection().exists()).toBe(true);
    });

    it('renders the loading icon', () => {
      const loadingIcon = findLoadingIcon();

      expect(loadingIcon.exists()).toBe(true);
      expect(loadingIcon.props('size')).toBe('md');
    });

    it('renders the title with the conversation count from the store', () => {
      expect(findTitle().text()).toBe(
        i18n.global.t('audit.improvements.running_analysis.title'),
      );
    });

    it('renders the title with zero when task total is missing', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'loading',
          task: { ...DEFAULT_IMPROVEMENTS_TASK },
        },
      });

      expect(findTitle().text()).toBe(
        i18n.global.t('audit.improvements.running_analysis.title'),
      );
    });

    it('renders the description with the correct translation', () => {
      expect(findDescription().text()).toBe(
        i18n.global.t('audit.improvements.running_analysis.description'),
      );
    });
  });
});
