<template>
  <section
    class="start-setup-skeleton"
    data-testid="start-setup-skeleton"
  >
    <section class="start-setup-skeleton__about">
      <UnnnicSkeletonLoading
        width="40%"
        height="22px"
      />
      <section class="start-setup-skeleton__about-description">
        <UnnnicSkeletonLoading
          v-for="i in 2"
          :key="i"
          width="100%"
          height="22px"
        />
      </section>
      <section class="start-setup-skeleton__systems">
        <UnnnicSkeletonLoading
          v-for="i in 2"
          :key="i"
          width="100%"
          height="36px"
        />
      </section>
    </section>

    <section class="start-setup-skeleton__mcps">
      <UnnnicSkeletonLoading
        width="30%"
        height="20px"
      />
      <section class="start-setup-skeleton__mcps-list">
        <UnnnicSkeletonLoading
          v-for="i in 3"
          :key="i"
          width="100%"
          height="65px"
        />
      </section>
    </section>

    <section class="start-setup-skeleton__conversation">
      <UnnnicSkeletonLoading
        width="50%"
        height="22px"
      />
      <UnnnicSkeletonLoading
        width="100%"
        height="100%"
      />
    </section>
  </section>
</template>

<style lang="scss" scoped>
.start-setup-skeleton {
  display: grid;
  grid-template-columns: 4fr 3fr;
  gap: $unnnic-space-4;

  span {
    display: flex;
  }
}

.start-setup-skeleton__about {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  grid-column: 1 / 2;
}

.start-setup-skeleton__about-description {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-05;
}

.start-setup-skeleton__systems {
  display: grid;
  grid-template-columns: 120px 120px;
  gap: $unnnic-space-2;
}

.start-setup-skeleton__mcps {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  grid-column: 1 / 2;
}

.start-setup-skeleton__mcps-list {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-05;
}

.start-setup-skeleton__conversation {
  display: grid;
  grid-template-rows: 1fr 100%;
  gap: $unnnic-space-2;

  grid-column: 2 / 3;
  grid-row: 1 / 3;
}
</style>
