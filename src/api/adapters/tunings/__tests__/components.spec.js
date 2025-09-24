import { describe, it, expect } from 'vitest';

import { ComponentsAdapter } from '../components.js';

describe('Tunings components adapter', () => {
  describe('fromApi method', () => {
    const fromApiTestCases = [
      {
        name: 'transforms API data to store format',
        input: true,
        expected: true,
      },
      {
        name: 'handles API data with false use_components',
        input: false,
        expected: false,
      },
      {
        name: 'handles API data without use_components field',
        input: undefined,
        expected: undefined,
      },
      {
        name: 'handles API data with null use_components',
        input: null,
        expected: null,
      },
    ];

    fromApiTestCases.forEach(({ name, input, expected }) => {
      it(name, () => {
        const obj = {
          name: 'Test Component',
          description: 'Test description',
          status: 'active',
        };
        const result = ComponentsAdapter.fromApi({
          ...obj,
          use_components: input,
        });
        expect(result).toEqual({ ...obj, components: expected });
      });
    });
  });

  describe('toApi method', () => {
    const fromApiTestCases = [
      {
        name: 'transforms API data to store format',
        input: true,
        expected: true,
      },
      {
        name: 'handles API data with false use_components',
        input: false,
        expected: false,
      },
      {
        name: 'handles API data without use_components field',
        input: undefined,
        expected: undefined,
      },
      {
        name: 'handles API data with null use_components',
        input: null,
        expected: null,
      },
    ];

    fromApiTestCases.forEach(({ name, input, expected }) => {
      it(name, () => {
        const obj = {
          name: 'Test Component',
          description: 'Test description',
          status: 'active',
        };
        const result = ComponentsAdapter.toApi({ ...obj, components: input });
        expect(result).toEqual({ ...obj, use_components: expected });
      });
    });
  });
});
