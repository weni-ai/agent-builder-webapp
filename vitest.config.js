import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude],
      root: fileURLToPath(new URL('./', import.meta.url)),
      globals: true,
      setupFiles: './setupVitest.js',
      coverage: {
        all: true,
        provider: 'istanbul',
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{vue,js,ts}'],
        exclude: ['src/main.js', '**/__tests__/**'],
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  }),
);
