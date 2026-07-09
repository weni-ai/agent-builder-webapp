import { mount, shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useImprovementsStore } from '@/store/Improvements';

import NoAnalysisPerformed from '../NoAnalysisPerformed.vue';
import RunAnalysisButton from '../RunAnalysisButton.vue';

describe('NoAnalysisPerformed.vue', () => {
  let wrapper;
  let improvementsStore;

  const findTitle = () =>
    wrapper.find('[data-testid="no-analysis-performed-title"]');
  const findDescription = () =>
    wrapper.find('[data-testid="no-analysis-performed-description"]');
  const findRunAnalysisButton = () => wrapper.findComponent(RunAnalysisButton);

  const createWrapper = () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        Improvements: {
          analysis: {
            status: 'complete',
            task: null,
            yesterdayConversationsCount: 20,
          },
        },
      },
    });

    wrapper = shallowMount(NoAnalysisPerformed, {
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
    it('renders the empty state section', () => {
      expect(
        wrapper.find('[data-testid="no-analysis-performed"]').exists(),
      ).toBe(true);
    });

    it('renders the title with the correct translation', () => {
      expect(findTitle().text()).toBe(
        i18n.global.t('audit.improvements.no_analysis.title'),
      );
    });

    it('renders the description with the correct translation', () => {
      expect(findDescription().text()).toBe(
        i18n.global.t('audit.improvements.no_analysis.description'),
      );
    });

    it('renders the run analysis button with the correct configuration', () => {
      const button = findRunAnalysisButton();

      expect(button.exists()).toBe(true);
      expect(button.props('dataTestid')).toBe(
        'no-analysis-performed-run-button',
      );
      expect(button.props('translationKey')).toBe(
        'audit.improvements.no_analysis.run_analysis',
      );
    });
  });

  describe('User interactions', () => {
    it('calls runAnalysis when the run analysis button is clicked', async () => {
      wrapper.unmount();
      const pinia = createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          Improvements: {
            analysis: {
              status: 'complete',
              task: null,
              yesterdayConversationsCount: 20,
            },
          },
        },
      });

      wrapper = mount(NoAnalysisPerformed, {
        global: {
          plugins: [pinia],
          stubs: {
            RunAnalysisDialog: {
              template: '<div data-testid="run-analysis-dialog-stub" />',
              props: ['open'],
            },
          },
        },
      });
      improvementsStore = useImprovementsStore(pinia);

      await wrapper.findComponent({ name: 'UnnnicButton' }).trigger('click');

      expect(improvementsStore.runAnalysis).toHaveBeenCalledOnce();
    });
  });
});
