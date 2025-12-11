import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import QuestionAndAnswer from '../index.vue';
import Message from '../Message.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import { processLog } from '@/utils/previewLogs';
import { formatTimestamp } from '@/utils/formatters';

vi.mock('@/utils/previewLogs', () => ({
  processLog: vi.fn(),
}));

vi.mock('@/utils/formatters', () => ({
  formatTimestamp: vi.fn().mockReturnValue('00/00/00 00:00'),
}));

const mockProcessLog = vi.mocked(processLog);

describe('QuestionAndAnswer index.vue', () => {
  let wrapper;
  let mockSupervisorStore;

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      Supervisor: {},
    },
  });

  const defaultProps = {
    isLoading: false,
    data: {
      id: 'message-123',
      source_type: 'user',
      text: 'Hello world',
      forwarded_human_support: false,
    },
  };

  const skeletonQuestion = () =>
    wrapper.find('[data-testid="skeleton-question"]');
  const skeletonAnswer = () => wrapper.find('[data-testid="skeleton-answer"]');
  const forwardedHumanSupport = () =>
    wrapper.find('[data-testid="forwarded-human-support"]');
  const questionMessage = () =>
    wrapper.findComponent('[data-testid="question"]');
  const questionDate = () => wrapper.find('[data-testid="question-date"]');
  const answerSection = () => wrapper.find('[data-testid="answer"]');
  const answerMessages = () =>
    wrapper.findAllComponents('[data-testid="answer-text"]');
  const previewLogs = () =>
    wrapper.findComponent('[data-testid="preview-logs"]');
  const answerDate = () => wrapper.find('[data-testid="answer-date"]');
  const viewLogsButton = () =>
    wrapper.findComponent('[data-testid="view-logs-button"]');

  const createWrapper = (props = {}) => {
    wrapper = shallowMount(QuestionAndAnswer, {
      props: {
        ...defaultProps,
        ...props,
      },
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicSkeletonLoading: {
            template: '<div />',
          },
          Message,
        },
      },
    });

    mockSupervisorStore = useSupervisorStore();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessLog.mockImplementation((log) => ({
      ...log,
      config: { currentAgent: 'test-agent' },
    }));
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component rendering', () => {
    it('renders skeleton loaders when loading', () => {
      createWrapper({ isLoading: true });

      expect(skeletonQuestion().exists()).toBe(true);
      expect(skeletonAnswer().exists()).toBe(true);
      expect(forwardedHumanSupport().exists()).toBe(false);
      expect(questionMessage().exists()).toBe(false);
      expect(answerSection().exists()).toBe(false);
    });

    it('renders forwarded human support when flag is true', () => {
      createWrapper({
        data: {
          ...defaultProps.data,
          forwarded_human_support: true,
        },
      });

      expect(forwardedHumanSupport().exists()).toBe(true);
      expect(questionMessage().exists()).toBe(false);
      expect(answerSection().exists()).toBe(false);
      expect(skeletonQuestion().exists()).toBe(false);
    });

    describe('User messages', () => {
      it('renders user message when source_type is user', () => {
        createWrapper({
          data: {
            id: 'user-message-1',
            source_type: 'user',
            text: 'User question',
          },
        });

        expect(questionMessage().exists()).toBe(true);
        expect(answerSection().exists()).toBe(false);
      });

      it('passes correct props to user Message component', () => {
        const userData = {
          id: 'user-message-1',
          source_type: 'user',
          text: 'User question',
        };

        createWrapper({ data: userData });

        expect(questionMessage().props('content')).toEqual(userData);
      });
    });

    describe('Agent messages', () => {
      it('renders agent answer section when source_type is agent', () => {
        createWrapper({
          data: {
            id: 'agent-message-1',
            source_type: 'agent',
            text: 'Agent response',
          },
        });

        expect(answerSection().exists()).toBe(true);
        expect(questionMessage().exists()).toBe(false);
      });

      it('renders single answer message by default', () => {
        createWrapper({
          data: {
            source_type: 'agent',
            text: 'Agent response',
          },
        });

        expect(answerMessages()).toHaveLength(1);
      });

      it('passes success scheme to agent Message components', () => {
        createWrapper({
          data: {
            source_type: 'agent',
            text: 'Agent response',
          },
        });

        expect(answerMessages()[0].props('scheme')).toBe('success');
      });
    });
  });

  describe('Component extraction and processing', () => {
    it('processes single component from text', () => {
      const textWithComponent = JSON.stringify({
        msg: { text: 'Component message' },
      });

      createWrapper({
        data: {
          source_type: 'agent',
          text: textWithComponent,
        },
      });

      expect(answerMessages()).toHaveLength(1);
      expect(answerMessages()[0].props('content')).toEqual({
        text: 'Component message',
      });
    });

    it('processes multiple components from text', () => {
      const component1 = JSON.stringify({ msg: { text: 'First message' } });
      const component2 = JSON.stringify({ msg: { text: 'Second message' } });
      const textWithComponents = `${component1}\n\n${component2}`;

      createWrapper({
        data: {
          source_type: 'agent',
          text: textWithComponents,
        },
      });

      expect(answerMessages()).toHaveLength(2);
      expect(answerMessages()[0].props('content')).toEqual({
        text: 'First message',
      });
      expect(answerMessages()[1].props('content')).toEqual({
        text: 'Second message',
      });
    });

    it('handles malformed JSON gracefully', () => {
      const textWithMalformedJSON = '{"invalid": json}}\n\n{"valid": "json"}';

      createWrapper({
        data: {
          source_type: 'agent',
          text: textWithMalformedJSON,
        },
      });

      expect(answerMessages()).toHaveLength(1);
    });

    it('falls back to original data when no valid components', () => {
      const originalData = {
        source_type: 'agent',
        text: 'Plain text without components',
      };

      createWrapper({ data: originalData });

      expect(answerMessages()).toHaveLength(1);
      expect(answerMessages()[0].props('content')).toEqual(originalData);
    });
  });

  describe('Logs functionality', () => {
    beforeEach(() => {
      mockSupervisorStore.loadLogs = vi.fn();
    });

    it('renders ViewLogsButton in agent messages', () => {
      createWrapper({
        data: {
          source_type: 'agent',
          text: 'Agent response',
        },
      });

      expect(viewLogsButton().exists()).toBe(true);
    });

    it('passes correct initial props to ViewLogsButton', () => {
      createWrapper({
        data: {
          source_type: 'agent',
          text: 'Agent response',
        },
      });

      expect(viewLogsButton().props()).toEqual({
        disabled: false,
        loading: false,
        active: false,
      });
    });

    it('does not render PreviewLogs initially', () => {
      createWrapper({
        data: {
          source_type: 'agent',
          text: 'Agent response',
        },
      });

      expect(previewLogs().exists()).toBe(false);
    });

    describe('Loading logs', () => {
      it('loads logs on first click', async () => {
        const mockLogs = [
          { id: 'log1', data: 'test' },
          { id: 'log2', data: 'test2' },
        ];
        mockSupervisorStore.loadLogs.mockResolvedValue(mockLogs);
        mockProcessLog.mockReturnValue({
          id: 'processed',
          config: { currentAgent: 'agent1' },
        });

        createWrapper({
          data: {
            id: 'message-123',
            source_type: 'agent',
            text: 'Agent response',
          },
        });

        await viewLogsButton().vm.$emit('click');
        await nextTick();

        expect(mockSupervisorStore.loadLogs).toHaveBeenCalledWith({
          messageId: 'message-123',
        });
        expect(mockProcessLog).toHaveBeenCalledTimes(2);
      });

      it('shows loading state while loading logs', async () => {
        mockSupervisorStore.loadLogs = vi.fn();

        createWrapper({
          data: {
            source_type: 'agent',
            text: 'Agent response',
          },
        });

        viewLogsButton().vm.$emit('click');
        await nextTick();

        expect(viewLogsButton().props('loading')).toBe(true);
        expect(viewLogsButton().props('disabled')).toBe(true);

        await nextTick();

        expect(viewLogsButton().props('loading')).toBe(false);
        expect(viewLogsButton().props('disabled')).toBe(false);
      });

      it('shows PreviewLogs after successful load', async () => {
        const mockLogs = [{ id: 'log1', data: 'test' }];
        mockSupervisorStore.loadLogs.mockResolvedValue(mockLogs);

        createWrapper({
          data: {
            source_type: 'agent',
            text: 'Agent response',
          },
        });

        await viewLogsButton().vm.$emit('click');
        await nextTick();

        expect(previewLogs().exists()).toBe(true);
        expect(previewLogs().props('logsSide')).toBe('right');
        expect(viewLogsButton().props('active')).toBe(true);
      });

      it('passes processed logs to PreviewLogs', async () => {
        const mockLogs = [
          { id: 'log1', data: 'test1' },
          { id: 'log2', data: 'test2' },
        ];
        const processedLogs = [
          { id: 'processed1', config: { currentAgent: 'agent1' } },
          { id: 'processed2', config: { currentAgent: 'agent2' } },
        ];

        mockSupervisorStore.loadLogs.mockResolvedValue(mockLogs);
        mockProcessLog
          .mockReturnValueOnce(processedLogs[0])
          .mockReturnValueOnce(processedLogs[1]);

        createWrapper({
          data: {
            source_type: 'agent',
            text: 'Agent response',
          },
        });

        await viewLogsButton().vm.$emit('click');
        await nextTick();

        expect(previewLogs().props('logs')).toEqual(processedLogs);
      });

      it('handles load logs error gracefully', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});
        mockSupervisorStore.loadLogs.mockRejectedValue(
          new Error('Load failed'),
        );

        createWrapper({
          data: {
            source_type: 'agent',
            text: 'Agent response',
          },
        });

        await viewLogsButton().vm.$emit('click');
        await nextTick();

        expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Load failed'));
        expect(viewLogsButton().props('loading')).toBe(false);
        expect(previewLogs().exists()).toBe(false);

        consoleErrorSpy.mockRestore();
      });
    });

    describe('Toggling logs visibility', () => {
      it('toggles logs visibility on subsequent clicks', async () => {
        const mockLogs = [{ id: 'log1', data: 'test' }];
        mockSupervisorStore.loadLogs.mockResolvedValue(mockLogs);

        createWrapper({
          data: {
            source_type: 'agent',
            text: 'Agent response',
          },
        });

        await viewLogsButton().vm.$emit('click');
        await nextTick();

        expect(previewLogs().exists()).toBe(true);
        expect(viewLogsButton().props('active')).toBe(true);

        await viewLogsButton().vm.$emit('click');
        await nextTick();

        expect(previewLogs().exists()).toBe(false);
        expect(viewLogsButton().props('active')).toBe(false);
        expect(mockSupervisorStore.loadLogs).toHaveBeenCalledTimes(1);
      });

      it('does not trigger when already loading', async () => {
        let resolveLoadLogs;
        const loadLogsPromise = new Promise((resolve) => {
          resolveLoadLogs = resolve;
        });
        mockSupervisorStore.loadLogs.mockReturnValue(loadLogsPromise);

        createWrapper({
          data: {
            source_type: 'agent',
            text: 'Agent response',
          },
        });

        viewLogsButton().vm.$emit('click');
        await nextTick();

        expect(viewLogsButton().props('loading')).toBe(true);

        viewLogsButton().vm.$emit('click');
        await nextTick();

        expect(mockSupervisorStore.loadLogs).toHaveBeenCalledTimes(1);

        resolveLoadLogs([]);
        await nextTick();
      });
    });

    describe('Message date formatting', () => {
      it('formats the question date correctly', () => {
        const mockDate = '2021-01-01T00:00:00Z';
        createWrapper({
          data: {
            source_type: 'user',
            text: 'User question',
            created_at: mockDate,
          },
        });

        expect(questionDate().text()).toBe(formatTimestamp(mockDate));
      });

      it('formats the answer date correctly', () => {
        const mockDate = '2021-01-01T00:00:00Z';
        createWrapper({
          data: {
            source_type: 'agent',
            text: 'Agent response',
            created_at: mockDate,
          },
        });

        expect(answerDate().text()).toBe(formatTimestamp(mockDate));
      });
    });
  });
});
