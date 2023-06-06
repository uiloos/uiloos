import { mount } from '@vue/test-utils';
import { Typewriter, licenseChecker } from '@uiloos/core';
import { test, expect, vi } from 'vitest';
import { defineComponent } from 'vue';

import { useTypewriter } from '../src/index';

test('useTypewriter composable', async () => {
  vi.useFakeTimers();

  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const TestComponent = defineComponent({
    render() {
      return 'fake component';
    },
    setup() {
      const typewriter = useTypewriter({
        actions: [
          {
            type: 'keyboard',
            text: 'a',
            delay: 1,
            cursor: 0,
          },
          {
            type: 'keyboard',
            text: 'b',
            delay: 1,
            cursor: 0,
          },
          {
            type: 'keyboard',
            text: 'c',
            delay: 1,
            cursor: 0,
          },
        ],
      });
      return {
        typewriter,
      };
    },
  });

  const wrapper = mount(TestComponent, {});

  expect(wrapper.vm.typewriter).instanceOf(Typewriter);

  expect(wrapper.vm.typewriter.text).toBe('');

  vi.advanceTimersByTime(1);
  expect(wrapper.vm.typewriter.text).toBe('a');

  vi.advanceTimersByTime(1);
  expect(wrapper.vm.typewriter.text).toBe('ab');

  vi.advanceTimersByTime(1);
  expect(wrapper.vm.typewriter.text).toBe('abc');

  wrapper.unmount();
});
