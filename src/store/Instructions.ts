import { reactive, ref, computed } from 'vue';
import { defineStore } from 'pinia';

import type {
  InstructionSuggestedByAI,
  InstructionCategory,
  NewInstruction,
} from './types/Instructions.types';

import { useProjectStore } from './Project';
import { useAlertStore } from './Alert';
import { useFeatureFlagsStore } from './FeatureFlags';

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
  const featureFlags = useFeatureFlagsStore();
  const useV2 = () => featureFlags.flags.categorizationOfInstructions;

  const instructions = reactive({
    data: [],
    status: null,
  });

  const categories = ref<InstructionCategory[]>([]);
  const sessionCategories = ref<string[]>([]);

  const categoryOptions = computed<InstructionCategory[]>(() => {
    const optionsByName = new Map<string, InstructionCategory>();

    categories.value.forEach((category) => {
      optionsByName.set(category.name, {
        id: category.id,
        name: category.name,
      });
    });

    sessionCategories.value.forEach((name) => {
      if (!optionsByName.has(name)) {
        optionsByName.set(name, { id: null, name });
      }
    });

    const suggested = instructionSuggestedByAI.data.suggested_category;
    if (suggested && !optionsByName.has(suggested)) {
      optionsByName.set(suggested, { id: null, name: suggested });
    }

    return [...optionsByName.values()];
  });

  const newInstruction = reactive<NewInstruction>({
    text: '',
    category: null,
    status: null,
  });

  const selectedCategoryIsNew = computed(
    () => !!newInstruction.category && newInstruction.category.id === null,
  );

  function createCategory(name: string) {
    const trimmedName = name.trim();
    if (!sessionCategories.value.includes(trimmedName)) {
      sessionCategories.value.push(trimmedName);
    }
    newInstruction.category = { id: null, name: trimmedName };
  }

  function toCategoryPayload() {
    const category = newInstruction.category;
    if (!category) return undefined;
    return category.id !== null ? { id: category.id } : { name: category.name };
  }

  function toGroupedPayload() {
    type GroupedItem = { id: number; instruction: string };
    const categoriesById = new Map<
      number,
      { id: number; name: string; instructions: GroupedItem[] }
    >();
    const uncategorized_instructions: GroupedItem[] = [];

    instructions.data.forEach((instruction) => {
      const item = { id: instruction.id, instruction: instruction.text };

      if (instruction.category) {
        const { id, name } = instruction.category;
        const group = categoriesById.get(id) ?? {
          id,
          name,
          instructions: [],
        };
        group.instructions.push(item);
        categoriesById.set(id, group);
      } else {
        uncategorized_instructions.push(item);
      }
    });

    return {
      categories: [...categoriesById.values()],
      uncategorized_instructions,
    };
  }

  const storedValidation = moduleStorage.getItem('validateInstructionByAI');

  const validateInstructionByAI = ref<boolean>(storedValidation ?? true);

  const instructionSuggestedByAI = reactive<InstructionSuggestedByAI>({
    data: {
      instruction: '',
      classification: [],
      suggestion: '',
      suggested_category: '',
    },
    suggestionApplied: '',
    status: null,
  });

  const activeInstructionsListTab = ref('custom');

  async function addInstruction() {
    newInstruction.status = 'loading';
    activeInstructionsListTab.value = 'custom';

    try {
      if (useV2()) {
        const response = await nexusaiAPI.agent_builder.instructions.create({
          projectUuid: projectUuid.value,
          instruction: newInstruction.text,
          category: toCategoryPayload(),
        });

        instructions.data = response.instructions;
        categories.value = response.categories;
      } else {
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
      }

      newInstruction.status = null;
      newInstruction.text = '';
      newInstruction.category = null;

      callAlert('success', 'new_instruction.success_alert');
    } catch (error) {
      newInstruction.status = 'error';
      callAlert('error', 'new_instruction.error_alert');
    }
  }

  async function loadInstructions() {
    instructions.status = 'loading';
    try {
      if (useV2()) {
        const response =
          await nexusaiAPI.agent_builder.instructions.listGrouped({
            projectUuid: projectUuid.value,
          });

        instructions.data = response.instructions;
        categories.value = response.categories;
      } else {
        const response = await nexusaiAPI.agent_builder.instructions.list({
          projectUuid: projectUuid.value,
        });

        instructions.data = [...instructions.data, ...response];
      }

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

      if (useV2()) {
        instruction.text = text;
        await nexusaiAPI.agent_builder.instructions.update({
          projectUuid: projectUuid.value,
          ...toGroupedPayload(),
        });
      } else {
        await nexusaiAPI.agent_builder.instructions.edit({
          projectUuid: projectUuid.value,
          id,
          text,
        });
        instruction.text = text;
      }

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
      if (useV2()) {
        await nexusaiAPI.agent_builder.instructions.deleteInstruction({
          projectUuid: projectUuid.value,
          id,
        });
      } else {
        await nexusaiAPI.agent_builder.instructions.delete({
          projectUuid: projectUuid.value,
          id,
        });
      }
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

  async function getInstructionSuggestionByAI(instruction: string) {
    instructionSuggestedByAI.status = 'loading';

    try {
      const { data } =
        await nexusaiAPI.agent_builder.instructions.getSuggestionByAI({
          projectUuid: projectUuid.value,
          instruction,
          instructionsCategories: categories.value.map(
            (category) => category.name,
          ),
        });

      const suggestedCategory = data.suggested_category ?? '';

      instructionSuggestedByAI.data = {
        instruction,
        classification: data.classification ?? [],
        suggestion: data.suggestion ?? '',
        suggested_category: suggestedCategory,
      };
      instructionSuggestedByAI.suggestionApplied = '';
      instructionSuggestedByAI.status = 'complete';

      if (suggestedCategory) {
        const existing = categories.value.find(
          (category) => category.name === suggestedCategory,
        );
        newInstruction.category = {
          id: existing ? existing.id : null,
          name: suggestedCategory,
        };
      }
    } catch (error) {
      instructionSuggestedByAI.status = 'error';
      callAlert(
        'error',
        'new_instruction.validate_instruction_by_ai.error_alert',
      );
    }
  }

  function updateValidateInstructionByAI(value: boolean) {
    validateInstructionByAI.value = value;
    moduleStorage.setItem('validateInstructionByAI', value);
  }

  function resetInstructionSuggestedByAI() {
    instructionSuggestedByAI.data = {
      instruction: '',
      classification: [],
      suggestion: '',
      suggested_category: '',
    };
  }

  return {
    instructions,
    categories,
    sessionCategories,
    categoryOptions,
    newInstruction,
    selectedCategoryIsNew,
    validateInstructionByAI,
    instructionSuggestedByAI,
    activeInstructionsListTab,
    createCategory,
    addInstruction,
    loadInstructions,
    editInstruction,
    removeInstruction,
    getInstructionSuggestionByAI,
    updateValidateInstructionByAI,
    resetInstructionSuggestedByAI,
  };
});
