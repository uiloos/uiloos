import { licenseChecker, ActiveList as ActiveListCore } from '@uiloos/core';
import { renderHook, act } from '@testing-library/react';

import {
  useActiveList,
} from '../src';

test('useActiveList hook', () => {
  licenseChecker.activateLicense("fake-100", { logLicenseActivated: false });

  const { result } = renderHook(() =>
    useActiveList({
      active: 'a',
      contents: ['a', 'b', 'c'],
    })
  );

  expect(result.current instanceof ActiveListCore).toBe(true);

  expect(result.current.active).toEqual(['a']);

  act(() => {
    result.current.activate('b');
  });

  expect(result.current.active).toEqual(['b']);
});

