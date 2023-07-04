const resolve = require( '@rollup/plugin-node-resolve');
const commonjs = require( '@rollup/plugin-commonjs');
const typescript = require( '@rollup/plugin-typescript');
const external = require( 'rollup-plugin-peer-deps-external');
const {default: dts} = require( 'rollup-plugin-dts');

const packageJson = require('./package.json');

const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        name: '@uiloos/react',
      },
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
      typescript({ tsconfig: './tsconfig.json' }),
    ],
    external: ['react', '@uiloos/core']
  },
  {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    external: [/\.css$/],
    plugins: [dts()],
  },
];

module.exports = config;