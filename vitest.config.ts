import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/lib/**',
        'src/app/api/**',
        'src/components/**',
        'src/app/[locale]/individual-carbon-footprint/**',
      ],
      exclude: [
        'src/components/earth/**', // Canvas WebGL / react-three-fiber, non testable en jsdom
        'src/lib/db.ts', // instancie un Pool pg à l'import
        '**/*.spec.tsx',
        '**/*.spec.ts',
      ],
    },
  },
  plugins: [react()],
});
