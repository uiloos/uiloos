import Alpine from 'alpinejs';
import {expect, jest, test, describe} from '@jest/globals';
import { getByText, queryByText } from '@testing-library/dom';
import { ViewChannel, licenseChecker } from '@uiloos/core';
import { createViewChannelStore } from '../src';

licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

describe('viewChannel', () => {
  test('scenario: spawning from withing JavaScript', async () => {
    jest.useFakeTimers();

    document.body.innerHTML = `
    <ul x-data>
      <template x-for="view in $store.flashMessages.viewChannel().views">
        <li x-text="view.data"></li>
      </template>
    </ul>
  `;

    const flashMessageViewChannel = new ViewChannel<string, string>();
    const flashMessageStore = createViewChannelStore({
      viewChannel: flashMessageViewChannel,
    });

    Alpine.store('flashMessages', flashMessageStore);

    Alpine.start();

    // @ts-expect-error Allow me to do this
    window.Alpine = Alpine;

    expect(flashMessageViewChannel.views.length).toBe(0);

    let promise = Promise.resolve('ja');

    const view = flashMessageViewChannel.present({
      data: 'some flash message here',
    });

    promise = view.result;

    expect(flashMessageViewChannel.views.length).toBe(1);

    jest.advanceTimersByTime(1);

    getByText(document.body, 'some flash message here');

    flashMessageViewChannel.views[0].dismiss('FINISHED');

    expect(flashMessageViewChannel.views.length).toBe(0);

    jest.advanceTimersByTime(1);
    expect(queryByText(document.body, 'some flash message here')).toBe(null);

    expect(promise).resolves.toBe('FINISHED');
  });
});
