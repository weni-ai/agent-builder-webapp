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
        <form class="custom-analysis-modal__form">
          <p
            class="custom-analysis-modal__description"
            data-testid="custom-analysis-modal-description"
          >
            {{ t('audit.improvements.custom_analysis_modal.description') }}
          </p>

          <section
            class="custom-analysis-modal__form-fields"
            data-testid="custom-analysis-modal-form"
          >
            <UnnnicDisclaimer
              v-if="isLimitReached"
              type="attention"
              :description="
                t('audit.improvements.custom_analysis_modal.limit_disclaimer')
              "
              data-testid="custom-analysis-modal-limit-disclaimer"
            />

            <UnnnicFormElement
              :label="t('audit.improvements.custom_analysis_modal.title_label')"
              :message="
                t('audit.improvements.custom_analysis_modal.title_helper')
              "
            >
              <UnnnicInput
                v-model="titleText"
                data-testid="custom-analysis-modal-title-input"
                :placeholder="
                  t(
                    'audit.improvements.custom_analysis_modal.title_placeholder',
                  )
                "
                :disabled="isLimitReached"
                :maxlength="TITLE_MAX_LENGTH"
              />
              <template #rightMessage
                >{{ titleText.length }}/{{ TITLE_MAX_LENGTH }}</template
              >
            </UnnnicFormElement>

            <UnnnicTextArea
              v-model="definitionText"
              data-testid="custom-analysis-modal-definition-textarea"
              :label="
                t('audit.improvements.custom_analysis_modal.definition_label')
              "
              :placeholder="
                t(
                  'audit.improvements.custom_analysis_modal.definition_placeholder',
                )
              "
              :message="
                t('audit.improvements.custom_analysis_modal.definition_helper')
              "
              :disabled="isLimitReached"
              maxLength="512"
            />

            <UnnnicButton
              class="custom-analysis-modal__add-button"
              data-testid="custom-analysis-modal-add-button"
              type="secondary"
              :text="t('audit.improvements.custom_analysis_modal.add')"
              :disabled="!canSubmit || isLimitReached"
              :loading="createCustomAnalysis.status === 'loading'"
              @click="handleAdd"
            />
          </section>
        </form>

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
            <header class="custom-analysis-modal__list-heading">
              <h3
                class="custom-analysis-modal__list-title"
                data-testid="custom-analysis-modal-list-title"
              >
                {{ t('audit.improvements.custom_analysis_modal.list_heading') }}
              </h3>
              <UnnnicTag
                data-testid="custom-analysis-modal-list-heading-count"
                :text="
                  t(
                    'audit.improvements.custom_analysis_modal.list_heading_count',
                    {
                      count: customAnalysis.data.length,
                      max: MAX_CUSTOM_ANALYSIS,
                    },
                  )
                "
                size="small"
                scheme="neutral"
              />
            </header>

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
import { MAX_CUSTOM_ANALYSIS } from '@/store/types/CustomAnalysisImprovements.types';

import CustomAnalysisImprovementRow from './CustomAnalysisImprovementRow.vue';
import DeleteCustomAnalysisDialog from './DeleteCustomAnalysisDialog.vue';

const open = defineModel<boolean>('open', {
  required: true,
});

const TITLE_MAX_LENGTH = 128;

const { t } = useI18n();
const customAnalysisImprovementsStore = useCustomAnalysisImprovementsStore();
const { customAnalysis, createCustomAnalysis } = storeToRefs(
  customAnalysisImprovementsStore,
);

const titleText = ref('');
const definitionText = ref('');
const deleteTarget = ref<{ uuid: string; title: string } | null>(null);
const isDeleteDialogOpen = ref(false);

const hasCustomAnalysisItems = computed(
  () => customAnalysis.value.data.length > 0,
);

const isLimitReached = computed(
  () => customAnalysis.value.data.length >= MAX_CUSTOM_ANALYSIS,
);

const canSubmit = computed(
  () => titleText.value.trim() && definitionText.value.trim(),
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
  const title = titleText.value.trim();
  const definition = definitionText.value.trim();
  if (!title || !definition || isLimitReached.value) return;

  const result = await customAnalysisImprovementsStore.submitCustomAnalysis({
    title,
    definition,
  });

  if (result.status === 'complete') {
    titleText.value = '';
    definitionText.value = '';
  }
}

watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      customAnalysisImprovementsStore.fetchCustomAnalysis();
      return;
    }

    titleText.value = '';
    definitionText.value = '';
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
  overflow: hidden;

  &__body {
    display: flex;
    flex-direction: column;

    overflow-y: auto;
  }

  &__description {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;

    padding: $unnnic-space-6;
  }

  &__form-fields {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-3;
  }

  &__add-button {
    align-self: flex-start;
  }

  &__list-section {
    border-top: 1px solid $unnnic-color-border-base;

    display: flex;
    flex-direction: column;

    padding: $unnnic-space-6;
  }

  &__list-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $unnnic-space-2;

    border-bottom: 1px solid $unnnic-color-border-base;
    padding-bottom: $unnnic-space-3;
  }

  &__list-title {
    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__empty {
    margin: auto 0;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $unnnic-space-1;

    text-align: center;
    min-height: 100px;
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
