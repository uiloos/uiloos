import { mount } from '@vue/test-utils';
import { Typewriter, licenseChecker } from '@uiloos/core';
import { test, expect, vi } from 'vitest';
import { defineComponent } from 'vue';

import { useTypewriterFromSentences } from '../src/index';

test('useTypewriterFromSentences composable', async () => {
  vi.useFakeTimers();

  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const TestComponent = defineComponent({
    render() {
      return 'fake component';
    },
    setup() {
      const typewriter = useTypewriterFromSentences({sentences: ['a', 'b', 'c']});
      return {
        typewriter,
      };
    },
  });

  const wrapper = mount(TestComponent, {});

  expect(wrapper.vm.typewriter).instanceOf(Typewriter);

  expect(wrapper.vm.typewriter.text).toBe('');

  vi.advanceTimersByTime(50);
  expect(wrapper.vm.typewriter.text).toBe('a');
 
  vi.advanceTimersByTime(2000);
  expect(wrapper.vm.typewriter.text).toBe('');

  vi.advanceTimersByTime(50);
  expect(wrapper.vm.typewriter.text).toBe('b');

  vi.advanceTimersByTime(2000);
  expect(wrapper.vm.typewriter.text).toBe('');

  vi.advanceTimersByTime(50);
  expect(wrapper.vm.typewriter.text).toBe('c');

  wrapper.unmount();
});
