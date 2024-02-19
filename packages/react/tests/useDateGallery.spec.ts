import { licenseChecker, DateGallery } from '@uiloos/core';
import { renderHook, act } from '@testing-library/react';

import { useDateGallery } from '../src';

test('useDateGallery hook', () => {
  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const { result } = renderHook(() =>
    useDateGallery({
      mode: 'day',
      initialDate: '1999-12-31 00:00',
    })
  );

  expect(result.current instanceof DateGallery).toBe(true);

  expect(result.current.firstFrame.anchorDate.getDate()).toBe(31);
  expect(result.current.firstFrame.anchorDate.getMonth()).toBe(11);
  expect(result.current.firstFrame.anchorDate.getFullYear()).toBe(1999);

  act(() => {
    result.current.next();
  });

  expect(result.current.firstFrame.anchorDate.getDate()).toBe(1);
  expect(result.current.firstFrame.anchorDate.getMonth()).toBe(0);
  expect(result.current.firstFrame.anchorDate.getFullYear()).toBe(2000);
});
