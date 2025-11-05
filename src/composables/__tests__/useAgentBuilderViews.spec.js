import { describe, it, expect, vi, beforeEach } from 'vitest';
import useAgentBuilderViews from '../useBuildViews';
import i18n from '@/utils/plugins/i18n';

const { t } = i18n.global;

describe('useAgentBuilderViews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('composable structure', () => {
    it('should return a computed property', () => {
      const result = useAgentBuilderViews();

      expect(result).toBeDefined();
      expect(result.value).toBeDefined();
      expect(Array.isArray(result.value)).toBe(true);
    });

    it('should return an array of view objects', () => {
      const result = useAgentBuilderViews();

      expect(result.value).toHaveLength(5);
      result.value.forEach((view) => {
        expect(view).toHaveProperty('title');
        expect(view).toHaveProperty('description');
        expect(view).toHaveProperty('page');
        expect(view).toHaveProperty('icon');
      });
    });
  });

  describe('view objects structure', () => {
    let views;

    beforeEach(() => {
      const result = useAgentBuilderViews();
      views = result.value;
    });

    it('should have supervisor view with correct properties', () => {
      const supervisorView = views.find((view) => view.page === 'supervisor');

      expect(supervisorView).toBeDefined();
      expect(supervisorView.title).toBe(
        t('agent_builder.tabs.supervisor.title'),
      );
      expect(supervisorView.description).toBe(
        t('agent_builder.tabs.supervisor.description'),
      );
      expect(supervisorView.page).toBe('supervisor');
      expect(supervisorView.icon).toBe('sms');
    });

    it('should have instructions view with correct properties', () => {
      const instructionsView = views.find(
        (view) => view.page === 'instructions',
      );

      expect(instructionsView).toBeDefined();
      expect(instructionsView.title).toBe(
        t('agent_builder.tabs.instructions.title'),
      );
      expect(instructionsView.description).toBe(
        t('agent_builder.tabs.instructions.description'),
      );
      expect(instructionsView.page).toBe('instructions');
      expect(instructionsView.icon).toBe('format_list_bulleted');
    });

    it('should have agents view with correct properties', () => {
      const agentsView = views.find((view) => view.page === 'agents');

      expect(agentsView).toBeDefined();
      expect(agentsView.title).toBe(t('agent_builder.tabs.agents.title'));
      expect(agentsView.description).toBe(
        t('agent_builder.tabs.agents.description'),
      );
      expect(agentsView.page).toBe('agents');
      expect(agentsView.icon).toBe('workspaces');
    });

    it('should have knowledge view with correct properties', () => {
      const knowledgeView = views.find((view) => view.page === 'knowledge');

      expect(knowledgeView).toBeDefined();
      expect(knowledgeView.title).toBe(t('agent_builder.tabs.knowledge.title'));
      expect(knowledgeView.description).toBe(
        t('agent_builder.tabs.knowledge.description'),
      );
      expect(knowledgeView.page).toBe('knowledge');
      expect(knowledgeView.icon).toBe('article');
    });

    it('should have tunings view with correct properties', () => {
      const tuningsView = views.find((view) => view.page === 'tunings');

      expect(tuningsView).toBeDefined();
      expect(tuningsView.title).toBe(t('agent_builder.tabs.tunings.title'));
      expect(tuningsView.description).toBe(
        t('agent_builder.tabs.tunings.description'),
      );
      expect(tuningsView.page).toBe('tunings');
      expect(tuningsView.icon).toBe('settings');
    });
  });

  describe('view order and completeness', () => {
    it('should return views in the correct order', () => {
      const result = useAgentBuilderViews();
      const views = result.value;

      const expectedOrder = [
        'supervisor',
        'instructions',
        'agents',
        'knowledge',
        'tunings',
      ];
      const actualOrder = views.map((view) => view.page);

      expect(actualOrder).toEqual(expectedOrder);
    });

    it('should have unique page identifiers', () => {
      const result = useAgentBuilderViews();
      const views = result.value;

      const pages = views.map((view) => view.page);
      const uniquePages = [...new Set(pages)];

      expect(pages).toHaveLength(uniquePages.length);
    });

    it('should have unique icons for each view', () => {
      const result = useAgentBuilderViews();
      const views = result.value;

      const icons = views.map((view) => view.icon);
      const uniqueIcons = [...new Set(icons)];

      expect(icons).toHaveLength(uniqueIcons.length);
    });

    it('should have all required properties for each view', () => {
      const result = useAgentBuilderViews();
      const views = result.value;

      const requiredProperties = ['title', 'description', 'page', 'icon'];

      views.forEach((view) => {
        requiredProperties.forEach((prop) => {
          expect(view).toHaveProperty(prop);
          expect(view[prop]).toBeTruthy();
        });
      });
    });
  });
});
