import { reactive, ref, computed } from 'vue';
import { defineStore } from 'pinia';

import type {
  InstructionSuggestedByAI,
  InstructionCategory,
  NewInstruction,
  Instruction,
  InstructionGroup,
  FlatInstruction,
} from './types/Instructions.types';

import { useProjectStore } from './Project';
import { useAlertStore } from './Alert';
import { useFeatureFlagsStore } from './FeatureFlags';

import {
  buildInstructionGroups,
  buildFlatInstructions,
} from './helpers/instructionViewModels';

import nexusaiAPI from '@/api/nexusaiAPI';

import i18n from '@/utils/plugins/i18n';
import { moduleStorage } from '@/utils/storage';

function callAlert(type, alertText, descriptionKey?: string) {
  const alertStore = useAlertStore();
  alertStore.add({
    text: i18n.global.t(`agent_builder.instructions.${alertText}`),
    description: descriptionKey
      ? i18n.global.t(`agent_builder.instructions.${descriptionKey}`)
      : '',
    type,
  });
}

function categoriesEqual(
  current: InstructionCategory | null,
  original: InstructionCategory | null,
) {
  if (current === original) return true;
  if (!current || !original) return false;
  if (current.id !== null && original.id !== null) {
    return current.id === original.id;
  }

  return current.name === original.name;
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

    const suggested = instructionSuggestedByAI.data.suggestedCategory;
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

  const suggestedCategory = computed<InstructionCategory | null>(() => {
    const name = instructionSuggestedByAI.data.suggestedCategory;
    if (!name) return null;

    return (
      categoryOptions.value.find((category) => category.name === name) ?? {
        id: null,
        name,
      }
    );
  });

  const suggestedCategoryIsNew = computed(
    () => !!suggestedCategory.value && suggestedCategory.value.id === null,
  );

  function createCategory(name: string) {
    const trimmedName = name.trim();
    if (!sessionCategories.value.includes(trimmedName)) {
      sessionCategories.value.push(trimmedName);
    }
    newInstruction.category = { id: null, name: trimmedName };
  }

  function toCategoryPayload(category = newInstruction.category) {
    if (!category) return undefined;
    return category.id !== null ? { id: category.id } : { name: category.name };
  }

  const storedValidation = moduleStorage.getItem('validateInstructionByAI');

  const validateInstructionByAI = ref<boolean>(storedValidation ?? true);

  const instructionSuggestedByAI = reactive<InstructionSuggestedByAI>({
    data: {
      instruction: '',
      classification: [],
      suggestion: '',
      suggestedCategory: '',
    },
    suggestionApplied: '',
    status: null,
  });

  const activeInstructionsListTab = ref('custom');
  const activeInstructionsView = ref<'categories' | 'list'>('categories');
  const searchTerm = ref('');

  const isInstructionDrawerOpen = ref(false);
  const instructionDrawerMode = ref<'create' | 'edit'>('create');
  const editingInstructionId = ref<number | string | null>(null);

  const editingInstruction = computed<Instruction | null>(
    () =>
      instructions.data.find(
        (item) => item.id === editingInstructionId.value,
      ) ?? null,
  );

  const hasEditingInstructionChanges = computed(() => {
    const original = editingInstruction.value;
    if (instructionDrawerMode.value !== 'edit' || !original) return false;

    return (
      newInstruction.text !== original.text ||
      !categoriesEqual(newInstruction.category, original.category ?? null)
    );
  });

  const isSearching = computed(() => searchTerm.value.trim().length > 0);

  const groupT = (key: string) =>
    i18n.global.t(`agents.instructions.view.${key}`);

  const defaultInstructionsMock = computed<Instruction[]>(() => {
    const globalI18n = i18n.global as { tm: (_key: string) => string[] };
    const mockedInstructions = globalI18n.tm(
      'agent_builder.instructions.instructions_list.default_instructions',
    );

    return mockedInstructions?.map((instruction, index) => ({
      id: `default-${index + 1}`,
      text: String(instruction),
      locked: true,
    }));
  });

  const groupedInstructions = computed<InstructionGroup[]>(() =>
    buildInstructionGroups({
      instructions: instructions.data,
      categories: categories.value,
      defaultInstructions: defaultInstructionsMock.value,
      searchTerm: searchTerm.value,
      labels: {
        uncategorized: groupT('uncategorized'),
        default: groupT('default_instructions'),
      },
    }),
  );

  const flatInstructions = computed<FlatInstruction[]>(() =>
    buildFlatInstructions({
      instructions: instructions.data,
      defaultInstructions: defaultInstructionsMock.value,
      searchTerm: searchTerm.value,
      labels: {
        uncategorized: groupT('uncategorized'),
        defaultInstruction: groupT('default_instruction'),
      },
    }),
  );

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

  function resetNewInstruction() {
    newInstruction.text = '';
    newInstruction.category = null;
    newInstruction.status = null;
  }

  function openNewInstructionDrawer() {
    resetNewInstruction();
    resetInstructionSuggestedByAI();
    instructionDrawerMode.value = 'create';
    editingInstructionId.value = null;
    isInstructionDrawerOpen.value = true;
  }

  function startEditingInstruction(instruction: { id: number | string }) {
    const target = instructions.data.find((item) => item.id === instruction.id);
    if (!target) return;

    resetInstructionSuggestedByAI();
    newInstruction.text = target.text;
    newInstruction.category = target.category ?? null;
    newInstruction.status = null;
    instructionDrawerMode.value = 'edit';
    editingInstructionId.value = target.id;
    isInstructionDrawerOpen.value = true;
  }

  function closeInstructionDrawer() {
    isInstructionDrawerOpen.value = false;
    instructionDrawerMode.value = 'create';
    editingInstructionId.value = null;
    resetNewInstruction();
    resetInstructionSuggestedByAI();
  }

  async function updateEditingInstruction() {
    const target = instructions.data.find(
      (item) => item.id === editingInstructionId.value,
    );
    if (!target) return;

    newInstruction.status = 'loading';

    const previousText = target.text;
    const previousCategory = target.category;

    try {
      const response = await nexusaiAPI.agent_builder.instructions.update({
        projectUuid: projectUuid.value,
        id: editingInstructionId.value,
        instruction: newInstruction.text,
        category: toCategoryPayload(),
      });

      instructions.data = response.instructions;
      categories.value = response.categories;

      newInstruction.status = null;
      callAlert('success', 'edit_instruction.success_alert');
    } catch {
      target.text = previousText;
      target.category = previousCategory;
      newInstruction.status = 'error';
      callAlert('error', 'edit_instruction.error_alert');
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
        const response = await nexusaiAPI.agent_builder.instructions.update({
          projectUuid: projectUuid.value,
          id,
          instruction: text,
          category: toCategoryPayload(instruction.category ?? null),
        });

        instructions.data = response.instructions;
        categories.value = response.categories;
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
      callAlert('informational', 'remove_instruction.success_alert');
      return { status: null };
    } catch (error) {
      instruction.status = 'error';
      callAlert(
        'error',
        'remove_instruction.error_alert',
        'remove_instruction.error_alert_description',
      );
    }

    return { status: instruction?.status };
  }

  async function deleteCategory(id: number) {
    const movedCount = instructions.data.filter(
      (instruction) => instruction.category?.id === id,
    ).length;

    const alertStore = useAlertStore();
    const categoryT = (key: string, params?: Record<string, unknown>) =>
      i18n.global.t(`agents.instructions.delete_category.${key}`, params ?? {});

    try {
      await nexusaiAPI.agent_builder.instructions.deleteCategory({
        projectUuid: projectUuid.value,
        id,
      });

      // Instructions are preserved and reassigned to Uncategorized.
      instructions.data = instructions.data.map((instruction) =>
        instruction.category?.id === id
          ? { ...instruction, category: null }
          : instruction,
      );
      categories.value = categories.value.filter(
        (category) => category.id !== id,
      );

      alertStore.add({
        type: 'informational',
        text: categoryT('success_title'),
        description:
          movedCount === 0
            ? categoryT('success_description_empty')
            : categoryT('success_description', { count: movedCount }),
      });

      return { status: null };
    } catch {
      alertStore.add({
        type: 'error',
        text: categoryT('error_title'),
        description: categoryT('error_description'),
      });

      return { status: 'error' };
    }
  }

  async function getInstructionSuggestionByAI(instruction: string) {
    instructionSuggestedByAI.status = 'loading';

    try {
      const data =
        await nexusaiAPI.agent_builder.instructions.getSuggestionByAI({
          projectUuid: projectUuid.value,
          instruction,
          instructionsCategories: categories.value.map(
            (category) => category.name,
          ),
          id:
            instructionDrawerMode.value === 'edit'
              ? editingInstructionId.value
              : null,
        });

      const suggestedCategory = data.suggestedCategory ?? '';

      instructionSuggestedByAI.data = {
        instruction,
        classification: data.classification ?? [],
        suggestion: data.suggestion ?? '',
        suggestedCategory,
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
      if (!useV2()) {
        callAlert(
          'error',
          'new_instruction.validate_instruction_by_ai.error_alert',
        );
      }
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
      suggestedCategory: '',
    };
    instructionSuggestedByAI.status = null;
  }

  const isExportingInstructionsLoading = ref(false);
  async function exportInstructions() {
    try {
      isExportingInstructionsLoading.value = true;

      const response = await nexusaiAPI.agent_builder.instructions.export({
        projectUuid: projectUuid.value,
        columns: {
          category: i18n.global.t(
            'agents.instructions.view.list_columns.category',
          ),
          instruction: i18n.global.t(
            'agents.instructions.view.list_columns.instruction',
          ),
        },
        categoryLabels: {
          uncategorized: groupT('uncategorized'),
          default: groupT('default_instructions'),
        },
        defaultInstructions: defaultInstructionsMock.value.map(
          (instruction) => instruction.text,
        ),
      });

      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'instructions.csv';
      a.click();
      window.URL.revokeObjectURL(url);

      useAlertStore().add({
        type: 'success',
        text: i18n.global.t(
          'agents.instructions.export_instructions.success_alert_title',
        ),
        description: i18n.global.t(
          'agents.instructions.export_instructions.success_alert_description',
        ),
      });

      return { status: 'success' };
    } catch (error) {
      console.error(error);
      return { status: 'error' };
    } finally {
      isExportingInstructionsLoading.value = false;
    }
  }

  return {
    instructions,
    categories,
    sessionCategories,
    categoryOptions,
    newInstruction,
    selectedCategoryIsNew,
    suggestedCategory,
    suggestedCategoryIsNew,
    validateInstructionByAI,
    instructionSuggestedByAI,
    activeInstructionsListTab,
    activeInstructionsView,
    searchTerm,
    isSearching,
    isInstructionDrawerOpen,
    instructionDrawerMode,
    editingInstructionId,
    hasEditingInstructionChanges,
    groupedInstructions,
    flatInstructions,
    createCategory,
    addInstruction,
    openNewInstructionDrawer,
    startEditingInstruction,
    closeInstructionDrawer,
    updateEditingInstruction,
    loadInstructions,
    editInstruction,
    removeInstruction,
    deleteCategory,
    getInstructionSuggestionByAI,
    updateValidateInstructionByAI,
    resetInstructionSuggestedByAI,

    isExportingInstructionsLoading,
    exportInstructions,
  };
});
