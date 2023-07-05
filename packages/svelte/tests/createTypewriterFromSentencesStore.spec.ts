import { licenseChecker, Typewriter } from '@uiloos/core';
import { createTypewriterFromSentencesStore } from '../src/lib/Typewriter/createTypewriterFromSentencesStore.js';
import { expect, test, vi } from 'vitest';

test('createTypewriterFromSentencesStore', () => {
  vi.useFakeTimers();

  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const typewriterReadable = createTypewriterFromSentencesStore({sentences: ['a', 'b', 'c']});

  let typewriter = null as unknown as Typewriter<unknown>;
  const unsubscribe = typewriterReadable.subscribe((t) => {
    typewriter = t;
  });

  expect(typewriter instanceof Typewriter).toBe(true);
  expect(unsubscribe instanceof Function).toBe(true);

  expect(typewriter.text).toBe(''); 
  
  vi.advanceTimersByTime(50);
  expect(typewriter.text).toBe('a'); 
  
  vi.advanceTimersByTime(2000);
  expect(typewriter.text).toBe('');
    
  vi.advanceTimersByTime(50);
  expect(typewriter.text).toBe('b');
    
  vi.advanceTimersByTime(2000);
  expect(typewriter.text).toBe('');

  vi.advanceTimersByTime(50); 
  expect(typewriter.text).toBe('c');

  unsubscribe();
});
