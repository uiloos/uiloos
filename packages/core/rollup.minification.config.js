import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import external from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';

import { execSync } from 'child_process';

const shell = (cmd) => execSync(cmd, { encoding: 'utf8' });

console.log('Building minified components');

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

const from = 'import \\* as uiloosLicenseChecker';
const to = '//import \\* as uiloosLicenseChecker';

function uiloosMinificationStart() {
  return {
    name: 'uiloos-minification-start',
    buildStart(options) {
      modifiedDir = options.input[0].split('/index.ts')[0] + "/*";

      console.log(`Commenting: '${from}'; from: ${modifiedDir}`);

      shell(`grep -rli 'as uiloosLicenseChecker' ${modifiedDir} | xargs -I@ sed -I '' 's#${from}#${to}#g' @`);
    },
  };
}

function uiloosMinificationEnd() {
  return {
    name: 'uiloos-minification-end',
    buildEnd() {
      console.log(`Uncommenting: '${to}'; from: ${modifiedDir}`);

      shell(`grep -rli 'as uiloosLicenseChecker' ${modifiedDir} | xargs -I@ sed -I '' 's#${to}#${from}#g' @`);

      console.log("Ignore any `Cannot find name 'uiloosLicenseChecker'` messages, this is expected.");
    },
  };
}
