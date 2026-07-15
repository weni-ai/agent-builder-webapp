import type {
  InstructionCategory,
  GroupedInstructionItem,
  InstructionGroup,
} from '../types/Instructions.types';

export const INSTRUCTION_GROUP_KEYS = {
  uncategorized: 'uncategorized',
  default: 'default',
} as const;

interface BuildInstructionGroupsParams {
  instructions: GroupedInstructionItem[];
  categories: InstructionCategory[];
  defaultInstructions: GroupedInstructionItem[];
  searchTerm: string;
  labels: {
    uncategorized: string;
    default: string;
  };
}

interface CategoryWithInstructions {
  id: InstructionCategory['id'];
  name: string;
  instructions: GroupedInstructionItem[];
}

const recencyOf = (item: GroupedInstructionItem) => Number(item.id) || 0;

const newestFirst = (items: GroupedInstructionItem[]) =>
  [...items].sort((a, b) => recencyOf(b) - recencyOf(a));

const lastAddedId = (items: GroupedInstructionItem[]) =>
  items.reduce((newest, item) => Math.max(newest, recencyOf(item)), -Infinity);

const createCategoryGroup = (category: InstructionCategory) => ({
  id: category.id,
  name: category.name,
  instructions: [],
});

function partitionByCategory(
  instructions: GroupedInstructionItem[],
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

  const uncategorized: GroupedInstructionItem[] = [];

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
  uncategorized: GroupedInstructionItem[],
  defaultInstructions: GroupedInstructionItem[],
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

// With an active search: keep only matching instructions and drop empty groups.
// Without a search: keep every group, except an empty Uncategorized.
function applySearch(
  groups: InstructionGroup[],
  searchTerm: string,
): InstructionGroup[] {
  const term = searchTerm.trim().toLowerCase();

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
        item.text.toLowerCase().includes(term),
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
