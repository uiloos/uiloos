import { licenseChecker, Typewriter as TypewriterCore } from '@uiloos/core';
import { renderHook, act } from '@testing-library/react';

import { useTypewriter } from '../src';

test('useTypewriter hook', () => {
  jest.useFakeTimers();

  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const { result } = renderHook(() =>
    useTypewriter({
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
      ],
    })
  );

  expect(result.current instanceof TypewriterCore).toBe(true);

  expect(result.current.text).toBe('');

  act(() => {
    jest.advanceTimersByTime(1);
  });
  expect(result.current.text).toBe('a');

  act(() => {
    jest.advanceTimersByTime(1);
  });
  expect(result.current.text).toBe('ab');

  act(() => {
    jest.advanceTimersByTime(1);
  });
  expect(result.current.text).toBe('abc');
});
