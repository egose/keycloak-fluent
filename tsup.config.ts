import type { Options } from 'tsup';

export const tsup: Options = {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'es2022',
  dts: true,
  splitting: true,
  sourcemap: false,
  clean: true,
  minify: false,
  external: [],
  esbuildPlugins: [],
};
