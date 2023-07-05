import { createViewChannelStore } from '../src/lib/ViewChannel/createViewChannelStore.js';
import {
  licenseChecker,
  ViewChannel as ViewChannelCore,
  ViewChannel,
} from '@uiloos/core';
import { expect, test } from 'vitest';

test('createViewChannelStore', () => {
  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const viewChannelOriginal = new ViewChannel<string, string>();

  const viewChannelReadable = createViewChannelStore(viewChannelOriginal);

  let viewChannel = null as unknown as ViewChannel<string, string>;
  const unsubscribe = viewChannelReadable.subscribe((v) => {
    viewChannel = v;
  });

  expect(viewChannel instanceof ViewChannelCore).toBe(true);
  expect(unsubscribe instanceof Function).toBe(true);

  expect(viewChannel.views.length).toBe(0);

  let promise = Promise.resolve('ja');

  const view = viewChannel.present({
    data: 'some flash message here',
  });

  promise = view.result;

  expect(viewChannel.views.length).toBe(1);

  viewChannel.views[0].dismiss('FINISHED');

  expect(viewChannel.views.length).toBe(0);

  expect(promise).resolves.toBe('FINISHED');

  unsubscribe();
});
