<template>
  <section
    class="improvements-skeleton"
    data-testid="improvements-skeleton"
  >
    <header
      class="improvements-skeleton__header"
      data-testid="improvements-skeleton-header"
    >
      <div class="improvements-skeleton__header-content">
        <UnnnicSkeletonLoading
          tag="div"
          width="439px"
          height="20px"
          data-testid="improvements-skeleton-title"
        />
        <UnnnicSkeletonLoading
          tag="div"
          width="128px"
          height="20px"
          data-testid="improvements-skeleton-description"
        />
      </div>

      <UnnnicSkeletonLoading
        tag="div"
        width="116px"
        height="45px"
        data-testid="improvements-skeleton-button"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="116px"
        height="45px"
        data-testid="improvements-skeleton-button"
      />
    </header>

    <div
      class="improvements-skeleton__list"
      data-testid="improvements-skeleton-list"
    >
      <div
        class="improvements-skeleton__list-header"
        data-testid="improvements-skeleton-list-header"
      >
        <UnnnicSkeletonLoading
          class="improvements-skeleton__col improvements-skeleton__col--improvement"
          tag="div"
          width="100%"
          height="20px"
          data-testid="improvements-skeleton-column-improvement"
        />
        <UnnnicSkeletonLoading
          class="improvements-skeleton__col improvements-skeleton__col--type"
          tag="div"
          width="100%"
          height="20px"
          data-testid="improvements-skeleton-column-type"
        />
        <UnnnicSkeletonLoading
          class="improvements-skeleton__col improvements-skeleton__col--affected_conversations"
          tag="div"
          width="100%"
          height="20px"
          data-testid="improvements-skeleton-column-affected_conversations"
        />
      </div>

      <UnnnicSkeletonLoading
        v-for="index in 7"
        :key="index"
        tag="div"
        width="100%"
        height="60px"
        :data-testid="`improvements-skeleton-row-${index}`"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.improvements-skeleton {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;

  width: 100%;

  * > div {
    display: flex;
  }

  &__header {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    column-gap: $unnnic-space-4;

    width: 100%;
  }

  &__header-content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;

    width: 100%;
  }

  &__list-header {
    display: flex;
    gap: $unnnic-space-4;

    width: 100%;
  }

  &__col--improvement {
    width: calc(100% / 12 * 8);
  }

  &__col--type,
  &__col--affected_conversations {
    width: calc(100% / 12 * 2);
  }
}
</style>
