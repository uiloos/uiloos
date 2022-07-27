import { mount } from '@vue/test-utils';
import { licenseChecker, ViewChannel } from '@uiloos/core';
import { test, expect } from 'vitest';
import { defineComponent } from 'vue';

import { useViewChannel } from '../src/index';

test('useViewChannel composable', async () => {
  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const viewChannelOriginal = new ViewChannel<string, string>();

  const TestComponent = defineComponent({
    render() {
      return "fake component";
    },
    setup() {
      const viewChannel = useViewChannel(viewChannelOriginal);
      return {
        viewChannel,
      }
    },
  });

  const wrapper = mount(TestComponent, {});

  expect(wrapper.vm.viewChannel).instanceOf(ViewChannel);

  expect(wrapper.vm.viewChannel.views.length).toBe(0);

  let promise = Promise.resolve('ja');

  const view = wrapper.vm.viewChannel.present({
    data: 'some flash message here',
  });

  promise = view.result;

  expect(wrapper.vm.viewChannel.views.length).toBe(1);

  wrapper.vm.viewChannel.views[0].dismiss('FINISHED');

  expect(wrapper.vm.viewChannel.views.length).toBe(0);

  expect(promise).resolves.toBe('FINISHED');
});
