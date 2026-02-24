import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import { createTestingPinia } from '@pinia/testing';
import i18n from '@/utils/plugins/i18n';

import ManagerCard from '../ManagerCard.vue';

const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const defaultProfileState = {
  status: null,
  name: { current: '', old: 'Manager Name' },
  goal: { current: '', old: 'Manager goal description' },
};

describe('ManagerCard.vue', () => {
  let wrapper;
  let pinia;

  const createWrapper = (initialState = {}) => {
    pinia = createTestingPinia({
      initialState: {
        profile: {
          ...defaultProfileState,
          ...initialState,
        },
      },
    });

    wrapper = shallowMount(ManagerCard, {
      global: {
        plugins: [pinia],
      },
    });
  };

  const findCard = () => wrapper.find('[data-testid="manager-card"]');
  const findSkeleton = () =>
    wrapper.findComponent('[data-testid="manager-card-skeleton"]');
  const findIcon = () => wrapper.findComponent('[data-testid="agent-icon"]');
  const findTitle = () => wrapper.find('[data-testid="title"]');
  const findTag = () => wrapper.findComponent('[data-testid="agent-tag"]');
  const findDescription = () => wrapper.find('[data-testid="description"]');
  const findEditManagerButton = () =>
    wrapper.findComponent('[data-testid="edit-manager-button"]');
  const findEditInstructionsButton = () =>
    wrapper.findComponent('[data-testid="edit-instructions-button"]');
  const findDrawer = () =>
    wrapper.findComponent('[data-testid="edit-manager-profile-drawer"]');

  beforeEach(() => {
    mockPush.mockClear();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders skeleton when profile is loading', () => {
      createWrapper({ status: 'loading' });

      expect(findSkeleton().exists()).toBe(true);
      expect(findIcon().exists()).toBe(false);
    });

    it('applies manager-card--loading class when loading', () => {
      createWrapper({ status: 'loading' });

      expect(findCard().classes()).toContain('manager-card--loading');
    });

    it('does not render skeleton when profile is not loading', () => {
      createWrapper();

      expect(findSkeleton().exists()).toBe(false);
    });
  });

  describe('content when not loading', () => {
    it('renders manager name from profile store', () => {
      createWrapper();

      expect(findTitle().exists()).toBe(true);
      expect(findTitle().text()).toBe('Manager Name');
    });

    it('renders agent icon with manager icon', () => {
      createWrapper();

      expect(findIcon().exists()).toBe(true);
      expect(findIcon().props('icon')).toBe('Manager');
    });

    it('renders manager tag with translated text', () => {
      createWrapper();

      expect(findTag().exists()).toBe(true);
      expect(findTag().props('text')).toBe(
        i18n.global.t('agents.assigned_agents.manager.name'),
      );
    });

    it('renders description when profile has goal', () => {
      createWrapper();

      expect(findDescription().exists()).toBe(true);
      expect(findDescription().text()).toBe('Manager goal description');
    });

    it('does not render description when profile goal is empty', () => {
      createWrapper({
        name: { current: '', old: 'Manager Name' },
        goal: { current: '', old: '' },
      });

      expect(findDescription().exists()).toBe(false);
    });
  });

  describe('actions', () => {
    it('renders edit manager and edit instructions buttons with correct labels', () => {
      createWrapper();

      expect(findEditManagerButton().exists()).toBe(true);
      expect(findEditInstructionsButton().exists()).toBe(true);
      expect(findEditManagerButton().props('text')).toBe(
        i18n.global.t('agents.assigned_agents.manager.edit_manager'),
      );
      expect(findEditInstructionsButton().props('text')).toBe(
        i18n.global.t('agents.assigned_agents.manager.edit_instructions'),
      );
    });

    it('opens edit manager drawer when edit manager button is clicked', async () => {
      createWrapper();

      expect(findDrawer().props('modelValue')).toBe(false);

      await findEditManagerButton().trigger('click');
      await nextTick();

      expect(findDrawer().props('modelValue')).toBe(true);
    });

    it('navigates to instructions view when edit instructions button is clicked', async () => {
      createWrapper();

      await findEditInstructionsButton().trigger('click');

      expect(mockPush).toHaveBeenCalledWith({ name: 'instructions' });
    });
  });

  describe('EditManagerProfileDrawer', () => {
    it('renders edit manager profile drawer', () => {
      createWrapper();

      expect(findDrawer().exists()).toBe(true);
    });

    it('closes drawer when drawer emits update:modelValue false', async () => {
      createWrapper();
      await findEditManagerButton().trigger('click');
      await nextTick();

      expect(findDrawer().props('modelValue')).toBe(true);

      await findDrawer().vm.$emit('update:modelValue', false);
      await nextTick();

      expect(findDrawer().props('modelValue')).toBe(false);
    });
  });
});
