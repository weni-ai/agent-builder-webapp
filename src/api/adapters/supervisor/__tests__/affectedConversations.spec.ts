import { describe, expect, it } from 'vitest';

import {
  AffectedConversationsAdapter,
  mapMessageToQuestionAndAnswer,
} from '../affectedConversations';

describe('Supervisor affected conversations adapter', () => {
  describe('fromApi', () => {
    it('transforms API data to frontend format', () => {
      const result = AffectedConversationsAdapter.fromApi({
        count: 25,
        results: [
          {
            uuid: 'conversation-uuid-1',
            contact_urn: 'whatsapp:5511999999999',
            contact_name: 'Alessandra',
            messages: [
              {
                uuid: 'message-uuid-1',
                id: '1',
                text: 'Do you deliver to my ZIP code?',
                source: 'incoming',
                created_at: '2026-06-23T09:44:26-03:00',
              },
              {
                uuid: 'message-uuid-2',
                id: '2',
                text: 'I need your CPF first.',
                source: 'outgoing',
                created_at: '2026-06-23T09:45:00-03:00',
              },
            ],
          },
        ],
      });

      expect(result).toEqual({
        count: 25,
        results: [
          {
            uuid: 'conversation-uuid-1',
            contactUrn: 'whatsapp:5511999999999',
            contactName: 'Alessandra',
            messages: [
              {
                uuid: 'message-uuid-1',
                id: '1',
                text: 'Do you deliver to my ZIP code?',
                source: 'incoming',
                createdAt: '2026-06-23T09:44:26-03:00',
              },
              {
                uuid: 'message-uuid-2',
                id: '2',
                text: 'I need your CPF first.',
                source: 'outgoing',
                createdAt: '2026-06-23T09:45:00-03:00',
              },
            ],
          },
        ],
      });
    });

    it('returns safe defaults when API fields are missing', () => {
      expect(AffectedConversationsAdapter.fromApi()).toEqual({
        count: 0,
        results: [],
      });
    });

    it('filters conversations and messages with invalid or incomplete data', () => {
      const result = AffectedConversationsAdapter.fromApi({
        count: 2,
        results: [
          {
            uuid: 'valid-uuid',
            contact_urn: 'whatsapp:5511999999999',
            contact_name: 'Renata',
            messages: [
              {
                uuid: 'msg-1',
                id: '1',
                text: 'Hello',
                source: 'incoming',
                created_at: '2026-06-23T09:44:26-03:00',
              },
              {
                uuid: 'msg-2',
                id: '2',
                text: 'Invalid source',
                source: 'unknown',
                created_at: '2026-06-23T09:45:00-03:00',
              },
            ],
          },
          {
            uuid: 'missing-urn',
            contact_name: 'Julian',
          },
        ],
      });

      expect(result.results).toEqual([
        {
          uuid: 'valid-uuid',
          contactUrn: 'whatsapp:5511999999999',
          contactName: 'Renata',
          messages: [
            {
              uuid: 'msg-1',
              id: '1',
              text: 'Hello',
              source: 'incoming',
              createdAt: '2026-06-23T09:44:26-03:00',
            },
          ],
        },
      ]);
    });
  });

  describe('mapMessageToQuestionAndAnswer', () => {
    it('maps incoming messages to user type', () => {
      expect(
        mapMessageToQuestionAndAnswer(
          {
            uuid: 'message-uuid-1',
            id: '1',
            text: 'Hello',
            source: 'incoming',
            createdAt: '2026-06-23T09:44:26-03:00',
          },
          'Alessandra',
        ),
      ).toEqual({
        id: '1',
        uuid: 'message-uuid-1',
        text: 'Hello',
        type: 'user',
        created_at: '2026-06-23T09:44:26-03:00',
        username: 'Alessandra',
      });
    });

    it('maps outgoing messages to agent type', () => {
      expect(
        mapMessageToQuestionAndAnswer(
          {
            uuid: 'message-uuid-2',
            id: '2',
            text: 'Hi there',
            source: 'outgoing',
            createdAt: '2026-06-23T09:45:00-03:00',
          },
          'Alessandra',
        ),
      ).toEqual({
        id: '2',
        uuid: 'message-uuid-2',
        text: 'Hi there',
        type: 'agent',
        created_at: '2026-06-23T09:45:00-03:00',
        username: 'Alessandra',
      });
    });
  });
});
