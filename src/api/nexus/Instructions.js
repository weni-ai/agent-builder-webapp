import nexusRequest from '../nexusaiRequest';
import { InstructionAdapter } from '../adapters/instructions/instruction';
import { useInstructionsStore } from '@/store/Instructions';

const request = nexusRequest;

export const Instructions = {
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
};
