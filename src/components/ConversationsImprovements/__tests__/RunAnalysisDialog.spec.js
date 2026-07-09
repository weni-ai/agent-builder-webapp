import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useImprovementsStore } from '@/store/Improvements';

import RunAnalysisDialog from '../RunAnalysisDialog.vue';

describe('RunAnalysisDialog.vue', () => {
  let wrapper;
  let improvementsStore;

  const findRunButton = () =>
    wrapper
      .findAllComponents({ name: 'UnnnicButton' })
      .find((button) => button.props('type') === 'attention');

  const createWrapper = (stateOverrides = {}, props = { open: true }) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        Improvements: {
          analysis: {
            status: 'complete',
            task: {
              createdAt: '2026-07-08T12:00:00.000Z',
            },
            yesterdayConversationsCount: 20,
            ...(stateOverrides.analysis || {}),
          },
          improvements: {
            data: [
              {
                uuid: 'improvement-1',
                text: 'Improve response time',
                type: 'repetitive_response',
                conversationsCount: 3,
              },
            ],
            status: 'complete',
            ...(stateOverrides.improvements || {}),
          },
        },
      },
    });

    wrapper = shallowMount(RunAnalysisDialog, {
      global: {
        plugins: [pinia],
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

  describe('User interactions', () => {
    it('closes the dialog and calls runAnalysis when Run is clicked', async () => {
      await findRunButton().trigger('click');

      expect(wrapper.emitted('update:open')).toEqual([[false]]);
      expect(improvementsStore.runAnalysis).toHaveBeenCalledOnce();
    });
  });

  describe('Component rendering', () => {
    it('renders the run button label', () => {
      expect(findRunButton().props('text')).toBe(
        i18n.global.t('audit.improvements.run_analysis_dialog.run'),
      );
    });
  });
});
