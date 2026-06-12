export const InstructionsGroupedAdapter = {
  fromApi({ categories = [], uncategorized_instructions = [] } = {}) {
    const categorized = categories.flatMap((category) =>
      (category.instructions || []).map((instruction) => ({
        id: instruction.id,
        text: instruction.instruction,
        category: { id: category.id, name: category.name },
      })),
    );

    const uncategorized = uncategorized_instructions.map((instruction) => ({
      id: instruction.id,
      text: instruction.instruction,
      category: null,
    }));

    return {
      instructions: [...categorized, ...uncategorized],
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
    };
  },

  toCreateApi({ text, category }) {
    const body = { instruction: text.trim() };

    if (category) {
      body.category = category;
    }

    return body;
  },

  toUpdateApi({ categories = [], uncategorizedInstructions = [] } = {}) {
    const toApiInstruction = ({ id, text }) => ({
      id,
      instruction: text,
    });

    return {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        instructions: (category.instructions || []).map(toApiInstruction),
      })),
      uncategorized_instructions:
        uncategorizedInstructions.map(toApiInstruction),
    };
  },
};
