import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import {
  MIN_CONVERSATIONS_FOR_ANALYSIS,
  useImprovementsStore,
} from '@/store/Improvements';
import { DEFAULT_IMPROVEMENTS_TASK } from '@/store/types/Improvements.types';

import RunAnalysisButton from '../RunAnalysisButton.vue';
import RunAnalysisDialog from '../RunAnalysisDialog.vue';

describe('RunAnalysisButton.vue', () => {
  let wrapper;
  let improvementsStore;

  const findTooltip = () => wrapper.findComponent({ name: 'UnnnicTooltip' });
  const findButton = () => wrapper.findComponent({ name: 'UnnnicButton' });

  const createWrapper = (stateOverrides = {}, props = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        Improvements: {
          analysis: {
            status: 'complete',
            task: { ...DEFAULT_IMPROVEMENTS_TASK },
            yesterdayConversationsCount: 20,
            ...(stateOverrides.analysis || {}),
          },
          improvements: {
            data: [],
            status: 'complete',
            ...(stateOverrides.improvements || {}),
          },
        },
      },
    });

    wrapper = mount(RunAnalysisButton, {
      attachTo: document.body,
      global: {
        plugins: [pinia],
        stubs: {
          RunAnalysisDialog: {
            template: '<div data-testid="run-analysis-dialog-stub" />',
            props: ['open'],
          },
        },
      },
      props,
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
    it('renders the run analysis button with default translation', () => {
      expect(findButton().exists()).toBe(true);
      expect(findButton().props('text')).toBe(
        i18n.global.t('audit.improvements.header.run_analysis'),
      );
    });

    it('uses the provided translation key', () => {
      wrapper.unmount();
      createWrapper(
        {},
        { translationKey: 'audit.improvements.no_analysis.run_analysis' },
      );

      expect(findButton().props('text')).toBe(
        i18n.global.t('audit.improvements.no_analysis.run_analysis'),
      );
    });

    it('uses the provided data-testid', () => {
      wrapper.unmount();
      createWrapper({}, { dataTestid: 'custom-run-button' });

      expect(findButton().attributes('data-testid')).toBe('custom-run-button');
    });
  });

  describe('Disabled state and tooltip', () => {
    it('disables the button and enables tooltip for insufficient volume', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          yesterdayConversationsCount: 10,
          task: { ...DEFAULT_IMPROVEMENTS_TASK },
        },
      });

      expect(findButton().props('disabled')).toBe(true);
      expect(findTooltip().props('enabled')).toBe(true);
      expect(findTooltip().props('text')).toBe(
        i18n.global.t(
          'audit.improvements.header.run_analysis_insufficient_volume_tooltip',
          { min: MIN_CONVERSATIONS_FOR_ANALYSIS },
        ),
      );
      expect(findTooltip().props('side')).toBe('left');
    });

    it('disables the button and enables tooltip when analysis already ran today', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          yesterdayConversationsCount: 50,
          task: {
            isRunning: false,
            progress: 5,
            total: 5,
            createdAt: new Date().toISOString(),
          },
        },
      });

      expect(findButton().props('disabled')).toBe(true);
      expect(findTooltip().props('enabled')).toBe(true);
      expect(findTooltip().props('text')).toBe(
        i18n.global.t(
          'audit.improvements.header.run_analysis_already_run_today_tooltip',
        ),
      );
    });

    it('does not enable tooltip when the button is only disabled due to loading', () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'loading',
          yesterdayConversationsCount: 20,
          task: { ...DEFAULT_IMPROVEMENTS_TASK },
        },
      });

      expect(findButton().props('disabled')).toBe(true);
      expect(findTooltip().props('enabled')).toBe(false);
    });
  });

  describe('User interactions', () => {
    const findDialog = () => wrapper.findComponent(RunAnalysisDialog);

    it('calls runAnalysis when there are no improvements', async () => {
      await findButton().trigger('click');

      expect(improvementsStore.runAnalysis).toHaveBeenCalledOnce();
      expect(findDialog().props('open')).toBe(false);
    });

    it('opens the dialog when there are improvements', async () => {
      wrapper.unmount();
      createWrapper({
        improvements: {
          data: [
            {
              uuid: 'improvement-1',
              text: 'Improve response time',
              type: 'repetitive_response',
              conversationsCount: 3,
            },
          ],
        },
      });

      await findButton().trigger('click');

      expect(improvementsStore.runAnalysis).not.toHaveBeenCalled();
      expect(findDialog().props('open')).toBe(true);
    });

    it('does not call runAnalysis when the button is disabled', async () => {
      wrapper.unmount();
      createWrapper({
        analysis: {
          status: 'complete',
          yesterdayConversationsCount: 10,
          task: { ...DEFAULT_IMPROVEMENTS_TASK },
        },
      });

      await findButton().trigger('click');

      expect(improvementsStore.runAnalysis).not.toHaveBeenCalled();
    });
  });
});
