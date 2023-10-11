/*
  This script does not run as part of the jest unit tests, but as
  separately from `npm test`.

  What is does is tests the minified files from the dist folder to
  see if all the components work when minified. The test does not
  check all functionality only the surface. This test is therefore
  more of a smoke test.
*/

const { ActiveList, Typewriter, ViewChannel, licenseChecker, typewriterFromSentences } = require('@uiloos/core');

console.log('Checking minification');

const vm = require('vm');
const fs = require('fs');

// We are using node set setTimout and clearTimeout on window
window = {};
window.setTimeout = setTimeout;
window.clearTimeout = clearTimeout;

// Mocks of the externals:
window.uiloosActiveList = { ActiveList: ActiveList };
window.uiloosTypewriter = { Typewriter: Typewriter, typewriterFromSentences };

licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

function load(file) {
  const contents = fs.readFileSync(file);
  const script = new vm.Script(contents);
  script.runInThisContext();
}

load('dist/uiloos-alpine-active-list-VERSION.min.js');

if (!uiloosAlpineActiveList) {
  console.error('uiloosAlpineActiveList is not defined');
  process.exit(1);
}

if (typeof uiloosAlpineActiveList.activeList !== 'function') {
  console.error('uiloosAlpineActiveList.activeList should be a function');
  process.exit(1);
}

const activeList = uiloosAlpineActiveList.activeList({});

if (
  typeof activeList.init !== 'function' &&
  typeof activeList.destroy !== 'function'
) {
  console.error('activeList is not a component');
  process.exit(1);
}

if (!activeList.activeList() instanceof ActiveList) {
  console.error('activeList() is not instance of ActiveList');
  process.exit(1);
}

load('dist/uiloos-alpine-view-channel-VERSION.min.js');

if (!uiloosAlpineViewChannel) {
  console.error('uiloosAlpineViewChannel is not defined');
  process.exit(1);
}

if (typeof uiloosAlpineViewChannel.createViewChannelStore !== 'function') {
  console.error(
    'uiloosAlpineActiveList.createViewChannelStore should be a function'
  );
  process.exit(1);
}

const viewChannel = new ViewChannel({});
const viewChannelStore = uiloosAlpineViewChannel.createViewChannelStore({
  viewChannel,
  actions: {
    test: 123,
  },
});

if (typeof viewChannelStore.init !== 'function') {
  console.error('viewChannelStore is not a store');
  process.exit(1);
}

if (!viewChannelStore.viewChannel === viewChannel) {
  console.error('viewChannelStore.viewChannel is not equal to the configured viewChannel');
  process.exit(1);
}

load('dist/uiloos-alpine-typewriter-VERSION.min.js');

if (!uiloosAlpineTypewriter) {
  console.error('uiloosAlpineActiveList is not defined');
  process.exit(1);
}

if (typeof uiloosAlpineTypewriter.typewriter !== 'function') {
  console.error('uiloosAlpineTypewriter.typewriter should be a function');
  process.exit(1);
}

const typewriter1 = uiloosAlpineTypewriter.typewriter({});

if (
  typeof typewriter1.init !== 'function' &&
  typeof typewriter1.destroy !== 'function'
) {
  console.error('typewriter is not a component');
  process.exit(1);
}

if (!typewriter1.typewriter() instanceof Typewriter) {
  console.error('typewriter() is not instance of Typewriter');
  process.exit(1);
}

load('dist/uiloos-alpine-typewriter-from-sentences-VERSION.min.js');

if (!uiloosAlpineTypewriterFromSentences) {
  console.error('uiloosAlpineActiveList is not defined');
  process.exit(1);
}

if (typeof uiloosAlpineTypewriterFromSentences.typewriterFromSentences !== 'function') {
  console.error('uiloosAlpineTypewriterFromSentences.typewriterFromSentences should be a function');
  process.exit(1);
}

const typewriter2 = uiloosAlpineTypewriterFromSentences.typewriterFromSentences({
  sentences: []
});

if (
  typeof typewriter2.init !== 'function' &&
  typeof typewriter2.destroy !== 'function'
) {
  console.error('typewriterFromSentences is not a component');
  process.exit(1);
}

if (!typewriter2.typewriter() instanceof Typewriter) {
  console.error('typewriter() is not instance of Typewriter');
  process.exit(1);
}

console.log('Finished checking minification');
