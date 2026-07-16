/**
 * Temporary mock for GET /guardrails-config/
 * TODO: Remove this mock when the backend endpoint is available.
 *
 * Topics only include `id` and `enabled`. Name and description come from
 * `agents.instructions.safety_guardrails.topics.{id}` locale keys.
 */
export const MOCK_GUARDRAILS_CONFIG = {
  topics: [
    { id: 'politics', enabled: true },
    { id: 'physical_health', enabled: true },
    { id: 'sexual_content', enabled: true },
    { id: 'bias', enabled: true },
    { id: 'hate', enabled: true },
    { id: 'religion', enabled: true },
    { id: 'suicide', enabled: true },
    { id: 'self_harm', enabled: true },
    { id: 'beliefs', enabled: true },
    { id: 'gender_identity', enabled: true },
    { id: 'sexual_relations', enabled: true },
  ],
  block_message: 'Não posso falar sobre esse tópico.',
};

export function getMockGuardrailsConfig() {
  return structuredClone(MOCK_GUARDRAILS_CONFIG);
}
