export const InstructionAdapter = {
  toApi(data) {
    const { text, id } = data;
    return {
      instruction: text.trim(),
      id,
    };
  },
  fromApi(data) {
    const { instruction, id } = data;
    return {
      text: instruction,
      id,
    };
  },
};
