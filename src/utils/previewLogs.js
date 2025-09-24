import i18n from './plugins/i18n';
import * as Sentry from '@sentry/browser';

/**
 * Processes a trace object and updates it with additional configuration and collaborator information.
 *
 * @param {Object} trace - The original trace object to process
 * @param {string} currentAgent - The name of the collaborator that was invoked
 *
 * @example
 * const result = processLog({
 *   trace: { trace: { trace: { orchestrationTrace: { ... } } } },
 *   currentAgent: 'string'
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
 *     currentAgent: 'string'
 *   }
 * }
 */
export function processLog({ log, currentAgent }) {
  const trace = log?.trace?.trace || log?.trace || {};

  const {
    orchestrationTrace: {
      invocationInput: { agentCollaboratorInvocationInput } = {},
      observation: { agentCollaboratorInvocationOutput } = {},
      modelInvocationInput,
      modelInvocationOutput,
    } = {},
  } = trace;

  const configData = log?.trace?.config || {};

  let updatedCollaborator = currentAgent;
  if (!configData.agentName) {
    updatedCollaborator = addAgentToConfig({
      currentAgent,
      input: agentCollaboratorInvocationInput,
      output: agentCollaboratorInvocationOutput,
      config: configData,
    });
  }

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
      currentAgent: updatedCollaborator,
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
    {
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

/**
 * This function is necessary to maintain agent sequencing according to the invoke,
 * since the agent only sends its ID in the input and output, and not in all of its traces
 * @param {Object} config - The config object to update
 * @param {string} currentAgent - The name of the collaborator that was invoked
 * @param {Object} input - The input object
 * @param {Object} output - The output object
 */
function addAgentToConfig({ currentAgent, input, output, config }) {
  const traceInvokingAgent = input?.agentCollaboratorName;
  const traceOutputAgent = output?.agentCollaboratorName;

  let updatedCollaborator = currentAgent;
  if (traceInvokingAgent) updatedCollaborator = traceInvokingAgent;
  else if (traceOutputAgent) updatedCollaborator = '';

  const agentName =
    traceInvokingAgent || traceOutputAgent || updatedCollaborator;

  if (agentName) {
    config.agentName = agentName;
  }

  return updatedCollaborator;
}
