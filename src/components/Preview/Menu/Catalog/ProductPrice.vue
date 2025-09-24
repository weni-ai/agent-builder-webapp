<template>
  <UnnnicIntelligenceText
    data-testid="price-text"
    color="weni-600"
    family="secondary"
    weight="bold"
    :size="size"
  >
    {{ formattedPrice }}
  </UnnnicIntelligenceText>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currency: {
    type: String,
    default: '$',
  },
  price: {
    type: [Number, String],
    required: true,
  },
  size: {
    type: String,
    default: 'body-gt',
  },
});

const formattedPrice = computed(() => {
  const currency = props.currency || '$';
  return `${currency} ${props.price}`;
});
</script>
