import Alpine from 'alpinejs';
import { test, describe } from '@jest/globals';
import { getByText, fireEvent } from '@testing-library/dom';
import { licenseChecker } from '@uiloos/core';
import { dateGallery } from '../src';

describe('dateGallery', () => {
  test('with custom name', async () => {
    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    document.body.innerHTML = `
      <div x-data="dateGallery({
        alpine: {
          name: 'calendar'
        },
        mode: 'day',
        initialDate: '1999-12-31 00:00'
      })">
        <template x-for="dateObj in calendar().firstFrame.dates">
          <div>
            <span x-text="\`\${dateObj.date.getDate()}-\${dateObj.date.getMonth()}-\${dateObj.date.getFullYear()} \`"></span>
            <button @click="calendar().next()">next</button>
          </div>
        </template>
      </div>
    `;

    // @ts-expect-error Allow me to assign this.
    Alpine.data('dateGallery', dateGallery);

    Alpine.start();

    getByText(document.body, '31-11-1999');

    await fireEvent.click(getByText(document.body, 'next'));

    getByText(document.body, '1-0-2000');
  });
});
