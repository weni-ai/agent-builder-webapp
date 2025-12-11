interface Csat {
  score: number;
  id: string;
}

export interface Conversation {
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
