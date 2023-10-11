import Alpine from 'alpinejs';

import { getByText, queryByText } from '@testing-library/dom';
import {expect, jest, test, describe} from '@jest/globals';
import { licenseChecker } from '@uiloos/core';

import { typewriterFromSentences } from '../src';

describe('typewriterFromSentences', () => {
  test('with custom name', async () => {
    jest.useFakeTimers();

    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    document.body.innerHTML = `
      <div x-data="typewriter({
        alpine: {
          name: 'foo'
        },
        sentences: [
          'a',
          'b',
          'c'
        ],
      })">
        <span x-text="foo().text"></span>
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
  });
});
