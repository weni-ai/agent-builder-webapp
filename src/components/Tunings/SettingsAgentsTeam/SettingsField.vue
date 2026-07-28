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
    <UnnnicToolTip
      side="top"
      maxWidth="240px"
      :text="tooltip"
      :contentProps="{
        align: 'start',
        side: 'left',
      }"
      :enabled="Boolean(tooltip) && disabled"
      data-testid="tooltip"
    >
      <UnnnicSwitch
        data-testid="switch"
        :disabled="disabled"
        :modelValue="modelValue"
        :textRight="textRight"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </UnnnicToolTip>

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
  disabled: {
    type: Boolean,
    default: false,
  },
  tooltip: {
    type: String,
    default: '',
  },
});
</script>
