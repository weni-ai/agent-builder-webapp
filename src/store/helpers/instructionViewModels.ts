import type {
  InstructionCategory,
  Instruction,
  InstructionGroup,
  FlatInstruction,
} from '../types/Instructions.types';

import { includesNormalized } from '@/utils/strings';

export const INSTRUCTION_GROUP_KEYS = {
  uncategorized: 'uncategorized',
  default: 'default',
} as const;

interface BuildViewParams {
  instructions: Instruction[];
  defaultInstructions: Instruction[];
  searchTerm: string;
}

interface BuildInstructionGroupsParams extends BuildViewParams {
  categories: InstructionCategory[];
  labels: {
    uncategorized: string;
    default: string;
  };
}

interface CategoryWithInstructions {
  id: InstructionCategory['id'];
  name: string;
  instructions: Instruction[];
}

const recencyOf = (item: Instruction) => Number(item.id) || 0;

const newestFirst = (items: Instruction[]) =>
  [...items].sort((a, b) => recencyOf(b) - recencyOf(a));

const lastAddedId = (items: Instruction[]) =>
  items.reduce((newest, item) => Math.max(newest, recencyOf(item)), -Infinity);

const createCategoryGroup = (category: InstructionCategory) => ({
  id: category.id,
  name: category.name,
  instructions: [],
});

function partitionByCategory(
  instructions: Instruction[],
  categories: InstructionCategory[],
) {
  const byCategory = new Map<
    InstructionCategory['id'],
    CategoryWithInstructions
  >();

  // Categories are seeded first so that empty categories still surface in the empty state.
  categories.forEach((category) => {
    if (category.id !== null) {
      byCategory.set(category.id, createCategoryGroup(category));
    }
  });

  const uncategorized: Instruction[] = [];

  instructions.forEach((instruction) => {
    const { category } = instruction;

    if (category) {
      const group =
        byCategory.get(category.id) ?? createCategoryGroup(category);
      group.instructions.push(instruction);
      byCategory.set(category.id, group);
    } else {
      uncategorized.push(instruction);
    }
  });

  return { categorized: [...byCategory.values()], uncategorized };
}

// Custom groups are ordered by their most recently added instruction.
function toCustomGroups(
  categorized: CategoryWithInstructions[],
): InstructionGroup[] {
  return categorized
    .map((category) => ({
      key: `category-${category.id}`,
      label: category.name,
      locked: false,
      instructions: newestFirst(category.instructions),
    }))
    .sort((a, b) => lastAddedId(b.instructions) - lastAddedId(a.instructions));
}

// System groups are mocked and are always read-only.
function buildSystemGroups(
  uncategorized: Instruction[],
  defaultInstructions: Instruction[],
  labels: BuildInstructionGroupsParams['labels'],
): InstructionGroup[] {
  return [
    {
      key: INSTRUCTION_GROUP_KEYS.uncategorized,
      label: labels.uncategorized,
      locked: true,
      instructions: newestFirst(uncategorized),
    },
    {
      key: INSTRUCTION_GROUP_KEYS.default,
      label: labels.default,
      locked: true,
      instructions: defaultInstructions,
    },
  ];
}

function applySearch(
  groups: InstructionGroup[],
  searchTerm: string,
): InstructionGroup[] {
  const term = searchTerm.trim();

  if (!term) {
    return groups.filter(
      (group) =>
        group.key !== INSTRUCTION_GROUP_KEYS.uncategorized ||
        group.instructions.length > 0,
    );
  }

  return groups
    .map((group) => ({
      ...group,
      instructions: group.instructions.filter((item) =>
        includesNormalized(item.text, term),
      ),
    }))
    .filter((group) => group.instructions.length > 0);
}

export function buildInstructionGroups({
  instructions,
  categories,
  defaultInstructions,
  searchTerm,
  labels,
}: BuildInstructionGroupsParams): InstructionGroup[] {
  const { categorized, uncategorized } = partitionByCategory(
    instructions,
    categories,
  );

  const groups = [
    ...toCustomGroups(categorized),
    ...buildSystemGroups(uncategorized, defaultInstructions, labels),
  ];

  return applySearch(groups, searchTerm);
}

interface BuildFlatInstructionsParams extends BuildViewParams {
  labels: {
    uncategorized: string;
    defaultInstruction: string;
  };
}

export function buildFlatInstructions({
  instructions,
  defaultInstructions,
  searchTerm,
  labels,
}: BuildFlatInstructionsParams): FlatInstruction[] {
  const customRows: FlatInstruction[] = newestFirst(instructions).map(
    (instruction) => ({
      id: instruction.id,
      text: instruction.text,
      categoryLabel: instruction.category
        ? instruction.category.name
        : labels.uncategorized,
      categoryLocked: !instruction.category,
      locked: false,
    }),
  );

  const defaultRows: FlatInstruction[] = defaultInstructions.map(
    (instruction) => ({
      id: instruction.id,
      text: instruction.text,
      categoryLabel: labels.defaultInstruction,
      categoryLocked: true,
      locked: true,
    }),
  );

  const rows = [...customRows, ...defaultRows];

  const term = searchTerm.trim();
  if (!term) return rows;

  return rows.filter((row) => includesNormalized(row.text, term));
}
