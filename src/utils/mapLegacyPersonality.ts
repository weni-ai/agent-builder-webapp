const LEGACY_PERSONALITY_MAP: Record<string, string> = {
  amigável: 'friendly',
  cooperativo: 'friendly',
  generoso: 'friendly',
  organizado: 'systematic',
  sistemático: 'systematic',
  intelectual: 'analytical',
  criativo: 'creative',
  inovador: 'creative',
  extrovertido: 'casual',
  relaxado: 'casual',
};

export function mapLegacyPersonality(value: string): string {
  if (!value) return value;
  return LEGACY_PERSONALITY_MAP[value.toLowerCase().trim()] ?? value;
}
