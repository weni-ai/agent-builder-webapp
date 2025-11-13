import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRoute } from 'vue-router';
import {
  useCurrentModule,
  getCurrentModuleFromPath,
  MODULE_PATHS,
} from '../useCurrentModule';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

describe('useCurrentModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MODULE_PATHS', () => {
    it('should export correct module paths', () => {
      expect(MODULE_PATHS).toEqual({
        conversations: '/conversations',
        agents: '/agents',
        build: '/build',
      });
    });
  });

  describe('getCurrentModuleFromPath', () => {
    describe('when path is empty or root', () => {
      it('should return null for empty string', () => {
        expect(getCurrentModuleFromPath('')).toBe(null);
      });

      it('should return null for root path', () => {
        expect(getCurrentModuleFromPath('/')).toBe(null);
      });
    });

    Object.entries(MODULE_PATHS).forEach(([key, value]) => {
      describe(`when path matches ${key} module`, () => {
        it(`should return "${key}" for exact path`, () => {
          expect(getCurrentModuleFromPath(value)).toBe(key);
        });

        it(`should return "${key}" for nested path`, () => {
          expect(getCurrentModuleFromPath(`${value}/123`)).toBe(key);
        });

        it(`should return "${key}" for path with query params`, () => {
          expect(getCurrentModuleFromPath(`${value}?tab=active`)).toBe(key);
        });
      });
    });

    describe('when path does not match any module', () => {
      it('should return null for unknown path', () => {
        expect(getCurrentModuleFromPath('/unknown')).toBe(null);
      });

      it('should return null for invalid path', () => {
        expect(getCurrentModuleFromPath('/random/path')).toBe(null);
      });

      it('should return "build" for path starting with /build even if longer', () => {
        // Note: '/building' starts with '/build', so it matches the build module
        expect(getCurrentModuleFromPath('/building')).toBe('build');
      });
    });

    describe('edge cases', () => {
      it('should handle paths with trailing slashes', () => {
        expect(getCurrentModuleFromPath('/build/')).toBe('build');
        expect(getCurrentModuleFromPath('/conversations/')).toBe(
          'conversations',
        );
        expect(getCurrentModuleFromPath('/agents/')).toBe('agents');
      });

      it('should be case-sensitive', () => {
        expect(getCurrentModuleFromPath('/Build')).toBe(null);
        expect(getCurrentModuleFromPath('/CONVERSATIONS')).toBe(null);
        expect(getCurrentModuleFromPath('/Agents')).toBe(null);
      });
    });
  });

  describe('useCurrentModule composable', () => {
    const moduleCheckers = {
      build: 'isBuildModule',
      conversations: 'isConversationsModule',
      agents: 'isAgentsModule',
    };

    Object.entries(MODULE_PATHS).forEach(([moduleName, modulePath]) => {
      describe(`when in ${moduleName} module`, () => {
        beforeEach(() => {
          useRoute.mockReturnValue({
            path: modulePath,
          });
        });

        it('should return correct currentModule', () => {
          const { currentModule } = useCurrentModule();
          expect(currentModule.value).toBe(moduleName);
        });

        Object.entries(moduleCheckers).forEach(([module, checkerName]) => {
          it(`should return ${moduleName === module ? 'true' : 'false'} for ${checkerName}`, () => {
            const composable = useCurrentModule();
            expect(composable[checkerName].value).toBe(moduleName === module);
          });
        });

        it('should correctly identify module with isModule function', () => {
          const { isModule } = useCurrentModule();
          Object.keys(MODULE_PATHS).forEach((module) => {
            expect(isModule(module)).toBe(moduleName === module);
          });
        });
      });
    });

    describe('when path is empty or unknown', () => {
      beforeEach(() => {
        useRoute.mockReturnValue({
          path: '',
        });
      });

      it('should return null for currentModule', () => {
        const { currentModule } = useCurrentModule();
        expect(currentModule.value).toBe(null);
      });

      it('should return false for all module checks', () => {
        const { isBuildModule, isConversationsModule, isAgentsModule } =
          useCurrentModule();
        expect(isBuildModule.value).toBe(false);
        expect(isConversationsModule.value).toBe(false);
        expect(isAgentsModule.value).toBe(false);
      });

      it('should return false for isModule function', () => {
        const { isModule } = useCurrentModule();
        expect(isModule('build')).toBe(false);
        expect(isModule('conversations')).toBe(false);
        expect(isModule('agents')).toBe(false);
      });
    });

    describe('composable structure', () => {
      beforeEach(() => {
        useRoute.mockReturnValue({
          path: '/build',
        });
      });

      it('should return all expected properties', () => {
        const result = useCurrentModule();

        expect(result).toHaveProperty('currentModule');
        expect(result).toHaveProperty('isModule');
        expect(result).toHaveProperty('isBuildModule');
        expect(result).toHaveProperty('isConversationsModule');
        expect(result).toHaveProperty('isAgentsModule');
        expect(result).toHaveProperty('MODULE_PATHS');
      });

      it('should return MODULE_PATHS constant', () => {
        const { MODULE_PATHS: paths } = useCurrentModule();
        expect(paths).toBe(MODULE_PATHS);
      });

      it('should return computed properties', () => {
        const {
          currentModule,
          isBuildModule,
          isConversationsModule,
          isAgentsModule,
        } = useCurrentModule();

        expect(currentModule).toHaveProperty('value');
        expect(isBuildModule).toHaveProperty('value');
        expect(isConversationsModule).toHaveProperty('value');
        expect(isAgentsModule).toHaveProperty('value');
      });

      it('should return isModule as a function', () => {
        const { isModule } = useCurrentModule();
        expect(typeof isModule).toBe('function');
      });
    });
  });
});
