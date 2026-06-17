import { describe, it, expect } from 'vitest';

import {
  buildInstructionGroups,
  buildFlatInstructions,
  INSTRUCTION_GROUP_KEYS,
} from '../instructionViewModels';

const LABELS = {
  uncategorized: 'Uncategorized',
  default: 'Default instructions',
};

const build = (overrides = {}) =>
  buildInstructionGroups({
    instructions: [],
    categories: [],
    defaultInstructions: [],
    searchTerm: '',
    labels: LABELS,
    ...overrides,
  });

const keysOf = (groups) => groups.map((group) => group.key);
const byKey = (groups, key) => groups.find((group) => group.key === key);

describe('buildInstructionGroups', () => {
  it('orders custom categories alphabetically by name', () => {
    const groups = build({
      categories: [
        { id: 10, name: 'Sales' },
        { id: 20, name: 'Support' },
      ],
      instructions: [
        { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
        { id: 5, text: 'Support A', category: { id: 20, name: 'Support' } },
        { id: 3, text: 'Sales B', category: { id: 10, name: 'Sales' } },
      ],
    });

    expect(keysOf(groups)).toEqual(['category-10', 'category-20', 'default']);
  });

  it('orders instructions within a group with the last inserted first', () => {
    const groups = build({
      categories: [{ id: 10, name: 'Sales' }],
      instructions: [
        { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
        { id: 3, text: 'Sales B', category: { id: 10, name: 'Sales' } },
      ],
    });

    expect(
      byKey(groups, 'category-10').instructions.map((i) => i.text),
    ).toEqual(['Sales B', 'Sales A']);
  });

  it('exposes the category id on custom groups', () => {
    const groups = build({
      categories: [{ id: 10, name: 'Sales' }],
      instructions: [
        { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
      ],
    });

    expect(byKey(groups, 'category-10').categoryId).toBe(10);
  });

  it('keeps custom categories without instructions for the empty state', () => {
    const groups = build({ categories: [{ id: 10, name: 'Empty' }] });

    const group = byKey(groups, 'category-10');
    expect(group).toBeDefined();
    expect(group.locked).toBe(false);
    expect(group.instructions).toEqual([]);
  });

  it('creates a group from the instruction category when it is not seeded in categories', () => {
    const groups = build({
      categories: [],
      instructions: [
        { id: 1, text: 'Orphan', category: { id: 30, name: 'Logistics' } },
      ],
    });

    const group = byKey(groups, 'category-30');
    expect(group).toBeDefined();
    expect(group.label).toBe('Logistics');
    expect(group.locked).toBe(false);
    expect(group.instructions.map((i) => i.text)).toEqual(['Orphan']);
  });

  it('shows the Uncategorized locked group only when it has instructions', () => {
    const groups = build({
      instructions: [{ id: 1, text: 'Loose instruction', category: null }],
    });

    const group = byKey(groups, INSTRUCTION_GROUP_KEYS.uncategorized);
    expect(group.label).toBe(LABELS.uncategorized);
    expect(group.locked).toBe(true);
    expect(group.instructions).toHaveLength(1);
  });

  it('hides the Uncategorized group when there are no uncategorized instructions', () => {
    const groups = build({
      categories: [{ id: 10, name: 'Sales' }],
      instructions: [
        { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
      ],
    });

    expect(byKey(groups, INSTRUCTION_GROUP_KEYS.uncategorized)).toBeUndefined();
  });

  it('always exposes the Default locked group with the provided instructions', () => {
    const defaultInstructions = [
      { id: 'default-1', text: 'Be concise', locked: true },
      { id: 'default-2', text: 'Be helpful', locked: true },
    ];

    const groups = build({ defaultInstructions });

    const group = byKey(groups, INSTRUCTION_GROUP_KEYS.default);
    expect(group.label).toBe(LABELS.default);
    expect(group.locked).toBe(true);
    expect(group.instructions).toEqual(defaultInstructions);
  });

  it('filters instructions by the search term and hides groups without matches', () => {
    const groups = build({
      categories: [{ id: 10, name: 'Sales' }],
      instructions: [
        { id: 1, text: 'tracking number', category: { id: 10, name: 'Sales' } },
        { id: 2, text: 'refund policy', category: { id: 10, name: 'Sales' } },
      ],
      defaultInstructions: [
        { id: 'default-1', text: 'Be concise', locked: true },
      ],
      searchTerm: 'tracking',
    });

    expect(keysOf(groups)).toEqual(['category-10']);
    expect(
      byKey(groups, 'category-10').instructions.map((i) => i.text),
    ).toEqual(['tracking number']);
  });

  it('matches the search term ignoring case and surrounding spaces', () => {
    const groups = build({
      categories: [{ id: 10, name: 'Sales' }],
      instructions: [
        { id: 1, text: 'Tracking number', category: { id: 10, name: 'Sales' } },
      ],
      searchTerm: '  TRACKING  ',
    });

    expect(byKey(groups, 'category-10').instructions).toHaveLength(1);
  });
});

describe('buildFlatInstructions', () => {
  const FLAT_LABELS = {
    uncategorized: 'Uncategorized',
    defaultInstruction: 'Default instruction',
  };

  const buildFlat = (overrides = {}) =>
    buildFlatInstructions({
      instructions: [],
      defaultInstructions: [],
      searchTerm: '',
      labels: FLAT_LABELS,
      ...overrides,
    });

  it('lists custom instructions newest first, then default instructions', () => {
    const rows = buildFlat({
      instructions: [
        { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
        { id: 3, text: 'Loose B', category: null },
      ],
      defaultInstructions: [
        { id: 'default-1', text: 'Default A', locked: true },
      ],
    });

    expect(rows.map((row) => row.text)).toEqual([
      'Loose B',
      'Sales A',
      'Default A',
    ]);
  });

  it('maps a custom instruction to an unlocked row with its category name', () => {
    const [row] = buildFlat({
      instructions: [
        { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
      ],
    });

    expect(row).toEqual({
      id: 1,
      text: 'Sales A',
      categoryLabel: 'Sales',
      categoryLocked: false,
      locked: false,
    });
  });

  it('marks uncategorized rows with a locked category but keeps them editable', () => {
    const [row] = buildFlat({
      instructions: [{ id: 1, text: 'Loose', category: null }],
    });

    expect(row.categoryLabel).toBe(FLAT_LABELS.uncategorized);
    expect(row.categoryLocked).toBe(true);
    expect(row.locked).toBe(false);
  });

  it('marks default instructions as fully locked', () => {
    const [row] = buildFlat({
      defaultInstructions: [
        { id: 'default-1', text: 'Default A', locked: true },
      ],
    });

    expect(row.categoryLabel).toBe(FLAT_LABELS.defaultInstruction);
    expect(row.categoryLocked).toBe(true);
    expect(row.locked).toBe(true);
  });

  it('filters rows by the search term across custom and default instructions', () => {
    const rows = buildFlat({
      instructions: [
        { id: 1, text: 'tracking number', category: { id: 10, name: 'Sales' } },
        { id: 2, text: 'refund policy', category: { id: 10, name: 'Sales' } },
      ],
      defaultInstructions: [
        { id: 'default-1', text: 'tracking defaults', locked: true },
      ],
      searchTerm: 'tracking',
    });

    expect(rows.map((row) => row.text)).toEqual([
      'tracking number',
      'tracking defaults',
    ]);
  });
});
