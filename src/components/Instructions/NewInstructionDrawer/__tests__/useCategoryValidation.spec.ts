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

const setup = (initialName = '', existingNames: string[] = []) => {
  const name = ref(initialName);
  const existing = ref(existingNames);
  let validation: ValidationResult;

  const wrapper = mount({
    template: '<div />',
    setup() {
      validation = useCategoryValidation(
        name as Ref<string>,
        existing as Ref<string[]>,
      );
      return {};
    },
  });

  return { name, existing, validation: validation!, wrapper };
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

  it('returns the already exists message when the name matches an existing category', () => {
    const { validation } = setup('Sales', ['Sales', 'Support']);

    expect(validation.error.value).toBe(validationT('already_exists'));
    expect(validation.isValid.value).toBe(false);
  });

  it('treats duplicate names as case-insensitive', () => {
    const { validation } = setup('sales', ['Sales']);

    expect(validation.error.value).toBe(validationT('already_exists'));
    expect(validation.isValid.value).toBe(false);
  });

  it('is valid when the name does not match any existing category', () => {
    const { validation } = setup('Logistics', ['Sales', 'Support']);

    expect(validation.error.value).toBeNull();
    expect(validation.isValid.value).toBe(true);
  });

  it('blocks the fixed uncategorized name in every locale', () => {
    const reservedNames = i18n.global.availableLocales.map((locale) =>
      String(
        i18n.global.t('agents.instructions.view.uncategorized', {}, { locale }),
      ),
    );

    expect(reservedNames).toEqual(
      expect.arrayContaining([
        'Uncategorized',
        'Sem categoria',
        'Sin categoría',
        'Fără categorie',
      ]),
    );

    reservedNames.forEach((reservedName) => {
      const { validation } = setup(reservedName);

      expect(validation.error.value).toBe(validationT('already_exists'));
      expect(validation.isValid.value).toBe(false);
    });
  });

  it('reacts when the existing names list changes', () => {
    const { existing, validation } = setup('Sales', []);

    expect(validation.isValid.value).toBe(true);

    existing.value = ['Sales'];

    expect(validation.error.value).toBe(validationT('already_exists'));
    expect(validation.isValid.value).toBe(false);
  });
});
