import { computed, unref } from 'vue';
import type { Ref } from 'vue';
import { useI18n } from 'vue-i18n';

const ALLOWED_CHARS = /^[\p{L}\p{N}\s-]+$/u;

export function useCategoryValidation(name: Ref<string> | string) {
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

    return null;
  });

  const isValid = computed(() => error.value === null);

  return { error, isValid };
}
