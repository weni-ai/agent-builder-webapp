<template>
  <section class="assign-agents">
    <aside>TODO: SIDEBAR</aside>
    <section class="assign-agents__content">
      <header>TODO: HEADER</header>
      <section>TODO: FILTERS</section>

      <AgentsList
        :agents="agents"
        :isLoading="isLoading"
      />
    </section>
  </section>
</template>

<script setup>
import { ref } from 'vue';

import AgentsList from '@/components/AgentsTeam/AssignAgents/AgentsList.vue';

const mockedAgents = [
  {
    name: 'Recomendador de Produtos VTEX',
    type: 'CUSTOMIZABLE',
    uuid: '3f5c1b2e-9f1a-4d3a-9c25-1c8c7d9b4a21',
    group: 'CONCIERGE',
    system: ['VTEX', 'SYNERISE'],
    assigned: true,
    category: 'PRODUCT_DISCOVERY_AND_RECOMMENDATIONS',
    description:
      'Template para recomenda\u00e7\u00e3o autom\u00e1tica de produtos no e-commerce.',
  },
  {
    name: 'Agente de Recomenda\u00e7\u00e3o IA',
    slug: 'agente-recomendacao-ia',
    uuid: 'a91b7e34-42c5-4f9d-8a87-1d3e9a66c012',
    model: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    skills: [
      {
        icon: 'shopping-cart',
        name: 'Recomendar Produtos',
        agent: 'a91b7e34-42c5-4f9d-8a87-1d3e9a66c012',
        unique_name: 'recommend_products',
      },
    ],
    project: '7c8d9e21-44a2-4b4f-9d39-8a2b9f2d3c11',
    assigned: false,
    credentials: [
      {
        name: 'api_key',
        label: 'API Key',
        placeholder: 'Informe sua chave de API',
        is_confidential: true,
      },
    ],
    description:
      'Agente inteligente respons\u00e1vel por sugerir produtos aos usu\u00e1rios.',
    is_official: true,
  },
];

const agents = ref(mockedAgents);
</script>

<style lang="scss" scoped>
.assign-agents {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: $unnnic-space-4;

  height: 100%;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }
}
</style>
