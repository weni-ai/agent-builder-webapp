<template>
  <UnnnicDrawerNext
    v-model:open="modelValue"
    lazyMount
  >
    <UnnnicDrawerContent size="large">
      <UnnnicDrawerHeader>
        <UnnnicDrawerTitle data-testid="new-instruction-drawer-title">
          {{ $t('agents.instructions.new_instruction_drawer.title') }}
        </UnnnicDrawerTitle>
      </UnnnicDrawerHeader>

      <section class="new-instruction-drawer">
        <NewInstructionDrawerForm />
      </section>

      <UnnnicDrawerFooter>
        <UnnnicDrawerClose>
          <UnnnicButton
            :text="$t('agents.instructions.new_instruction_drawer.cancel')"
            type="tertiary"
            @click="close"
          />
        </UnnnicDrawerClose>
        <UnnnicButton
          :text="$t('agents.instructions.new_instruction_drawer.save')"
          type="primary"
          @click="save"
        />
      </UnnnicDrawerFooter>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>
</template>

<script setup>
import NewInstructionDrawerForm from './Form.vue';

const modelValue = defineModel({
  type: Boolean,
  required: true,
});

function close() {
  modelValue.value = false;
}

function save() {
  // TODO: Implement save
}
</script>

<style lang="scss" scoped>
.new-instruction-drawer {
  height: 100%;

  padding: $unnnic-space-6;
}
</style>
