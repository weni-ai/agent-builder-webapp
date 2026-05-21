import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import { createTestingPinia } from '@pinia/testing';

import DetailAgentCard from '../index.vue';
import AgentCard from '../../AgentCard.vue';
import AgentDetailModal from '../AgentDetailModal/index.vue';

const defaultAgent = {
  uuid: 'agent-uuid-1',
  id: 'agent-id-1',
  name: 'Test Agent',
  is_official: false,
  about: { en: 'Test description', pt: null, es: null },
  mcps: [],
  icon: 'icon-url',
};

describe('DetailAgentCard.vue', () => {
  let wrapper;
  let pinia;

  const createWrapper = (props = {}) => {
    wrapper = shallowMount(DetailAgentCard, {
      global: {
        plugins: [pinia],
      },
      props: {
        agent: defaultAgent,
        loading: false,
        ...props,
      },
    });
  };

  const findAgentCard = () => wrapper.findComponent(AgentCard);
  const findAgentDetailModal = () => wrapper.findComponent(AgentDetailModal);

  beforeEach(() => {
    pinia = createTestingPinia({
      initialState: {
        AgentsTeam: {
          activeTeam: {
            status: null,
            data: { manager: null, agents: [] },
          },
          newAgentAssigned: null,
        },
      },
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('AgentCard', () => {
    it('renders AgentCard with agent prop', () => {
      createWrapper();

      expect(findAgentCard().props('agent')).toEqual(defaultAgent);
    });

    it('passes loading prop to AgentCard', () => {
      createWrapper({ loading: true });

      expect(findAgentCard().props('loading')).toBe(true);
    });

    it('passes empty tags when agent has no mcps', () => {
      createWrapper({ agent: { ...defaultAgent, mcps: [] } });

      expect(findAgentCard().props('tags')).toEqual([]);
    });

    it('passes empty tags when first mcp has no system', () => {
      createWrapper({
        agent: { ...defaultAgent, mcps: [{ system: undefined }] },
      });

      expect(findAgentCard().props('tags')).toEqual([]);
    });

    it('passes the system slug as a tag when present', () => {
      createWrapper({
        agent: { ...defaultAgent, mcps: [{ system: 'system_a' }] },
      });

      expect(findAgentCard().props('tags')).toEqual(['system_a']);
    });

    it('passes newAgentHighlight true when agent uuid matches store newAgentAssigned', () => {
      pinia = createTestingPinia({
        initialState: {
          AgentsTeam: {
            activeTeam: {
              status: null,
              data: { manager: null, agents: [] },
            },
            newAgentAssigned: { ...defaultAgent },
          },
        },
      });
      createWrapper();

      expect(findAgentCard().props('newAgentHighlight')).toBe(true);
    });

    it('passes newAgentHighlight false when store newAgentAssigned is null', () => {
      createWrapper();

      expect(findAgentCard().props('newAgentHighlight')).toBe(false);
    });

    it('passes newAgentHighlight false when store newAgentAssigned has different uuid', () => {
      pinia = createTestingPinia({
        initialState: {
          AgentsTeam: {
            activeTeam: {
              status: null,
              data: { manager: null, agents: [] },
            },
            newAgentAssigned: { uuid: 'other-uuid' },
          },
        },
      });
      createWrapper();

      expect(findAgentCard().props('newAgentHighlight')).toBe(false);
    });
  });

  describe('AgentDetailModal', () => {
    it('renders AgentDetailModal with agent prop', () => {
      createWrapper();

      expect(findAgentDetailModal().props('agent')).toEqual(defaultAgent);
    });

    it('passes open false initially', () => {
      createWrapper();

      expect(findAgentDetailModal().props('open')).toBe(false);
    });
  });

  describe('click behavior', () => {
    it('opens modal when AgentCard is clicked', async () => {
      createWrapper();

      await findAgentCard().trigger('click');

      expect(findAgentDetailModal().props('open')).toBe(true);
    });

    it('keeps modal open after a second click on card', async () => {
      createWrapper();

      await findAgentCard().trigger('click');
      await findAgentCard().trigger('click');

      expect(findAgentDetailModal().props('open')).toBe(true);
    });
  });

  describe('modal close', () => {
    it('closes modal when AgentDetailModal emits update:open false', async () => {
      createWrapper();
      await findAgentCard().trigger('click');

      expect(findAgentDetailModal().props('open')).toBe(true);

      await findAgentDetailModal().vm.$emit('update:open', false);
      await nextTick();

      expect(findAgentDetailModal().props('open')).toBe(false);
    });
  });
});
