<template>
  <section
    class="assign-agent-card-skeleton"
    data-testid="assign-agent-card-skeleton"
  >
    <header class="assign-agent-card-skeleton__header">
      <UnnnicSkeletonLoading
        class="skeleton"
        tag="div"
        width="40px"
        height="40px"
        data-testid="skeleton-loading"
      />

      <UnnnicSkeletonLoading
        class="skeleton"
        tag="div"
        width="100%"
        height="22px"
        data-testid="skeleton-loading"
      />
    </header>

    <section class="assign-agent-card-skeleton__infos">
      <UnnnicSkeletonLoading
        class="skeleton"
        tag="div"
        width="100%"
        height="22px"
        data-testid="skeleton-loading"
      />
      <UnnnicSkeletonLoading
        class="skeleton"
        tag="div"
        width="100%"
        height="22px"
        data-testid="skeleton-loading"
      />

      <section
        class="assign-agent-card-skeleton__skills"
        data-testid="skills-section"
      >
        <UnnnicSkeletonLoading
          class="skeleton"
          tag="div"
          width="100px"
          height="37px"
          data-testid="skills-skeleton-loading"
        />
        <UnnnicSkeletonLoading
          class="skeleton"
          tag="div"
          width="150px"
          height="37px"
          data-testid="skills-skeleton-loading"
        />
      </section>
    </section>
  </section>
</template>

<style lang="scss" scoped>
.assign-agent-card-skeleton {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__header {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: $unnnic-space-4;
  }

  &__infos {
    display: flex;
    flex-direction: column;

    > :nth-child(2) {
      margin: $unnnic-space-05 0 $unnnic-space-2;
    }
  }

  &__skills {
    width: 100%;
    display: flex;
    gap: $unnnic-space-2;
    flex-wrap: wrap;
  }

  .skeleton {
    display: flex;
  }
}
</style>
