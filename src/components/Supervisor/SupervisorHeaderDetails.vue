<template>
  <p
    class="supervisor-header-details"
    @click="handleDetailsModal"
  >
    {{ $t('agent_builder.supervisor.learn_details_conversations') }}
  </p>

  <UnnnicModalDialog
    :modelValue="isDetailsModalOpen"
    showCloseIcon
    showActionsDivider
    size="md"
    :title="$t('agent_builder.supervisor.conversation_details.title')"
    class="supervisor-header-details__modal"
    @update:model-value="handleDetailsModal"
  >
    <section
      v-for="topic in topics"
      :key="topic"
      class="modal__topic"
    >
      <p class="topic__title">
        {{ $t(`agent_builder.supervisor.conversation_details.${topic}`) }}
      </p>
      <p class="topic__description">
        {{
          $t(
            `agent_builder.supervisor.conversation_details.${topic}_description`,
          )
        }}
      </p>
    </section>
  </UnnnicModalDialog>
</template>

<script setup>
import { ref } from 'vue';

const topics = ref([
  'what_is_a_conversation',
  'optimized_resolution',
  'other_conclusion',
  'transferred_to_human_support',
]);

const isDetailsModalOpen = ref(false);

function handleDetailsModal() {
  isDetailsModalOpen.value = !isDetailsModalOpen.value;
}
</script>

<style scoped lang="scss">
.supervisor-header-details {
  display: initial;

  color: $unnnic-color-neutral-cloudy;
  font-size: $unnnic-font-size-body-gt;
  font-weight: $unnnic-font-weight-bold;
  font-family: $unnnic-font-family-secondary;
  text-decoration: underline;

  cursor: pointer;

  &__modal {
    .modal__topic {
      margin-bottom: $unnnic-spacing-sm;

      .topic__title {
        margin-bottom: $unnnic-spacing-nano;
        color: $unnnic-color-neutral-dark;
        font-size: $unnnic-font-size-body-gt;
        font-family: $unnnic-font-family-secondary;
        line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
        font-weight: $unnnic-font-weight-bold;
      }

      .topic__description {
        color: $unnnic-color-neutral-cloudy;
        font-size: $unnnic-font-size-body-gt;
        font-family: $unnnic-font-family-secondary;
        line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
        white-space: pre-line;
      }
    }
  }
}
</style>
