import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import { useProfileStore } from '@/store/Profile';
import { useAlertStore } from '@/store/Alert';
import { useTuningsStore } from '@/store/Tunings';
import i18n from '@/utils/plugins/i18n';

import EditManagerProfileDrawer from '../EditManagerProfileDrawer.vue';

const defaultSettingsData = {
  components: false,
  progressiveFeedback: false,
  manager: '',
};

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
    Tunings: {
      settings: {
        status: null,
        data: { ...defaultSettingsData },
      },
      initialSettings: null,
    },
  },
});

describe('EditManagerProfileDrawer.vue', () => {
  let wrapper;
  let profileStore;
  let alertStore;
  let tuningsStore;

  const drawer = () => wrapper.findComponent({ name: 'UnnnicDrawerNext' });
  const drawerContent = () =>
    wrapper.findComponent(
      '[data-testid="edit-manager-profile-drawer-content"]',
    );
  const drawerTitle = () =>
    wrapper.find('[data-testid="edit-manager-profile-drawer-title"]');
  const drawerCloseButton = () =>
    wrapper.findComponent(
      '[data-testid="edit-manager-profile-drawer-close-button"]',
    );
  const drawerSaveButton = () =>
    wrapper.findComponent(
      '[data-testid="edit-manager-profile-drawer-save-button"]',
    );
  const tabs = () =>
    wrapper.find('[data-testid="edit-manager-profile-drawer-tabs"]');
  const generalInfo = () =>
    wrapper.findComponent('[data-testid="general-info"]');
  const settingsAgentsTeam = () =>
    wrapper.findComponent('[data-testid="settings-agents-team"]');

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mount(EditManagerProfileDrawer, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [i18n, pinia],
        stubs: {
          UnnnicDrawerNext: false,
          SettingsAgentsTeam: true,
        },
      },
    });

    profileStore = useProfileStore();
    alertStore = useAlertStore();
    tuningsStore = useTuningsStore();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component structure', () => {
    it('renders the general info component', () => {
      expect(generalInfo().exists()).toBe(true);
    });

    it('renders the tabs control', () => {
      expect(tabs().exists()).toBe(true);
    });
  });

  describe('Props and data binding', () => {
    it('renders the drawer component', () => {
      expect(drawer().exists()).toBe(true);
    });

    it('passes modelValue prop to drawer', () => {
      expect(drawer().props('open')).toBe(true);
    });

    it('passes open false to drawer when modelValue is false', () => {
      wrapper = mount(EditManagerProfileDrawer, {
        props: { modelValue: false },
        global: {
          plugins: [i18n, pinia],
          stubs: { UnnnicDrawerNext: false },
        },
      });
      expect(drawer().props('open')).toBe(false);
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

    it('save button disabled prop reflects isSaveDisabled computed (no profile and no settings changes)', async () => {
      profileStore.name.current = profileStore.name.old;
      profileStore.role.current = profileStore.role.old;
      profileStore.personality.current = profileStore.personality.old;
      profileStore.goal.current = profileStore.goal.old;
      tuningsStore.initialSettings = null;
      tuningsStore.settings.data = { ...defaultSettingsData };
      await nextTick();
      const expectedDisabled =
        profileStore.isSaveButtonDisabled && !tuningsStore.isSettingsValid;
      expect(drawerSaveButton().props('disabled')).toBe(expectedDisabled);
    });

    it('save button is not disabled when tuningsStore has settings changes', async () => {
      tuningsStore.initialSettings = { ...defaultSettingsData };
      tuningsStore.settings.data = { ...defaultSettingsData, manager: 'other' };
      await nextTick();
      expect(drawerSaveButton().props('disabled')).toBe(false);
    });

    it('save button shows loading when tuningsStore.settings.status is loading', async () => {
      tuningsStore.settings.status = 'loading';
      await nextTick();
      expect(drawerSaveButton().props('loading')).toBe(true);
    });
  });

  describe('Tab content', () => {
    it('shows general-info when tab is profile and does not show settings-agents-team', () => {
      expect(generalInfo().exists()).toBe(true);
      expect(settingsAgentsTeam().exists()).toBe(false);
    });

    it('shows settings-agents-team when tab is settings', async () => {
      wrapper.vm.selectedTab = 'settings';
      await nextTick();
      expect(settingsAgentsTeam().exists()).toBe(true);
      expect(generalInfo().exists()).toBe(false);
    });

    it('calls tuningsStore.fetchSettings when switching to settings tab and settings.status is not success', async () => {
      tuningsStore.settings.status = null;
      wrapper.vm.selectedTab = 'settings';
      await nextTick();
      expect(tuningsStore.fetchSettings).toHaveBeenCalled();
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
      profileStore.name.current = 'Modified Name';
      await nextTick();

      const saveSpy = vi
        .spyOn(profileStore, 'save')
        .mockResolvedValue({ status: 'success' });
      await drawerSaveButton().trigger('click');

      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('Save functionality', () => {
    it('calls profileStore.save method', async () => {
      profileStore.name.current = 'Modified Name';
      await nextTick();

      const saveSpy = vi
        .spyOn(profileStore, 'save')
        .mockResolvedValue({ status: 'success' });

      await wrapper.vm.save();

      expect(saveSpy).toHaveBeenCalled();
    });

    it('shows success alert and closes drawer on successful save', async () => {
      profileStore.name.current = 'Modified Name';
      await nextTick();

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
      profileStore.name.current = 'Modified Name';
      await nextTick();

      vi.spyOn(profileStore, 'save').mockResolvedValue({ status: 'error' });
      const alertSpy = vi.spyOn(alertStore, 'add');

      await wrapper.vm.save();

      expect(alertSpy).toHaveBeenCalledWith({
        text: i18n.global.t('profile.save_error'),
        type: 'error',
      });
    });

    it('saves only settings when no profile changes and settings have changes', async () => {
      profileStore.name.current = profileStore.name.old;
      profileStore.role.current = profileStore.role.old;
      profileStore.personality.current = profileStore.personality.old;
      profileStore.goal.current = profileStore.goal.old;
      profileStore.save.mockClear();

      tuningsStore.initialSettings = { ...defaultSettingsData };
      tuningsStore.settings.data = { ...defaultSettingsData, manager: 'other' };
      tuningsStore.saveSettings.mockResolvedValue(true);
      const alertSpy = vi.spyOn(alertStore, 'add');

      await wrapper.vm.save();

      expect(profileStore.save).not.toHaveBeenCalled();
      expect(tuningsStore.saveSettings).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith({
        text: i18n.global.t('profile.save_success'),
        type: 'success',
      });
      expect(wrapper.vm.modelValue).toBe(false);
    });

    it('shows settings save error and does not close when saveSettings fails', async () => {
      profileStore.name.current = profileStore.name.old;
      profileStore.role.current = profileStore.role.old;
      profileStore.personality.current = profileStore.personality.old;
      profileStore.goal.current = profileStore.goal.old;

      tuningsStore.initialSettings = { ...defaultSettingsData };
      tuningsStore.settings.data = { ...defaultSettingsData, manager: 'other' };
      tuningsStore.saveSettings.mockResolvedValue(false);
      const alertSpy = vi.spyOn(alertStore, 'add');

      await wrapper.vm.save();

      expect(alertSpy).toHaveBeenCalledWith({
        text: i18n.global.t('router.tunings.settings.save_error'),
        type: 'error',
      });
      expect(wrapper.vm.modelValue).toBe(true);
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

    it('resets tuningsStore.settings.data to initialSettings when initialSettings exists', () => {
      const initial = {
        components: true,
        progressiveFeedback: true,
        manager: 'initial-manager',
      };
      tuningsStore.initialSettings = { ...initial };
      tuningsStore.settings.data = {
        components: false,
        progressiveFeedback: false,
        manager: 'modified',
      };

      wrapper.vm.closeWithReset();

      expect(tuningsStore.settings.data).toEqual(
        expect.objectContaining(initial),
      );
    });
  });

  describe('Drawer close integration', () => {
    it('resets profile and closes when drawer emits update:open false', async () => {
      profileStore.name.current = 'Modified Name';
      profileStore.role.current = 'Modified Role';

      await drawer().vm.$emit('update:open', false);

      expect(profileStore.name.current).toBe(profileStore.name.old);
      expect(profileStore.role.current).toBe(profileStore.role.old);
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
