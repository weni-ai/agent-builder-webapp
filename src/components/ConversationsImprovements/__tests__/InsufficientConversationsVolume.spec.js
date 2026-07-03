import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { DEFAULT_IMPROVEMENTS_TASK } from '@/store/types/Improvements.types';

import InsufficientConversationsVolume from '../InsufficientConversationsVolume.vue';
import RunAnalysisButton from '../RunAnalysisButton.vue';

describe('InsufficientConversationsVolume.vue', () => {
  let wrapper;

  const findTitle = () =>
    wrapper.find('[data-testid="insufficient-conversations-volume-title"]');
  const findDescription = () =>
    wrapper.find(
      '[data-testid="insufficient-conversations-volume-description"]',
    );
  const findRunAnalysisButton = () => wrapper.findComponent(RunAnalysisButton);

  const createWrapper = () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        Improvements: {
          analysis: {
            status: 'complete',
            task: { ...DEFAULT_IMPROVEMENTS_TASK },
            yesterdayConversationsCount: 10,
          },
        },
      },
    });

    wrapper = shallowMount(InsufficientConversationsVolume, {
      global: {
        plugins: [pinia],
      },
    });

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
    it('renders the insufficient volume section', () => {
      expect(
        wrapper
          .find('[data-testid="insufficient-conversations-volume"]')
          .exists(),
      ).toBe(true);
    });

    it('renders the title with the correct translation', () => {
      expect(findTitle().text()).toBe(
        i18n.global.t('audit.improvements.insufficient_volume.title'),
      );
    });

    it('renders the description with the correct translation', () => {
      expect(findDescription().text()).toBe(
        i18n.global.t('audit.improvements.insufficient_volume.description'),
      );
    });

    it('renders the shared run analysis button', () => {
      const button = findRunAnalysisButton();

      expect(button.exists()).toBe(true);
      expect(button.props('dataTestid')).toBe(
        'insufficient-conversations-volume-run-button',
      );
    });
  });
});
