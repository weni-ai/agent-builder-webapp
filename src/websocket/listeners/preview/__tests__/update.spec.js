import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import update from '../update.js';
import { useFlowPreviewStore } from '@/store/FlowPreview';
import i18n from '@/utils/plugins/i18n.js';

vi.mock('@/store/FlowPreview', () => ({
  useFlowPreviewStore: vi.fn(),
}));

const fallbackMessage = i18n.global.t('quick_test.unable_to_find_an_answer');

describe('src/websocket/listeners/preview/update.js', () => {
  let mockFlowPreviewStore;

  beforeEach(() => {
    setActivePinia(createPinia());

    mockFlowPreviewStore = {
      messages: [],
      addMessage: vi.fn(),
      treatAnswerResponse: vi.fn(),
    };

    useFlowPreviewStore.mockReturnValue(mockFlowPreviewStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Message processing with existing loading answer', () => {
    it('uses existing loading answer when last answer is loading', () => {
      const existingAnswer = {
        type: 'answer',
        text: '',
        status: 'loading',
        question_uuid: null,
        feedback: { value: null, reason: null },
      };

      mockFlowPreviewStore.messages = [
        { type: 'question', text: 'Test question' },
        existingAnswer,
      ];

      const testMessage = {
        content: {
          type: 'broadcast',
          message: 'Test response',
        },
      };

      update(testMessage);

      expect(mockFlowPreviewStore.addMessage).not.toHaveBeenCalled();
      expect(mockFlowPreviewStore.treatAnswerResponse).toHaveBeenCalledWith(
        existingAnswer,
        testMessage.content,
        {
          fallbackMessage,
        },
      );
    });

    it('filters messages to find only answer type messages', () => {
      const answerMessage = {
        type: 'answer',
        status: 'loading',
        text: 'Loading...',
      };

      mockFlowPreviewStore.messages = [
        { type: 'question', text: 'Question 1' },
        { type: 'flowstart', name: 'Flow started' },
        { type: 'answer', status: 'loaded', text: 'Previous answer' },
        answerMessage,
        { type: 'other', data: 'Other message' },
      ];

      const testMessage = {
        content: { type: 'broadcast', message: 'Response' },
      };

      update(testMessage);

      expect(mockFlowPreviewStore.treatAnswerResponse).toHaveBeenCalledWith(
        answerMessage,
        testMessage.content,
        expect.any(Object),
      );
    });
  });

  describe('Message processing without loading answer', () => {
    it('creates new answer when no loading answer exists', () => {
      mockFlowPreviewStore.messages = [
        { type: 'question', text: 'Test question' },
        {
          type: 'answer',
          status: 'loaded',
          text: 'Previous answer',
        },
      ];

      const testMessage = {
        content: {
          type: 'broadcast',
          message: 'Test response',
        },
      };

      update(testMessage);

      const expectedNewAnswer = {
        type: 'answer',
        text: '',
        status: 'loading',
        question_uuid: null,
        feedback: {
          value: null,
          reason: null,
        },
      };

      expect(mockFlowPreviewStore.addMessage).toHaveBeenCalledWith(
        expectedNewAnswer,
      );
      expect(mockFlowPreviewStore.treatAnswerResponse).toHaveBeenCalledWith(
        expectedNewAnswer,
        testMessage.content,
        {
          fallbackMessage,
        },
      );
    });

    it('creates new answer when no answer messages exist at all', () => {
      mockFlowPreviewStore.messages = [
        { type: 'question', text: 'Test question' },
        { type: 'flowstart', name: 'Flow started' },
      ];

      const testMessage = {
        content: { type: 'broadcast', message: 'Response' },
      };

      update(testMessage);

      expect(mockFlowPreviewStore.addMessage).toHaveBeenCalled();
      expect(mockFlowPreviewStore.treatAnswerResponse).toHaveBeenCalled();
    });

    it('creates new answer when messages array is empty', () => {
      mockFlowPreviewStore.messages = [];

      const testMessage = {
        content: { type: 'broadcast', message: 'Response' },
      };

      update(testMessage);

      expect(mockFlowPreviewStore.addMessage).toHaveBeenCalled();
      expect(mockFlowPreviewStore.treatAnswerResponse).toHaveBeenCalled();
    });
  });

  describe('Answer response treatment', () => {
    it('calls treatAnswerResponse with correct parameters', () => {
      const existingAnswer = {
        type: 'answer',
        status: 'loading',
      };

      mockFlowPreviewStore.messages = [existingAnswer];

      const testMessage = {
        content: {
          type: 'flowstart',
          name: 'Test Flow',
          uuid: 'flow-uuid-123',
        },
      };

      update(testMessage);

      expect(mockFlowPreviewStore.treatAnswerResponse).toHaveBeenCalledWith(
        existingAnswer,
        testMessage.content,
        {
          fallbackMessage,
        },
      );
    });

    it('uses i18n for fallback message', () => {
      mockFlowPreviewStore.messages = [{ type: 'answer', status: 'loading' }];

      const testMessage = {
        content: { type: 'broadcast', message: 'Response' },
      };

      update(testMessage);

      expect(mockFlowPreviewStore.treatAnswerResponse).toHaveBeenCalledWith(
        expect.any(Object),
        testMessage.content,
        {
          fallbackMessage,
        },
      );
    });
  });

  describe('Different message content types', () => {
    it('handles broadcast message content', () => {
      mockFlowPreviewStore.messages = [{ type: 'answer', status: 'loading' }];

      const testMessage = {
        content: {
          type: 'broadcast',
          message: 'Broadcast message',
          fonts: ['source1.pdf', 'source2.txt'],
        },
      };

      update(testMessage);

      expect(mockFlowPreviewStore.treatAnswerResponse).toHaveBeenCalledWith(
        expect.any(Object),
        testMessage.content,
        expect.any(Object),
      );
    });

    it('handles cancelled message content', () => {
      mockFlowPreviewStore.messages = [{ type: 'answer', status: 'loading' }];

      const testMessage = {
        content: {
          type: 'cancelled',
        },
      };

      update(testMessage);

      expect(mockFlowPreviewStore.treatAnswerResponse).toHaveBeenCalledWith(
        expect.any(Object),
        testMessage.content,
        expect.any(Object),
      );
    });
  });

  describe('Edge cases', () => {
    it('handles message without content', () => {
      mockFlowPreviewStore.messages = [{ type: 'answer', status: 'loading' }];

      const testMessage = {};

      update(testMessage);

      expect(mockFlowPreviewStore.treatAnswerResponse).toHaveBeenCalledWith(
        expect.any(Object),
        undefined,
        expect.any(Object),
      );
    });

    it('handles null message', () => {
      mockFlowPreviewStore.messages = [{ type: 'answer', status: 'loading' }];

      expect(() => update(null)).toThrow();
    });

    it('handles undefined message', () => {
      mockFlowPreviewStore.messages = [{ type: 'answer', status: 'loading' }];

      expect(() => update(undefined)).toThrow();
    });

    it('handles answer with undefined status (not loading)', () => {
      mockFlowPreviewStore.messages = [
        {
          type: 'answer',
          text: 'Previous answer',
          // status is undefined, so it's not 'loading'
        },
      ];

      const testMessage = {
        content: { type: 'broadcast', message: 'Response' },
      };

      update(testMessage);

      expect(mockFlowPreviewStore.addMessage).toHaveBeenCalled();
    });

    it('handles answer with null status (not loading)', () => {
      mockFlowPreviewStore.messages = [
        {
          type: 'answer',
          text: 'Previous answer',
          status: null,
        },
      ];

      const testMessage = {
        content: { type: 'broadcast', message: 'Response' },
      };

      update(testMessage);

      expect(mockFlowPreviewStore.addMessage).toHaveBeenCalled();
    });
  });

  describe('Store integration', () => {
    it('uses flow preview store instance', () => {
      const testMessage = {
        content: { type: 'broadcast', message: 'Response' },
      };

      update(testMessage);

      expect(useFlowPreviewStore).toHaveBeenCalled();
    });

    it('accesses messages from store', () => {
      const testMessages = [
        { type: 'question', text: 'Test question' },
        { type: 'answer', status: 'loaded', text: 'Previous answer' },
      ];

      mockFlowPreviewStore.messages = testMessages;

      const testMessage = {
        content: { type: 'broadcast', message: 'Response' },
      };

      update(testMessage);

      expect(mockFlowPreviewStore.addMessage).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('handles store addMessage method throwing error', () => {
      const errorMessage = 'Store addMessage error';
      mockFlowPreviewStore.addMessage.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      mockFlowPreviewStore.messages = [{ type: 'answer', status: 'loaded' }];

      const testMessage = {
        content: { type: 'broadcast', message: 'Response' },
      };

      expect(() => update(testMessage)).toThrow(errorMessage);
    });

    it('handles store treatAnswerResponse method throwing error', () => {
      const errorMessage = 'Store treatAnswerResponse error';
      mockFlowPreviewStore.treatAnswerResponse.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      mockFlowPreviewStore.messages = [{ type: 'answer', status: 'loading' }];

      const testMessage = {
        content: { type: 'broadcast', message: 'Response' },
      };

      expect(() => update(testMessage)).toThrow(errorMessage);
    });

    it('handles store initialization error', () => {
      useFlowPreviewStore.mockImplementation(() => {
        throw new Error('Store initialization failed');
      });

      const testMessage = {
        content: { type: 'broadcast', message: 'Response' },
      };

      expect(() => update(testMessage)).toThrow('Store initialization failed');
    });
  });
});
