<template>
  <UnnnicPageHeader hideDivider>
    <template #infos>
      <section class="supervisor-header__infos">
        <h1
          class="supervisor-header__title"
          data-testid="page-title"
        >
          {{ headerTitle }}
        </h1>

        <p
          class="supervisor-header__description"
          data-testid="page-description"
        >
          {{ headerDescription }}

          <SupervisorHeaderDetails />
        </p>
      </section>
    </template>

    <template
      v-if="showExport"
      #actions
    >
      <section class="supervisor-header__actions">
        <UnnnicButton
          iconCenter="open_in_new"
          type="secondary"
          data-testid="export-button"
          @click="openExportModal"
        />
      </section>

      <SupervisorExportModal
        v-model="isExportModalOpen"
        data-testid="export-modal"
      />
    </template>
  </UnnnicPageHeader>
</template>

<script setup>
import SupervisorExportModal from '@/components/Supervisor/SupervisorExportModal.vue';
import SupervisorHeaderDetails from '@/components/Supervisor/SupervisorHeaderDetails.vue';

import { useFeatureFlagsStore } from '@/store/FeatureFlags';

import i18n from '@/utils/plugins/i18n';

import { computed, ref } from 'vue';

const { t } = i18n.global;

const featureFlagsStore = useFeatureFlagsStore();

const headerTitle = computed(() => t('agent_builder.tabs.conversations.title'));

const headerDescription = computed(() =>
  t('agent_builder.tabs.conversations.description'),
);

const showExport = computed(() => featureFlagsStore.flags.supervisorExport);

const isExportModalOpen = ref(false);

function openExportModal() {
  isExportModalOpen.value = true;
}
</script>

<style lang="scss" scoped>
.supervisor-header {
  &__infos {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__title {
    @include unnnic-font-display-1;
    color: $unnnic-color-fg-emphasized;
  }

  &__description {
    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
    justify-content: flex-end;
  }
}
</style>
