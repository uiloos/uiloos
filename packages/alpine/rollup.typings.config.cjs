const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const external = require('rollup-plugin-peer-deps-external');
const {default: dts} = require('rollup-plugin-dts');

const packageJson = require('./package.json');

console.log('\nBuilding TypeScript definition files for alpine package');

/*
  This config is needed so typings are generated with comments intact or
  without any comments. A bit annoying see: 

  https://github.com/microsoft/TypeScript/issues/14619
*/
const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      external(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.typings.json',
      }),
    ],
  },
  {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    external: [/\.css$/],
    plugins: [dts()],
  },
];

module.exports = config;
