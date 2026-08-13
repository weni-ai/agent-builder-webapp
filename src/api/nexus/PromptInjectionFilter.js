import request from '@/api/nexusaiRequest';
import { PromptInjectionFilterAdapter } from '@/api/adapters/guardrails/promptInjectionFilter';

export const PromptInjectionFilter = {
  async read({ projectUuid }) {
    const response = await request.$http.get(
      `api/${projectUuid}/prompt-injection-filter/`,
    );

    return PromptInjectionFilterAdapter.fromApi(response.data);
  },

  async update({ projectUuid, data, requestOptions = {} }) {
    const response = await request.$http.patch(
      `api/${projectUuid}/prompt-injection-filter/`,
      PromptInjectionFilterAdapter.toApi(data),
      {
        hideGenericErrorAlert: true,
        ...requestOptions,
      },
    );

    return PromptInjectionFilterAdapter.fromApi(response.data);
  },
};
