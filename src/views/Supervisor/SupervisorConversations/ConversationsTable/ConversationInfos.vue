<template>
  <section class="conversation-infos">
    <SupervisorUsername
      :username="username"
      data-testid="conversation-username"
    />

    <p
      data-testid="conversation-urn"
      class="conversation-infos__urn"
    >
      {{ formattedUrn }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SupervisorUsername from '@/components/Supervisor/SupervisorUsername.vue';
import { formatWhatsappUrn } from '@/utils/formatters';

const props = withDefaults(
  defineProps<{
    username?: string;
    urn: string;
  }>(),
  {
    username: '',
  },
);

const formattedUrn = computed(() => formatWhatsappUrn(props.urn));
</script>

<style scoped lang="scss">
.conversation-infos {
  display: grid;

  &__urn {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @include unnnic-font-caption-2;
    color: $unnnic-color-fg-muted;
  }
}
</style>
