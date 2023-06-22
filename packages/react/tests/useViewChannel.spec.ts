import {
  licenseChecker,
  ViewChannel as ViewChannelCore,
  ViewChannel,
} from '@uiloos/core';
import { renderHook, act } from '@testing-library/react';

import { useViewChannel } from '../src';

test('useActiveList hook', () => {
  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const viewChannel = new ViewChannel<string, string>();

  const { result } = renderHook(() => useViewChannel(viewChannel));

  expect(result.current instanceof ViewChannelCore).toBe(true);

  expect(result.current.views.length).toBe(0);

  let promise = Promise.resolve("ja");

  act(() => {
    const view = result.current.present({
      data: 'some flash message here',
    });

    promise = view.result;
  });

  expect(result.current.views.length).toBe(1);

  act(() => {
    result.current.views[0].dismiss("FINISHED");
  });

  expect(result.current.views.length).toBe(0);

  expect(promise).resolves.toBe('FINISHED');
});
