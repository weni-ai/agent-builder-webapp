import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useAlertStore } from '@/store/Alert';

import McpInfoDrawer from '../McpInfoDrawer.vue';
import {
  CONNECTION_STEPS,
  DOCUMENTATION_URL,
  IMPROVEMENTS_FEATURES,
  MCP_SERVER_URL,
  PROJECT_FEATURES,
} from '../mcpDrawerContent';

describe('McpInfoDrawer.vue', () => {
  let wrapper;
  let alertStore;
  let writeTextMock;
  let windowOpenMock;

  const createWrapper = (props = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
    });

    alertStore = useAlertStore(pinia);

    wrapper = mount(McpInfoDrawer, {
      props: {
        open: true,
        ...props,
      },
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicDrawerNext: false,
        },
      },
    });
  };

  const elements = {
    drawer: () => wrapper.findComponent({ name: 'UnnnicDrawerNext' }),
    title: () => wrapper.find('[data-testid="mcp-info-drawer-title"]'),
    description: () =>
      wrapper.find('[data-testid="mcp-info-drawer-description"]'),
    mcpDescription: () =>
      wrapper.find('[data-testid="mcp-info-drawer-mcp-description"]'),
    content: () => wrapper.find('[data-testid="mcp-info-drawer-content"]'),
    whatYouCanDo: () =>
      wrapper.find('[data-testid="mcp-info-drawer-what-you-can-do"]'),
    whatYouCanDoTitle: () =>
      wrapper.find('[data-testid="mcp-info-drawer-what-you-can-do-title"]'),
    improvementsFeatures: () =>
      wrapper.find('[data-testid="mcp-info-drawer-improvements-features"]'),
    projectFeatures: () =>
      wrapper.find('[data-testid="mcp-info-drawer-project-features"]'),
    feature: (id) =>
      wrapper.find(`[data-testid="mcp-info-drawer-feature-${id}"]`),
    featureIcon: (id) =>
      wrapper
        .find(`[data-testid="mcp-info-drawer-feature-${id}"]`)
        .findComponent({ name: 'UnnnicIcon' }),
    disclaimer: () =>
      wrapper.findComponent('[data-testid="mcp-info-drawer-disclaimer"]'),
    howToConnect: () =>
      wrapper.find('[data-testid="mcp-info-drawer-how-to-connect"]'),
    howToConnectTitle: () =>
      wrapper.find('[data-testid="mcp-info-drawer-how-to-connect-title"]'),
    step: (number) =>
      wrapper.find(`[data-testid="mcp-info-drawer-step-${number}"]`),
    stepNumber: (number) =>
      wrapper.find(`[data-testid="mcp-info-drawer-step-number-${number}"]`),
    serverUrl: () =>
      wrapper.findComponent('[data-testid="mcp-info-drawer-server-url"]'),
    documentationButton: () =>
      wrapper.findComponent(
        '[data-testid="mcp-info-drawer-documentation-button"]',
      ),
    footer: () => wrapper.find('[data-testid="mcp-info-drawer-footer"]'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });
    windowOpenMock = vi.fn();
    window.open = windowOpenMock;
    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('header', () => {
    it('renders the drawer', () => {
      expect(elements.drawer().exists()).toBe(true);
    });

    it('renders the title and descriptions', () => {
      expect(elements.title().text()).toBe(
        i18n.global.t('audit.improvements.mcp_drawer.title'),
      );
      expect(elements.description().text()).toBe(
        i18n.global.t('audit.improvements.mcp_drawer.description'),
      );
      expect(elements.mcpDescription().text()).toBe(
        i18n.global.t('audit.improvements.mcp_drawer.mcp_description'),
      );
    });
  });

  describe('what you can do', () => {
    it('renders the section title', () => {
      expect(elements.whatYouCanDo().exists()).toBe(true);
      expect(elements.whatYouCanDoTitle().text()).toBe(
        i18n.global.t('audit.improvements.mcp_drawer.what_you_can_do'),
      );
    });

    it('renders the improvements backlog feature group', () => {
      expect(elements.improvementsFeatures().exists()).toBe(true);
      expect(elements.improvementsFeatures().text()).toContain(
        i18n.global.t(
          'audit.improvements.mcp_drawer.with_improvements_backlog',
        ),
      );
    });

    it('renders the project feature group', () => {
      expect(elements.projectFeatures().exists()).toBe(true);
      expect(elements.projectFeatures().text()).toContain(
        i18n.global.t('audit.improvements.mcp_drawer.across_your_project'),
      );
    });

    it.each([...IMPROVEMENTS_FEATURES, ...PROJECT_FEATURES])(
      'renders the $id feature with its icon and copy',
      ({ id, icon }) => {
        const feature = elements.feature(id);
        const featureIcon = elements.featureIcon(id);

        expect(feature.exists()).toBe(true);
        expect(feature.text()).toContain(
          i18n.global.t(`audit.improvements.mcp_drawer.features.${id}.title`),
        );
        expect(feature.text()).toContain(
          i18n.global.t(
            `audit.improvements.mcp_drawer.features.${id}.description`,
          ),
        );
        expect(featureIcon.exists()).toBe(true);
        expect(featureIcon.props('icon')).toBe(icon);
        expect(featureIcon.props('size')).toBe('ant');
        expect(featureIcon.props('scheme')).toBe('fg-accent');
      },
    );

    it('renders the neutral disclaimer', () => {
      const disclaimer = elements.disclaimer();

      expect(disclaimer.exists()).toBe(true);
      expect(disclaimer.props('type')).toBe('neutral');
      expect(disclaimer.props('description')).toBe(
        i18n.global.t('audit.improvements.mcp_drawer.disclaimer'),
      );
    });
  });

  describe('how to connect', () => {
    it('renders the section title', () => {
      expect(elements.howToConnect().exists()).toBe(true);
      expect(elements.howToConnectTitle().text()).toBe(
        i18n.global.t('audit.improvements.mcp_drawer.how_to_connect'),
      );
    });

    it.each(CONNECTION_STEPS)(
      'renders step $number with its title',
      ({ number, titleKey }) => {
        expect(elements.step(number).exists()).toBe(true);
        expect(elements.stepNumber(number).text()).toBe(String(number));
        expect(elements.step(number).text()).toContain(
          i18n.global.t(`audit.improvements.mcp_drawer.${titleKey}`),
        );
      },
    );

    it('renders the server URL input with a copy affordance', () => {
      const serverUrl = elements.serverUrl();

      expect(serverUrl.exists()).toBe(true);
      expect(serverUrl.props('modelValue')).toBe(MCP_SERVER_URL);
      expect(serverUrl.props('readonly')).toBe(true);
      expect(serverUrl.props('iconRight')).toBe('content_copy');
      expect(serverUrl.props('iconRightClickable')).toBe(true);
    });

    it('copies the URL and shows a success alert', async () => {
      await elements
        .serverUrl()
        .findComponent({ name: 'UnnnicIcon' })
        .trigger('click');
      await nextTick();

      expect(writeTextMock).toHaveBeenCalledWith(MCP_SERVER_URL);
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'informational',
        text: i18n.global.t('audit.improvements.mcp_drawer.copy_success'),
      });
    });

    it('shows an error alert when copying the server URL fails', async () => {
      writeTextMock.mockRejectedValueOnce(new Error('Clipboard error'));

      await elements
        .serverUrl()
        .findComponent({ name: 'UnnnicIcon' })
        .trigger('click');
      await nextTick();

      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'error',
        text: i18n.global.t('audit.improvements.mcp_drawer.copy_error'),
      });
    });
  });

  describe('footer', () => {
    it('renders the documentation button', () => {
      const documentationButton = elements.documentationButton();

      expect(elements.footer().exists()).toBe(true);
      expect(documentationButton.exists()).toBe(true);
      expect(documentationButton.props('type')).toBe('secondary');
      expect(documentationButton.props('text')).toBe(
        i18n.global.t('audit.improvements.mcp_drawer.view_documentation'),
      );
    });

    it('opens the documentation URL in a new tab', async () => {
      await elements.documentationButton().trigger('click');

      expect(windowOpenMock).toHaveBeenCalledWith(
        DOCUMENTATION_URL,
        '_blank',
        'noopener,noreferrer',
      );
    });
  });
});
