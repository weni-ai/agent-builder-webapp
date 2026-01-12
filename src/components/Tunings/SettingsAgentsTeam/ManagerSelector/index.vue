<template>
  <section class="manager-selector">
    <UpgradeDisclaimer
      v-if="shouldShowUpgradeDisclaimer"
      data-testid="upgrade-disclaimer"
    />

    <ManagerUpgradeCard
      v-else-if="shouldUpgradeManager"
      data-testid="manager-upgrade-card"
    />

    <h2
      class="manager-selector__title"
      data-testid="manager-selector-title"
    >
      {{ $t('agent_builder.tunings.manager.title') }}
    </h2>
    <UnnnicRadioGroup
      state="vertical"
      :modelValue="selectedManager"
      data-testid="manager-selector-radio-group"
      @update:model-value="updateSelectedManager"
    >
      <section class="manager-selector__new-manager">
        <UnnnicRadio
          data-testid="manager-selector-radio-new"
          :label="managers.new.label"
          :value="managers.new.id"
          :helper="$t('agent_builder.tunings.manager.recommended')"
        />

        <p
          class="manager-selector__new-tag"
          data-testid="manager-selector-radio-new-tag"
        >
          {{ $t('agent_builder.tunings.manager.new') }}
        </p>
      </section>

      <UnnnicRadio
        data-testid="manager-selector-radio-legacy"
        :label="managers.legacy.label"
        :value="managers.legacy.id"
        :helper="$t('agent_builder.tunings.manager.legacy_model')"
      />
    </UnnnicRadioGroup>
  </section>
</template>

<script setup>
import { computed, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useManagerSelectorStore } from '@/store/ManagerSelector';

import ManagerUpgradeCard from './ManagerUpgradeCard.vue';
import UpgradeDisclaimer from './UpgradeDisclaimer.vue';

const managerSelectorStore = useManagerSelectorStore();
const { resetPostUpgradeDisclaimerSession } = managerSelectorStore;
const {
  options,
  selectedManager,
  shouldUpgradeManager,
  shouldShowUpgradeDisclaimer,
} = storeToRefs(managerSelectorStore);

const managers = computed(() => options.value?.managers);

const updateSelectedManager = (managerId) => {
  managerSelectorStore.setSelectedManager(managerId);
};

onUnmounted(() => {
  resetPostUpgradeDisclaimerSession();
});
</script>

<style lang="scss" scoped>
.manager-selector {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__title {
    font: $unnnic-font-display-3;
    color: $unnnic-color-neutral-darkest;
  }

  &__new-manager {
    display: flex;
    align-items: flex-start;
    gap: $unnnic-space-2;
  }

  &__new-tag {
    border-radius: $unnnic-radius-1;

    padding: $unnnic-space-05 $unnnic-space-1;

    background-color: $unnnic-color-teal-100;
    color: $unnnic-color-fg-active;
    font: $unnnic-font-caption-1;
  }
}
</style>
