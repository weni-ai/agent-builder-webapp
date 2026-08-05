<template>
  <UnnnicDrawerNext
    :open="modelValue"
    lazyMount
    data-testid="safety-guardrails-drawer"
    @update:open="onOpenChange"
  >
    <UnnnicDrawerContent size="large">
      <UnnnicDrawerHeader>
        <UnnnicDrawerTitle data-testid="safety-guardrails-drawer-title">
          {{ $t('agents.instructions.safety_guardrails.drawer.title') }}
        </UnnnicDrawerTitle>
      </UnnnicDrawerHeader>

      <section
        class="safety-guardrails-drawer"
        data-testid="safety-guardrails-drawer-content"
      >
        <section
          class="safety-guardrails-drawer__description"
          data-testid="safety-guardrails-drawer-description"
        >
          <p>
            {{
              $t(
                'agents.instructions.safety_guardrails.drawer.description.intro',
              )
            }}
          </p>
          <div class="safety-guardrails-drawer__description-states">
            <p>
              {{
                $t(
                  'agents.instructions.safety_guardrails.drawer.description.on',
                )
              }}
            </p>
            <p>
              {{
                $t(
                  'agents.instructions.safety_guardrails.drawer.description.off',
                )
              }}
            </p>
          </div>
        </section>
      </section>

      <UnnnicDrawerFooter>
        <UnnnicDrawerClose>
          <UnnnicButton
            data-testid="safety-guardrails-drawer-cancel"
            :text="$t('cancel')"
            type="tertiary"
            @click="close"
          />
        </UnnnicDrawerClose>
        <UnnnicButton
          data-testid="safety-guardrails-drawer-save"
          :text="$t('agents.instructions.safety_guardrails.save')"
          type="primary"
          @click="close"
        />
      </UnnnicDrawerFooter>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>
</template>

<script setup>
const modelValue = defineModel({
  type: Boolean,
  required: true,
});

function close() {
  modelValue.value = false;
}

function onOpenChange(open) {
  if (!open) close();
}
</script>

<style lang="scss" scoped>
.safety-guardrails-drawer {
  height: 100%;

  padding: $unnnic-space-6;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;

  overflow-y: auto;

  &__description {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;

    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__description-states {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }
}
</style>
