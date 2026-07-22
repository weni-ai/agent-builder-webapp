interface Csat {
  score: number;
  id: string;
}

export interface Conversation {
  isAmazing: boolean;
  uuid: string;
  id: string;
  start: string;
  end: string;
  username: string;
  urn: string;
  status: string;
  csat: Csat | null;
  topics: string;
}

export interface SelectedConversationData {
  status: 'loading' | 'complete' | 'error' | null;
  results?: unknown[];
  next?: string | null;
  count?: number;
}

export type SelectedConversation = Partial<Conversation> & {
  uuid: string;
  data: SelectedConversationData;
};
