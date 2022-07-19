import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import external from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';
import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';

console.log('\nBuilding minified components for core package');

const config = [
  {
    input: 'src/license/index.ts',
    output: {
      file: `dist/uiloos-license-checker-VERSION.min.js`,
      format: 'iife',
      name: 'uiloosLicenseChecker',
      plugins: [
        // Note: do not allow mangling of `_` here because otherwise
        // _checkLicense will be mangled.
        terser(),
      ],
    },
    plugins: [
      external(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
  },
  {
    input: 'src/ActiveList/index.ts',
    output: {
      file: `dist/uiloos-active-list-VERSION.min.js`,
      format: 'iife',
      name: 'uiloosActiveList',
      plugins: [
        terser({
          mangle: {
            properties: {
              regex: /^_|_$/, // It is safe to rename variables with underscores
            },
          },
        }),
      ],
    },
    plugins: [
      uiloosMinificationStart(),
      external(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      uiloosMinificationEnd(),
    ],
  },
];

export default config;

/*
  Here begins some funky stuff, here is the problem:

  Whenever we minify using terser the uiloos licenseChecker will 
  be included in every component's minified file. This causes it to
  become duplicated.

  To prevent this we remove the following line, from the components 
  file:

  `import * as uiloosLicenseChecker`

  When terser sees a "variable" not being imported, it assumes that
  is is a global, which for minification is what we want.

  So what the code below does is comment the import, run the
  minification, and then uncomment the import again.

  Note that this process does cause, the following types of errors:

  `Cannot find name 'uiloosLicenseChecker'.`
*/

// Stores the directory we are going to alter, since buildEnd cannot
// access the input file.
let modifiedDir = '';

const from = 'import * as uiloosLicenseChecker';
const to = '//import * as uiloosLicenseChecker';

function uiloosMinificationStart() {
  return {
    name: 'uiloos-minification-start',
    buildStart(options) {
      modifiedDir = options.input[0].split('/index.ts')[0] + '/**/*.ts';

      console.log(`Applying terser minification hack: commenting all "${from}" for pattern: "${modifiedDir}"`);

      glob.sync('./' + modifiedDir).forEach((file) => {
        const fileAsString = readFileSync(file, 'utf8');

        if (fileAsString.includes(from)) {
          console.log(`  > file: "${file}" contains the import, commenting it out...`)
          const replacedContent = fileAsString.replace(from, to);
          writeFileSync(file, replacedContent, 'utf8');
        }
      });
    },
  };
}

function uiloosMinificationEnd() {
  return {
    name: 'uiloos-minification-end',
    buildEnd() {
      console.log(`\nUndoing terser minification hack: uncommenting all "${to}" for pattern: "${modifiedDir}"`);

      glob.sync('./' + modifiedDir).forEach((file) => {
        const fileAsString = readFileSync(file, 'utf8');

        if (fileAsString.includes(to)) {
          console.log(`  >  file: "${file}" contains the import, uncommenting it...`);
          const replacedContent = fileAsString.replace(to, from);
          writeFileSync(file, replacedContent, 'utf8');
        }
      });

      console.log("\n\nIgnore any `Cannot find name 'uiloosLicenseChecker'` messages, this is expected!\n");
    },
  };
}
