import { describe, jest, test } from '@jest/globals';
import { getByText } from '@testing-library/dom';
import { Typewriter, licenseChecker } from '@uiloos/core';
import Alpine from 'alpinejs';
import { subscribe } from '../src/';

describe('subscribe', () => {
  test('Typewriter', async () => {
    jest.useFakeTimers();

    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    document.body.innerHTML = `
      <div x-data="typewriter" x-init="typewriter().play()">
        <span x-text="typewriter().text"></span>
      </div>
    `;

    const typewriter = new Typewriter({
      autoPlay: false,
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

    const name = 'typewriter';
    Alpine.data(name, subscribe(name, typewriter));

    Alpine.start();

    jest.advanceTimersByTime(1);
    getByText(document.body, 'a');

    jest.advanceTimersByTime(1);
    getByText(document.body, 'ab');

    jest.advanceTimersByTime(1);
    getByText(document.body, 'abc');
  });
});
