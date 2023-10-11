import Alpine from 'alpinejs';
import {expect, jest, test, describe} from '@jest/globals';
import { getByText, fireEvent, queryByText } from '@testing-library/dom';
import { licenseChecker } from '@uiloos/core';
import { typewriter } from '../src';

describe('typewriter', () => {
  test('with default name', async () => {
    jest.useFakeTimers();

    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    document.body.innerHTML = `
      <div x-data="{ enabled: true }">
        <button @click.prevent="enabled = !enabled">toggle</button>

        <template x-if="enabled">
          <div x-data="typewriter({
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
          })">
            <span x-text="typewriter().text"></span>
          </div>
        </template>
      </div>
    `;

    // @ts-expect-error Allow me to assign this.
    Alpine.data('typewriter', typewriter);

    Alpine.start();

    jest.advanceTimersByTime(1);
    getByText(document.body, 'a');

    jest.advanceTimersByTime(1);
    getByText(document.body, 'ab');

    jest.advanceTimersByTime(1);
    getByText(document.body, 'abc');

    await fireEvent.click(getByText(document.body, 'toggle'));
    // Needed to force alpine to render, due to the fake timers.
    jest.advanceTimersByTime(1);

    expect(queryByText(document.body, 'abc')).toBe(null);

    await fireEvent.click(getByText(document.body, 'toggle'));
    // Needed to force alpine to render, due to the fake timers.
    jest.advanceTimersByTime(1);

    getByText(document.body, 'a');

    jest.advanceTimersByTime(1);
    getByText(document.body, 'ab');

    jest.advanceTimersByTime(1);
    getByText(document.body, 'abc');
  });
});
