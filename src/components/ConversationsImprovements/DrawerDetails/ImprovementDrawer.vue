<template>
  <UnnnicDrawerNext
    v-model:open="drawerOpen"
    data-testid="improvement-drawer"
  >
    <UnnnicDrawerContent size="large">
      <UnnnicDrawerHeader>
        <UnnnicDrawerTitle data-testid="improvement-drawer-title">
          {{ improvement?.text }}
        </UnnnicDrawerTitle>

        <section class="improvement-drawer__header-info">
          <UnnnicTag
            class="improvement-drawer__type"
            data-testid="improvement-drawer-type"
            :scheme="typeTag.scheme"
            :text="typeTag.text"
          />

          <p
            class="improvement-drawer__conversations-count"
            data-testid="improvement-drawer-conversations-count"
          >
            {{
              t('audit.improvements.drawer.affected_conversations_count', {
                count: improvement?.conversationsCount ?? 0,
              })
            }}
          </p>
        </section>
      </UnnnicDrawerHeader>

      <section
        class="improvement-drawer"
        data-testid="improvement-drawer-content"
      >
        <ImprovementDrawerSection
          testId="diagnosis"
          :title="$t('audit.improvements.drawer.diagnosis_title')"
        >
          <p data-testid="improvement-drawer-diagnosis-description">
            {{ improvementDetail?.description }}
          </p>
        </ImprovementDrawerSection>

        <SuggestedSolutionSection />

        <AffectedConversationsSection
          :open="drawerOpen"
          :improvementUuid="improvement?.uuid ?? null"
          @close-drawer="drawerOpen = false"
        />
      </section>

      <UnnnicDrawerFooter>
        <UnnnicButton
          data-testid="improvement-drawer-ignore-button"
          :text="$t('audit.improvements.drawer.ignore_improvement')"
          type="tertiary"
          @click="openStatusDialog('ignored')"
        />
        <UnnnicButton
          data-testid="improvement-drawer-mark-resolved-button"
          :text="$t('audit.improvements.drawer.mark_as_resolved')"
          type="primary"
          @click="openStatusDialog('resolved')"
        />
      </UnnnicDrawerFooter>
    </UnnnicDrawerContent>

    <ImprovementStatusDialog
      v-model:open="isStatusDialogOpen"
      :status="statusDialogStatus"
      :improvementUuid="improvement?.uuid ?? null"
      @success="handleStatusUpdateSuccess"
    />
  </UnnnicDrawerNext>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useImprovementsStore } from '@/store/Improvements';
import { getImprovementTypeTag } from '@/utils/improvements/getImprovementTypeTag';

import ImprovementStatusDialog from './ImprovementStatusDialog.vue';
import SuggestedSolutionSection from './SuggestedSolutionSection.vue';
import AffectedConversationsSection from './AffectedConversationsSection.vue';
import ImprovementDrawerSection from './ImprovementDrawerSection.vue';

import type {
  Improvement,
  ImprovementStatus,
} from '@/store/types/Improvements.types';

const drawerOpen = defineModel<boolean>('open', {
  required: true,
});

const props = defineProps<{
  improvement: Improvement | null;
}>();

const { t } = useI18n();
const improvementsStore = useImprovementsStore();
const improvementDetail = computed(
  () => improvementsStore.improvementDetail.data,
);

const isStatusDialogOpen = ref(false);
const statusDialogStatus = ref<ImprovementStatus>('ignored');

function openStatusDialog(status: ImprovementStatus) {
  statusDialogStatus.value = status;
  isStatusDialogOpen.value = true;
}

function handleStatusUpdateSuccess() {
  drawerOpen.value = false;
}

watch(
  () => [drawerOpen.value, props.improvement?.uuid] as const,
  ([open, improvementUuid]) => {
    if (open && improvementUuid) {
      improvementsStore.fetchImprovementDetail(improvementUuid);
      return;
    }

    if (!open) {
      improvementsStore.resetImprovementDetail();
    }
  },
  { immediate: true },
);

const typeTag = computed(() => {
  const { category, scheme } = getImprovementTypeTag(props.improvement?.type);

  return {
    scheme,
    text: t(`audit.improvements.types.${category}`),
  };
});
</script>

<style scoped lang="scss">
.improvement-drawer {
  padding: $unnnic-space-6;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;

  overflow-y: auto;

  &__header-info {
    margin-top: $unnnic-space-1;

    display: flex;
    gap: $unnnic-space-3;
    align-items: center;
  }

  &__conversations-count {
    @include unnnic-font-caption-1;
    color: $unnnic-color-fg-base;
  }

  &__section-description {
    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
