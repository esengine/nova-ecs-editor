import typescript from '@rollup/plugin-typescript';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default {
  input: 'src/index.ts',
  external: ['@esengine/nova-ecs'],
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'NovaECSEditor',
      globals: {
        '@esengine/nova-ecs': 'NovaECS'
      }
    },
    {
      file: pkg.module,
      format: 'esm'
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src'
    })
  ]
};