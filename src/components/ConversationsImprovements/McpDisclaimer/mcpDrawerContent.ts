export const MCP_SERVER_URL = 'https://mcp.weni.ai/mcp';

export const DOCUMENTATION_URL =
  'https://developers.vtex.com/docs/guides/connect-the-vtex-cx-platform-mcp';

export type McpFeature = {
  icon: string;
  id: string;
};

export const IMPROVEMENTS_FEATURES: McpFeature[] = [
  { icon: 'search', id: 'review_backlog' },
  { icon: 'chat_bubble', id: 'check_conversations' },
  { icon: 'edit_square', id: 'draft_fixes' },
  { icon: 'refresh', id: 'run_analyses' },
];

export const PROJECT_FEATURES: McpFeature[] = [
  { icon: 'article_person', id: 'conversations_contacts' },
  { icon: 'sentiment_satisfied', id: 'customer_satisfaction' },
  { icon: 'headphones', id: 'human_support' },
  { icon: 'mdi:whatsapp', id: 'whatsapp_templates' },
  { icon: 'shopping_cart', id: 'sales' },
];

export type McpConnectionStep = {
  number: number;
  titleKey: string;
  descriptionKey?: string;
  hasCopyField?: boolean;
};

export const CONNECTION_STEPS: McpConnectionStep[] = [
  {
    number: 1,
    titleKey: 'step_1_title',
    hasCopyField: true,
  },
  {
    number: 2,
    titleKey: 'step_2_title',
    descriptionKey: 'step_2_description',
  },
  {
    number: 3,
    titleKey: 'step_3_title',
    descriptionKey: 'step_3_description',
  },
];
