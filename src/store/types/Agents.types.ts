import type { TranslatedField } from '@/composables/useTranslatedField';

export type AgentCategory = 'PRODUCT_DISCOVERY_AND_RECOMMENDATIONS';

export type AgentSystem = {
  slug: string;
  name: string;
  logo: string | null;
};

export interface AgentSkill {
  icon?: string;
  name: string;
  agent: string;
  unique_name: string;
}

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

export interface AgentAssignedSystem {
  name: string;
  slug: string;
  icon: string;
}

export interface AgentAssignedMCP {
  name: string;
  description: TranslatedField<string>;
  constants?: Record<string, AgentAssignedConstantValue>;
  system?: AgentAssignedSystem;
}

export interface ActiveTeamAgent {
  group?: string;
  uuid: string;
  id: string;
  name: string;
  is_official: boolean;
  about: TranslatedField<string> | null;
  description: string;
  mcp: AgentAssignedMCP | null;
  icon: string;
}

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
}

export interface AgentMCP {
  name: string;
  description: TranslatedField<string>;
  system: string;
  credentials?: AgentCredential[];
  constants: AgentConstantField[];
}

export interface AgentGroup {
  name: string;
  category: AgentCategory | null;
  group: string | null;
  uuid: string | null;
  slug: string | null;
  active: boolean | null;
  about: TranslatedField<string>;
  conversation_example?: TranslatedField<ConversationMessage[]>;
  mcps: AgentMCP[];
  systems: string[];
  assigned: boolean;
  icon: string;
  is_official: true;
}

export interface Agent {
  uuid: string;
  id?: string;
  name: string;
  about: TranslatedField<string> | null;
  description: string;
  skills: AgentSkill[];
  assigned: boolean;
  slug: string;
  is_official: boolean;
  credentials: AgentCredential[] | [];
  constants?: AgentConstantField[];
  icon: string;
  group?: AgentGroup | null;
  mcp?: AgentAssignedMCP | null;
}

export type AgentGroupOrAgent = AgentGroup | Agent;

type SelectOption = {
  label: string;
  value: string;
};

export type AssignAgentsFilters = {
  search: string;
  category: SelectOption[] | [];
  system: string | 'ALL_OFFICIAL' | 'ALL_CUSTOM' | '';
};
