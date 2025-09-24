<template>
  <section
    class="cta-message"
    data-testid="cta-message"
  >
    <UnnnicButton
      type="secondary"
      size="large"
      iconLeft="open_in_new"
      :text="message.cta_message.display_text"
      class="cta-message__button"
      data-testid="cta-button"
      @click="openUrl"
    />
  </section>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

function openUrl() {
  const url = props.message.cta_message.url;
  const isAbsoluteUrl = /^https?:\/\//.test(url);
  const finalUrl = isAbsoluteUrl ? url : `https://${url}`;

  window.open(finalUrl, '_blank');
}
</script>

<style lang="scss" scoped>
.cta-message {
  margin-top: $unnnic-spacing-ant;

  display: grid;
}
</style>
