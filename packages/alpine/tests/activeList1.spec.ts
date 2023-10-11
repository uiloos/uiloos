import Alpine from 'alpinejs';
import {expect, test, describe} from '@jest/globals';
import { getByText, fireEvent, queryByText } from '@testing-library/dom';
import { licenseChecker } from '@uiloos/core';
import { activeList } from '../src';

describe('activeList', () => {
  test('with default name', async () => {
    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    document.body.innerHTML = `
      <div x-data="{ enabled: true }">
        <button @click.prevent="enabled = !enabled">toggle</button>
  
        <template x-if="enabled">
          <div x-data="activeList({
            active: 'a',
            contents: ['a', 'b', 'c']
          })">
            <ul>
              <template x-for="content in activeList().contents">
                <li @click="content.activate()">
                  <span x-text="\`\${content.value} \${content.isActive ? 'active' : 'inactive'}\`"></span>
                </li>
              </template>
            </ul>
          </div>
        </template>
      </div>
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

    await fireEvent.click(getByText(document.body, 'toggle'));
    
    expect(queryByText(document.body, 'c active')).toBe(null);

    await fireEvent.click(getByText(document.body, 'toggle'));

    getByText(document.body, 'a active');
    getByText(document.body, 'b inactive');
    getByText(document.body, 'c inactive');
  });
});
