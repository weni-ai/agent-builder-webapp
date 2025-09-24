<template>
  <UnnnicSkeletonLoading
    v-if="loading"
    tag="div"
    width="100%"
    height="57px"
    data-testid="skeleton-loading"
  />

  <section
    v-else
    class="form__field"
    data-testid="field"
  >
    <UnnnicSwitch
      data-testid="switch"
      :modelValue="modelValue"
      :textRight="textRight"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <UnnnicIntelligenceText
      data-testid="description"
      tag="p"
      family="secondary"
      size="body-gt"
      color="neutral-clean"
      class="form__description"
    >
      {{ description }}
    </UnnnicIntelligenceText>
  </section>
</template>

<script setup>
const emit = defineEmits(['update:modelValue']);

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  textRight: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
</script>
