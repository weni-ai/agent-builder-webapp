export type AgentGroupType = 'CUSTOMIZABLE' | 'PLUG_IN_PLAY';
export type AgentGroupID = 'CONCIERGE';
export type AgentCategory = 'PRODUCT_DISCOVERY_AND_RECOMMENDATIONS';
export type AgentSystem = 'VTEX' | 'SYNERISE';

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
  systems: AgentSystem[];
  assigned: boolean;
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
}

export type AgentGroupOrAgent = AgentGroup | Agent;
