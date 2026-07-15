import { computed, unref } from 'vue';
import type { Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import i18n from '@/utils/plugins/i18n';

const ALLOWED_CHARS = /^[\p{L}\p{N}\s-]+$/u;
const UNCATEGORIZED_KEY = 'agents.instructions.view.uncategorized';

function namesMatch(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: 'base' }) === 0;
}

function getReservedCategoryNames(): string[] {
  return i18n.global.availableLocales.map((locale) =>
    String(i18n.global.t(UNCATEGORIZED_KEY, {}, { locale })),
  );
}

export function useCategoryValidation(
  name: Ref<string> | string,
  existingNames: Ref<string[]> | string[] = [],
) {
  const { t } = useI18n();

  const validationT = (key: string) =>
    t(
      `agents.instructions.new_instruction_drawer.ai_analysis.category.validation.${key}`,
    );

  const trimmed = computed(() => unref(name).trim());

  const error = computed<string | null>(() => {
    const value = trimmed.value;

    if (!value) return validationT('required');
    if (!ALLOWED_CHARS.test(value)) return validationT('invalid_chars');

    const blockedNames = [
      ...getReservedCategoryNames(),
      ...unref(existingNames),
    ];
    const alreadyExists = blockedNames.some((existing) =>
      namesMatch(existing, value),
    );
    if (alreadyExists) return validationT('already_exists');

    return null;
  });

  const isValid = computed(() => error.value === null);

  return { error, isValid };
}
