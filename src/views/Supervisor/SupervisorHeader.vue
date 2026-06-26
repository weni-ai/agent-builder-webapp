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

          <SupervisorHeaderDetails v-if="activeTab === 'conversations'" />
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

    <template
      v-if="featureFlagsStore.flags.conversationsImprovements"
      #tabs
    >
      <UnnnicTabs
        :modelValue="activeTab"
        @update:model-value="router.replace({ name: $event })"
      >
        <UnnnicTabsList>
          <UnnnicTabsTrigger value="conversations">
            {{ $t('audit.conversations.title') }}
          </UnnnicTabsTrigger>
          <UnnnicTabsTrigger value="improvements">
            {{ $t('audit.improvements.title') }}
          </UnnnicTabsTrigger>
        </UnnnicTabsList>
      </UnnnicTabs>
    </template>
  </UnnnicPageHeader>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import SupervisorExportModal from '@/components/Supervisor/SupervisorExportModal.vue';
import SupervisorHeaderDetails from '@/components/Supervisor/SupervisorHeaderDetails.vue';

import { useFeatureFlagsStore } from '@/store/FeatureFlags';

import i18n from '@/utils/plugins/i18n';

const { t } = i18n.global;

const featureFlagsStore = useFeatureFlagsStore();
const router = useRouter();
const route = useRoute();

const activeTab = computed(() => route.name || 'conversations');
const isExportModalOpen = ref(false);

const headerTitle = computed(() => t('audit.title'));
const headerDescription = computed(() => t('audit.description'));
const showExport = computed(() => featureFlagsStore.flags.supervisorExport);

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
