<template>
  <section class="conversation-infos">
    <UnnnicIntelligenceText
      data-testid="conversation-urn"
      class="conversation-infos__urn"
      tag="h3"
      color="neutral-darkest"
      family="secondary"
      size="body-gt"
      weight="bold"
    >
      {{ formattedUrn }}
    </UnnnicIntelligenceText>
    <UnnnicIntelligenceText
      data-testid="conversation-last-message"
      class="conversation-infos__last-message"
      tag="p"
      color="neutral-cloudy"
      family="secondary"
      size="body-md"
    >
      {{ lastMessage }}
    </UnnnicIntelligenceText>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  urn: {
    type: String,
    required: true,
  },
  lastMessage: {
    type: String,
    required: true,
  },
});

function formatWhatsappUrn(urn) {
  const WHATSAPP_PREFIX = 'whatsapp:';

  if (!urn?.startsWith(WHATSAPP_PREFIX)) {
    return urn;
  }

  const phoneNumber = urn.replace(WHATSAPP_PREFIX, '');

  if (phoneNumber.length < 12) {
    return urn;
  }

  const ddi = phoneNumber.substring(0, 2);
  const ddd = phoneNumber.substring(2, 4);
  const number = phoneNumber.substring(4);

  const formattedNumber =
    number.length === 9
      ? number.replace(/(\d{5})(\d{4})/, '$1-$2') // 99999-9999
      : number.replace(/(\d{4})(\d{4})/, '$1-$2'); // 9999-9999

  return `+${ddi} (${ddd}) ${formattedNumber}`;
}

const formattedUrn = computed(() => formatWhatsappUrn(props.urn));
</script>

<style scoped lang="scss">
.conversation-infos {
  display: grid;

  &__urn,
  &__last-message {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
