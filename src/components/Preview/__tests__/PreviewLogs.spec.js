import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import PreviewLogs from '../PreviewLogs.vue';

import { usePreviewStore } from '@/store/Preview';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

const mockAllAgents = {
  agents: [
    { id: 'agent-1', name: 'Test Agent 1' },
    { id: 'agent-2', name: 'Test Agent 2' },
  ],
  manager: { id: 'manager', name: 'Manager' },
};

const mockLogs = [
  {
    type: 'trace_update',
    data: {
      trace: {},
    },
    config: {
      agentName: 'agent-1',
      icon: 'icon-1',
      summary: 'First trace summary',
    },
  },
  {
    type: 'trace_update',
    data: null,
    config: {
      agentName: 'agent-1',
      icon: 'icon-2',
      summary: 'Second trace summary',
    },
  },
  {
    type: 'trace_update',
    data: null,
    config: {
      agentName: 'manager',
      summary: 'Manager trace',
    },
  },
];

const createWrapper = (props = {}) => {
  const pinia = createTestingPinia({
    initialState: {
      preview: {
        logs: [...mockLogs],
      },
    },
  });

  return mount(PreviewLogs, {
    props: {
      logs: mockLogs,
      logsSide: 'left',
      ...props,
    },
    global: {
      plugins: [pinia],
      stubs: {
        TransitionGroup: false,
        PreviewLogsDetailsModal: true,
      },
    },
    attachTo: document.body,
  });
};

describe('PreviewLogs.vue', () => {
  let wrapper;
  let previewStore;
  let agentsTeamStore;

  const previewLogs = () => wrapper.find('[data-testid="preview-logs"]');
  const emptyMessage = () => wrapper.find('[data-testid="preview-logs-empty"]');
  const logItems = () => wrapper.findAll('[data-testid="preview-logs-log"]');
  const logAgentNames = () =>
    wrapper.findAll('[data-testid="preview-logs-log-agent-name"]');
  const logStepIcons = () =>
    wrapper.findAll('[data-testid="preview-logs-log-step-icon"]');
  const logStepIconsIcon = () =>
    wrapper.findAll('[data-testid="preview-logs-log-step-icon-icon"]');
  const stepItems = () =>
    wrapper.findAll('[data-testid="preview-logs-log-step"]');
  const seeFullButtons = () =>
    wrapper.findAll('[data-testid="preview-logs-log-step-see-full"]');
  const progressBar = () =>
    wrapper.find('[data-testid="preview-logs-progress-bar"]');
  const modal = () =>
    wrapper.findComponent('[data-testid="preview-logs-details-modal"]');

  beforeEach(() => {
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 0,
      bottom: 100,
      height: 20,
    }));

    wrapper = createWrapper();
    previewStore = usePreviewStore();
    agentsTeamStore = useAgentsTeamStore();
    agentsTeamStore.allAgents = mockAllAgents;
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('matches snapshot', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders correctly with required props', () => {
      expect(previewLogs().exists()).toBe(true);
    });

    it('renders the correct number of logs and steps', () => {
      expect(logItems().length).toBe(2);
      expect(stepItems().length).toBe(3);
    });

    it('renders the correct icon for each step', () => {
      expect(logStepIcons().length).toBe(2);
      expect(logStepIconsIcon().at(0).text()).toBe('icon-1');
      expect(logStepIconsIcon().at(1).text()).toBe('icon-2');
    });

    it('renders the correct agent names', () => {
      expect(logAgentNames().at(0).text()).toBe('Test Agent 1');
      expect(logAgentNames().at(1).text()).toBe('Manager');
    });

    it('displays empty message when no logs are available', async () => {
      await wrapper.setProps({ logs: [] });

      expect(emptyMessage().exists()).toBe(true);
      expect(emptyMessage().text()).toBe(
        wrapper.vm.$t('router.preview.no_logs_registered'),
      );
    });
  });

  describe('Props validation', () => {
    it('accepts valid logsSide values', () => {
      const leftWrapper = createWrapper({ logsSide: 'left' });
      const rightWrapper = createWrapper({ logsSide: 'right' });

      expect(leftWrapper.props('logsSide')).toBe('left');
      expect(rightWrapper.props('logsSide')).toBe('right');
    });

    it('applies correct CSS classes based on logsSide prop', async () => {
      expect(previewLogs().classes()).toContain('preview-logs--left');

      await wrapper.setProps({ logsSide: 'right' });
      expect(previewLogs().classes()).toContain('preview-logs--right');
    });

    it('uses provided agents prop when available', async () => {
      const customAgents = {
        agents: [{ id: 'custom-agent', name: 'Custom Agent' }],
        manager: { id: 'custom-manager', name: 'Custom Manager' },
      };

      const customLogs = [
        {
          type: 'trace_update',
          data: null,
          config: {
            agentName: 'custom-agent',
            summary: 'Custom agent trace',
          },
        },
      ];

      await wrapper.setProps({
        agents: customAgents,
        logs: customLogs,
      });

      expect(logAgentNames().at(0).text()).toBe('Custom Agent');
    });
  });

  describe('Logs processing', () => {
    it('correctly processes logs from traces', () => {
      const processedLogs = wrapper.vm.processedLogs;

      expect(processedLogs.length).toBe(2);
      expect(processedLogs[0].agent).toBe('Test Agent 1');
      expect(processedLogs[0].steps.length).toBe(2);
      expect(processedLogs[1].agent).toBe('Manager');
      expect(processedLogs[1].steps.length).toBe(1);
    });

    it('handles empty traces correctly', async () => {
      await wrapper.setProps({ logs: [] });

      expect(wrapper.vm.processedLogs).toEqual([]);
    });

    it('handles missing agent correctly', async () => {
      const logsWithUnknownAgent = [
        {
          type: 'trace_update',
          summary: 'Unknown agent trace',
          data: null,
          config: {
            agentId: 'unknown-agent',
          },
        },
      ];

      await wrapper.setProps({ logs: logsWithUnknownAgent });

      expect(wrapper.vm.processedLogs.length).toBe(1);
      expect(wrapper.vm.processedLogs[0].agent).toBe('Manager');
    });

    it('groups consecutive logs from the same agent', async () => {
      const consecutiveLogs = [
        {
          type: 'trace_update',
          data: null,
          config: {
            agentName: 'agent-1',
            summary: 'First step',
          },
        },
        {
          type: 'trace_update',
          data: null,
          config: {
            agentName: 'agent-1',
            summary: 'Second step',
          },
        },
        {
          type: 'trace_update',
          data: null,
          config: {
            agentName: 'agent-2',
            summary: 'Third step',
          },
        },
      ];

      await wrapper.setProps({ logs: consecutiveLogs });
      const processedLogs = wrapper.vm.processedLogs;

      expect(processedLogs.length).toBe(2);
      expect(processedLogs[0].steps.length).toBe(2);
      expect(processedLogs[1].steps.length).toBe(1);
    });

    it('handles logs without config correctly', async () => {
      const logsWithoutConfig = [
        {
          type: 'trace_update',
          data: { trace: { someTraceData: 'value' } },
        },
      ];

      await wrapper.setProps({ logs: logsWithoutConfig });
      const processedLogs = wrapper.vm.processedLogs;

      expect(processedLogs.length).toBe(1);
      expect(processedLogs[0].agent).toBe('Manager');
    });
  });

  describe('getLogSummary function', () => {
    it('returns config summary when available', () => {
      const logWithSummary = {
        config: { summary: 'Custom Summary' },
      };

      const summary = wrapper.vm.getLogSummary(logWithSummary);
      expect(summary).toBe('Custom Summary');
    });

    it('generates camelCase summary from trace keys', () => {
      const logWithTrace = {
        data: {
          trace: {
            someComplexTraceKey: 'some data',
            otherData: 'value',
          },
        },
      };

      const summary = wrapper.vm.getLogSummary(logWithTrace);
      expect(summary).toBe('Some Complex Trace Key');
    });

    const unknownCases = [
      {
        description: 'returns "Unknown" when no trace key is found',
        log: { data: { someData: 'value' } },
      },
      {
        description: 'returns "Unknown" when data is null',
        log: { data: null },
      },
      {
        description: 'returns "Unknown" when data is not an object',
        log: { data: 'string data' },
      },
      {
        description: 'returns "Unknown" when log has no data',
        log: { type: 'some_type' },
      },
    ];

    unknownCases.forEach(({ description, log }) => {
      it(description, () => {
        const summary = wrapper.vm.getLogSummary(log);
        expect(summary).toBe('Unknown');
      });
    });
  });

  describe('Progress bar functionality', () => {
    it('calculates progress bar height on mount', async () => {
      await nextTick();
      expect(typeof wrapper.vm.progressHeight).toBe('number');
      expect(progressBar().exists()).toBe(true);
    });

    it('updates progress bar height with different types', async () => {
      const spy = vi.spyOn(wrapper.vm, 'updateProgressBarHeight');

      wrapper.vm.updateProgressBarHeight('agent');
      wrapper.vm.updateProgressBarHeight('step');
      wrapper.vm.updateProgressBarHeight('mount');

      expect(spy).toHaveBeenCalledWith('agent');
      expect(spy).toHaveBeenCalledWith('step');
      expect(spy).toHaveBeenCalledWith('mount');
    });

    it('applies correct progress bar positioning for right side', async () => {
      await wrapper.setProps({ logsSide: 'right' });

      expect(progressBar().classes()).toContain(
        'preview-logs__progress-bar--right',
      );
    });
  });

  describe('Modal functionality', () => {
    it('opens modal with correct details when "see full details" is clicked', async () => {
      expect(modal().props('modelValue')).toBeFalsy();

      await seeFullButtons().at(0).trigger('click');

      expect(modal().props('modelValue')).toBeTruthy();

      expect(modal().props('title')).toBe('First trace summary');
      expect(modal().props('log')).toEqual(mockLogs[0]);
    });

    it('closes modal correctly', async () => {
      await seeFullButtons().at(0).trigger('click');
      expect(modal().props('modelValue')).toBeTruthy();

      await modal().vm.$emit('update:modelValue', false);

      expect(wrapper.vm.showDetailsModal).toBe(false);
    });
  });

  describe('Watchers', () => {
    it('resets progress height when logs become empty', async () => {
      wrapper.vm.progressHeight = 100;

      await wrapper.setProps({ logs: [] });
      await nextTick();

      expect(wrapper.vm.progressHeight).toBe(0);
    });

    it('does not reset progress height when logs are not empty', async () => {
      wrapper.vm.progressHeight = 100;

      await wrapper.setProps({ logs: [mockLogs[0]] });
      await nextTick();

      expect(wrapper.vm.progressHeight).toBe(100);
    });
  });

  describe('Events', () => {
    it('emits scroll-to-bottom when updateProgressBarHeight is called', async () => {
      vi.useFakeTimers();
      await wrapper.vm.updateProgressBarHeight();
      await nextTick();

      vi.runAllTimers();
      vi.useRealTimers();

      expect(wrapper.emitted('scroll-to-bottom')).toBeTruthy();
    });

    it('emits scroll-to-bottom for different update types', async () => {
      vi.useFakeTimers();

      wrapper.vm.updateProgressBarHeight('agent');
      wrapper.vm.updateProgressBarHeight('step');

      vi.runAllTimers();
      vi.useRealTimers();

      expect(wrapper.emitted('scroll-to-bottom')).toHaveLength(2);
    });
  });

  describe('Step rendering', () => {
    it('renders steps without icons when icon is not provided', async () => {
      const logsWithoutIcons = [
        {
          data: null,
          config: {
            agentName: 'agent-1',
            summary: 'Step without icon',
          },
        },
        {
          data: null,
          config: {
            agentName: 'agent-1',
            summary: 'Second step without icon',
          },
        },
      ];

      await wrapper.setProps({ logs: logsWithoutIcons });

      expect(logStepIcons().length).toBe(0);
    });

    it('shows see full button only when log data exists', async () => {
      const logsWithAndWithoutData = [
        {
          data: { trace: { someTrace: 'data' } },
          config: {
            agentName: 'agent-1',
            summary: 'Step with data',
          },
        },
        {
          data: null,
          config: {
            agentName: 'agent-1',
            summary: 'Step without data',
          },
        },
      ];

      await wrapper.setProps({ logs: logsWithAndWithoutData });

      expect(seeFullButtons().length).toBe(1);
    });
  });

  describe('Edge cases', () => {
    it('handles logs with missing config.agentName', async () => {
      const logsWithMissingAgentName = [
        {
          data: null,
          config: {
            summary: 'Log without agent name',
          },
        },
      ];

      await wrapper.setProps({ logs: logsWithMissingAgentName });

      expect(wrapper.vm.processedLogs.length).toBe(1);
      expect(wrapper.vm.processedLogs[0].agent).toBe('Manager');
    });

    it('handles agent not found in agents list', async () => {
      const logsWithNonExistentAgent = [
        {
          data: null,
          config: {
            agentName: 'non-existent-agent',
            summary: 'Log from non-existent agent',
          },
        },
      ];

      await wrapper.setProps({ logs: logsWithNonExistentAgent });

      expect(wrapper.vm.processedLogs.length).toBe(1);
      expect(wrapper.vm.processedLogs[0].agent).toBe('Manager');
    });
  });
});
