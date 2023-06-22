import { licenseChecker, Typewriter as TypewriterCore } from '@uiloos/core';
import { renderHook, act } from '@testing-library/react';

import { useTypewriterFromSentences } from '../src';

test('useTypewriterFromSentences hook', () => {
  jest.useFakeTimers();

  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const { result } = renderHook(() => useTypewriterFromSentences({sentences: ['a', 'b', 'c']}));

  expect(result.current instanceof TypewriterCore).toBe(true);

  expect(result.current.text).toBe('');

  act(() => {
    jest.advanceTimersByTime(50);
  });
  expect(result.current.text).toBe('a');

  act(() => {
    jest.advanceTimersByTime(2000);
  });
  expect(result.current.text).toBe('');

  act(() => {
    jest.advanceTimersByTime(50);
  });
  expect(result.current.text).toBe('b');

  act(() => {
    jest.advanceTimersByTime(2000);
  });
  expect(result.current.text).toBe('');

  act(() => {
    jest.advanceTimersByTime(50);
  });
  expect(result.current.text).toBe('c');
});
