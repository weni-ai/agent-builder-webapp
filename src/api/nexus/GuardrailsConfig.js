import request from '@/api/nexusaiRequest';
import { GuardrailsConfigAdapter } from '@/api/adapters/guardrails/guardrailsConfig';

export const GuardrailsConfig = {
  async read({ projectUuid }) {
    const response = await request.$http.get(
      `api/${projectUuid}/guardrails-config/`,
    );

    return GuardrailsConfigAdapter.fromApi(response.data);
  },

  async update({ projectUuid, data, requestOptions = {} }) {
    const response = await request.$http.patch(
      `api/${projectUuid}/guardrails-config/`,
      GuardrailsConfigAdapter.toApi(data),
      {
        hideGenericErrorAlert: true,
        ...requestOptions,
      },
    );

    return GuardrailsConfigAdapter.fromApi(response.data);
  },
};
