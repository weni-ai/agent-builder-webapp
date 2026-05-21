import i18n from './plugins/i18n';
import * as Sentry from '@sentry/browser';

/**
 * Processes a trace object and enriches it with the resolved summary/icon/category.
 *
 * @param {Object} params
 * @param {Object} params.log - The original log message received from the backend
 *
 * @example
 * const result = processLog({
 *   log: { trace: { trace: { orchestrationTrace: { ... } }, config: { agentName: 'manager' } } },
 * });
 *
 * @returns
 * {
 *   type: 'trace_update',
 *   data: {
 *     sessionId: 'string',
 *     orchestrationTrace: { ... } or guardrailTrace: { ... } or other relevant traces
 *   },
 *   config: {
 *     summary: 'string',
 *     icon: 'string',
 *     category: 'string',
 *     agentName: 'string'
 *   }
 * }
 */
export function processLog({ log }) {
  const trace = log?.trace?.trace || log?.trace || {};

  const {
    orchestrationTrace: { modelInvocationInput, modelInvocationOutput } = {},
  } = trace;

  const configData = log?.trace?.config || {};

  const traceConfig = getLogConfig({ trace, config: configData });

  return {
    type: log?.type,
    data:
      ['invoking_model', 'model_response_received'].includes(configData.type) ||
      modelInvocationInput ||
      modelInvocationOutput
        ? null
        : log?.trace,
    config: {
      ...configData,
      ...traceConfig,
    },
  };
}

function getLogConfig({ trace, config }) {
  const {
    orchestrationTrace: {
      invocationInput: {
        agentCollaboratorInvocationInput,
        knowledgeBaseLookupInput,
        actionGroupInvocationInput,
      } = {},
      observation: {
        agentCollaboratorInvocationOutput,
        knowledgeBaseLookupOutput,
        actionGroupInvocationOutput,
        finalResponse,
      } = {},
      modelInvocationInput,
      modelInvocationOutput,
      rationale,
    } = {},
    guardrailTrace,
    postProcessingTrace,
  } = trace;

  const { type: traceType } = config;

  const traceT = (key, params) =>
    i18n.global.t(`agent_builder.traces.${key}`, params);

  const mappingRules = [
    {
      type: 'search_result_received',
      key: knowledgeBaseLookupOutput,
      summary: traceT('search_result_received'),
      category: 'knowledge',
      icon: 'article',
    },
    {
      type: 'searching_knowledge_base',
      key: knowledgeBaseLookupInput,
      summary: traceT('searching_knowledge_base'),
      category: 'knowledge',
      icon: 'article',
    },
    {
      type: 'invoking_model',
      key: modelInvocationInput,
      summary: traceT('invoking_model'),
      category: 'model',
      icon: 'workspaces',
    },
    {
      type: 'model_response_received',
      key: modelInvocationOutput,
      summary: traceT('model_response_received'),
      category: 'model',
      icon: 'workspaces',
    },
    {
      type: 'thinking',
      key: rationale,
      summary: traceT('thinking'),
      category: 'thinking',
      icon: 'lightbulb',
    },
    {
      type: 'delegating_to_agent',
      key: agentCollaboratorInvocationInput,
      summary: traceT('delegating_to_agent'),
      category: 'delegating_to_agent',
      icon: 'login',
    },
    {
      type: 'forwarding_to_manager',
      key: agentCollaboratorInvocationOutput,
      summary: traceT('forwarding_to_manager'),
      category: 'forwarding_to_manager',
      icon: 'logout',
    },
    {
      type: 'executing_tool',
      key: actionGroupInvocationInput,
      summary: traceT('executing_tool', {
        function:
          config?.toolName ||
          actionGroupInvocationInput?.function?.split('-')?.[0],
      }),
      category: 'tool',
      icon: 'build',
    },
    config?.toolName === 'open-ticket'
      ? {
          type: 'tool_result_received',
          key: actionGroupInvocationOutput,
          summary: traceT('forwarding_to_human_support'),
          category: 'forwarding_to_human_support',
          icon: 'headphones',
        }
      : {
          type: 'tool_result_received',
          key: actionGroupInvocationOutput,
          summary: traceT('tool_result_received'),
          category: 'tool',
          icon: 'build',
        },
    config?.agentName && config?.agentName !== 'manager'
      ? {
          type: 'sending_response',
          key: finalResponse,
          summary: traceT('sending_response_for_manager'),
          category: 'sending_response_for_manager',
          icon: 'chat_bubble',
        }
      : {
          type: 'sending_response',
          key: finalResponse,
          summary: traceT('sending_final_response'),
          category: 'sending_final_response',
          icon: 'question_answer',
        },
    {
      type: 'applying_safety_rules',
      key: guardrailTrace,
      summary: traceT('applying_safety_rules'),
      category: 'applying_guardrails',
      icon: 'shield',
    },
    {
      type: 'processing_message',
      key: postProcessingTrace,
      summary: traceT('processing_message'),
      category: 'processing_message',
      icon: 'autorenew',
    },
  ];

  let summary = '';
  let icon = '';
  let category = '';

  const matched = mappingRules.find(
    ({ type, key }) => type === traceType || key !== undefined,
  );
  if (matched) {
    summary = matched.summary;
    icon = matched.icon;
    category = matched.category;
  } else {
    const error = new Error('No matching trace rules found');
    error.trace = JSON.stringify(trace);
    Sentry.captureException(error);
  }

  return {
    summary,
    category,
    icon,
  };
}
