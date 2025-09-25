import { describe, it, expect } from 'vitest';

import { ProgressiveFeedbackAdapter } from '../progressiveFeedback.js';

describe('Tunings progressiveFeedback adapter', () => {
  describe('fromApi method', () => {
    const fromApiTestCases = [
      {
        name: 'transforms API data to store format',
        input: 'This is the feedback rationale',
        expected: 'This is the feedback rationale',
      },
      {
        name: 'handles API data with empty rationale',
        input: '',
        expected: '',
      },
      {
        name: 'handles API data without rationale field',
        input: undefined,
        expected: undefined,
      },
      {
        name: 'handles API data with null rationale',
        input: null,
        expected: null,
      },
    ];

    fromApiTestCases.forEach(({ name, input, expected }) => {
      it(`${name}`, () => {
        const obj = {
          name: 'Test Feedback',
          description: 'Test description',
          status: 'active',
        };
        const result = ProgressiveFeedbackAdapter.fromApi({
          ...obj,
          rationale: input,
        });
        expect(result).toEqual({ ...obj, progressiveFeedback: expected });
      });
    });
  });

  describe('toApi method', () => {
    const toApiTestCases = [
      {
        name: 'transforms store data to API format',
        input: 'This is the feedback rationale',
        expected: 'This is the feedback rationale',
      },
      {
        name: 'handles store data with empty progressiveFeedback',
        input: '',
        expected: '',
      },
      {
        name: 'handles store data without progressiveFeedback field',
        input: undefined,
        expected: undefined,
      },
      {
        name: 'handles store data with null progressiveFeedback',
        input: null,
        expected: null,
      },
    ];

    toApiTestCases.forEach(({ name, input, expected }) => {
      it(`${name}`, () => {
        const obj = {
          name: 'Test Feedback',
          description: 'Test description',
          status: 'active',
        };
        const result = ProgressiveFeedbackAdapter.toApi({
          ...obj,
          progressiveFeedback: input,
        });
        expect(result).toEqual({ ...obj, rationale: expected });
      });
    });
  });
});
