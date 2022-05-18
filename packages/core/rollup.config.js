import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import external from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

const packageJson = require('./package.json');

console.log('Building in mode', process.env.BUILD_MODE);

/*
  Mode is needed so typings are generated with comments intact or
  without any comments. A bit annoying see: 

  https://github.com/microsoft/TypeScript/issues/14619
*/
const isCodeMode = process.env.BUILD_MODE === 'code';

const result = [];

result[0] = {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      name: '@uiloos/core',
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
    {
      file: `dist/uiloos-core-${packageJson.version}-min.js`,
      format: 'iife',
      name: 'uiloos',
      plugins: [terser()],
    },
  ],
  plugins: [
    external(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: isCodeMode ? './tsconfig.json' : './tsconfig.typings.json',
    }),
  ],
};

if (!isCodeMode) {
  result[1] = {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    external: [/\.css$/],
    plugins: [dts()],
  };
}

export default result;
