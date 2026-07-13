import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { formatMonthDayDate } from '@/utils/formatters';

import NoImprovementIdentified from '../NoImprovementIdentified.vue';

describe('NoImprovementIdentified.vue', () => {
  let wrapper;

  const createdAt = '2026-05-18T12:00:00.000Z';

  const findTitle = () =>
    wrapper.find('[data-testid="no-improvement-identified-title"]');
  const findDescription = () =>
    wrapper.find('[data-testid="no-improvement-identified-description"]');

  const createWrapper = () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        Improvements: {
          analysis: {
            status: 'complete',
            task: {
              isRunning: false,
              progress: 5,
              total: 5,
              createdAt,
            },
            yesterdayConversationsCount: 20,
          },
          improvements: {
            data: [],
            status: 'complete',
          },
        },
      },
    });

    wrapper = shallowMount(NoImprovementIdentified, {
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
    it('renders the empty state section', () => {
      expect(
        wrapper.find('[data-testid="no-improvement-identified"]').exists(),
      ).toBe(true);
    });

    it('renders the title with the correct translation', () => {
      expect(findTitle().text()).toBe(
        i18n.global.t('audit.improvements.no_improvement_identified.title'),
      );
    });

    it('renders the description with the analysis date', () => {
      expect(findDescription().text()).toBe(
        i18n.global.t(
          'audit.improvements.no_improvement_identified.description',
          {
            date: formatMonthDayDate(createdAt),
          },
        ),
      );
    });
  });
});
