import Alpine from 'alpinejs';
import {expect, jest, test, describe} from '@jest/globals';
import { getByText, fireEvent, queryByText } from '@testing-library/dom';

import { licenseChecker } from '@uiloos/core';

import { typewriterFromSentences } from '../src';

describe('typewriterFromSentences', () => {
  test('with default name', async () => {
    jest.useFakeTimers();

    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    document.body.innerHTML = `
      <div x-data="{ enabled: true }">
        <button @click.prevent="enabled = !enabled">toggle</button>
  
        <template x-if="enabled">
          <span 
            x-data="typewriter({
              sentences: [
                'a',
                'b',
                'c'
              ],
            })" 
            x-text="typewriter().text"
          ></span>
        </template>
      </div>
    `;

    // @ts-expect-error Allow me to assign this.
    Alpine.data('typewriter', typewriterFromSentences);

    Alpine.start();

    jest.advanceTimersByTime(50);

    getByText(document.body, 'a');

    jest.advanceTimersByTime(2000);
    expect(queryByText(document.body, 'a')).toBe(null);

    jest.advanceTimersByTime(50);

    getByText(document.body, 'b');

    jest.advanceTimersByTime(2000);

    expect(queryByText(document.body, 'b')).toBe(null);

    jest.advanceTimersByTime(50);

    getByText(document.body, 'c');

    await fireEvent.click(getByText(document.body, 'toggle'));
    // Needed to force alpine to render, due to the fake timers.
    jest.advanceTimersByTime(1);

    expect(queryByText(document.body, 'c')).toBe(null);

    await fireEvent.click(getByText(document.body, 'toggle'));
    // Needed to force alpine to render, due to the fake timers.
    jest.advanceTimersByTime(50);

    getByText(document.body, 'a');

    jest.advanceTimersByTime(2000);
    expect(queryByText(document.body, 'a')).toBe(null);

    jest.advanceTimersByTime(50);

    getByText(document.body, 'b');

    jest.advanceTimersByTime(2000);

    expect(queryByText(document.body, 'b')).toBe(null);

    jest.advanceTimersByTime(50);

    getByText(document.body, 'c');
  });
});
