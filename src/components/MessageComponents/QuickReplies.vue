<template>
  <section
    class="quick-replies"
    data-testid="quick-replies"
  >
    <UnnnicButton
      v-for="(reply, index) in message.quick_replies"
      :key="`reply-${index}`"
      type="secondary"
      size="large"
      class="quick-replies__button"
      data-testid="quick-reply-button"
      :text="reply"
      @click="emitReply(reply)"
    />
  </section>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['send-message']);

function emitReply(replyText) {
  emit('send-message', replyText);
}
</script>

<style lang="scss" scoped>
.quick-replies {
  margin-top: $unnnic-spacing-ant;

  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-nano;
}
</style>
