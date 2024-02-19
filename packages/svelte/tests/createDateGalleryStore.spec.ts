import { licenseChecker, DateGallery } from '@uiloos/core';
import { createDateGalleryStore } from '../src/lib/DateGallery/createDateGalleryStore.js';
import { expect, test } from 'vitest';

test('createDateGalleryStore', () => {
  licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

  const dateGalleryReadable = createDateGalleryStore({
    mode: 'day',
    initialDate: '1999-12-31 00:00',
  });

  let dateGallery = null as unknown as DateGallery<unknown>;
  const unsubscribe = dateGalleryReadable.subscribe((dg) => {
    dateGallery = dg;
  });

  expect(dateGallery instanceof DateGallery).toBe(true);
  expect(unsubscribe instanceof Function).toBe(true);

  expect(dateGallery.firstFrame.anchorDate.getDate()).toBe(31);
  expect(dateGallery.firstFrame.anchorDate.getMonth()).toBe(11);
  expect(dateGallery.firstFrame.anchorDate.getFullYear()).toBe(1999);

  dateGallery.next();

  expect(dateGallery.firstFrame.anchorDate.getDate()).toBe(1);
  expect(dateGallery.firstFrame.anchorDate.getMonth()).toBe(0);
  expect(dateGallery.firstFrame.anchorDate.getFullYear()).toBe(2000);

  unsubscribe();
});
