<template>
  <UnnnicDialog
    data-testid="improvements-intro-modal"
    :open="open"
    lazyMount
    @update:open="handleOpenChange"
  >
    <UnnnicDialogContent size="large">
      <UnnnicDialogHeader
        class="improvements-intro-modal__header"
        :closeButton="false"
      >
        <UnnnicDialogTitle data-testid="improvements-intro-modal-title">
          {{ $t('audit.improvements.title') }}
        </UnnnicDialogTitle>

        <UnnnicTag
          data-testid="improvements-intro-modal-step-tag"
          :text="
            $t('audit.improvements.intro_modal.step_of', {
              step: currentStep,
              total: TOTAL_STEPS,
            })
          "
          scheme="gray"
        />

        <div class="improvements-intro-modal__header-actions">
          <UnnnicButton
            data-testid="improvements-intro-modal-help-guide"
            type="secondary"
            size="small"
            :text="$t('audit.improvements.intro_modal.view_help_guide')"
            @click="handleViewHelpGuide"
          />

          <UnnnicDialogClose>
            <UnnnicButton
              data-testid="improvements-intro-modal-close"
              type="tertiary"
              size="small"
              iconCenter="close"
            />
          </UnnnicDialogClose>
        </div>
      </UnnnicDialogHeader>

      <section
        class="improvements-intro-modal__body"
        data-testid="improvements-intro-modal-body"
      >
        <div class="improvements-intro-modal__illustration">
          <img
            data-testid="improvements-intro-modal-illustration"
            :src="activeStep.illustration"
            :alt="t(activeStep.titleKey)"
          />
        </div>

        <div class="improvements-intro-modal__copy">
          <h3
            class="improvements-intro-modal__step-title"
            data-testid="improvements-intro-modal-step-title"
          >
            {{ t(activeStep.titleKey) }}
          </h3>
          <p
            class="improvements-intro-modal__step-description"
            data-testid="improvements-intro-modal-step-description"
          >
            {{ t(activeStep.descriptionKey) }}
          </p>
        </div>
      </section>

      <UnnnicDialogFooter>
        <UnnnicButton
          data-testid="improvements-intro-modal-back"
          type="tertiary"
          :text="$t('back')"
          :disabled="isFirstStep"
          @click="handleBack"
        />
        <UnnnicButton
          data-testid="improvements-intro-modal-next"
          type="primary"
          :text="isLastStep ? $t('finish') : $t('next')"
          @click="handleNext"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getHelpGuideUrl, INTRO_STEPS, TOTAL_STEPS } from './steps';

const open = defineModel<boolean>('open', {
  required: true,
});

const { t, locale } = useI18n();

const currentStep = ref(1);

const activeStep = computed(
  () => INTRO_STEPS[currentStep.value - 1] ?? INTRO_STEPS[0],
);
const isFirstStep = computed(() => currentStep.value === 1);
const isLastStep = computed(() => currentStep.value === TOTAL_STEPS);

watch(open, (isOpen) => {
  if (!isOpen) {
    currentStep.value = 1;
  }
});

function handleOpenChange(nextOpen: boolean) {
  open.value = nextOpen;
}

function handleBack() {
  if (isFirstStep.value) return;
  currentStep.value -= 1;
}

function handleNext() {
  if (isLastStep.value) {
    open.value = false;
    return;
  }
  currentStep.value += 1;
}

function handleViewHelpGuide() {
  window.open(getHelpGuideUrl(locale.value), '_blank', 'noopener,noreferrer');
}
</script>

<style scoped lang="scss">
.improvements-intro-modal {
  &__header-actions {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
    margin-left: auto;
  }

  &__body {
    display: grid;
    grid-template-rows: 1fr auto;
    gap: $unnnic-space-4;
    padding: $unnnic-space-6;

    overflow-y: auto;
  }

  &__illustration {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 100%;
    border-radius: $unnnic-radius-3;
    background-color: $unnnic-color-bg-blue-plain;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
  }

  &__copy {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__step-title {
    margin: 0;
    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__step-description {
    margin: 0;
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
    white-space: pre-line;
  }
}
</style>
