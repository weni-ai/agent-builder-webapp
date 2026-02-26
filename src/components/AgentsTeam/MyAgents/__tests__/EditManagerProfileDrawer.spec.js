import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import { useProfileStore } from '@/store/Profile';
import { useAlertStore } from '@/store/Alert';
import i18n from '@/utils/plugins/i18n';

import EditManagerProfileDrawer from '../EditManagerProfileDrawer.vue';

const pinia = createTestingPinia({
  initialState: {
    profile: {
      status: null,
      isSaving: false,
      name: {
        current: 'Test Agent',
        old: 'Test Agent',
      },
      role: {
        current: 'Test Role',
        old: 'Test Role',
      },
      personality: {
        current: 'Test Personality',
        old: 'Test Personality',
      },
      goal: {
        current: 'Test Goal',
        old: 'Test Goal',
      },
      save: vi.fn().mockResolvedValue({ status: 'success' }),
    },
    alert: {
      data: {},
    },
  },
});

describe('EditManagerProfileDrawer.vue', () => {
  let wrapper;
  let profileStore;
  let alertStore;

  const drawer = () => wrapper.findComponent({ name: 'UnnnicDrawerNext' });
  const drawerContent = () =>
    wrapper.findComponent(
      '[data-testid="edit-manager-profile-drawer-content"]',
    );
  const drawerTitle = () =>
    wrapper.findComponent('[data-testid="edit-manager-profile-drawer-title"]');
  const drawerCloseButton = () =>
    wrapper.findComponent(
      '[data-testid="edit-manager-profile-drawer-close-button"]',
    );
  const drawerSaveButton = () =>
    wrapper.findComponent(
      '[data-testid="edit-manager-profile-drawer-save-button"]',
    );

  const generalInfo = () =>
    wrapper.findComponent('[data-testid="general-info"]');

  beforeEach(() => {
    wrapper = mount(EditManagerProfileDrawer, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [i18n, pinia],
        stubs: {
          UnnnicDrawerNext: false,
        },
      },
    });

    profileStore = useProfileStore();
    alertStore = useAlertStore();
  });

  describe('Component structure', () => {
    it('renders the general info component', () => {
      expect(generalInfo().exists()).toBe(true);
    });
  });

  describe('Props and data binding', () => {
    it('renders the drawer component', () => {
      expect(drawer().exists()).toBe(true);
    });

    it('passes modelValue prop to drawer', () => {
      expect(drawer().props('open')).toBe(true);
    });

    it('passes correct title to drawer', () => {
      const expectedTitle = i18n.global.t('profile.edit_manager_profile');

      expect(drawerTitle().text()).toBe(expectedTitle);
    });

    it('passes correct size to drawer', () => {
      expect(drawerContent().props('size')).toBe('large');
    });

    it('passes correct button texts', () => {
      expect(drawerSaveButton().text()).toBe(i18n.global.t('profile.save_btn'));
      expect(drawerCloseButton().text()).toBe(i18n.global.t('cancel'));
    });

    it('passes store state to drawer buttons', () => {
      expect(drawerSaveButton().props('disabled')).toBe(
        profileStore.isSaveButtonDisabled,
      );
      expect(drawerSaveButton().props('loading')).toBe(profileStore.isSaving);
    });
  });

  describe('Event handling', () => {
    it('emits close event when drawer close is triggered', async () => {
      await drawer().vm.$emit('update:open', false);

      expect(wrapper.vm.modelValue).toBe(false);
    });

    it('emits close event when secondary button is clicked', async () => {
      await drawerCloseButton().trigger('click');

      expect(wrapper.vm.modelValue).toBe(false);
    });

    it('calls save method when primary button is clicked', async () => {
      const saveSpy = vi
        .spyOn(profileStore, 'save')
        .mockResolvedValue({ status: 'success' });
      await drawerSaveButton().trigger('click');

      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('Save functionality', () => {
    it('calls profileStore.save method', async () => {
      const saveSpy = vi
        .spyOn(profileStore, 'save')
        .mockResolvedValue({ status: 'success' });

      await wrapper.vm.save();

      expect(saveSpy).toHaveBeenCalled();
    });

    it('shows success alert and closes drawer on successful save', async () => {
      vi.spyOn(profileStore, 'save').mockResolvedValue({ status: 'success' });
      const alertSpy = vi.spyOn(alertStore, 'add');

      await wrapper.vm.save();

      expect(alertSpy).toHaveBeenCalledWith({
        text: i18n.global.t('profile.save_success'),
        type: 'success',
      });
      expect(wrapper.vm.modelValue).toBe(false);
    });

    it('shows error alert on failed save', async () => {
      vi.spyOn(profileStore, 'save').mockResolvedValue({ status: 'error' });
      const alertSpy = vi.spyOn(alertStore, 'add');

      await wrapper.vm.save();

      expect(alertSpy).toHaveBeenCalledWith({
        text: i18n.global.t('profile.save_error'),
        type: 'error',
      });
    });
  });

  describe('Close with reset functionality', () => {
    it('resets profile store values to old values', () => {
      // Modify current values
      profileStore.name.current = 'Modified Name';
      profileStore.role.current = 'Modified Role';
      profileStore.personality.current = 'Modified Personality';
      profileStore.goal.current = 'Modified Goal';

      wrapper.vm.closeWithReset();

      expect(profileStore.name.current).toBe(profileStore.name.old);
      expect(profileStore.role.current).toBe(profileStore.role.old);
      expect(profileStore.personality.current).toBe(
        profileStore.personality.old,
      );
      expect(profileStore.goal.current).toBe(profileStore.goal.old);
    });

    it('closes the drawer after reset', () => {
      wrapper.vm.closeWithReset();

      expect(wrapper.vm.modelValue).toBe(false);
    });
  });

  describe('Close functionality', () => {
    it('sets modelValue to false', () => {
      wrapper.vm.close();

      expect(wrapper.vm.modelValue).toBe(false);
    });
  });
});
