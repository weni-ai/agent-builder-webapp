<template>
  <UnnnicDialog
    data-testid="custom-analysis-modal"
    :open="open"
    lazyMount
    @update:open="handleOpenChange"
  >
    <UnnnicDialogContent size="large">
      <UnnnicDialogHeader>
        <UnnnicDialogTitle data-testid="custom-analysis-modal-title">
          {{ t('audit.improvements.custom_analysis_modal.title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section class="custom-analysis-modal__body">
        <p
          class="custom-analysis-modal__description"
          data-testid="custom-analysis-modal-description"
        >
          {{ t('audit.improvements.custom_analysis_modal.description') }}
        </p>

        <section
          class="custom-analysis-modal__form"
          data-testid="custom-analysis-modal-form"
        >
          <UnnnicTextArea
            v-model="inputText"
            data-testid="custom-analysis-modal-textarea"
            :label="t('audit.improvements.custom_analysis_modal.input_label')"
            :placeholder="
              t('audit.improvements.custom_analysis_modal.input_placeholder')
            "
            :message="
              t('audit.improvements.custom_analysis_modal.input_helper')
            "
            maxLength="512"
          />

          <UnnnicButton
            class="custom-analysis-modal__add-button"
            data-testid="custom-analysis-modal-add-button"
            type="secondary"
            :text="t('audit.improvements.custom_analysis_modal.add')"
            :disabled="!inputText.trim()"
            :loading="createCustomAnalysis.status === 'loading'"
            @click="handleAdd"
          />
        </section>

        <section
          class="custom-analysis-modal__list-section"
          data-testid="custom-analysis-modal-list-section"
        >
          <template v-if="customAnalysis.status === 'loading'">
            <UnnnicSkeletonLoading
              v-for="index in 3"
              :key="index"
              tag="div"
              width="100%"
              height="64px"
              :data-testid="`custom-analysis-modal-skeleton-${index}`"
            />
          </template>

          <template v-else-if="hasCustomAnalysisItems">
            <h3
              class="custom-analysis-modal__list-heading"
              data-testid="custom-analysis-modal-list-heading"
            >
              {{
                t('audit.improvements.custom_analysis_modal.list_heading', {
                  count: customAnalysis.data.length,
                })
              }}
            </h3>

            <CustomAnalysisImprovementRow
              v-for="item in customAnalysis.data"
              :key="item.uuid"
              :customAnalysis="item"
              data-testid="custom-analysis-modal-row"
              @delete="openDeleteDialog"
            />
          </template>

          <template v-else>
            <section
              class="custom-analysis-modal__empty"
              data-testid="custom-analysis-modal-empty"
            >
              <p class="custom-analysis-modal__empty-title">
                {{ t('audit.improvements.custom_analysis_modal.empty_title') }}
              </p>
              <p class="custom-analysis-modal__empty-description">
                {{
                  t(
                    'audit.improvements.custom_analysis_modal.empty_description',
                  )
                }}
              </p>
            </section>
          </template>
        </section>
      </section>
    </UnnnicDialogContent>
  </UnnnicDialog>

  <DeleteCustomAnalysisDialog
    v-if="deleteTarget"
    v-model:open="isDeleteDialogOpen"
    data-testid="custom-analysis-modal-delete-dialog"
    :customAnalysisUuid="deleteTarget.uuid"
    :customAnalysisTitle="deleteTarget.title"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import { useCustomAnalysisImprovementsStore } from '@/store/CustomAnalysisImprovements';

import CustomAnalysisImprovementRow from './CustomAnalysisImprovementRow.vue';
import DeleteCustomAnalysisDialog from './DeleteCustomAnalysisDialog.vue';

const open = defineModel<boolean>('open', {
  required: true,
});

const { t } = useI18n();
const customAnalysisImprovementsStore = useCustomAnalysisImprovementsStore();
const { customAnalysis, createCustomAnalysis } = storeToRefs(
  customAnalysisImprovementsStore,
);

const inputText = ref('');
const deleteTarget = ref<{ uuid: string; title: string } | null>(null);
const isDeleteDialogOpen = ref(false);

const hasCustomAnalysisItems = computed(
  () => customAnalysis.value.data.length > 0,
);

function handleOpenChange(value: boolean) {
  open.value = value;
}

function openDeleteDialog(customAnalysisUuid: string) {
  const item = customAnalysis.value.data.find(
    (entry) => entry.uuid === customAnalysisUuid,
  );

  if (!item) return;

  deleteTarget.value = {
    uuid: item.uuid,
    title: item.title,
  };
  isDeleteDialogOpen.value = true;
}

async function handleAdd() {
  const text = inputText.value.trim();
  if (!text) return;

  const result =
    await customAnalysisImprovementsStore.submitCustomAnalysis(text);

  if (result.status === 'complete') {
    inputText.value = '';
  }
}

watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      customAnalysisImprovementsStore.fetchCustomAnalysis();
      return;
    }

    inputText.value = '';
    deleteTarget.value = null;
    isDeleteDialogOpen.value = false;
  },
);

watch(isDeleteDialogOpen, (isOpen) => {
  if (!isOpen) {
    deleteTarget.value = null;
  }
});
</script>

<style scoped lang="scss">
.custom-analysis-modal {
  &__body {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-6;
    padding: $unnnic-space-6;
  }

  &__description {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__add-button {
    align-self: flex-start;
  }

  &__list-section {
    display: flex;
    flex-direction: column;
  }

  &__list-heading {
    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;

    border-bottom: 1px solid $unnnic-color-border-base;
    padding-bottom: $unnnic-space-3;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $unnnic-space-2;
    min-height: 100px;
    text-align: center;
  }

  &__empty-title {
    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__empty-description {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-muted;
  }
}
</style>
