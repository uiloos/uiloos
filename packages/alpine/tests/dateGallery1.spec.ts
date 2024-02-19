import Alpine from 'alpinejs';
import {expect, test, describe} from '@jest/globals';
import { getByText, fireEvent, queryByText } from '@testing-library/dom';
import { licenseChecker } from '@uiloos/core';
import { dateGallery } from '../src';

describe('dateGallery', () => {
  test('with default name', async () => {
    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    document.body.innerHTML = `
      <div x-data="{ enabled: true }">
        <button @click.prevent="enabled = !enabled">toggle</button>
  
        <template x-if="enabled">
          <div x-data="dateGallery({
            mode: 'day',
            initialDate: '1999-12-31 00:00',
          })">
            <template x-for="dateObj in dateGallery().firstFrame.dates">
              <div>
                <span x-text="\`\${dateObj.date.getDate()}-\${dateObj.date.getMonth()}-\${dateObj.date.getFullYear()} \`"></span>
                <button @click="dateGallery().next()">next</button>
              </div>
            </template>
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

    await fireEvent.click(getByText(document.body, 'toggle'));
    
    expect(queryByText(document.body, '1-0-2000')).toBe(null);

    await fireEvent.click(getByText(document.body, 'toggle'));

    getByText(document.body, '31-11-1999');
  });
});
