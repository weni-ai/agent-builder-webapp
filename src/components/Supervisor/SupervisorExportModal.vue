<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    showCloseIcon
    showActionsDivider
    size="md"
    :title="$t('agent_builder.supervisor.export.title')"
    :secondaryButtonProps="{
      text: $t('cancel'),
      'data-test': 'cancel-button',
    }"
    :primaryButtonProps="{
      text: $t('agent_builder.supervisor.export.send'),
      loading: isSending,
      disabled: !token,
      'data-test': 'send-export-button',
    }"
    class="supervisor-export-modal"
    @secondary-button-click="closeModal"
    @primary-button-click="handleExport"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <UnnnicIntelligenceText
      class="supervisor-export-modal__description"
      tag="p"
      color="neutral-dark"
      family="secondary"
      size="body-gt"
      weight="regular"
    >
      {{ $t('agent_builder.supervisor.export.description') }}
    </UnnnicIntelligenceText>

    <ul class="supervisor-export-modal__email-list">
      <li
        v-for="(email, index) in emails"
        :key="index"
      >
        <UnnnicIntelligenceText
          tag="p"
          color="neutral-cloudy"
          family="secondary"
          size="body-gt"
          weight="regular"
          class="email-list__item"
        >
          {{ email }}
        </UnnnicIntelligenceText>
      </li>
    </ul>

    <UnnnicDivider ySpacing="sm" />

    <UnnnicFormElement
      :label="$t('agent_builder.supervisor.export.token_label')"
      class="supervisor-export-modal__form-element"
    >
      <UnnnicInput
        v-model="token"
        :placeholder="$t('agent_builder.supervisor.export.token_placeholder')"
        data-test="token-input"
      />
    </UnnnicFormElement>

    <UnnnicIntelligenceText
      tag="p"
      color="neutral-cloudy"
      family="secondary"
      size="body-md"
      weight="regular"
      class="supervisor-export-modal__help-text"
    >
      {{ $t('agent_builder.supervisor.export.token_help') }}
      <a
        :href="`${env('CONNECT_URL')}/projects/${projectStore.uuid}/settings`"
        class="help-text__link"
        target="_blank"
      >
        {{ $t('agent_builder.supervisor.export.project_settings') }}
      </a>
      {{ $t('agent_builder.supervisor.export.and_paste') }}
    </UnnnicIntelligenceText>
  </UnnnicModalDialog>
</template>

<script setup>
import { ref, watch } from 'vue';

import { useProjectStore } from '@/store/Project';
import { useSupervisorStore } from '@/store/Supervisor';

import { Supervisor as supervisorApi } from '@/api/nexus/Supervisor';
import env from '@/utils/env';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'export']);

const projectStore = useProjectStore();
const supervisorStore = useSupervisorStore();

const token = ref('');
const isSending = ref(false);
const emails = ref([]);

const closeModal = () => {
  emit('update:modelValue', false);
};

const handleExport = async () => {
  if (!token.value) return;

  isSending.value = true;

  await supervisorStore.exportSupervisorData({ token: token.value });

  isSending.value = false;
  closeModal();
};

const getExportEmails = async () => {
  const response = await supervisorApi.conversations.getExportEmails({
    projectUuid: projectStore.uuid,
  });

  emails.value = response?.emails || [];
};

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue && !emails.value.length) {
      getExportEmails();
    }
  },
);
</script>

<style lang="scss" scoped>
.supervisor-export-modal {
  &__description {
    margin-bottom: $unnnic-spacing-xs;
  }

  &__email-list {
    margin: 0;
    padding: 0;

    list-style-type: none;

    .email-list__item {
      &::before {
        content: '•';
        margin-right: $unnnic-spacing-xs;
        color: $unnnic-color-neutral-cloudy;
      }
    }
  }

  &__help-text {
    margin-top: $unnnic-spacing-nano;

    font-size: $unnnic-font-size-body-sm;
    color: $unnnic-color-neutral-cloudy;
  }

  .help-text__link {
    color: $unnnic-color-neutral-dark;
    text-decoration-line: underline;
    text-underline-offset: 3px;
  }
}
</style>
