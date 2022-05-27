/*
  This script does not run as part of the jest unit tests, but as
  separately from `npm test`.

  What is does is tests the minified files from the dist folder to
  see if all the components work when minified. The test does not
  check all functionality only the surface. This test is therefore
  more of a smoke test.
*/

console.log("Checking minification");

const vm = require('vm');
const fs = require('fs');

function load(file) {
  const licenseFile = fs.readFileSync(file);
  const script = new vm.Script(licenseFile);
  script.runInThisContext();
}

load('dist/uiloos-license-checker-VERSION.min.js');

if (!uiloosLicenseChecker) {
  console.error('uiloosLicenseChecker is not defined');
  process.exit(1);
}

if (!uiloosLicenseChecker.licenseChecker) {
  console.error('uiloosLicenseChecker.licenseChecker is not defined');
  process.exit(1);
}

uiloosLicenseChecker.licenseChecker.activateLicense('x-100', { logLicenseActivated: false });

load('dist/uiloos-active-list-VERSION.min.js');

if (!uiloosActiveList) {
  console.error('uiloosActiveList is not defined');
  process.exit(1);
}

if (!uiloosActiveList.ActiveList) {
  console.error('uiloosActiveList.ActiveList is not defined');
  process.exit(1);
}

const activeList = new uiloosActiveList.ActiveList();
activeList.push('a');
activeList.push('b');
activeList.push('c');

activeList.activate('b');

if (activeList.lastActivated !== 'b') {
  console.error('activeList.lastActivated should be b');
  process.exit(1);
}

console.log("Finished checking minification");