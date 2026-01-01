import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    webhook: 'src/webhook/index.ts',
    templates: 'src/templates/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
})
