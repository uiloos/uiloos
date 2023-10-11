import Alpine from 'alpinejs';
import { expect, jest, test, describe } from '@jest/globals';
import { getByText, fireEvent, queryByText } from '@testing-library/dom';
import { ViewChannel, licenseChecker } from '@uiloos/core';
import { createViewChannelStore } from '../src';

licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

describe('viewChannel', () => {
  test('scenario: spawning from with HTML with action creators', async () => {
    jest.useFakeTimers();

    document.body.innerHTML = `
    <div x-data>
      <ul>
        <template x-for="view in $store.flashMessages.viewChannel().views">
          <li >
            <span x-text="view.data"></span>
            <button @click="view.dismiss('DISMISSED')">dismiss</span>
          </li>
        </template>   
      </ul>

      <button @click="$store.flashMessages.success('spawned from button')">spawn<button>
      <button @click="$store.flashMessages.viewChannel().dismissAll('CLEARING HOUSE')">Clear all<button>
    </div>
  `;

    const flashMessageViewChannel = new ViewChannel<string, string>();

    const flashMessageStore = createViewChannelStore({
      viewChannel: flashMessageViewChannel,
      actions: {
        success(msg: string) {
          flashMessageViewChannel.present({ data: msg, autoDismiss: { duration: 2000, result: 'DISMISSED' } });
        },
      },
    });

    Alpine.store('flashMessages', flashMessageStore);

    Alpine.start();

    // @ts-expect-error jaja
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

    await fireEvent.click(getByText(document.body, 'dismiss'));

    expect(flashMessageViewChannel.views.length).toBe(0);

    expect(promise).resolves.toBe('DISMISSED');

    expect(flashMessageViewChannel.views.length).toBe(0);

    await fireEvent.click(getByText(document.body, 'spawn'));
    expect(flashMessageViewChannel.views.length).toBe(1);
    jest.advanceTimersByTime(1);
    getByText(document.body, 'spawned from button');

    await fireEvent.click(getByText(document.body, 'spawn'));
    expect(flashMessageViewChannel.views.length).toBe(2);

    promise = flashMessageViewChannel.views[0].result;

    await fireEvent.click(getByText(document.body, 'Clear all'));

    jest.advanceTimersByTime(1);
    expect(queryByText(document.body, 'spawned from button')).toBe(null);

    expect(flashMessageViewChannel.views.length).toBe(0);

    expect(promise).resolves.toBe('CLEARING HOUSE');
  });
});
