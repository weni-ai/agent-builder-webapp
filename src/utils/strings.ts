/**
 * Normalizes a string for accent- and case-insensitive comparisons.
 * @param {String} value - The string to normalize
 * @returns {String} The normalized string
 */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Checks whether a text contains a search term, ignoring case and accents.
 * @param {String} text - The text to search within
 * @param {String} term - The term to look for
 * @returns {Boolean} Whether the normalized text includes the normalized term
 */
export function includesNormalized(
  text: string | null | undefined,
  term: string | null | undefined,
): boolean {
  return normalizeText(text).includes(normalizeText(term));
}
