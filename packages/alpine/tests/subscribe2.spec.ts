import Alpine from 'alpinejs';
import { test, describe } from '@jest/globals';
import { getByText, fireEvent } from '@testing-library/dom';
import { ActiveList, licenseChecker } from '@uiloos/core';
import { subscribe } from '../src/';

describe('subscribe', () => {
  test('ActiveList', async () => {
    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    document.body.innerHTML = `
      <ul x-data="tabs">
        <template x-for="content in tabs().contents">
          <li @click="content.activate()">
            <span x-text="content.isActive ? content.value + ' active' : content.value + ' inactive'"></span>
          </li>
        </template>
      </ul>
    `;

    const activeList = new ActiveList({
      active: 'a',
      contents: ['a', 'b', 'c'],
    });
    Alpine.data('tabs', subscribe('tabs', activeList));

    Alpine.start();

    getByText(document.body, 'a active');
    getByText(document.body, 'b inactive');
    getByText(document.body, 'c inactive');

    await fireEvent.click(getByText(document.body, 'c inactive'));

    getByText(document.body, 'a inactive');
    getByText(document.body, 'b inactive');
    getByText(document.body, 'c active');
  });
});
