import Alpine from 'alpinejs';
import { test, describe } from '@jest/globals';
import { getByText, fireEvent } from '@testing-library/dom';
import { licenseChecker } from '@uiloos/core';
import { activeList } from '../src';

describe('activeList', () => {
  test('with custom name', async () => {
    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    document.body.innerHTML = `
      <ul x-data="activeList({
        alpine: {
          name: 'tabs'
        },
        active: 'a',
        contents: ['a', 'b', 'c']
      })">
        <template x-for="content in tabs().contents">
          <li @click="content.activate()">
            <span x-text="content.isActive ? content.value + ' active' : content.value + ' inactive'"></span>
          </li>
        </template>
      </ul>
    `;

    // @ts-expect-error Allow me to assign this.
    Alpine.data('activeList', activeList);

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
