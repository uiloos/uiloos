import { mount } from '@vue/test-utils';
import { ActiveList, licenseChecker } from '@uiloos/core';
import { test, expect } from 'vitest';
import { defineComponent } from 'vue';

import { useActiveList } from '../src/index';

test('useActiveList composable', async () => {
  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const TestComponent = defineComponent({
    render() {
      return 'fake component';
    },
    setup() {
      const activeList = useActiveList({
        active: 'a',
        contents: ['a', 'b', 'c'],
      });
      return {
        activeList,
      };
    },
  });

  const wrapper = mount(TestComponent, {});

  expect(wrapper.vm.activeList).instanceOf(ActiveList);

  expect(wrapper.vm.activeList.active).toEqual(['a']);

  wrapper.vm.activeList.activate('b');

  expect(wrapper.vm.activeList.active).toEqual(['b']);

  wrapper.unmount();
});
