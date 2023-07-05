import { licenseChecker, ActiveList } from '@uiloos/core';
import { createActiveListStore } from '../src/lib/ActiveList/createActiveListStore.js';
import { expect, test } from 'vitest';

test('createActiveListStore', () => {
  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const activeListReadable = createActiveListStore({
    active: 'a',
    contents: ['a', 'b', 'c'],
  });

  let activeList = null as unknown as ActiveList<string>;
  const unsubscribe = activeListReadable.subscribe((a) => {
    activeList = a;
  });

  expect(activeList instanceof ActiveList).toBe(true);
  expect(unsubscribe instanceof Function).toBe(true);

  expect(activeList.active).toEqual(['a']);

  activeList.activate('b');

  expect(activeList.active).toEqual(['b']);

  unsubscribe();
});
