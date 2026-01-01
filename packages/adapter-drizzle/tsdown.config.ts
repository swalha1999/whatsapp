import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    schema: 'src/schema.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
})
