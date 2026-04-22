<template>
  <PostUpgradeDisclaimer
    v-if="shouldShowPostUpgradeDisclaimer"
    data-testid="post-upgrade-disclaimer"
  />

  <UpgradeDisclaimer
    v-if="shouldShowUpgradeDisclaimer"
    data-testid="upgrade-disclaimer"
  />

  <ManagerUpgradeCard
    v-else-if="shouldUpgradeManager"
    data-testid="manager-upgrade-card"
  />
</template>

<script setup>
import { onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useManagerSelectorStore } from '@/store/ManagerSelector';

import PostUpgradeDisclaimer from './ManagerSelector/PostUpgradeDisclaimer.vue';
import UpgradeDisclaimer from './ManagerSelector/UpgradeDisclaimer.vue';
import ManagerUpgradeCard from './ManagerSelector/ManagerUpgradeCard.vue';

const managerSelectorStore = useManagerSelectorStore();
const {
  shouldUpgradeManager,
  shouldShowUpgradeDisclaimer,
  shouldShowPostUpgradeDisclaimer,
} = storeToRefs(managerSelectorStore);

onUnmounted(() => {
  managerSelectorStore.resetPostUpgradeDisclaimerSession();
});
</script>
