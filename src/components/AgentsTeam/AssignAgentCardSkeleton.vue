<template>
  <section
    class="assign-agent-card-skeleton"
    data-testid="assign-agent-card-skeleton"
  >
    <UnnnicSkeletonLoading
      tag="div"
      width="30%"
      height="22px"
      data-testid="skeleton-loading"
    />

    <UnnnicSkeletonLoading
      tag="div"
      width="100%"
      height="44px"
      data-testid="skeleton-loading"
    />

    <section
      class="assign-agent-card-skeleton__skills"
      data-testid="skills-section"
    >
      <UnnnicSkeletonLoading
        tag="div"
        width="100px"
        height="30px"
        data-testid="skills-skeleton-loading"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="150px"
        height="30px"
        data-testid="skills-skeleton-loading"
      />
    </section>

    <UnnnicSkeletonLoading
      tag="div"
      width="100%"
      height="38px"
      data-testid="skeleton-loading"
    />
  </section>
</template>

<style lang="scss" scoped>
.assign-agent-card-skeleton {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;

  &__skills {
    width: 100%;
    display: flex;
    gap: $unnnic-spacing-nano;
    flex-wrap: wrap;
  }
}
</style>
