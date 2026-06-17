import nexusRequest from '../nexusaiRequest';
import { InstructionAdapter } from '../adapters/instructions/instruction';
import { InstructionClassificationAdapter } from '../adapters/instructions/classification';
import { InstructionsGroupedAdapter } from '../adapters/instructions/grouped';
import { useInstructionsStore } from '@/store/Instructions';

import i18n from '@/utils/plugins/i18n';

const request = nexusRequest;

export const Instructions = {
  async listGrouped({ projectUuid }) {
    const response = await request.$http.get(
      `api/${projectUuid}/instructions/`,
    );

    return InstructionsGroupedAdapter.fromApi(response.data);
  },

  async create({ projectUuid, instruction, category }) {
    const response = await request.$http.post(
      `api/${projectUuid}/instructions/`,
      InstructionsGroupedAdapter.toCreateApi({ text: instruction, category }),
      {
        hideGenericErrorAlert: true,
      },
    );

    return InstructionsGroupedAdapter.fromApi(response.data);
  },

  async update({ projectUuid, ...groupedPayload }) {
    const response = await request.$http.patch(
      `api/${projectUuid}/instructions/`,
      InstructionsGroupedAdapter.toUpdateApi(groupedPayload),
    );

    return InstructionsGroupedAdapter.fromApi(response.data);
  },

  async deleteInstruction({ projectUuid, id }) {
    await request.$http.delete(`api/${projectUuid}/instructions/?id=${id}`);
  },

  async deleteCategory({ projectUuid, id }) {
    await request.$http.delete(
      `api/${projectUuid}/instructions/categories/${id}/`,
    );
  },

  async addInstruction({ projectUuid, instruction }) {
    const instructionsStore = useInstructionsStore();
    const body = {
      instructions: [...instructionsStore.instructions.data, instruction].map(
        InstructionAdapter.toApi,
      ),
    };
    const response = await request.$http.put(
      `api/${projectUuid}/customization/`,
      body,
      {
        hideGenericErrorAlert: true,
      },
    );

    const biggestId = response.data.instructions.reduce((acc, instruction) => {
      if (instruction.id > acc) acc = instruction.id;
      return acc;
    }, 0);

    return InstructionAdapter.fromApi(
      response.data.instructions.find(
        (instruction) => instruction.id === biggestId,
      ),
    );
  },

  async list({ projectUuid }) {
    const response = await request.$http.get(
      `api/${projectUuid}/customization/`,
    );

    return response.data.instructions.map(InstructionAdapter.fromApi);
  },

  async edit({ projectUuid, id, text }) {
    const instructionsStore = useInstructionsStore();

    const body = {
      instructions: [
        ...instructionsStore.instructions.data.filter(
          (instruction) => instruction.id !== id,
        ),
        { id, text },
      ].map(InstructionAdapter.toApi),
    };
    await request.$http.put(`api/${projectUuid}/customization/`, body);
  },

  async delete({ projectUuid, id }) {
    await request.$http.delete(`api/${projectUuid}/customization/?id=${id}`);
  },

  async getSuggestionByAI({
    projectUuid,
    instruction,
    instructionsCategories = [],
  }) {
    const languageMap = {
      en: 'English',
      'pt-br': 'Portuguese',
      es: 'Spanish',
      ro: 'Romanian',
    };
    const language = languageMap[i18n.global.locale.value] || 'English';

    const response = await request.$http.post(
      `api/${projectUuid}/instructions-classification/`,
      {
        instruction,
        instructions_categories: instructionsCategories,
        language,
      },
    );
    return InstructionClassificationAdapter.fromApi(response.data);
  },

  async export({ projectUuid }) {
    const response = await request.$http.get(
      `api/${projectUuid}/instructions/export/`,
    );

    return response.data;
  },
};
