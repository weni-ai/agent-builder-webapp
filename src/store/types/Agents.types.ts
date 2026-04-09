import type { TranslatedField } from '@/composables/useTranslatedField';

export type AgentGroupType = 'CUSTOMIZABLE' | 'PLUG_IN_PLAY';
export type AgentCategory = 'PRODUCT_DISCOVERY_AND_RECOMMENDATIONS';

export type AgentSystem = {
  slug: string;
  name: string;
  logo: string | null;
};

export type GroupVariant = {
  uuid: string;
  name: string;
  slug: string;
  assigned: boolean;
  systems: string[];
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

export type AgentAssignedMCPConfigValue =
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
  description: string;
  config?: Record<string, AgentAssignedMCPConfigValue>;
  system?: AgentAssignedSystem;
}

export interface ActiveTeamAgent {
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

export interface AgentMCP {
  name: string;
  description: TranslatedField<string>;
  system: string;
  credentials?: AgentCredential[];
  config: {
    name: string;
    label: string;
    default_value: string | boolean | number;
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
  }[];
}

export interface AgentGroup {
  name: string;
  description: string;
  type: AgentGroupType;
  category: AgentCategory;
  group: string;
  agents: GroupVariant[];
  MCPs: AgentMCP[];
  systems: string[];
  credentials?: AgentCredential[];
  presentation?: {
    agent_name?: string;
    about?: TranslatedField<string>;
    conversation_example?: TranslatedField<ConversationMessage[]>;
  };
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
  model: string;
  is_official: boolean;
  project: string;
  credentials: AgentCredential[] | [];
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
