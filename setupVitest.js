import { vi } from 'vitest';

import { config } from '@vue/test-utils';
import i18n from '@/utils/plugins/i18n';
import lodash from 'lodash';
import UnnnicSystemPlugin from '@/utils/plugins/UnnnicSystem.ts';
import UnnnicDivider from '@/components/Divider.vue';
import UnnnicIntelligenceText from '@/components/unnnic-intelligence/Text.vue';

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

config.global.plugins = [i18n, UnnnicSystemPlugin];
config.global.components = {
  UnnnicDivider,
  UnnnicIntelligenceText,
};

vi.spyOn(lodash, 'debounce').mockImplementation((fn) => fn);
