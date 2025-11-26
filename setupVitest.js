import { vi } from 'vitest';

import { config } from '@vue/test-utils';
import i18n from '@/utils/plugins/i18n';
import lodash from 'lodash';
import UnnnicSystemPlugin from '@/utils/plugins/UnnnicSystem.ts';
import UnnnicDivider from '@/components/Divider.vue';
import UnnnicIntelligenceText from '@/components/unnnic-intelligence/Text.vue';
import Unnnic from '@weni/unnnic-system';

vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    enumerable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

class IntersectionObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.IntersectionObserver = IntersectionObserverMock;

const unnnicDrawerStub = {
  name: 'UnnnicDrawerStub',
  inheritAttrs: false,
  props: Unnnic?.unnnicDrawer.props,
  emits: Unnnic?.unnnicDrawer.emits,
  template: `
    <div v-bind="$attrs">
      <slot name="title" />
      <slot name="content" />
    </div>
  `,
};

const unnnicModalDialogStub = {
  name: 'UnnnicModalDialogStub',
  inheritAttrs: false,
  props: Unnnic?.unnnicModalDialog.props,
  emits: Unnnic?.unnnicModalDialog.emits,
  template: `
    <div v-bind="$attrs">
      <slot name="leftSidebar" />
      <slot />
      <slot name="footer" />
    </div>
  `,
};

const unnnicTooltipStub = {
  name: 'UnnnicToolTipStub',
  inheritAttrs: false,
  props: Unnnic?.unnnicToolTip.props,
  emits: Unnnic?.unnnicToolTip.emits,
  template: `<div><slot /></div>`,
};

config.global.plugins = [i18n, UnnnicSystemPlugin];
config.global.components = {
  UnnnicDivider,
  UnnnicIntelligenceText,
};
config.global.stubs = {
  ...(config.global.stubs || {}),
  teleport: {
    template: `<div><slot /></div>`,
  },
  UnnnicModalDialog: unnnicModalDialogStub,
  UnnnicToolTip: unnnicTooltipStub,
  Drawer: unnnicDrawerStub,
};

vi.spyOn(lodash, 'debounce').mockImplementation((fn) => fn);
