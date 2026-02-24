<template>
  <UnnnicDrawer
    data-testid="edit-manager-profile-drawer"
    :modelValue="modelValue"
    :title="$t('profile.edit_manager_profile')"
    size="lg"
    :primaryButtonText="$t('profile.save_btn')"
    :secondaryButtonText="$t('cancel')"
    :disabledPrimaryButton="profileStore.isSaveButtonDisabled"
    :loadingPrimaryButton="profileStore.isSaving"
    @close="closeWithReset"
    @primary-button-click="save"
    @secondary-button-click="closeWithReset"
  >
    <template #content>
      <div class="edit-manager-profile-drawer">
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
      </div>
    </template>
  </UnnnicDrawer>
</template>

<script setup>
import { ref } from 'vue';
import i18n from '@/utils/plugins/i18n';

import { useProfileStore } from '@/store/Profile';
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
const alertStore = useAlertStore();

async function save() {
  const result = await profileStore.save();

  if (result.status === 'success') {
    close();
    alertStore.add({
      text: i18n.global.t('profile.save_success'),
      type: 'success',
    });
  } else {
    alertStore.add({
      text: i18n.global.t('profile.save_error'),
      type: 'error',
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

  close();
}
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
