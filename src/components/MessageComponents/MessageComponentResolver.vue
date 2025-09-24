<template>
  <component
    :is="resolvedComponent"
    v-if="shouldShowComponent"
    :message="message"
    data-testid="message-component"
    @send-message="$emit('send-message', $event)"
    @open-preview-menu="$emit('open-preview-menu')"
  />
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

import QuickRepliesComponent from './QuickReplies.vue';
import ListMessageComponent from './ListMessage.vue';
import CtaMessageComponent from './CtaMessage.vue';
import CatalogComponent from './Catalog.vue';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['send-message', 'open-preview-menu']);

const parsedMessageData = computed(() => {
  if (!props.message) return null;

  try {
    if (
      props.message.text ||
      props.message.attachments ||
      props.message.quick_replies ||
      props.message.interaction_type ||
      props.message.catalog_message ||
      (props.message.header && props.message.catalog_message)
    ) {
      return props.message;
    }
  } catch (error) {
    return null;
  }

  return null;
});

const resolvedComponent = computed(() => {
  if (!props.message) return null;

  const messageData = parsedMessageData.value;
  if (!messageData) return null;

  if (messageData.quick_replies?.length) {
    return QuickRepliesComponent;
  }

  if (messageData.interaction_type === 'list' && messageData.list_message) {
    return ListMessageComponent;
  }

  if (messageData.interaction_type === 'cta_url' && messageData.cta_message) {
    return CtaMessageComponent;
  }

  if (messageData.catalog_message) {
    return CatalogComponent;
  }

  if (messageData.attachments?.length) {
    return null; // AttachmentComponent
  }

  return null;
});

const shouldShowComponent = computed(() => {
  if (!props.message) return false;

  return !!resolvedComponent.value;
});
</script>
