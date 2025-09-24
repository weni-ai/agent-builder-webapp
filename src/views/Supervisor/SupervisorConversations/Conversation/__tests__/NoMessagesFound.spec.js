import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { useProjectStore } from '@/store/Project';

import NoMessagesFound from '../NoMessagesFound.vue';

vi.stubEnv('CONNECT_URL', 'https://connect.example.com');

vi.mock('@/store/Project', () => ({
  useProjectStore: vi.fn().mockReturnValue({
    uuid: 'test-project-uuid-123',
  }),
}));

describe('NoMessagesFound.vue', () => {
  let wrapper;

  const pinia = createTestingPinia({ stubActions: false });

  const icon = () => wrapper.findComponent('[data-testid="no-messages-icon"]');
  const title = () =>
    wrapper.findComponent('[data-testid="no-messages-title"]');
  const description = () =>
    wrapper.findComponent('[data-testid="no-messages-description"]');
  const descriptionI18n = () =>
    wrapper.findComponent('[data-testid="no-messages-description-i18n"]');
  const studioLink = () => wrapper.find('[data-testid="studio-link"]');

  const createWrapper = () => {
    return mount(NoMessagesFound, {
      global: {
        plugins: [pinia],
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('should match snapshot', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders correctly with all required elements', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.no-messages-found').exists()).toBe(true);
    });

    it('renders the search_off icon with correct scheme', () => {
      expect(icon().exists()).toBe(true);
      expect(icon().props('icon')).toBe('sms');
      expect(icon().props('scheme')).toBe('neutral-soft');
      expect(icon().classes()).toContain('no-messages-found__icon');
    });

    it('renders the title with correct translation key', () => {
      expect(title().props('tag')).toBe('p');
      expect(title().props('color')).toBe('neutral-cloudy');
      expect(title().props('family')).toBe('secondary');
      expect(title().props('size')).toBe('body-gt');
      expect(title().props('weight')).toBe('regular');
      expect(title().classes()).toContain('no-messages-found__title');
    });

    it('renders the description with i18n-t component', () => {
      expect(description().exists()).toBe(true);
      expect(descriptionI18n().exists()).toBe(true);
      expect(descriptionI18n().props('keypath')).toBe(
        'agent_builder.supervisor.no_messages_found.description',
      );
      expect(descriptionI18n().props('tag')).toBe('p');
    });

    it('renders the studio link with correct attributes', () => {
      expect(studioLink().exists()).toBe(true);
      expect(studioLink().attributes('target')).toBe('_blank');
      expect(studioLink().classes()).toContain('no-messages-found__link');
    });
  });

  describe('Link construction', () => {
    it('constructs the correct studio link URL using env and project store', () => {
      const expectedUrl =
        'https://connect.example.com/projects/test-project-uuid-123/studio/contact';

      expect(studioLink().attributes('href')).toBe(expectedUrl);
      expect(studioLink().exists()).toBe(true);
    });

    it('handles different project UUID values correctly', async () => {
      const expectedUrl =
        'https://connect.example.com/projects/different-project-uuid/studio/contact';

      vi.mocked(useProjectStore).mockImplementationOnce(() => ({
        uuid: 'different-project-uuid',
      }));
      wrapper = createWrapper();

      expect(studioLink().attributes('href')).toBe(expectedUrl);
    });
  });

  describe('Accessibility and external link behavior', () => {
    it('opens the studio link in a new tab', () => {
      expect(studioLink().attributes('target')).toBe('_blank');
    });
  });
});
