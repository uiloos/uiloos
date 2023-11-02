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

// We are using node set setTimout and clearTimeout on window
window = {};
window.setTimeout = setTimeout;
window.clearTimeout = clearTimeout;

function load(file) {
  const contents = fs.readFileSync(file);
  const script = new vm.Script(contents);
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

if (!uiloosActiveList.createActiveListSubscriber) {
  console.error('uiloosActiveList.createActiveListSubscriber is not defined');
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

load('dist/uiloos-view-channel-VERSION.min.js');

if (!uiloosViewChannel) {
  console.error('uiloosViewChannel is not defined');
  process.exit(1);
}

if (!uiloosViewChannel.ViewChannel) {
  console.error('uiloosViewChannel.ViewChannel is not defined');
  process.exit(1);
}

if (!uiloosViewChannel.createViewChannelSubscriber) {
  console.error('uiloosViewChannel.createViewChannelSubscriber is not defined');
  process.exit(1);
}

const viewChannel = new uiloosViewChannel.ViewChannel();
viewChannel.present({
  data: "a",
  priority: 2
});
viewChannel.present({
  data: "b",
  priority: 1
});
viewChannel.present({
  data: "c",
  priority: 0
});

if (viewChannel.views.length !== 3) {
  console.error('viewChannel.views.length should be 3');
  process.exit(1);
}

const [c, b, a] = viewChannel.views.map(v => v.data);

if (c !== "c" || b !== "b" || a !== "a") {
  console.error('viewChannel.views values are incorrect');
  process.exit(1);
}

load('dist/uiloos-typewriter-VERSION.min.js');
const typewriter = new uiloosTypewriter.Typewriter({
  actions: [
    {
      type: 'keyboard',
      text: 'a',
      delay: 1,
      cursor: 0,
    },
    {
      type: 'keyboard',
      text: 'b',
      delay: 1,
      cursor: 0,
    },
    {
      type: 'keyboard',
      text: 'c',
      delay: 1,
      cursor: 0,
    },
  ]
});

if (typewriter.actions.length !== 3) {
  console.error('typewriter.actions.length should be 3');
  process.exit(1);
}

if (!uiloosTypewriter.typewriterFromSentences) {
  console.error('typewriter.typewriterFromSentences should be defined');
  process.exit(1);
}

if (!uiloosTypewriter.createTypewriterSubscriber) {
  console.error('uiloosTypewriter.createTypewriterSubscriber is not defined');
  process.exit(1);
}

console.log("Finished checking minification");