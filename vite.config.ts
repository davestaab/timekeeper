import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,ts,vue}'],
      exclude: [
        'src/main.ts',
        'src/registerServiceWorker.ts',
        'src/App.vue',
        'src/timeline/TimeLineChart.ts',
        'src/components/TimeLineChart.vue'
      ],
      thresholds: { lines: 70 }
    }
  }
});
