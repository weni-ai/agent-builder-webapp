import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Sentry from '@sentry/browser';

import { processLog } from '../previewLogs.js';
import i18n from '@/utils/plugins/i18n';

vi.mock('@sentry/browser', () => ({
  captureException: vi.fn(),
}));

describe('previewLogs.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processLog', () => {
    const createMockTrace = (overrides = {}) => ({
      orchestrationTrace: {
        invocationInput: {},
        observation: {},
        ...overrides,
      },
    });

    const createMockLog = (traceOverrides = {}, type = 'trace_update') => ({
      type,
      trace: {
        trace: createMockTrace(traceOverrides),
      },
    });

    describe('Basic functionality', () => {
      it('should preserve type, trace data and forward backend config (agentName)', () => {
        const mockLog = {
          type: 'trace_update',
          trace: {
            trace: createMockTrace(),
            config: { agentName: 'manager' },
          },
        };

        const result = processLog({ log: mockLog });

        expect(result).toEqual({
          type: 'trace_update',
          data: { trace: createMockTrace(), config: { agentName: 'manager' } },
          config: {
            agentName: 'manager',
            summary: '',
            category: '',
            icon: '',
          },
        });
      });

      it('should handle log with nested trace structure and final response', () => {
        const mockLog = {
          type: 'trace_update',
          trace: {
            trace: createMockTrace({
              observation: {
                finalResponse: { text: 'Final response' },
              },
            }),
          },
        };

        const result = processLog({ log: mockLog });

        expect(result.type).toBe('trace_update');
        expect(result.config.summary).toBe('Sending final response');
        expect(result.config.icon).toBe('question_answer');
        expect(result.config.category).toBe('sending_final_response');
      });

      it('should handle log with direct trace structure', () => {
        const mockLog = {
          type: 'trace_update',
          trace: createMockTrace({
            observation: {
              knowledgeBaseLookupOutput: { results: [] },
            },
          }),
        };

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe(
          i18n.global.t('agent_builder.traces.search_result_received'),
        );
        expect(result.config.icon).toBe('article');
        expect(result.config.category).toBe('knowledge');
      });
    });

    describe('Knowledge base traces', () => {
      it('should process knowledge base lookup input', () => {
        const mockLog = createMockLog({
          invocationInput: {
            knowledgeBaseLookupInput: { query: 'test query' },
          },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe(
          i18n.global.t('agent_builder.traces.searching_knowledge_base'),
        );
        expect(result.config.icon).toBe('article');
        expect(result.config.category).toBe('knowledge');
      });

      it('should process knowledge base lookup output', () => {
        const mockLog = createMockLog({
          observation: {
            knowledgeBaseLookupOutput: { results: ['result1', 'result2'] },
          },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe(
          i18n.global.t('agent_builder.traces.search_result_received'),
        );
        expect(result.config.icon).toBe('article');
        expect(result.config.category).toBe('knowledge');
      });
    });

    describe('Model invocation traces', () => {
      it('should process model invocation input', () => {
        const mockLog = createMockLog({
          modelInvocationInput: { prompt: 'test prompt' },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe(
          i18n.global.t('agent_builder.traces.invoking_model'),
        );
        expect(result.config.icon).toBe('workspaces');
        expect(result.config.category).toBe('model');
        expect(result.data).toBeNull();
      });

      it('should process model invocation output', () => {
        const mockLog = createMockLog({
          modelInvocationOutput: { response: 'test response' },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe('Model response received');
        expect(result.config.icon).toBe('workspaces');
        expect(result.config.category).toBe('model');
        expect(result.data).toBeNull();
      });
    });

    describe('Agent collaboration traces', () => {
      it('should process agent collaborator invocation input', () => {
        const mockLog = createMockLog({
          invocationInput: {
            agentCollaboratorInvocationInput: {
              agentCollaboratorName: 'collaborator-agent',
            },
          },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe(
          i18n.global.t('agent_builder.traces.delegating_to_agent'),
        );
        expect(result.config.icon).toBe('login');
        expect(result.config.category).toBe('delegating_to_agent');
      });

      it('should process agent collaborator invocation output', () => {
        const mockLog = createMockLog({
          observation: {
            agentCollaboratorInvocationOutput: {
              agentCollaboratorName: 'output-agent',
            },
          },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe(
          i18n.global.t('agent_builder.traces.forwarding_to_manager'),
        );
        expect(result.config.icon).toBe('logout');
        expect(result.config.category).toBe('forwarding_to_manager');
      });
    });

    describe('Tool/Action group traces', () => {
      it('should process action group invocation input', () => {
        const mockLog = createMockLog({
          invocationInput: {
            actionGroupInvocationInput: {
              function: 'searchTool-76',
            },
          },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe('Executing tool searchTool');
        expect(result.config.icon).toBe('build');
        expect(result.config.category).toBe('tool');
      });

      it('should process action group invocation input without function', () => {
        const mockLog = createMockLog({
          invocationInput: {
            actionGroupInvocationInput: {},
          },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe('Executing tool ');
        expect(result.config.icon).toBe('build');
        expect(result.config.category).toBe('tool');
      });

      it('should process action group invocation output', () => {
        const mockLog = createMockLog({
          observation: {
            actionGroupInvocationOutput: { result: 'tool result' },
          },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe(
          i18n.global.t('agent_builder.traces.tool_result_received'),
        );
        expect(result.config.icon).toBe('build');
        expect(result.config.category).toBe('tool');
      });
    });

    describe('Final response traces', () => {
      it('should process final response without agent name as final response', () => {
        const mockLog = createMockLog({
          observation: {
            finalResponse: { text: 'Final response' },
          },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe('Sending final response');
        expect(result.config.icon).toBe('question_answer');
        expect(result.config.category).toBe('sending_final_response');
      });

      it('should process final response with collaborator agent name as response for manager', () => {
        const mockLog = {
          type: 'trace_update',
          trace: {
            trace: createMockTrace({
              observation: {
                finalResponse: { text: 'Final response' },
              },
            }),
            config: { agentName: 'collaborator' },
          },
        };

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe(
          i18n.global.t('agent_builder.traces.sending_response_for_manager'),
        );
        expect(result.config.icon).toBe('chat_bubble');
        expect(result.config.category).toBe('sending_response_for_manager');
        expect(result.config.agentName).toBe('collaborator');
      });

      it('should process final response with agentName "manager" as final response', () => {
        const mockLog = {
          type: 'trace_update',
          trace: {
            trace: createMockTrace({
              observation: {
                finalResponse: { text: 'Final response' },
              },
            }),
            config: { agentName: 'manager' },
          },
        };

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe('Sending final response');
        expect(result.config.icon).toBe('question_answer');
        expect(result.config.category).toBe('sending_final_response');
        expect(result.config.agentName).toBe('manager');
      });
    });

    describe('Rationale traces', () => {
      it('should process rationale traces', () => {
        const mockLog = createMockLog({
          rationale: { text: 'Thinking process' },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe('Thinking');
        expect(result.config.icon).toBe('lightbulb');
        expect(result.config.category).toBe('thinking');
      });
    });

    describe('Guardrail traces', () => {
      it('should process guardrail traces', () => {
        const mockLog = {
          type: 'trace_update',
          trace: {
            trace: {
              guardrailTrace: { action: 'block' },
            },
          },
        };

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe(
          i18n.global.t('agent_builder.traces.applying_safety_rules'),
        );
        expect(result.config.icon).toBe('shield');
        expect(result.config.category).toBe('applying_guardrails');
      });
    });

    describe('Post-processing traces', () => {
      it('should process post-processing traces', () => {
        const mockLog = {
          type: 'trace_update',
          trace: {
            trace: {
              postProcessingTrace: { step: 'formatting' },
            },
          },
        };

        const result = processLog({ log: mockLog });

        expect(result.config.summary).toBe('Processing message');
        expect(result.config.icon).toBe('autorenew');
        expect(result.config.category).toBe('processing_message');
      });
    });

    describe('Error handling', () => {
      it('should capture Sentry exception when no matching trace rules found', () => {
        const mockLog = createMockLog();

        processLog({ log: mockLog });

        expect(Sentry.captureException).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'No matching trace rules found',
            trace: expect.any(String),
          }),
        );
      });

      it('should handle logs with empty traces gracefully', () => {
        const mockLog = {
          type: 'trace_update',
          trace: {},
        };

        const result = processLog({ log: mockLog });

        expect(result).toEqual({
          type: 'trace_update',
          data: {},
          config: {
            summary: '',
            category: '',
            icon: '',
          },
        });
      });

      it('should handle logs with null/undefined trace', () => {
        const mockLog = {
          type: 'trace_update',
          trace: null,
        };

        const result = processLog({ log: mockLog });

        expect(result).toEqual({
          type: 'trace_update',
          data: null,
          config: {
            summary: '',
            category: '',
            icon: '',
          },
        });
      });
    });

    describe('Agent name passthrough', () => {
      it('passes through agentName from backend config', () => {
        const mockLog = {
          type: 'trace_update',
          trace: {
            trace: createMockTrace({
              rationale: { text: 'Thinking' },
            }),
            config: { agentName: 'Concierge' },
          },
        };

        const result = processLog({ log: mockLog });

        expect(result.config.agentName).toBe('Concierge');
      });

      it('leaves config.agentName undefined when backend did not send it', () => {
        const mockLog = createMockLog({
          rationale: { text: 'Thinking' },
        });

        const result = processLog({ log: mockLog });

        expect(result.config.agentName).toBeUndefined();
      });
    });
  });
});
