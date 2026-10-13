import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import vue from '@vitejs/plugin-vue'

const nuxtSpecs = [
  'app/app.spec.ts',
  'app/pages/**/*.spec.ts',
  'app/api/**/*.spec.ts',
  'app/components/footer/AppFooter.spec.ts',
  'app/components/ui/AppHeader.spec.ts',
  'app/composables/useLocalizedNavigation.spec.ts',
  'app/composables/useReport.spec.ts',
]

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [vue()],
        resolve: { alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) } },
        // Keep SVG imports as file URLs (not data URIs) so specs can assert on icon names.
        build: { assetsInlineLimit: 0 },
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./app/test-setup.ts'],
          include: ['app/**/*.spec.ts'],
          exclude: [...nuxtSpecs, '**/node_modules/**'],
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          environmentOptions: { nuxt: { domEnvironment: 'jsdom' } },
          globals: true,
          include: nuxtSpecs,
        },
      }),
    ],
  },
})
