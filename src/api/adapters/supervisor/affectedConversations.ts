import type {
  AffectedConversation,
  AffectedConversationMessage,
  AffectedConversationMessageSource,
  AffectedConversationsResponse,
} from '@/store/types/Improvements.types';

export interface AffectedConversationMessageApi {
  uuid?: string;
  id?: string;
  text?: string;
  source?: string;
  created_at?: string;
}

export interface AffectedConversationApi {
  uuid?: string;
  contact_urn?: string;
  contact_name?: string;
  messages?: AffectedConversationMessageApi[];
}

export interface AffectedConversationsApi {
  count?: number;
  results?: AffectedConversationApi[];
}

function isMessageSource(
  value: unknown,
): value is AffectedConversationMessageSource {
  return value === 'incoming' || value === 'outgoing';
}

function parseMessage(
  item: AffectedConversationMessageApi = {},
): AffectedConversationMessage | null {
  if (!item.uuid || !item.id || !item.text || !isMessageSource(item.source)) {
    return null;
  }

  return {
    uuid: item.uuid,
    id: item.id,
    text: item.text,
    source: item.source,
    createdAt: item.created_at ?? '',
  };
}

function parseConversation(
  item: AffectedConversationApi = {},
): AffectedConversation | null {
  if (!item.uuid || !item.contact_urn) return null;

  return {
    uuid: item.uuid,
    contactUrn: item.contact_urn,
    contactName: item.contact_name ?? '',
    messages: (item.messages ?? [])
      .map(parseMessage)
      .filter(
        (message): message is AffectedConversationMessage => message !== null,
      ),
  };
}

export function mapMessageToQuestionAndAnswer(
  message: AffectedConversationMessage,
  username: string,
) {
  return {
    id: message.id,
    uuid: message.uuid,
    text: message.text,
    type: message.source === 'incoming' ? 'user' : 'agent',
    createdAt: message.createdAt,
    username,
  };
}

export const AffectedConversationsAdapter = {
  fromApi(
    apiData: AffectedConversationsApi = {},
  ): AffectedConversationsResponse {
    return {
      count: Number(apiData.count) || 0,
      results: (apiData.results ?? [])
        .map(parseConversation)
        .filter((item): item is AffectedConversation => item !== null),
    };
  },
};
