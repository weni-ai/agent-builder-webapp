import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import useFlowPreview, { isMT, isMessage } from '../useFlowPreview';

const mockPost = vi.fn();
const MESSAGE_DELAY_MS = 200;

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: mockPost,
    })),
  },
}));

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

vi.stubEnv('FLOWS_API_BASE_URL', 'http://mock-api.com');

const mockFlowUuid = 'mock-flow-uuid';
const mockAuthToken = 'mockAuthToken';
const mockEvent = {
  type: 'msg_created',
  msg: { text: 'Hello' },
  step_uuid: 'step-uuid',
};
const mockContact = { urns: ['tel:1234567890'], uuid: 'mock-uuid' };
const mockSession = {
  runs: [{ path: [{ uuid: 'step-uuid', exit_uuid: 'exit-uuid' }] }],
};

describe('useFlowPreview', () => {
  let flowPreview;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('authToken', mockAuthToken);

    flowPreview = useFlowPreview();
    flowPreview.preview.value.flowUuid = mockFlowUuid;
    flowPreview.preview.value.contact = mockContact;
    flowPreview.preview.value.session = {
      contact: mockContact,
      runs: mockSession.runs,
    };

    mockPost.mockResolvedValue({
      data: {
        events: [mockEvent],
        session: mockSession,
      },
    });
  });

  describe('utility functions', () => {
    it('should correctly identify message types', () => {
      expect(isMT(mockEvent)).toBe(true);
      expect(isMessage(mockEvent)).toBe(true);
    });
  });

  describe('computed properties', () => {
    it('should create axios client with correct baseURL', () => {
      flowPreview.previewStart({
        flowUuid: mockFlowUuid,
      });

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://mock-api.com',
      });
    });

    it('previewAPI should return a function to make API calls', () => {
      const body = { key: 'value' };
      flowPreview.previewAPI.value(body);

      expect(mockPost).toHaveBeenCalledWith(
        `api/v2/flows/${mockFlowUuid}/simulate`,
        body,
        {
          headers: {
            Authorization: mockAuthToken,
          },
        },
      );
    });
  });

  describe('previewInit', () => {
    it('should initialize preview contact correctly', () => {
      const contentBaseUuid = 'test-content-base-uuid';
      flowPreview.previewInit({ contentBaseUuid });

      expect(flowPreview.preview.value.contact.uuid).toBe('mock-uuid');
      expect(flowPreview.preview.value.contact.urns[0]).toMatch(/^tel:/);
    });
  });

  describe('previewUpdateEvents', () => {
    it('should update events correctly', () => {
      const callback = vi.fn();
      const events = [mockEvent];
      const recentMessages = {};

      flowPreview.previewUpdateEvents(
        events,
        mockSession,
        recentMessages,
        callback,
      );

      expect(flowPreview.preview.value.events).toContainEqual(mockEvent);
      expect(callback).toHaveBeenCalled();
    });

    it('should save quick replies if event is of message type (MT) and has quick replies', () => {
      const callback = vi.fn();
      const mockQuickReplies = ['reply1', 'reply2'];
      const recentMessages = {};

      const mtEvent = {
        type: 'msg_created',
        msg: {
          text: 'This is a message',
          quick_replies: mockQuickReplies,
        },
        step_uuid: 'step-uuid',
        created_on: new Date().toISOString(),
      };

      const events = [mtEvent];
      flowPreview.previewUpdateEvents(
        events,
        mockSession,
        recentMessages,
        callback,
      );

      expect(flowPreview.preview.value.events).toContainEqual(mtEvent);
      expect(flowPreview.preview.value.quickReplies).toEqual(mockQuickReplies);
      expect(callback).toHaveBeenCalled();
    });

    it('should call setTimeout and re-call previewUpdateEvents if events remain', () => {
      vi.useFakeTimers();
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const callback = vi.fn();
      const mockEvent2 = { ...mockEvent, id: 2 };
      const recentMessages = {};
      const events = [mockEvent, mockEvent2];
      const session = { runs: mockSession.runs };

      flowPreview.previewUpdateEvents(
        events,
        session,
        recentMessages,
        callback,
      );

      expect(setTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        MESSAGE_DELAY_MS,
      );
      expect(events).toHaveLength(1);

      vi.runAllTimers();

      expect(events).toHaveLength(0);
      expect(callback).toHaveBeenCalled();
      vi.useRealTimers();
      setTimeoutSpy.mockRestore();
    });

    it('should call the callback immediately if events are initially empty', () => {
      const callback = vi.fn();
      const events = [];
      const recentMessages = {};
      const session = { runs: mockSession.runs };

      flowPreview.previewUpdateEvents(
        events,
        session,
        recentMessages,
        callback,
      );

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('previewHasQuickReplies', () => {
    it('should correctly handle previewHasQuickReplies', () => {
      flowPreview.preview.value.quickReplies = {};
      expect(flowPreview.previewHasQuickReplies()).toBe(false);

      flowPreview.preview.value.quickReplies = [];
      expect(flowPreview.previewHasQuickReplies()).toBe(false);

      flowPreview.preview.value.quickReplies = ['reply1'];
      expect(flowPreview.previewHasQuickReplies()).toBe(true);
    });
  });

  describe('previewUpdateRunContext', () => {
    test.each([
      { hintType: 'audio', expectedDrawerType: 'audio' },
      { hintType: 'video', expectedDrawerType: 'videos' },
      { hintType: 'image', expectedDrawerType: 'images' },
      { hintType: 'location', expectedDrawerType: 'location' },
      { hintType: 'digits', hintCount: 1, expectedDrawerType: 'digit' },
      { hintType: 'digits', hintCount: 2, expectedDrawerType: 'digits' },
      {
        hintType: 'unknown',
        expectedDrawerType: null,
        expectedLog: 'Unknown hint',
      },
    ])(
      'should handle hintType $hintType and expect drawerType $expectedDrawerType',
      async ({ hintType, hintCount, expectedDrawerType, expectedLog }) => {
        const originalLog = console.log;
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        const runContext = {
          session: {
            runs: mockSession.runs,
            wait: {
              hint: {
                type: hintType,
                count: hintCount,
              },
            },
          },
          events: [mockEvent],
        };

        await flowPreview.previewUpdateRunContext(runContext);

        if (expectedDrawerType) {
          expect(flowPreview.preview.value.drawerType).toBe(expectedDrawerType);
        }

        if (expectedLog) {
          expect(logSpy).toHaveBeenCalledWith(expectedLog, hintType);
        } else {
          expect(logSpy).not.toHaveBeenCalled();
        }

        console.log = originalLog;
        logSpy.mockRestore();
      },
    );
  });

  describe('previewUpdateActivity', () => {
    it('should update activity correctly', () => {
      const recentMessages = {};
      flowPreview.previewUpdateActivity(recentMessages);
      expect(flowPreview.preview.value.session).toBeTruthy();
    });

    it('should update paths and recentMessages correctly when session is present', () => {
      const recentMessages = {};
      flowPreview.preview.value.session = {
        runs: [
          {
            path: [
              { node_uuid: 'node1', exit_uuid: 'exit1' },
              { node_uuid: 'node2', exit_uuid: 'exit2' },
            ],
            flow_uuid: 'flow1',
          },
        ],
        status: 'waiting',
      };

      flowPreview.previewUpdateActivity(recentMessages);

      expect(recentMessages).toHaveProperty('exit1:node2');
      expect(recentMessages['exit1:node2']).toEqual([]);
      expect(recentMessages).toHaveProperty('exit2:null');
      expect(recentMessages['exit2:null']).toEqual([]);
      expect(flowPreview.preview.value.session).toBeTruthy();
    });

    it('should handle multiple runs and update active nodes and activeFlow correctly', () => {
      const recentMessages = {};
      flowPreview.preview.value.session = {
        runs: [
          {
            path: [
              { node_uuid: 'node1', exit_uuid: 'exit1' },
              { node_uuid: 'node2', exit_uuid: 'exit2' },
            ],
            flow_uuid: 'flow1',
          },
          {
            path: [
              { node_uuid: 'node3', exit_uuid: 'exit3' },
              { node_uuid: 'node4', exit_uuid: 'exit4' },
            ],
            flow_uuid: 'flow2',
          },
        ],
        status: 'waiting',
      };

      flowPreview.previewUpdateActivity(recentMessages);

      expect(recentMessages).toHaveProperty('exit1:node2');
      expect(recentMessages['exit1:node2']).toEqual([]);
      expect(recentMessages).toHaveProperty('exit2:null');
      expect(recentMessages['exit2:null']).toEqual([]);
      expect(recentMessages).toHaveProperty('exit3:node4');
      expect(recentMessages['exit3:node4']).toEqual([]);
      expect(recentMessages).toHaveProperty('exit4:null');
      expect(recentMessages['exit4:null']).toEqual([]);
      expect(flowPreview.preview.value.session).toBeTruthy();
    });

    it('should do nothing when session is not present', () => {
      const recentMessages = {};
      flowPreview.preview.value.session = null;

      flowPreview.previewUpdateActivity(recentMessages);

      expect(flowPreview.preview.value.session).toBeNull();
      expect(recentMessages).toEqual({});
    });
  });

  describe('previewResume', () => {
    it('should correctly handle previewResume with no text', async () => {
      await flowPreview.previewResume('');
      expect(flowPreview.preview.value.sprinting).toBe(false);
    });

    it('should resume preview and handle API responses', async () => {
      mockPost.mockResolvedValueOnce({
        data: { events: [mockEvent], session: { runs: mockSession.runs } },
      });

      await flowPreview.previewResume('Test message');

      expect(mockPost).toHaveBeenCalledWith(
        `api/v2/flows/${mockFlowUuid}/simulate`,
        expect.any(Object),
        {
          headers: { Authorization: mockAuthToken },
        },
      );
    });

    it('should handle server errors when resuming preview', async () => {
      mockPost.mockRejectedValueOnce({
        response: { status: 500, data: { error: 'Server error' } },
      });

      await flowPreview.previewResume('Test message');
      expect(flowPreview.preview.value.events).toContainEqual({
        type: 'error',
        text: 'Server error, try again later',
      });
    });

    it('should handle non-server errors when resuming preview', async () => {
      mockPost.mockRejectedValueOnce({
        response: { status: 498, data: { error: 'Server error' } },
      });

      await flowPreview.previewResume('Test message');
      expect(flowPreview.preview.value.events).toContainEqual({
        type: 'error',
        text: 'Server error',
      });
    });
  });

  describe('previewStart', () => {
    it('should set the language on contact when provided', async () => {
      mockPost.mockResolvedValueOnce({
        data: { events: [mockEvent], session: mockSession },
      });

      const languageId = 'es';
      await flowPreview.previewStart({
        languageId,
        flowUuid: mockFlowUuid,
        flowName: 'Test Flow',
      });

      expect(flowPreview.preview.value.contact.language).toBe(languageId);
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          contact: expect.objectContaining({
            language: languageId,
          }),
        }),
        expect.any(Object),
      );
    });

    it('should handle API errors when starting preview', async () => {
      mockPost.mockRejectedValueOnce();

      await expect(
        flowPreview.previewStart({
          flowUuid: mockFlowUuid,
          flowName: 'Test Flow',
        }),
      ).rejects.toThrow();
    });
  });
});
