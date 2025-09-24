<template>
  <section
    v-for="(item, index) in message.list_message.list_items"
    :key="`list-item-${index}`"
    class="list-message__item"
    data-testid="list-item"
    @click="selectItem(item)"
  >
    <UnnnicIntelligenceText
      color="neutral-dark"
      family="secondary"
      weight="bold"
      size="body-gt"
      data-testid="list-item-title"
    >
      {{ item.title }}
    </UnnnicIntelligenceText>
    <UnnnicIntelligenceText
      color="neutral-cloudy"
      family="secondary"
      weight="regular"
      size="body-md"
      data-testid="list-item-description"
    >
      {{ item.description }}
    </UnnnicIntelligenceText>
  </section>
</template>

<script setup>
const emit = defineEmits(['send-message']);

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const selectItem = (item) => {
  emit('send-message', item.title);
};
</script>

<style lang="scss" scoped>
.list-message__item {
  padding: $unnnic-spacing-sm $unnnic-spacing-md;

  display: flex;
  flex-direction: column;
  border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

  cursor: pointer;

  &:hover {
    background-color: $unnnic-color-neutral-lightest;
  }
}
</style>
