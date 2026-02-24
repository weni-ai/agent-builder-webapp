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
      <RouterProfileGeneralInfo data-testid="general-info" />
    </template>
  </UnnnicDrawer>
</template>

<script setup>
import i18n from '@/utils/plugins/i18n';

import { useProfileStore } from '@/store/Profile';
import { useAlertStore } from '@/store/Alert';

import RouterProfileGeneralInfo from '@/components/Profile/RouterProfileGeneralInfo.vue';

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
