import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import i18n from '@/utils/plugins/i18n';

import NoImprovementIdentified from '../NoImprovementIdentified.vue';

describe('NoImprovementIdentified.vue', () => {
  let wrapper;

  const findTitle = () =>
    wrapper.find('[data-testid="no-improvement-identified-title"]');
  const findTitleEmoji = () =>
    wrapper.find('.no-improvement-identified__emoji');
  const findDescription = () =>
    wrapper.find('[data-testid="no-improvement-identified-description"]');

  beforeEach(() => {
    wrapper = shallowMount(NoImprovementIdentified);
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

    it('renders the title with the emoji and the correct translation', () => {
      expect(findTitleEmoji().text()).toBe('🎉');
      expect(findTitle().text()).toContain(
        i18n.global.t('audit.improvements.no_improvement_identified.title'),
      );
    });

    it('renders the description with the correct translation', () => {
      expect(findDescription().text()).toBe(
        i18n.global.t(
          'audit.improvements.no_improvement_identified.description',
        ),
      );
    });
  });
});
