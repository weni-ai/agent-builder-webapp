import { describe, it, expect } from 'vitest';

import { InstructionsGroupedAdapter } from '../grouped';

describe('InstructionsGroupedAdapter.toUpdateApi', () => {
  it('builds a categories payload for an existing category', () => {
    expect(
      InstructionsGroupedAdapter.toUpdateApi({
        id: 7,
        text: 'New text',
        category: { id: 5 },
      }),
    ).toEqual({
      categories: [
        {
          id: 5,
          instructions: [{ id: 7, instruction: 'New text' }],
        },
      ],
    });
  });

  it('builds an uncategorized payload when category is omitted', () => {
    expect(
      InstructionsGroupedAdapter.toUpdateApi({
        id: 7,
        text: 'New text',
      }),
    ).toEqual({
      uncategorized_instructions: [{ id: 7, instruction: 'New text' }],
    });
  });

  it('builds an uncategorized payload when category has no id', () => {
    expect(
      InstructionsGroupedAdapter.toUpdateApi({
        id: 7,
        text: 'New text',
        category: { name: 'Marketing' },
      }),
    ).toEqual({
      uncategorized_instructions: [{ id: 7, instruction: 'New text' }],
    });
  });

  it('trims instruction text', () => {
    expect(
      InstructionsGroupedAdapter.toUpdateApi({
        id: 7,
        text: '  New text  ',
        category: { id: 5 },
      }),
    ).toEqual({
      categories: [
        {
          id: 5,
          instructions: [{ id: 7, instruction: 'New text' }],
        },
      ],
    });
  });
});
