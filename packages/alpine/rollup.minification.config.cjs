const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const external = require('rollup-plugin-peer-deps-external');
const terser = require('@rollup/plugin-terser');

console.log('\nBuilding minified components for alpine package');

const config = [
  createEntry({
    input: 'activeList',
    output: 'active-list',
    name: 'uiloosAlpineActiveList',
    core: 'uiloosActiveList'
  }),
  createEntry({
    input: 'viewChannel',
    output: 'view-channel',
    name: 'uiloosAlpineViewChannel',
    core: 'uiloosViewChannel'
  }),
  createEntry({
    input: 'typewriter',
    output: 'typewriter',
    name: 'uiloosAlpineTypewriter',
    core: 'uiloosTypewriter'
  }),
  createEntry({
    input: 'typewriterFromSentences',
    output: 'typewriter-from-sentences',
    name: 'uiloosAlpineTypewriterFromSentences',
    core: 'uiloosTypewriter'
  }),
  createEntry({
    input: 'dateGallery',
    output: 'date-gallery',
    name: 'uiloosAlpineDateGallery',
    core: 'uiloosDateGallery'
  }),
  createEntry({
    input: 'subscribe',
    output: 'subscribe',
    name: 'uiloosAlpineSubscribe',
    core: ''
  }),
];

module.exports = config;

function createEntry({ input, output, name, core }) {
  return {
    input: `src/${input}.ts`,
    output: {
      file: `dist/uiloos-alpine-${output}-VERSION.min.js`,
      format: 'iife',
      name,
      plugins: [
        terser({
          mangle: {
            properties: {
              regex: /^_|_$/, // It is safe to rename variables with underscores
            },
          },
        }),
      ],
      globals: {
        '@uiloos/core': `window.${core}`,
      },
    },
    plugins: [
      external(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
    external: ['@uiloos/core'],
  };
}
