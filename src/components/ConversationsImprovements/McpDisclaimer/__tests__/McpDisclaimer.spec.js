import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';

import McpDisclaimer from '../index.vue';
import McpInfoDrawer from '../McpInfoDrawer.vue';

describe('McpDisclaimer.vue', () => {
  let wrapper;

  const createWrapper = () => {
    wrapper = mount(McpDisclaimer, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          McpInfoDrawer: true,
        },
      },
    });
  };

  const elements = {
    banner: () => wrapper.find('[data-testid="mcp-disclaimer"]'),
    icon: () => wrapper.findComponent('[data-testid="mcp-disclaimer-icon"]'),
    title: () => wrapper.find('[data-testid="mcp-disclaimer-title"]'),
    description: () =>
      wrapper.find('[data-testid="mcp-disclaimer-description"]'),
    button: () =>
      wrapper.findComponent('[data-testid="mcp-disclaimer-button"]'),
    drawer: () => wrapper.findComponent(McpInfoDrawer),
  };

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders the disclaimer banner', () => {
      expect(elements.banner().exists()).toBe(true);
    });

    it('renders the MCP icon', () => {
      const icon = elements.icon();

      expect(icon.exists()).toBe(true);
      expect(icon.props('size')).toBe('md');
      expect(icon.props('scheme')).toBe('fg-accent');
      expect(icon.props('icon')).toBe('hugeicons:mcp-server');
    });

    it('renders the title and description', () => {
      expect(elements.title().text()).toBe(
        i18n.global.t('audit.improvements.mcp_disclaimer.title'),
      );
      expect(elements.description().text()).toBe(
        i18n.global.t('audit.improvements.mcp_disclaimer.description'),
      );
    });

    it('renders the tertiary CTA button', () => {
      const button = elements.button();

      expect(button.exists()).toBe(true);
      expect(button.props('type')).toBe('tertiary');
      expect(button.props('text')).toBe(
        i18n.global.t('audit.improvements.mcp_disclaimer.button'),
      );
    });

    it('renders the MCP info drawer closed initially', () => {
      expect(elements.drawer().exists()).toBe(true);
      expect(elements.drawer().props('open')).toBe(false);
    });
  });

  describe('Drawer interaction', () => {
    it('opens the drawer when the CTA is clicked', async () => {
      await elements.button().trigger('click');
      await nextTick();

      expect(elements.drawer().props('open')).toBe(true);
    });

    it('closes the drawer when it emits update:open false', async () => {
      await elements.button().trigger('click');
      await nextTick();

      await elements.drawer().setValue(false, 'open');
      await nextTick();

      expect(elements.drawer().props('open')).toBe(false);
    });
  });
});
