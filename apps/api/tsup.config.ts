import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node22',
  clean: true,
  sourcemap: true,
  // workspace paketleri (@catalog/*) kaynak .ts olarak geldiği için bundle'a dahil edilir
  noExternal: [/^@catalog\//],
});
