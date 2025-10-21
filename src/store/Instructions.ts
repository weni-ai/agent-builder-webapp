import { reactive, ref, computed } from 'vue';
import { defineStore } from 'pinia';

import { useProjectStore } from './Project';
import { useAlertStore } from './Alert';

import nexusaiAPI from '@/api/nexusaiAPI';

import i18n from '@/utils/plugins/i18n';
import { moduleStorage } from '@/utils/storage';

function callAlert(type, alertText) {
  const alertStore = useAlertStore();
  alertStore.add({
    text: i18n.global.t(`agent_builder.instructions.${alertText}`),
    type,
  });
}

export const useInstructionsStore = defineStore('Instructions', () => {
  const projectUuid = computed(() => useProjectStore().uuid);

  const instructions = reactive({
    data: [],
    status: null,
  });

  const newInstruction = reactive({
    text: '',
    status: null,
  });

  const validateInstructionByAI = ref<boolean>(
    moduleStorage.getItem('validateInstructionByAI') ?? true,
  );

  const activeInstructionsListTab = ref('custom');

  async function addInstruction() {
    newInstruction.status = 'loading';
    activeInstructionsListTab.value = 'custom';

    try {
      const instructionResponse =
        await nexusaiAPI.agent_builder.instructions.addInstruction({
          projectUuid: projectUuid.value,
          instruction: newInstruction,
        });

      instructions.data.unshift({
        ...newInstruction,
        status: 'complete',
        id: instructionResponse.id,
      });
      newInstruction.status = null;
      newInstruction.text = '';

      callAlert('success', 'new_instruction.success_alert');
    } catch (error) {
      newInstruction.status = 'error';
      callAlert('error', 'new_instruction.error_alert');
    }
  }

  async function loadInstructions() {
    instructions.status = 'loading';
    try {
      const response = await nexusaiAPI.agent_builder.instructions.list({
        projectUuid: projectUuid.value,
      });

      instructions.data = [...instructions.data, ...response];
      instructions.status = 'complete';
    } catch (error) {
      instructions.status = 'error';
    }
  }
  async function editInstruction(id, text) {
    const instruction = instructions.data.find(
      (instruction) => instruction.id === id,
    );

    if (!instruction) return;

    try {
      instruction.status = 'loading';
      await nexusaiAPI.agent_builder.instructions.edit({
        projectUuid: projectUuid.value,
        id,
        text,
      });
      instruction.text = text;
      instruction.status = 'complete';

      callAlert('success', 'edit_instruction.success_alert');
    } catch (error) {
      instruction.status = 'error';
      callAlert('error', 'edit_instruction.error_alert');
    }

    return { status: instruction.status };
  }

  async function removeInstruction(id) {
    const instruction = instructions.data.find(
      (instruction) => instruction.id === id,
    );
    if (!instruction) return;
    instruction.status = 'loading';

    try {
      await nexusaiAPI.agent_builder.instructions.delete({
        projectUuid: projectUuid.value,
        id,
      });
      instructions.data = instructions.data.filter(
        (instruction) => instruction.id !== id,
      );
      callAlert('default', 'remove_instruction.success_alert');
      return { status: null };
    } catch (error) {
      instruction.status = 'error';
      callAlert('error', 'remove_instruction.error_alert');
    }

    return { status: instruction?.status };
  }

  function updateValidateInstructionByAI(value: boolean) {
    validateInstructionByAI.value = value;
    moduleStorage.setItem('validateInstructionByAI', value);
  }

  return {
    instructions,
    newInstruction,
    validateInstructionByAI,
    activeInstructionsListTab,
    addInstruction,
    loadInstructions,
    editInstruction,
    removeInstruction,
    updateValidateInstructionByAI,
  };
});
