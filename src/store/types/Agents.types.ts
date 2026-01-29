export type AgentGroupType = 'CUSTOMIZABLE' | 'PLUG_IN_PLAY';
export type AgentGroupID = 'CONCIERGE';
export type AgentCategory = 'PRODUCT_DISCOVERY_AND_RECOMMENDATIONS';

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
  description: string;
  mcp: AgentAssignedMCP | null;
  icon: string;
}

export interface AgentMCP {
  name: string;
  description: string;
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
