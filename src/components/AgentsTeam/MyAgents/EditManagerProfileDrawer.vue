<template>
  <UnnnicDrawer
    data-testid="edit-manager-profile-drawer"
    :modelValue="modelValue"
    :title="$t('profile.edit_manager_profile')"
    size="lg"
    :primaryButtonText="$t('profile.save_btn')"
    :secondaryButtonText="$t('cancel')"
    :disabledPrimaryButton="isSaveDisabled"
    :loadingPrimaryButton="isSavingDrawer"
    @close="closeWithReset"
    @primary-button-click="save"
    @secondary-button-click="closeWithReset"
  >
    <template #content>
      <section class="edit-manager-profile-drawer">
        <UnnnicSegmentedControl
          v-model="selectedTab"
          data-testid="edit-manager-profile-drawer-tabs"
          class="edit-manager-profile-drawer__tabs"
        >
          <UnnnicSegmentedControlList>
            <UnnnicSegmentedControlTrigger
              v-for="tab in drawerTabs"
              :key="tab"
              :value="tab"
            >
              {{ $t(`profile.tabs.${tab}`) }}
            </UnnnicSegmentedControlTrigger>
          </UnnnicSegmentedControlList>
        </UnnnicSegmentedControl>

        <section
          data-testid="edit-manager-profile-drawer-content"
          class="edit-manager-profile-drawer__content"
        >
          <RouterProfileGeneralInfo
            v-if="selectedTab === 'profile'"
            data-testid="general-info"
          />
          <SettingsAgentsTeam
            v-else-if="selectedTab === 'settings'"
            data-testid="settings-agents-team"
          />
        </section>
      </section>
    </template>
  </UnnnicDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import i18n from '@/utils/plugins/i18n';

import { useProfileStore } from '@/store/Profile';
import { useTuningsStore } from '@/store/Tunings';
import { useAlertStore } from '@/store/Alert';

import RouterProfileGeneralInfo from '@/components/Profile/RouterProfileGeneralInfo.vue';
import SettingsAgentsTeam from '@/components/Tunings/SettingsAgentsTeam/index.vue';

const selectedTab = ref('profile');
const drawerTabs = ['profile', 'settings'];

const modelValue = defineModel({
  type: Boolean,
  required: true,
});

const profileStore = useProfileStore();
const tuningsStore = useTuningsStore();
const alertStore = useAlertStore();

const hasProfileChanges = computed(() => !profileStore.isSaveButtonDisabled);
const hasSettingsChanges = computed(() => tuningsStore.isSettingsValid);

const isSaveDisabled = computed(
  () => !hasProfileChanges.value && !hasSettingsChanges.value,
);

const isSavingDrawer = computed(
  () => profileStore.isSaving || tuningsStore.settings.status === 'loading',
);

async function save() {
  let hasError = false;

  if (hasProfileChanges.value) {
    const profileResult = await profileStore.save();
    if (profileResult?.status !== 'success') {
      hasError = true;
      alertStore.add({
        text: i18n.global.t('profile.save_error'),
        type: 'error',
      });
    }
  }

  if (!hasError && hasSettingsChanges.value) {
    const settingsSaved = await tuningsStore.saveSettings();
    if (!settingsSaved) {
      hasError = true;
      alertStore.add({
        text: i18n.global.t('router.tunings.settings.save_error'),
        type: 'error',
      });
    }
  }

  if (!hasError) {
    close();
    alertStore.add({
      text: i18n.global.t('profile.save_success'),
      type: 'success',
    });
  }
}

function close() {
  modelValue.value = false;
}

function closeWithReset() {
  profileStore.personality.current = profileStore.personality.old;
  profileStore.role.current = profileStore.role.old;
  profileStore.goal.current = profileStore.goal.old;
  profileStore.name.current = profileStore.name.old;

  if (tuningsStore.initialSettings) {
    tuningsStore.settings.data = { ...tuningsStore.initialSettings };
  }

  close();
}

watch(
  () => selectedTab.value,
  (newTab) => {
    if (newTab === 'settings' && tuningsStore.settings.status !== 'success') {
      tuningsStore.fetchSettings();
    }
  },
);
</script>

<style lang="scss" scoped>
.edit-manager-profile-drawer {
  height: 100%;

  display: flex;
  flex-direction: column;

  &__tabs {
    margin-bottom: $unnnic-space-4;
  }

  &__content {
    overflow: hidden auto;

    padding-bottom: $unnnic-space-6;

    /* Add padding to the right of the content to avoid the scrollbar */
    padding-right: $unnnic-space-4;
    margin-right: -$unnnic-space-4;
  }
}
</style>
