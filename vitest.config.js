import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.test.js',
        '**/*.spec.js',
        'e2e/'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    // Fix for navigator property issue
    globals: true,
    // Mock common browser APIs
    deps: {
      inline: ['jsdom']
    }
  },
  // Resolve path aliases
  resolve: {
    alias: {
      '@': './src'
    }
  }
});
