import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import type { Ref } from 'vue';

import i18n from '@/utils/plugins/i18n';
import { useCategoryValidation } from '../useCategoryValidation';

const validationT = (key: string) =>
  i18n.global.t(
    `agents.instructions.new_instruction_drawer.ai_analysis.category.validation.${key}`,
  );

type ValidationResult = ReturnType<typeof useCategoryValidation>;

const setup = (initialName = '') => {
  const name = ref(initialName);
  let validation: ValidationResult;

  const wrapper = mount({
    template: '<div />',
    setup() {
      validation = useCategoryValidation(name as Ref<string>);
      return {};
    },
  });

  return { name, validation: validation!, wrapper };
};

describe('useCategoryValidation', () => {
  it('returns the required message and is invalid for an empty name', () => {
    const { validation } = setup('');

    expect(validation.error.value).toBe(validationT('required'));
    expect(validation.isValid.value).toBe(false);
  });

  it('returns the required message for a whitespace-only name', () => {
    const { validation } = setup('   ');

    expect(validation.error.value).toBe(validationT('required'));
    expect(validation.isValid.value).toBe(false);
  });

  it('returns the invalid chars message when disallowed characters are used', () => {
    const { validation } = setup('Sales & Support');

    expect(validation.error.value).toBe(validationT('invalid_chars'));
    expect(validation.isValid.value).toBe(false);
  });

  it('is valid for a name with letters, numbers, spaces and hyphens', () => {
    const { validation } = setup('Sales 2 - Support');

    expect(validation.error.value).toBeNull();
    expect(validation.isValid.value).toBe(true);
  });

  it('trims surrounding whitespace before validating', () => {
    const { validation } = setup('  Sales  ');

    expect(validation.error.value).toBeNull();
    expect(validation.isValid.value).toBe(true);
  });

  it('reacts to name changes', async () => {
    const { name, validation } = setup('');

    expect(validation.isValid.value).toBe(false);

    name.value = 'Support';

    expect(validation.isValid.value).toBe(true);
    expect(validation.error.value).toBeNull();
  });
});
