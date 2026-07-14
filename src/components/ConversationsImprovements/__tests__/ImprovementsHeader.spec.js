import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { subDays } from 'date-fns';

import i18n from '@/utils/plugins/i18n';
import { useImprovementsStore } from '@/store/Improvements';
import { DEFAULT_IMPROVEMENTS_TASK } from '@/store/types/Improvements.types';
import {
  formatMonthDayDate,
  getYesterdayFormattedDate,
} from '@/utils/formatters';

import ImprovementsHeader from '../ImprovementsHeader.vue';

describe('ImprovementsHeader.vue', () => {
  let wrapper;
  let improvementsStore;

  const findStaleDisclaimer = () =>
    wrapper.findComponent('[data-testid="stale-analysis-disclaimer"]');
  const findTitle = () =>
    wrapper.find('[data-testid="conversations-improvements-header-title"]');
  const findDescription = () =>
    wrapper.find(
      '[data-testid="conversations-improvements-header-description"]',
    );

  const createWrapper = (stateOverrides = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        Improvements: {
          analysis: {
            status: 'complete',
            task: {
              ...DEFAULT_IMPROVEMENTS_TASK,
              createdAt: new Date().toISOString(),
              isRunning: false,
            },
            ...(stateOverrides.analysis || {}),
          },
          improvements: {
            data: [{ id: '1' }],
            status: 'complete',
            ...(stateOverrides.improvements || {}),
          },
        },
      },
    });

    wrapper = shallowMount(ImprovementsHeader, {
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicDisclaimer: {
            name: 'UnnnicDisclaimer',
            template: '<div data-testid="stale-analysis-disclaimer" />',
            props: ['type', 'title', 'description'],
          },
          UnnnicButton: true,
          RunAnalysisButton: true,
          CustomAnalysisModal: true,
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

  describe('Stale analysis disclaimer', () => {
    it('does not render the disclaimer when the analysis is less than 5 days old', () => {
      expect(findStaleDisclaimer().exists()).toBe(false);
    });

    it('does not render the disclaimer when the analysis is 4 days old', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: {
            ...DEFAULT_IMPROVEMENTS_TASK,
            createdAt: subDays(new Date(), 4).toISOString(),
            isRunning: false,
          },
        },
      });

      expect(findStaleDisclaimer().exists()).toBe(false);
    });

    it('renders the disclaimer when the analysis is 5 days old', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: {
            ...DEFAULT_IMPROVEMENTS_TASK,
            createdAt: subDays(new Date(), 5).toISOString(),
            isRunning: false,
          },
        },
      });

      const disclaimer = findStaleDisclaimer();

      expect(disclaimer.exists()).toBe(true);
      expect(disclaimer.props('type')).toBe('informational');
      expect(disclaimer.props('title')).toBe(
        i18n.global.t('audit.improvements.stale_analysis_disclaimer.title', {
          days: 5,
        }),
      );
      expect(disclaimer.props('description')).toBe(
        i18n.global.t(
          'audit.improvements.stale_analysis_disclaimer.description',
        ),
      );
    });

    it('renders the disclaimer with the correct day count when older than 5 days', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: {
            ...DEFAULT_IMPROVEMENTS_TASK,
            createdAt: subDays(new Date(), 10).toISOString(),
            isRunning: false,
          },
        },
      });

      expect(findStaleDisclaimer().props('title')).toBe(
        i18n.global.t('audit.improvements.stale_analysis_disclaimer.title', {
          days: 10,
        }),
      );
    });

    it('does not render the disclaimer when createdAt is missing', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: null,
          task: { ...DEFAULT_IMPROVEMENTS_TASK },
        },
      });

      expect(findStaleDisclaimer().exists()).toBe(false);
    });
  });

  describe('Header content', () => {
    it('renders the header title', () => {
      expect(findTitle().exists()).toBe(true);
    });

    it('renders the header title without count when there are no improvements', () => {
      wrapper.unmount();
      createWrapper({
        improvements: {
          data: [],
          status: 'complete',
        },
      });

      expect(findTitle().text()).toBe(
        i18n.global.t('audit.improvements.header.title', {
          date: getYesterdayFormattedDate(),
          count: 0,
        }),
      );
      expect(findTitle().text()).toBe(
        `Analysis of conversations from ${getYesterdayFormattedDate()}`,
      );
    });

    it('renders the header title with the conversations date one day before createdAt', () => {
      const createdAt = subDays(new Date(), 5).toISOString();
      const conversationsDate = formatMonthDayDate(
        subDays(new Date(createdAt), 1).toISOString(),
      );

      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          task: {
            ...DEFAULT_IMPROVEMENTS_TASK,
            createdAt,
            isRunning: false,
          },
        },
      });

      expect(findTitle().text()).toBe(
        i18n.global.t('audit.improvements.header.title', {
          date: conversationsDate,
          count: 1,
        }),
      );
    });

    it('renders the header description when createdAt is present', () => {
      expect(findDescription().exists()).toBe(true);
    });
  });
});
