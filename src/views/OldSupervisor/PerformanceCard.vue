<template>
  <section
    :class="[
      'performance-card',
      `performance-card--${scheme}`,
      { 'performance-card--clickable': clickable },
      { 'performance-card--clicked': clickable && clicked },
    ]"
    data-test="card"
  >
    <header class="card__header">
      <UnnnicIntelligenceText
        tag="h3"
        family="secondary"
        size="body-gt"
        color="neutral-darkest"
        class="header__title"
        data-test="card-title"
      >
        {{ title }}
      </UnnnicIntelligenceText>

      <UnnnicToolTip
        side="top"
        :text="tooltip"
        enabled
        maxWidth="18rem"
        class="header__tooltip"
        data-test="card-tooltip"
      >
        <UnnnicIcon
          icon="info"
          size="sm"
          scheme="neutral-cleanest"
          filled
        />
      </UnnnicToolTip>
    </header>

    <UnnnicSkeletonLoading
      v-if="isLoading"
      data-test="card-value-skeleton"
      tag="div"
      width="50px"
      height="31px"
    />
    <UnnnicIntelligenceText
      v-else
      tag="p"
      family="primary"
      size="title-md"
      color="neutral-darkest"
      weight="bold"
      data-test="card-value"
    >
      {{ formattedValue }}%
    </UnnnicIntelligenceText>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  tooltip: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  scheme: {
    type: String,
    required: true,
    validator: (value) => ['green', 'red', 'blue'].includes(value),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  clicked: {
    type: Boolean,
    default: false,
  },
});

const formattedValue = computed(() => {
  return new Intl.NumberFormat(i18n.global.locale, {
    minimumFractionDigits: props.value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(props.value);
});
</script>

<style lang="scss" scoped>
$red: $unnnic-color-aux-red-300;
$green: $unnnic-color-aux-green-300;
$blue: $unnnic-color-aux-blue-300;

.performance-card {
  position: relative;

  overflow: hidden;

  padding: $unnnic-spacing-sm;

  border-radius: $unnnic-border-radius-md;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-nano;

  &::after {
    content: '';

    position: absolute;
    top: 0;
    left: 0;

    width: $unnnic-border-width-thick;
    height: 100%;
    background-color: $unnnic-color-neutral-cleanest;
    border-radius: $unnnic-border-radius-sm;
  }

  &--green {
    &::after {
      background-color: $green;
    }

    &.performance-card--clickable:hover,
    &.performance-card--clicked {
      border-color: $green;
    }
  }

  &--red {
    &::after {
      background-color: $red;
    }

    &.performance-card--clickable:hover,
    &.performance-card--clicked {
      border-color: $red;
    }
  }

  &--blue {
    &::after {
      background-color: $blue;
    }

    &.performance-card--clickable:hover,
    &.performance-card--clicked {
      border-color: $blue;
    }
  }

  &--clickable {
    cursor: pointer;
  }

  .card__header {
    display: flex;
    gap: $unnnic-spacing-xs;
    align-items: center;

    .header__title {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .header__tooltip {
      display: flex;
      cursor: default;
    }
  }
}
</style>
