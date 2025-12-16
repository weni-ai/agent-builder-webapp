export type AgentGroupType = 'CUSTOMIZABLE' | 'PLUG_IN_PLAY';
export type AgentGroupID = 'CONCIERGE';
export type AgentCategory = 'PRODUCT_DISCOVERY_AND_RECOMMENDATIONS';
export type AgentSystem = 'VTEX' | 'SYNERISE';

export type ConciergeVariant = 'DEFAULT' | 'TRADE_POLICY' | 'META_CATALOG';

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

export interface AgentGroup {
  uuid: string;
  name: string;
  description: string;
  type: AgentGroupType;
  id: AgentGroupID;
  category: AgentCategory;
  group: AgentGroupID;
  variant: ConciergeVariant | string;
  systems: AgentSystem[];
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
}

export type AgentGroupOrAgent = AgentGroup | Agent;

type SelectOption = {
  label: string;
  value: string;
};

export type AssignAgentsFilters = {
  search: string;
  category: SelectOption[] | [];
  system: AgentSystem | 'ALL_OFFICIAL' | 'ALL_CUSTOM' | '';
};
