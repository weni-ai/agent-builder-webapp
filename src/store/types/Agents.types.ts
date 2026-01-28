export type AgentGroupType = 'CUSTOMIZABLE' | 'PLUG_IN_PLAY';
export type AgentGroupID = 'CONCIERGE';
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

export interface AgentMCP {
  name: string;
  description: string;
  system: string;
  credentials?: AgentCredential[];
  config:
    | {
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
      }[]
    | [];
}

export interface AgentGroup {
  name: string;
  description: string;
  type: AgentGroupType;
  category: AgentCategory;
  group: AgentGroupID;
  agents: GroupVariant[];
  MCPs: AgentMCP[];
  systems: string[];
  credentials?: AgentCredential[];
  presentation?: {
    conversation_example?: {
      direction: 'incoming' | 'outgoing';
      text: string;
    }[];
  };
  assigned: boolean;
  icon: string;
  is_official: true;
}

export interface Agent {
  uuid: string;
  name: string;
  description: string;
  skills: AgentSkill[];
  assigned: boolean;
  slug: string;
  model: string;
  is_official: boolean;
  project: string;
  credentials: AgentCredential[] | [];
  icon: string;
  group: null;
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
