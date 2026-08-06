import { describe, it, expect } from 'vitest';

import { ConversationAdapter } from '../conversation';

describe('Supervisor conversation adapter', () => {
  describe('fromDetailApi', () => {
    it('transforms the detail root into the list row shape', () => {
      const result = ConversationAdapter.fromDetailApi({
        contact_name: 'Alessandra',
        contact_urn: 'whatsapp:5511999999999',
        start_date: '2026-06-23T09:44:26-03:00',
        end_date: '2026-06-23T10:02:11-03:00',
        resolution: 0,
        csat: '4',
        topic: 'Delivery',
        is_amazing: true,
      });

      expect(result).toEqual({
        username: 'Alessandra',
        urn: 'whatsapp:5511999999999',
        start: '2026-06-23T09:44:26-03:00',
        end: '2026-06-23T10:02:11-03:00',
        status: 'optimized_resolution',
        csat: { score: 4, id: 'satisfied' },
        topics: 'Delivery',
        isAmazing: true,
      });
    });

    it('omits fields absent from the response', () => {
      const result = ConversationAdapter.fromDetailApi({
        contact_name: 'Renata',
      });

      expect(result).toEqual({ username: 'Renata' });
    });

    it('returns an empty object for payloads without contact data', () => {
      expect(ConversationAdapter.fromDetailApi()).toEqual({});
      expect(ConversationAdapter.fromDetailApi({})).toEqual({});
    });

    it('keeps an explicit null csat', () => {
      expect(ConversationAdapter.fromDetailApi({ csat: null })).toEqual({
        csat: null,
      });
    });

    it('falls back to in_progress for unknown resolutions', () => {
      expect(ConversationAdapter.fromDetailApi({ resolution: 99 })).toEqual({
        status: 'in_progress',
      });
    });
  });
});
