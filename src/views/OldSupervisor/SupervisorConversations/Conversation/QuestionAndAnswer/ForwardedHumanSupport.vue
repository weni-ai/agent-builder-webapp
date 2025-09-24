<template>
  <section class="forwarded-human-support">
    <UnnnicIcon
      icon="forward"
      size="sm"
      scheme="neutral-cloudy"
    />
    <UnnnicIntelligenceText
      color="neutral-cloudy"
      family="secondary"
      size="body-md"
      tag="p"
    >
      {{ $t('agent_builder.supervisor.forwarded_human_support.title') }}
    </UnnnicIntelligenceText>
  </section>
</template>

<style lang="scss" scoped>
.forwarded-human-support {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $unnnic-spacing-nano;
}
</style>
