<template>
  <section
    class="manager-selector-skeleton"
    data-testid="manager-selector-radios-skeleton"
  >
    <UnnnicSkeletonLoading
      v-for="index in 2"
      :key="index"
      tag="div"
      width="100%"
      height="57px"
      class="manager-selector-skeleton__radio"
    />
  </section>
</template>

<style lang="scss" scoped>
.manager-selector-skeleton {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;
}
</style>
