import { createTypewriterStore } from '../src/lib/Typewriter/createTypewriterStore.js';
import { Typewriter, licenseChecker } from '@uiloos/core';
import { expect, test, vi } from 'vitest';

test('createTypewriterStore', async () => {
  vi.useFakeTimers();

  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const typewriterReadable = createTypewriterStore({
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
  });

  let typewriter = null as unknown as Typewriter<unknown>;
  const unsubscribe = typewriterReadable.subscribe((t) => {
    typewriter = t;
  });

  expect(typewriter instanceof Typewriter).toBe(true);
  expect(unsubscribe instanceof Function).toBe(true);

  vi.advanceTimersByTime(1);
  expect(typewriter.text).toBe('a');

  vi.advanceTimersByTime(1);
  expect(typewriter.text).toBe('ab');

  vi.advanceTimersByTime(1);
  expect(typewriter.text).toBe('abc');

  unsubscribe();
});
