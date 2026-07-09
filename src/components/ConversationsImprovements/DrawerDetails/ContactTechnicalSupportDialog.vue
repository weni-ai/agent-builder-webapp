<template>
  <UnnnicDialog
    data-testid="contact-technical-support-dialog"
    :open="open"
    lazyMount
    @update:open="handleOpenChange"
  >
    <UnnnicDialogContent size="medium">
      <UnnnicDialogHeader>
        <UnnnicDialogTitle data-testid="contact-technical-support-dialog-title">
          {{ t('audit.improvements.contact_technical_support_dialog.title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section class="contact-technical-support-dialog__content">
        <p data-testid="contact-technical-support-dialog-description">
          {{ description }}
        </p>

        <section
          class="contact-technical-support-dialog__info-box"
          data-testid="contact-technical-support-dialog-info-box"
        >
          <p
            class="contact-technical-support-dialog__info-title"
            data-testid="contact-technical-support-dialog-info-title"
          >
            {{ improvementTitle }}
          </p>

          <p
            v-for="item in infoPreviewItems"
            :key="item.id"
            class="contact-technical-support-dialog__info-caption"
            :data-testid="`contact-technical-support-dialog-info-${item.id}`"
          >
            {{ item.text }}
          </p>
        </section>
      </section>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            data-testid="contact-technical-support-dialog-cancel"
            :disabled="isSubmitting"
            :text="
              t('audit.improvements.contact_technical_support_dialog.cancel')
            "
            type="tertiary"
            @click="close"
          />
        </UnnnicDialogClose>
        <UnnnicButton
          data-testid="contact-technical-support-dialog-confirm"
          :loading="isSubmitting"
          :text="
            t(
              'audit.improvements.contact_technical_support_dialog.contact_support',
            )
          "
          type="primary"
          @click="onConfirm"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useImprovementsStore } from '@/store/Improvements';
import { useProjectStore } from '@/store/Project';
import { useUserStore } from '@/store/User';
import { formatLongDate } from '@/utils/formatters';

const SUPPORT_EMAIL = 'support.weni@vtex.com';

const open = defineModel<boolean>('open', {
  required: true,
});

const props = defineProps<{
  improvementUuid: string;
  improvementTitle: string;
  conversationsCount: number;
  improvementTypeLabel: string;
  identifiedAt: string;
}>();

const { t } = useI18n();
const improvementsStore = useImprovementsStore();
const projectStore = useProjectStore();
const userStore = useUserStore();

const isSubmitting = ref(false);

const description = computed(() =>
  t('audit.improvements.contact_technical_support_dialog.description', {
    support_email: SUPPORT_EMAIL,
  }),
);

const infoPreviewItems = computed(() => {
  const TRANSLATION_KEY = 'audit.improvements.contact_technical_support_dialog';

  const itemsById = {
    summary: t(`${TRANSLATION_KEY}.summary_type_and_count`, {
      type: props.improvementTypeLabel,
      count: props.conversationsCount,
    }),
    'identified-on': t(`${TRANSLATION_KEY}.identified_on`, {
      date: formatLongDate(props.identifiedAt),
      email: userStore.user.email ?? '',
    }),
    'project-uuid': t(`${TRANSLATION_KEY}.project_uuid`, {
      uuid: projectStore.uuid,
    }),
  };

  return Object.entries(itemsById).map(([id, text]) => ({ id, text }));
});

function close() {
  open.value = false;
}

function handleOpenChange(value: boolean) {
  if (!value && !isSubmitting.value) {
    close();
  }
}

async function onConfirm() {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  const result = await improvementsStore.contactTechnicalSupport(
    props.improvementUuid,
  );

  isSubmitting.value = false;

  if (result.status === 'complete') {
    close();
  }
}
</script>

<style scoped lang="scss">
.contact-technical-support-dialog {
  &__content {
    padding: $unnnic-space-6;
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;

    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__info-box {
    border-radius: $unnnic-radius-2;
    background: $unnnic-color-bg-base-soft;

    padding: $unnnic-space-3;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__info-title {
    font: $unnnic-font-caption-1;
  }

  &__info-caption {
    font: $unnnic-font-caption-2;
  }
}
</style>
