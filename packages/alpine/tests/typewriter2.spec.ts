import Alpine from 'alpinejs';
import { jest, test, describe } from '@jest/globals';
import { getByText } from '@testing-library/dom';
import { licenseChecker } from '@uiloos/core';
import { typewriter } from '../src';

describe('typewriter', () => {
  test('with custom name', async () => {
    jest.useFakeTimers();

    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    document.body.innerHTML = `
      <span 
        x-data="typewriter({
          alpine: {
            name: 'foo'
          },
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
        })" 
        x-text="foo().text">
      </span>
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
  });
});
