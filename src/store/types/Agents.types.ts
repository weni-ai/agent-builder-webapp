import type { TranslatedField } from '@/composables/useTranslatedField';

export type AgentCategory =
  | 'product_discovery_and_recommendations'
  | 'orders_status_and_tracking'
  | 'returns_exchanges_and_cancellations'
  | 'payments_and_checkout'
  | 'crm_and_lead_capture'
  | 'feedback_and_surveys'
  | 'utilities_and_monitoring'
  | 'others';

export type AgentSystem = {
  slug: string;
  name: string;
  logo: string | null;
};

export interface AgentCredential {
  name: string;
  label: string;
  placeholder: string;
  is_confidential: boolean;
}

export type AgentAssignedConstantValue =
  | string
  | boolean
  | number
  | string[]
  | null;

export type ConversationMessage = {
  direction: 'incoming' | 'outgoing';
  text: string;
};

export interface AgentConstantField {
  name: string;
  label: string;
  default_value: string | boolean | number;
  is_required: boolean;
  type:
    | 'SELECT'
    | 'INPUT'
    | 'CHECKBOX'
    | 'RADIO'
    | 'SWITCH'
    | 'NUMBER'
    | 'TEXT';
  options:
    | {
        name: string;
        value: string;
      }[]
    | [];
  value?: AgentAssignedConstantValue;
}

export interface AgentMCP {
  name: string;
  description: TranslatedField<string>;
  system: string;
  credentials?: AgentCredential[];
  config: AgentConstantField[];
}

export interface Agent {
  group: string | null;
  name: string;
  slug: string | null;
  uuid: string | null;
  about: TranslatedField<string> | null;
  assigned: boolean;
  active: boolean | null;
  is_official: boolean;
  category: AgentCategory | null;
  systems: string[] | null;
  mcps: AgentMCP[] | null;
  conversation_example?: TranslatedField<ConversationMessage[]> | null;
  icon: string;
  id?: string;
  last_updated?: string | null;
}

type SelectOption = {
  label: string;
  value: string;
};

export type AssignAgentsFilters = {
  search: string;
  category: SelectOption[] | [];
  system: string | 'ALL_OFFICIAL' | 'ALL_CUSTOM' | '';
};
