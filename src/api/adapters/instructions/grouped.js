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

  toUpdateApi({ id, text, category }) {
    const instructionItem = {
      id,
      instruction: text.trim(),
    };

    if (!category) {
      return {
        uncategorized_instructions: [instructionItem],
      };
    }

    if (category.id != null) {
      return {
        categories: [
          {
            id: category.id,
            instructions: [instructionItem],
          },
        ],
      };
    }

    return {
      categories: [
        {
          name: category.name,
          instructions: [instructionItem],
        },
      ],
    };
  },
};
