<template>
  <section
    class="manager-only-new"
    data-testid="manager-selector-only-new"
  >
    <p
      class="manager-only-new__title"
      data-testid="manager-selector-only-new-title"
    >
      {{ manager.label }}
    </p>
    <p
      class="manager-only-new__description"
      data-testid="manager-selector-only-new-description"
    >
      {{
        $t('agent_builder.tunings.manager.only_new_manager_description', {
          manager_name: manager.label,
        })
      }}
    </p>
  </section>
</template>

<script setup>
defineProps({
  manager: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.manager-only-new {
  display: flex;
  flex-direction: column;

  &__title {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-emphasized;
  }

  &__description {
    font: $unnnic-font-caption-2;
    color: $unnnic-color-fg-base;
  }
}
</style>
