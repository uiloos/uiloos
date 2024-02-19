import { mount } from '@vue/test-utils';
import { DateGallery, licenseChecker } from '@uiloos/core';
import { test, expect } from 'vitest';
import { defineComponent } from 'vue';

import { useDateGallery } from '../src/index';

test('useDateGallery composable', async () => {
  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const TestComponent = defineComponent({
    render() {
      return 'fake component';
    },
    setup() {
      const dateGallery =  useDateGallery({
        mode: 'day',
        initialDate: '1999-12-31 00:00',
      })
      return {
        dateGallery,
      };
    },
  });

  const wrapper = mount(TestComponent, {});

  expect(wrapper.vm.dateGallery).instanceOf(DateGallery);

  expect(wrapper.vm.dateGallery.firstFrame.anchorDate.getDate()).toBe(31);
  expect(wrapper.vm.dateGallery.firstFrame.anchorDate.getMonth()).toBe(11);
  expect(wrapper.vm.dateGallery.firstFrame.anchorDate.getFullYear()).toBe(1999);

  wrapper.vm.dateGallery.next();

  expect(wrapper.vm.dateGallery.firstFrame.anchorDate.getDate()).toBe(1);
  expect(wrapper.vm.dateGallery.firstFrame.anchorDate.getMonth()).toBe(0);
  expect(wrapper.vm.dateGallery.firstFrame.anchorDate.getFullYear()).toBe(2000);

  wrapper.unmount();
});
