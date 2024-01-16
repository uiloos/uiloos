import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

import {
  CreateDateGallerySubscriberConfig,
  DateGallery,
  DateGalleryEvent,
  DateGalleryEventInvalidRangeError,
  DateGalleryEventNotFoundError,
  DateGalleryInvalidDateError,
  DateGallerySelectionLimitReachedError,
  createDateGallerySubscriber,
} from '../../src/DateGallery';

import { licenseChecker } from '../../src/license';

import { UnsubscribeFunction } from '../../src/generic/types';
import { _hasOverlap } from '../../src/DateGallery/utils';
import { assertLastSubscriber, assertState, frameToTestFrame } from './utils';

describe('DateGallery', () => {
  let unsubscribe: UnsubscribeFunction | null = null;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2000-01-01 12:00:00+00:00'));

    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    if (unsubscribe) {
      unsubscribe();
    }
  });

  afterEach(() => {
    jest.useRealTimers();

    if (unsubscribe) {
      unsubscribe();
    }
  });

  test('sanity check: timezone of the tests should be samoa', () => {
    expect(new Date().getTimezoneOffset()).toBe(660);
  });

  function autoSubscribe(dateGallery: DateGallery<string>) {
    const subscriber = jest.fn();
    unsubscribe = dateGallery.subscribe(subscriber);

    return subscriber;
  }

  describe('selectDate', () => {
    test('should select the given date when date is a string', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.selectDate('1990-09-24 00:00');

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: ['ma 24-09-1990 00:00'],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_SELECTED',
          date: new Date('1990-09-24 00:00'),
          deselectedDate: null,
          time: new Date(),
        }
      );
    });

    test('should select the given date when date is a Date', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.selectDate(new Date('1990-09-24 00:00'));

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: ['ma 24-09-1990 00:00'],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_SELECTED',
          date: new Date('1990-09-24 00:00'),
          deselectedDate: null,
          time: new Date(),
        }
      );
    });

    test('select should work when isUTC is true', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        isUTC: true,
        mode: 'week',
        initialDate: '1990-09-26',
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.selectDate(new Date('1990-09-24'));

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: true,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 01:00',
              dates: [
                {
                  date: 'zo 23-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 01:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: ['ma 24-09-1990 01:00'],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_SELECTED',
          date: new Date('1990-09-24'),
          deselectedDate: null,
          time: new Date(),
        }
      );
    });

    test('should select when calling select from a DateGalleryDate', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.firstFrame.dates[1].select();

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: ['ma 24-09-1990 00:00'],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_SELECTED',
          date: new Date('1990-09-24 00:00'),
          deselectedDate: null,
          time: new Date(),
        }
      );
    });

    test('should do nothing if date is already selected', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: ['1990-09-24'],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.selectDate(new Date('1990-09-24'));
      dateGallery.selectDate('1990-09-24');

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('should error when given a malformed date', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: ['1990-09-24'],
      });

      const subscriber = autoSubscribe(dateGallery);

      expect(() => {
        dateGallery.selectDate('1990-125-24');
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.selectDate('1990-125-24');
      }).toThrowError(
        'uiloos > DateGallery > selectDate > "date" is an or contains an invalid date'
      );

      expect(() => {
        dateGallery.selectDate(new Date('1990-125-24'));
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.selectDate(new Date('1990-125-24'));
      }).toThrowError(
        'uiloos > DateGallery > selectDate > "date" is an or contains an invalid date'
      );

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    describe('maxSelectionLimit', () => {
      describe('when maxSelectionLimit is 1', () => {
        test("when behavior is 'circular' once the limit is reached, the first one in is the first one out", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 1,
            maxSelectionLimitBehavior: 'circular',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.selectDate(new Date('1990-09-27 00:00'));

          // Now select this date, due to circular it should now be selected
          dateGallery.selectDate(new Date('1990-09-23 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['zo 23-09-1990 00:00'],
              maxSelectionLimit: 1,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-23 00:00'),
              deselectedDate: new Date('1990-09-27 00:00'),
              time: new Date(),
            }
          );
        });

        test("when behavior is 'ignore' once the limit is reached dates should no longer be added, but no errors are thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 1,
            maxSelectionLimitBehavior: 'ignore',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.selectDate(new Date('1990-09-23 00:00'));

          // Now select this date, due to 'ignore' it should not be selected
          dateGallery.selectDate(new Date('1990-09-27 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['zo 23-09-1990 00:00'],
              maxSelectionLimit: 1,
              maxSelectionLimitBehavior: 'ignore',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-23 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Should still be the same
          expect(dateGallery.selectedDates).toEqual([
            new Date('1990-09-23 00:00'),
          ]);
        });

        test("when behavior is 'error' once the limit is reached and error should be thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 1,
            maxSelectionLimitBehavior: 'error',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.selectDate(new Date('1990-09-23 00:00'));

          // Now select this date, due to 'error' it should throw
          expect(() => {
            dateGallery.selectDate(new Date('1990-09-27 00:00'));
          }).toThrowError(DateGallerySelectionLimitReachedError);

          // Now select this date, due to 'error' it should throw
          expect(() => {
            dateGallery.selectDate(new Date('1990-09-27 00:00'));
          }).toThrowError(
            'uiloos > DateGallery > selectDate > selection limit reached'
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          // Should still be the same
          expect(dateGallery.selectedDates).toEqual([
            new Date('1990-09-23 00:00'),
          ]);
        });
      });

      describe('when maxSelectionLimit is N', () => {
        test("when behavior is 'circular' once the limit is reached, the first one in is the first one out", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 2,
            maxSelectionLimitBehavior: 'circular',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.selectDate(new Date('1990-09-27 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-27 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now select this date it should also get selected
          dateGallery.selectDate(new Date('1990-09-25 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00', 'di 25-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-25 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now cross the limit, the first should be the first out
          dateGallery.selectDate(new Date('1990-09-23 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['di 25-09-1990 00:00', 'zo 23-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-23 00:00'),
              deselectedDate: new Date('1990-09-27 00:00'),
              time: new Date(),
            }
          );
        });

        test("when behavior is 'ignore' once the limit is reached dates should no longer be added, but no errors are thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 2,
            maxSelectionLimitBehavior: 'ignore',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.selectDate(new Date('1990-09-27 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'ignore',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-27 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now select this date it should also get selected
          dateGallery.selectDate(new Date('1990-09-25 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00', 'di 25-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'ignore',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-25 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now cross the limit nothing should happen due to the ignore
          dateGallery.selectDate(new Date('1990-09-23 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(2);

           // Should still be the same
           expect(dateGallery.selectedDates).toEqual([
            new Date('1990-09-27 00:00'),
            new Date('1990-09-25 00:00')
          ]);
        });

        test("when behavior is 'error' once the limit is reached and error should be thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 2,
            maxSelectionLimitBehavior: 'error',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.selectDate(new Date('1990-09-27 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'error',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-27 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now select this date it should also get selected
          dateGallery.selectDate(new Date('1990-09-25 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00', 'di 25-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'error',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-25 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now cross the limit an error should be thrown
          expect(() => {
            dateGallery.selectDate(new Date('1990-09-23 00:00'));
          }).toThrowError(
            'uiloos > DateGallery > selectDate > selection limit reached'
          );

          expect(() => {
            dateGallery.selectDate(new Date('1990-09-23 00:00'));
          }).toThrowError(DateGallerySelectionLimitReachedError);

          expect(subscriber).toHaveBeenCalledTimes(2);

          // Should still be the same
          expect(dateGallery.selectedDates).toEqual([
            new Date('1990-09-27 00:00'),
            new Date('1990-09-25 00:00'),
          ]);
        });
      });
    });
  });

  describe('deselectDate', () => {
    test('should deselect the given date when date is a string', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: ['1990-09-24'],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.deselectDate('1990-09-24');

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED',
          date: new Date('1990-09-24'),
          time: new Date(),
        }
      );
    });

    test('should deselect the given date when date is a Date', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: [new Date('1990-09-24')],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.deselectDate(new Date('1990-09-24'));

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED',
          date: new Date('1990-09-24'),
          time: new Date(),
        }
      );
    });

    test('deselect should work when isUTC is true', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        isUTC: true,
        mode: 'week',
        initialDate: '1990-09-26',
        selectedDates: [new Date('1990-09-24')],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.deselectDate(new Date('1990-09-24'));

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: true,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 01:00',
              dates: [
                {
                  date: 'zo 23-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED',
          date: new Date('1990-09-24'),
          time: new Date(),
        }
      );
    });

    test('should deselect when calling deselect from a DateGalleryDate', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: [new Date('1990-09-24 00:00')],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.firstFrame.dates[1].deselect();

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED',
          date: new Date('1990-09-24 00:00'),
          time: new Date(),
        }
      );
    });

    test('should do nothing if date is already deselected', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.deselectDate(new Date('1990-09-24'));
      dateGallery.deselectDate('1990-09-24');

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('should keep other dates selected', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: [
          new Date('1990-09-24 00:00'),
          new Date('1990-09-25 00:00'),
          new Date('1990-09-23 00:00'),
        ],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.deselectDate(new Date('1990-09-24 00:00'));

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: ['di 25-09-1990 00:00', 'zo 23-09-1990 00:00'],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED',
          date: new Date('1990-09-24 00:00'),
          time: new Date(),
        }
      );
    });

    test('should error when given a malformed date', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: ['1990-09-24'],
      });

      const subscriber = autoSubscribe(dateGallery);

      expect(() => {
        dateGallery.deselectDate('1990-125-24');
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.deselectDate('1990-125-24');
      }).toThrowError(
        'uiloos > DateGallery > deselectDate > "date" is an or contains an invalid date'
      );

      expect(() => {
        dateGallery.deselectDate(new Date('1990-125-24'));
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.deselectDate(new Date('1990-125-24'));
      }).toThrowError(
        'uiloos > DateGallery > deselectDate > "date" is an or contains an invalid date'
      );

      expect(subscriber).toHaveBeenCalledTimes(0);
    });
  });

  describe('toggleDateSelection', () => {
    test('should select the given date when date is a string, when date is not selected', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.toggleDateSelection('1990-09-24 00:00');

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: ['ma 24-09-1990 00:00'],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_SELECTED',
          date: new Date('1990-09-24 00:00'),
          deselectedDate: null,
          time: new Date(),
        }
      );
    });

    test('should select the given date when date is a Date, when date is not selected', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.toggleDateSelection(new Date('1990-09-24 00:00'));

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: ['ma 24-09-1990 00:00'],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_SELECTED',
          date: new Date('1990-09-24 00:00'),
          deselectedDate: null,
          time: new Date(),
        }
      );
    });

    test('should select when calling toggle from a DateGalleryDate, when date is not selected', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.firstFrame.dates[1].toggle();

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: ['ma 24-09-1990 00:00'],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_SELECTED',
          date: new Date('1990-09-24 00:00'),
          deselectedDate: null,
          time: new Date(),
        }
      );
    });

    test('should deselect the given date when date is a string, when date is selected', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: ['1990-09-24'],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.toggleDateSelection('1990-09-24');

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED',
          date: new Date('1990-09-24'),
          time: new Date(),
        }
      );
    });

    test('toggle should work when isUTC is true, for when toggle selects', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        isUTC: true,
        mode: 'week',
        initialDate: '1990-09-26',
        selectedDates: [new Date('1990-09-24')],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.toggleDateSelection(new Date('1990-09-24'));

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: true,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 01:00',
              dates: [
                {
                  date: 'zo 23-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED',
          date: new Date('1990-09-24'),
          time: new Date(),
        }
      );
    });

    test('toggle should work when isUTC is true, for when toggle deselects', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        isUTC: true,
        mode: 'week',
        initialDate: '1990-09-26',
        selectedDates: ['1990-09-24'],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.toggleDateSelection('1990-09-24');

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: true,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 01:00',
              dates: [
                {
                  date: 'zo 23-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED',
          date: new Date('1990-09-24'),
          time: new Date(),
        }
      );
    });

    test('should deselect the given date when date is a Date, when date is selected', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: [new Date('1990-09-24')],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.toggleDateSelection(new Date('1990-09-24'));

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED',
          date: new Date('1990-09-24'),
          time: new Date(),
        }
      );
    });

    test('should deselect when calling toggle from a DateGalleryDate, when date is selected', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: [new Date('1990-09-24 00:00')],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.firstFrame.dates[1].toggle();

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED',
          date: new Date('1990-09-24 00:00'),
          time: new Date(),
        }
      );
    });

    test('should error when given a malformed date', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: ['1990-09-24'],
      });

      const subscriber = autoSubscribe(dateGallery);

      expect(() => {
        dateGallery.toggleDateSelection('1990-125-24');
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.toggleDateSelection('1990-125-24');
      }).toThrowError(
        'uiloos > DateGallery > toggleDateSelection > "date" is an or contains an invalid date'
      );

      expect(() => {
        dateGallery.toggleDateSelection(new Date('1990-125-24'));
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.toggleDateSelection(new Date('1990-125-24'));
      }).toThrowError(
        'uiloos > DateGallery > toggleDateSelection > "date" is an or contains an invalid date'
      );

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    describe('maxSelectionLimit', () => {
      describe('when maxSelectionLimit is 1', () => {
        test("when behavior is 'circular' once the limit is reached, the first one in is the first one out", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 1,
            maxSelectionLimitBehavior: 'circular',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.toggleDateSelection(new Date('1990-09-27 00:00'));

          // Now select this date, due to circular it should now be selected
          dateGallery.toggleDateSelection(new Date('1990-09-23 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['zo 23-09-1990 00:00'],
              maxSelectionLimit: 1,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-23 00:00'),
              deselectedDate: new Date('1990-09-27 00:00'),
              time: new Date(),
            }
          );
        });

        test("when behavior is 'ignore' once the limit is reached dates should no longer be added, but no errors are thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 1,
            maxSelectionLimitBehavior: 'ignore',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.toggleDateSelection(new Date('1990-09-23 00:00'));

          // Now select this date, due to 'ignore' it should not be selected
          dateGallery.toggleDateSelection(new Date('1990-09-27 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['zo 23-09-1990 00:00'],
              maxSelectionLimit: 1,
              maxSelectionLimitBehavior: 'ignore',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-23 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

           // Should still be the same
           expect(dateGallery.selectedDates).toEqual([
            new Date('1990-09-23 00:00')
          ]);
        });

        test("when behavior is 'error' once the limit is reached and error should be thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 1,
            maxSelectionLimitBehavior: 'error',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.toggleDateSelection(new Date('1990-09-23 00:00'));

          // Now select this date, due to 'error' it should throw
          expect(() => {
            dateGallery.toggleDateSelection(new Date('1990-09-27 00:00'));
          }).toThrowError(DateGallerySelectionLimitReachedError);

          // Now select this date, due to 'error' it should throw
          expect(() => {
            dateGallery.toggleDateSelection(new Date('1990-09-27 00:00'));
          }).toThrowError(
            'uiloos > DateGallery > toggleDateSelection > selection limit reached'
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          // Should still be the same
          expect(dateGallery.selectedDates).toEqual([
            new Date('1990-09-23 00:00')
          ]);
        });
      });

      describe('when maxSelectionLimit is N', () => {
        test("when behavior is 'circular' once the limit is reached, the first one in is the first one out", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 2,
            maxSelectionLimitBehavior: 'circular',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.toggleDateSelection(new Date('1990-09-27 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-27 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now select this date it should also get selected
          dateGallery.toggleDateSelection(new Date('1990-09-25 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00', 'di 25-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-25 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now cross the limit, the first should be the first out
          dateGallery.toggleDateSelection(new Date('1990-09-23 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['di 25-09-1990 00:00', 'zo 23-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-23 00:00'),
              deselectedDate: new Date('1990-09-27 00:00'),
              time: new Date(),
            }
          );
        });

        test("when behavior is 'ignore' once the limit is reached dates should no longer be added, but no errors are thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 2,
            maxSelectionLimitBehavior: 'ignore',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.toggleDateSelection(new Date('1990-09-27 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'ignore',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-27 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now select this date it should also get selected
          dateGallery.toggleDateSelection(new Date('1990-09-25 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00', 'di 25-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'ignore',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-25 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now cross the limit nothing should happen due to the ignore
          dateGallery.selectDate(new Date('1990-09-23 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(2);

          // Should still be the same
          expect(dateGallery.selectedDates).toEqual([
            new Date('1990-09-27 00:00'),
            new Date('1990-09-25 00:00')
          ]);
        });

        test("when behavior is 'error' once the limit is reached and error should be thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 2,
            maxSelectionLimitBehavior: 'error',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First select this date
          dateGallery.toggleDateSelection(new Date('1990-09-27 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'error',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-27 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now select this date it should also get selected
          dateGallery.toggleDateSelection(new Date('1990-09-25 00:00'));

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00', 'di 25-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'error',
            },
            {
              type: 'DATE_SELECTED',
              date: new Date('1990-09-25 00:00'),
              deselectedDate: null,
              time: new Date(),
            }
          );

          // Now cross the limit an error should be thrown
          expect(() => {
            dateGallery.toggleDateSelection(new Date('1990-09-23 00:00'));
          }).toThrowError(
            'uiloos > DateGallery > toggleDateSelection > selection limit reached'
          );

          expect(() => {
            dateGallery.toggleDateSelection(new Date('1990-09-23 00:00'));
          }).toThrowError(DateGallerySelectionLimitReachedError);

          expect(subscriber).toHaveBeenCalledTimes(2);

          // Should still be the same
          expect(dateGallery.selectedDates).toEqual([
            new Date('1990-09-27 00:00'),
            new Date('1990-09-25 00:00')
          ]);
        });
      });
    });
  });

  describe('deselectAll', () => {
    test('should deselect all dates', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: [
          new Date('1990-09-24 00:00'),
          new Date('2050-09-25 00:00'),
          new Date('1990-09-23 00:00'),
          new Date('2001-09-23 00:00'),
        ],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.deselectAll();

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED_MULTIPLE',
          dates: [
            new Date('1990-09-24 00:00'),
            new Date('2050-09-25 00:00'),
            new Date('1990-09-23 00:00'),
            new Date('2001-09-23 00:00'),
          ],
          time: new Date(),
        }
      );
    });

    test('deselectAll should work when isUTC is true', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        isUTC: true,
        mode: 'week',
        initialDate: '1990-09-26',
        selectedDates: [
          new Date('1990-09-24'),
          new Date('2050-09-25'),
          new Date('1990-09-23'),
          new Date('2001-09-23'),
        ],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.deselectAll();

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: true,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 01:00',
              dates: [
                {
                  date: 'zo 23-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED_MULTIPLE',
          dates: [
            new Date('1990-09-24'),
            new Date('2050-09-25'),
            new Date('1990-09-23'),
            new Date('2001-09-23'),
          ],
          time: new Date(),
        }
      );
    });

    test('should work when there is only one date to deselect', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: [new Date('1990-09-24 00:00')],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.deselectAll();

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_DESELECTED_MULTIPLE',
          dates: [new Date('1990-09-24 00:00')],
          time: new Date(),
        }
      );
    });

    test('should do nothing when there are no dates selected', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: [],
      });

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.deselectAll();

      expect(subscriber).toHaveBeenCalledTimes(0);
    });
  });

  describe('selectRange', () => {
    test('should error when given a malformed date', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: ['1990-09-24'],
      });

      const subscriber = autoSubscribe(dateGallery);

      // For a
      expect(() => {
        dateGallery.selectRange('1990-125-24', '2000-01-01');
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.selectRange('1990-125-24', '2000-01-01');
      }).toThrowError(
        'uiloos > DateGallery > selectRange > "a" is an or contains an invalid date'
      );

      expect(() => {
        dateGallery.selectRange(new Date('1990-125-24'), '2000-01-01');
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.selectRange(new Date('1990-125-24'), '2000-01-01');
      }).toThrowError(
        'uiloos > DateGallery > selectRange > "a" is an or contains an invalid date'
      );

      // For b
      expect(() => {
        dateGallery.selectRange('2000-01-01', '1990-125-24');
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.selectRange('2000-01-01', '1990-125-24');
      }).toThrowError(
        'uiloos > DateGallery > selectRange > "b" is an or contains an invalid date'
      );

      expect(() => {
        dateGallery.selectRange('2000-01-01', new Date('1990-125-24'));
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.selectRange('2000-01-01', new Date('1990-125-24'));
      }).toThrowError(
        'uiloos > DateGallery > selectRange > "b" is an or contains an invalid date'
      );

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('should just select the day if the same day is provided for a and b', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: [],
      });

      const subscriber = autoSubscribe(dateGallery);

      // Should just select the 25th
      dateGallery.selectRange('1990-09-25 00:00', '1990-09-25 00:00');

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: ['di 25-09-1990 00:00'],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_SELECTED_MULTIPLE',
          dates: [new Date('1990-09-25 00:00')],
          deselectedDates: [],
          time: new Date(),
        }
      );
    });

    test('should activate the range of dates, but not dates that are already active', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: [new Date('1990-09-23 00:00'), '1990-09-26 00:00'],
      });

      const subscriber = autoSubscribe(dateGallery);

      // All dates in the range should be activated, except for
      // the 26th since it is already active.
      dateGallery.selectRange('1990-09-25 00:00', '1990-09-28 00:00');

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [
            'zo 23-09-1990 00:00',
            'wo 26-09-1990 00:00',
            'di 25-09-1990 00:00',
            'do 27-09-1990 00:00',
            'vr 28-09-1990 00:00',
          ],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_SELECTED_MULTIPLE',
          dates: [
            new Date('1990-09-25 00:00'),
            new Date('1990-09-27 00:00'),
            new Date('1990-09-28 00:00'),
          ],
          deselectedDates: [],
          time: new Date(),
        }
      );
    });

    test('selectRange should work when isUTC is true', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        isUTC: true,
        mode: 'week',
        initialDate: '1990-09-26',
        selectedDates: [new Date('1990-09-23'), '1990-09-26'],
      });

      const subscriber = autoSubscribe(dateGallery);

      // All dates in the range should be activated, except for
      // the 26th since it is already active.
      dateGallery.selectRange('1990-09-25', '1990-09-28');

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: true,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 01:00',
              dates: [
                {
                  date: 'zo 23-09-1990 01:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 01:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 01:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 01:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 01:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 01:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [
            'zo 23-09-1990 01:00',
            'wo 26-09-1990 01:00',
            'di 25-09-1990 01:00',
            'do 27-09-1990 01:00',
            'vr 28-09-1990 01:00',
          ],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_SELECTED_MULTIPLE',
          dates: [
            new Date('1990-09-25'),
            new Date('1990-09-27'),
            new Date('1990-09-28'),
          ],
          deselectedDates: [],
          time: new Date(),
        }
      );
    });

    test('the order of a and b should not matter', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: [new Date('1990-09-23 00:00'), '1990-09-26 00:00'],
      });

      const subscriber = autoSubscribe(dateGallery);

      // All dates in the range should be activated, except for
      // the 26th since it is already active.
      dateGallery.selectRange('1990-09-28 00:00', '1990-09-25 00:00');

      expect(subscriber).toHaveBeenCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'week',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'zo 23-09-1990 00:00',
              dates: [
                {
                  date: 'zo 23-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'ma 24-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'di 25-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'wo 26-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'do 27-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'vr 28-09-1990 00:00',
                  isPadding: false,
                  isSelected: true,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
                {
                  date: 'za 29-09-1990 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: false,
                  events: [],
                  hasEvents: false,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [],
            },
          ],
          events: [],
          selectedDates: [
            'zo 23-09-1990 00:00',
            'wo 26-09-1990 00:00',
            'di 25-09-1990 00:00',
            'do 27-09-1990 00:00',
            'vr 28-09-1990 00:00',
          ],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'DATE_SELECTED_MULTIPLE',
          dates: [
            new Date('1990-09-25 00:00'),
            new Date('1990-09-27 00:00'),
            new Date('1990-09-28 00:00'),
          ],
          deselectedDates: [],
          time: new Date(),
        }
      );
    });

    test('should not do anything if the range is already active', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
        selectedDates: ['1990-09-25 00:00', '1990-09-26 00:00'],
      });

      const subscriber = autoSubscribe(dateGallery);

      // All dates in the range should be activated, except for
      // the 26th since it is already active.
      dateGallery.selectRange('1990-09-25 00:00', '1990-09-26 00:00');

      expect(subscriber).toHaveBeenCalledTimes(0);
      assertState(dateGallery, {
        history: [],
        isUTC: false,
        numberOfFrames: 1,
        mode: 'week',
        firstDayOfWeek: 0,
        firstFrame: frameToTestFrame(dateGallery.frames[0]),
        frames: [
          {
            anchorDate: 'zo 23-09-1990 00:00',
            dates: [
              {
                date: 'zo 23-09-1990 00:00',
                isPadding: false,
                isSelected: false,
                isToday: false,
                events: [],
                hasEvents: false,
                hasEventsWithOverlap: false,
              },
              {
                date: 'ma 24-09-1990 00:00',
                isPadding: false,
                isSelected: false,
                isToday: false,
                events: [],
                hasEvents: false,
                hasEventsWithOverlap: false,
              },
              {
                date: 'di 25-09-1990 00:00',
                isPadding: false,
                isSelected: true,
                isToday: false,
                events: [],
                hasEvents: false,
                hasEventsWithOverlap: false,
              },
              {
                date: 'wo 26-09-1990 00:00',
                isPadding: false,
                isSelected: true,
                isToday: false,
                events: [],
                hasEvents: false,
                hasEventsWithOverlap: false,
              },
              {
                date: 'do 27-09-1990 00:00',
                isPadding: false,
                isSelected: false,
                isToday: false,
                events: [],
                hasEvents: false,
                hasEventsWithOverlap: false,
              },
              {
                date: 'vr 28-09-1990 00:00',
                isPadding: false,
                isSelected: false,
                isToday: false,
                events: [],
                hasEvents: false,
                hasEventsWithOverlap: false,
              },
              {
                date: 'za 29-09-1990 00:00',
                isPadding: false,
                isSelected: false,
                isToday: false,
                events: [],
                hasEvents: false,
                hasEventsWithOverlap: false,
              },
            ],
            events: [],
          },
        ],
        events: [],
        selectedDates: ['di 25-09-1990 00:00', 'wo 26-09-1990 00:00'],
        maxSelectionLimit: false,
        maxSelectionLimitBehavior: 'circular',
      });
    });

    describe('maxSelectionLimit', () => {
      describe('when maxSelectionLimit is 1', () => {
        test("when behavior is 'circular' once the limit is reached, the first one in is the first one out", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 1,
            maxSelectionLimitBehavior: 'circular',
          });

          const subscriber = autoSubscribe(dateGallery);

          // Only the 27 should remain in the end, but no dates
          // should be deselected as they were selected inside
          // of this call, but this was never observed by the
          // outside.
          dateGallery.selectRange(
            new Date('1990-09-23 00:00'),
            new Date('1990-09-27 00:00')
          );

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00'],
              maxSelectionLimit: 1,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED_MULTIPLE',
              dates: [new Date('1990-09-27 00:00')],
              deselectedDates: [], // No dates should be deselected!
              time: new Date(),
            }
          );

          dateGallery.selectRange(
            new Date('1990-09-27 00:00'),
            new Date('1990-09-29 00:00')
          );

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['za 29-09-1990 00:00'],
              maxSelectionLimit: 1,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED_MULTIPLE',
              dates: [new Date('1990-09-29 00:00')],
              deselectedDates: [new Date('1990-09-27 00:00')],
              time: new Date(),
            }
          );
        });

        test("when behavior is 'ignore' once the limit is reached dates should no longer be added, but no errors are thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 1,
            maxSelectionLimitBehavior: 'ignore',
          });

          const subscriber = autoSubscribe(dateGallery);

          // Only the 23 should remain in the end, but no dates
          // should be deselected as they were selected inside
          // of this call, but this was never observed by the
          // outside.
          dateGallery.selectRange(
            new Date('1990-09-23 00:00'),
            new Date('1990-09-27 00:00')
          );

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['zo 23-09-1990 00:00'],
              maxSelectionLimit: 1,
              maxSelectionLimitBehavior: 'ignore',
            },
            {
              type: 'DATE_SELECTED_MULTIPLE',
              dates: [new Date('1990-09-23 00:00')],
              deselectedDates: [], // No dates should be deselected!
              time: new Date(),
            }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

           // Nothing should happen due to the ignore
           dateGallery.selectRange(
            new Date('1990-09-27 00:00'),
            new Date('1990-09-29 00:00')
          );
        });

        test("when behavior is 'error' once the limit is reached and error should be thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 1,
            maxSelectionLimitBehavior: 'error',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First prove that a selection can be made, even through
          // it is a non selection.
          dateGallery.selectRange(
            new Date('1990-09-27 00:00'),
            new Date('1990-09-27 00:00')
          );

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00'],
              maxSelectionLimit: 1,
              maxSelectionLimitBehavior: 'error',
            },
            {
              type: 'DATE_SELECTED_MULTIPLE',
              dates: [new Date('1990-09-27 00:00')],
              deselectedDates: [], // No dates should be deselected!
              time: new Date(),
            }
          );

          // Now select this date, due to 'error' it should throw
          expect(() => {
            dateGallery.selectRange(
              new Date('1990-09-23 00:00'),
              new Date('1990-09-28 00:00')
            );
          }).toThrowError(DateGallerySelectionLimitReachedError);

          // Now select this date, due to 'error' it should throw
          expect(() => {
            dateGallery.selectRange(
              new Date('1990-09-23 00:00'),
              new Date('1990-09-28 00:00')
            );
          }).toThrowError(
            'uiloos > DateGallery > selectRange > selection limit reached'
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          // Still only the 27th should be selected
          expect(dateGallery.selectedDates).toEqual([
            new Date('1990-09-27 00:00'),
          ]);
        });

        test("when behavior is 'error' once the limit is reached and error should be thrown, but can also inform and throw in one go", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 1,
            maxSelectionLimitBehavior: 'error',
          });

          const subscriber = autoSubscribe(dateGallery);

          // Should select the 27th and also throw an error when 28 is selected.
          expect(() => {
            dateGallery.selectRange(
              new Date('1990-09-27 00:00'),
              new Date('1990-09-28 00:00')
            );
          }).toThrowError(DateGallerySelectionLimitReachedError);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00'],
              maxSelectionLimit: 1,
              maxSelectionLimitBehavior: 'error',
            },
            {
              type: 'DATE_SELECTED_MULTIPLE',
              dates: [new Date('1990-09-27 00:00')],
              deselectedDates: [], // No dates should be deselected!
              time: new Date(),
            }
          );
        });
      });

      describe('when maxSelectionLimit is N', () => {
        test("when behavior is 'circular' once the limit is reached, the first one in is the first one out", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 3,
            maxSelectionLimitBehavior: 'circular',
          });

          const subscriber = autoSubscribe(dateGallery);

          // Only the 25, 26, 27 should remain in the end, but no dates
          // should be deselected as they were selected inside
          // of this call, but this was never observed by the
          // outside.
          dateGallery.selectRange(
            new Date('1990-09-23 00:00'),
            new Date('1990-09-27 00:00')
          );

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: [
                'di 25-09-1990 00:00',
                'wo 26-09-1990 00:00',
                'do 27-09-1990 00:00',
              ],
              maxSelectionLimit: 3,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED_MULTIPLE',
              dates: [
                new Date('1990-09-25 00:00'),
                new Date('1990-09-26 00:00'),
                new Date('1990-09-27 00:00'),
              ],
              deselectedDates: [], // No dates should be deselected!
              time: new Date(),
            }
          );

          // Only the 24, 25, 26 should remain in the end, and
          // the 27 should be deselected.
          dateGallery.selectRange(
            new Date('1990-09-20 00:00'),
            new Date('1990-09-26 00:00')
          );

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: [
                'ma 24-09-1990 00:00',
                'di 25-09-1990 00:00',
                'wo 26-09-1990 00:00',
              ],
              maxSelectionLimit: 3,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'DATE_SELECTED_MULTIPLE',
              dates: [
                new Date('1990-09-24 00:00'),
                new Date('1990-09-25 00:00'),
                new Date('1990-09-26 00:00'),
              ],
              deselectedDates: [new Date('1990-09-27 00:00')],
              time: new Date(),
            }
          );
        });

        test("when behavior is 'ignore' once the limit is reached dates should no longer be added, but no errors are thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 3,
            maxSelectionLimitBehavior: 'ignore',
          });

          const subscriber = autoSubscribe(dateGallery);

          // Only the 23, 24, 25 should remain in the end, but no dates
          // should be deselected as they were selected inside
          // of this call, but this was never observed by the
          // outside.
          dateGallery.selectRange(
            new Date('1990-09-23 00:00'),
            new Date('1990-09-27 00:00')
          );

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: [
                'zo 23-09-1990 00:00',
                'ma 24-09-1990 00:00',
                'di 25-09-1990 00:00',
              ],
              maxSelectionLimit: 3,
              maxSelectionLimitBehavior: 'ignore',
            },
            {
              type: 'DATE_SELECTED_MULTIPLE',
              dates: [
                new Date('1990-09-23 00:00'),
                new Date('1990-09-24 00:00'),
                new Date('1990-09-25 00:00'),
              ],
              deselectedDates: [], // No dates should be deselected!
              time: new Date(),
            }
          );

          // This call should be ignored.
          dateGallery.selectRange(
            new Date('1990-09-10 00:00'),
            new Date('1990-09-16 00:00')
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

           // Should have remained the same.
           expect(dateGallery.selectedDates).toEqual([
            new Date('1990-09-23 00:00'),
            new Date('1990-09-24 00:00'),
            new Date('1990-09-25 00:00'),
          ]);
        });

        test("when behavior is 'error' once the limit is reached and error should be thrown", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 3,
            maxSelectionLimitBehavior: 'error',
          });

          const subscriber = autoSubscribe(dateGallery);

          // First prove that a selection can be made.
          dateGallery.selectRange(
            new Date('1990-09-25 00:00'),
            new Date('1990-09-27 00:00')
          );

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: [
                'di 25-09-1990 00:00',
                'wo 26-09-1990 00:00',
                'do 27-09-1990 00:00',
              ],
              maxSelectionLimit: 3,
              maxSelectionLimitBehavior: 'error',
            },
            {
              type: 'DATE_SELECTED_MULTIPLE',
              dates: [
                new Date('1990-09-25 00:00'),
                new Date('1990-09-26 00:00'),
                new Date('1990-09-27 00:00'),
              ],
              deselectedDates: [], // No dates should be deselected!
              time: new Date(),
            }
          );

          // Now select this date, due to 'error' it should throw
          expect(() => {
            dateGallery.selectRange(
              new Date('1990-09-23 00:00'),
              new Date('1990-09-28 00:00')
            );
          }).toThrowError(DateGallerySelectionLimitReachedError);

          // Now select this date, due to 'error' it should throw
          expect(() => {
            dateGallery.selectRange(
              new Date('1990-09-23 00:00'),
              new Date('1990-09-28 00:00')
            );
          }).toThrowError(
            'uiloos > DateGallery > selectRange > selection limit reached'
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          // Still only the original three should be selected
          expect(dateGallery.selectedDates).toEqual([
            new Date('1990-09-25 00:00'),
            new Date('1990-09-26 00:00'),
            new Date('1990-09-27 00:00'),
          ]);

        });

        test("when behavior is 'error' once the limit is reached and error should be thrown, but can also inform and throw in one go", () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            mode: 'week',
            initialDate: '1990-09-26 00:00',
            maxSelectionLimit: 2,
            maxSelectionLimitBehavior: 'error',
          });

          const subscriber = autoSubscribe(dateGallery);

          // Should select the 27th, 28 and also throw an error when 29 is selected.
          expect(() => {
            dateGallery.selectRange(
              new Date('1990-09-27 00:00'),
              new Date('1990-09-29 00:00')
            );
          }).toThrowError(DateGallerySelectionLimitReachedError);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'week',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'zo 23-09-1990 00:00',
                  dates: [
                    {
                      date: 'zo 23-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'ma 24-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'di 25-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'wo 26-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'do 27-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'vr 28-09-1990 00:00',
                      isPadding: false,
                      isSelected: true,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                    {
                      date: 'za 29-09-1990 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: ['do 27-09-1990 00:00', 'vr 28-09-1990 00:00'],
              maxSelectionLimit: 2,
              maxSelectionLimitBehavior: 'error',
            },
            {
              type: 'DATE_SELECTED_MULTIPLE',
              dates: [
                new Date('1990-09-27 00:00'),
                new Date('1990-09-28 00:00'),
              ],
              deselectedDates: [], // No dates should be deselected!
              time: new Date(),
            }
          );
        });
      });
    });
  });

  describe('addEvent', () => {
    test('should error when given a malformed start date', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      expect(() => {
        dateGallery.addEvent({
          data: 'event',
          startDate: '2000-2000-2000',
          endDate: '2000-02-02',
        });
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.addEvent({
          data: 'event',
          startDate: '2000-2000-2000',
          endDate: '2000-02-02',
        });
      }).toThrowError(
        'uiloos > DateGallery > addEvent > "event.startDate" is an or contains an invalid date'
      );

      expect(() => {
        dateGallery.addEvent({
          data: 'event',
          startDate: new Date('2000-2000-2000'),
          endDate: '2000-02-02',
        });
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.addEvent({
          data: 'event',
          startDate: new Date('2000-2000-2000'),
          endDate: '2000-02-02',
        });
      }).toThrowError(
        'uiloos > DateGallery > addEvent > "event.startDate" is an or contains an invalid date'
      );

      expect(subscriber).toBeCalledTimes(0);
    });

    test('should error when given a malformed end date', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      expect(() => {
        dateGallery.addEvent({
          data: 'event',
          startDate: '2000-01-01',
          endDate: '2000-32-02',
        });
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.addEvent({
          data: 'event',
          startDate: '2000-01-01',
          endDate: '2000-32-02',
        });
      }).toThrowError(
        'uiloos > DateGallery > addEvent > "event.endDate" is an or contains an invalid date'
      );

      expect(() => {
        dateGallery.addEvent({
          data: 'event',
          startDate: '2000-01-01',
          endDate: new Date('2000-32-02'),
        });
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.addEvent({
          data: 'event',
          startDate: '2000-01-01',
          endDate: new Date('2000-32-02'),
        });
      }).toThrowError(
        'uiloos > DateGallery > addEvent > "event.endDate" is an or contains an invalid date'
      );

      expect(subscriber).toBeCalledTimes(0);
    });

    test('should error when given a invalid range', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      expect(() => {
        dateGallery.addEvent({
          data: 'event',
          startDate: '2000-01-01 15:01',
          endDate: '2000-01-01 15:00',
        });
      }).toThrowError(DateGalleryEventInvalidRangeError);

      expect(() => {
        dateGallery.addEvent({
          data: 'event',
          startDate: '2000-01-01 15:01',
          endDate: '2000-01-01 15:00',
        });
      }).toThrowError(
        'uiloos > DateGallery > invalid range, an events startDate lies after its endDate'
      );

      expect(subscriber).toBeCalledTimes(0);
    });

    describe('when adding an event update the frames, recalculate overlap, and re-order arrays', () => {
      describe('when isUTC is true', () => {
        test('3 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            isUTC: true,
            numberOfFrames: 3,
            mode: 'day',
            initialDate: '1989-03-21',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21T21:00Z',
            endDate: '1989-03-21T21:00Z',
          });

          expect(event1 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(event2 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );
        });

        test('2 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            isUTC: true,
            numberOfFrames: 2,
            mode: 'day',
            initialDate: '1989-03-21',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21T21:00Z',
            endDate: '1989-03-21T21:00Z',
          });

          expect(event1 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(event2 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );
        });

        test('1 frame', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            isUTC: true,
            numberOfFrames: 1,
            mode: 'day',
            initialDate: '1989-03-21',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21T21:00Z',
            endDate: '1989-03-21T21:00Z',
          });

          expect(event1 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(event2 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: false,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );
        });
      });

      describe('when isUTC is false', () => {
        test('3 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            numberOfFrames: 3,
            mode: 'day',
            initialDate: '1989-03-21 00:00',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21 21:00',
            endDate: '1989-03-21 21:00',
          });

          expect(event1 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(event2 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );
        });

        test('2 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            numberOfFrames: 2,
            mode: 'day',
            initialDate: '1989-03-21 00:00',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21 21:00',
            endDate: '1989-03-21 21:00',
          });

          expect(event1 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(event2 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );
        });

        test('1 frame', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            numberOfFrames: 1,
            mode: 'day',
            initialDate: '1989-03-21 00:00',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21 21:00',
            endDate: '1989-03-21 21:00',
          });

          expect(event1 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(event2 instanceof DateGalleryEvent).toBe(true);

          expect(subscriber).toBeCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: ['event1'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: ['event1'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: false,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_ADDED',
              event: dateGallery.events[0],
              time: new Date(),
            }
          );
        });
      });
    });
  });

  describe('removeEvent', () => {
    test('should do nothing when event cannot be found', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      const event = dateGallery.addEvent({
        data: 'event1',
        startDate: '2000-01-01 12:00',
        endDate: '2000-01-01 14:00',
      });

      expect(subscriber).toBeCalledTimes(1);

      // The first removal should do something.
      const eventRemoved = dateGallery.removeEvent(event);
      expect(eventRemoved instanceof DateGalleryEvent).toBe(true);
      expect(eventRemoved === event);
      expect(subscriber).toBeCalledTimes(2);

      // The second removal should do nothing
      const eventThatWasAlreadyRemoved = dateGallery.removeEvent(event);
      expect(eventThatWasAlreadyRemoved instanceof DateGalleryEvent).toBe(true);
      expect(eventRemoved === eventThatWasAlreadyRemoved);
      expect(subscriber).toBeCalledTimes(2);
    });

    describe('when removing an event update the frames, recalculate overlap, and re-order arrays', () => {
      describe('when isUTC is true', () => {
        test('3 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            isUTC: true,
            numberOfFrames: 3,
            mode: 'day',
            initialDate: '1989-03-21',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21T21:00Z',
            endDate: '1989-03-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.removeEvent(event1);

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: true,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event1,
              time: new Date(),
            }
          );

          event2.remove();

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event2,
              time: new Date(),
            }
          );

          event2.remove();
          expect(subscriber).toBeCalledTimes(4);
        });

        test('2 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            isUTC: true,
            numberOfFrames: 2,
            mode: 'day',
            initialDate: '1989-03-21',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21T21:00Z',
            endDate: '1989-03-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.removeEvent(event1);

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: true,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event1,
              time: new Date(),
            }
          );

          event2.remove();

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event2,
              time: new Date(),
            }
          );

          event2.remove();
          expect(subscriber).toBeCalledTimes(4);
        });

        test('1 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            isUTC: true,
            numberOfFrames: 1,
            mode: 'day',
            initialDate: '1989-03-21',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21T21:00Z',
            endDate: '1989-03-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.removeEvent(event1);

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 22:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 22:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: true,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event1,
              time: new Date(),
            }
          );

          event2.remove();

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event2,
              time: new Date(),
            }
          );

          event2.remove();
          expect(subscriber).toBeCalledTimes(4);
        });
      });

      describe('when isUTC is false', () => {
        test('3 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            numberOfFrames: 3,
            mode: 'day',
            initialDate: '1989-03-21 00:00',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21 21:00',
            endDate: '1989-03-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.removeEvent(event1);

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: true,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event1,
              time: new Date(),
            }
          );

          event2.remove();

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event2,
              time: new Date(),
            }
          );

          event2.remove();
          expect(subscriber).toBeCalledTimes(4);
        });

        test('2 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            numberOfFrames: 2,
            mode: 'day',
            initialDate: '1989-03-21 00:00',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21 21:00',
            endDate: '1989-03-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.removeEvent(event1);

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: true,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event1,
              time: new Date(),
            }
          );

          event2.remove();

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event2,
              time: new Date(),
            }
          );

          event2.remove();
          expect(subscriber).toBeCalledTimes(4);
        });

        test('1 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            numberOfFrames: 1,
            mode: 'day',
            initialDate: '1989-03-21 00:00',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21 21:00',
            endDate: '1989-03-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.removeEvent(event1);

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event2',
                          startDate: 'di 21-03-1989 20:00',
                          endDate: 'zo 21-05-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event2',
                      startDate: 'di 21-03-1989 20:00',
                      endDate: 'zo 21-05-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event2',
                  startDate: 'di 21-03-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: true,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event1,
              time: new Date(),
            }
          );

          event2.remove();

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_REMOVED',
              event: event2,
              time: new Date(),
            }
          );

          event2.remove();
          expect(subscriber).toBeCalledTimes(4);
        });
      });
    });
  });

  describe('moveEvent', () => {
    test('should error when given a malformed start date', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const event = dateGallery.addEvent({
        data: 'event',
        startDate: '1989-03-21 21:00',
        endDate: '1989-03-21 21:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: '2000-2000-2000',
          endDate: '2000-02-02',
        });
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: '2000-2000-2000',
          endDate: '2000-02-02',
        });
      }).toThrowError(
        'uiloos > DateGallery > moveEvent > "range.startDate" is an or contains an invalid date'
      );

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: new Date('2000-2000-2000'),
          endDate: '2000-02-02',
        });
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: new Date('2000-2000-2000'),
          endDate: '2000-02-02',
        });
      }).toThrowError(
        'uiloos > DateGallery > moveEvent > "range.startDate" is an or contains an invalid date'
      );

      expect(subscriber).toBeCalledTimes(0);
    });

    test('should error when given a malformed end date', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const event = dateGallery.addEvent({
        data: 'event',
        startDate: '1989-03-21 21:00',
        endDate: '1989-03-21 21:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: '2000-02-02',
          endDate: '2000-2000-2000',
        });
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: '2000-02-02',
          endDate: '2000-2000-2000',
        });
      }).toThrowError(
        'uiloos > DateGallery > moveEvent > "range.endDate" is an or contains an invalid date'
      );

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: '2000-02-02',
          endDate: new Date('2000-2000-2000'),
        });
      }).toThrowError(DateGalleryInvalidDateError);

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: '2000-02-02',
          endDate: new Date('2000-2000-2000'),
        });
      }).toThrowError(
        'uiloos > DateGallery > moveEvent > "range.endDate" is an or contains an invalid date'
      );

      expect(subscriber).toBeCalledTimes(0);
    });

    test('should error when given a invalid range', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const event = dateGallery.addEvent({
        data: 'event',
        startDate: '1989-03-21 21:00',
        endDate: '1989-03-21 21:00',
      });

      const subscriber = autoSubscribe(dateGallery);

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: '2000-01-01 15:01',
          endDate: '2000-01-01 15:00',
        });
      }).toThrowError(DateGalleryEventInvalidRangeError);

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: '2000-01-01 15:01',
          endDate: '2000-01-01 15:00',
        });
      }).toThrowError(
        'uiloos > DateGallery > invalid range, an events startDate lies after its endDate'
      );

      expect(subscriber).toBeCalledTimes(0);
    });

    test('should error when event cannot be found inside of the DateGallery', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const event = dateGallery.addEvent({
        data: 'event',
        startDate: '1989-03-21 21:00',
        endDate: '1989-03-21 21:00',
      });

      event.remove();

      const subscriber = autoSubscribe(dateGallery);

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: '2000-01-01 14:00',
          endDate: '2000-01-01 15:00',
        });
      }).toThrowError(DateGalleryEventNotFoundError);

      expect(() => {
        dateGallery.moveEvent(event, {
          startDate: '2000-01-01 14:00',
          endDate: '2000-01-01 15:00',
        });
      }).toThrowError(
        'uiloos > DateGallery > moveEvent > "DateGalleryEvent" not found in events array'
      );

      expect(subscriber).toBeCalledTimes(0);
    });

    test('should do nothing if event is set to the same range', () => {
      const dateGallery: DateGallery<string> = new DateGallery({
        mode: 'week',
        initialDate: '1990-09-26 00:00',
      });

      const event = dateGallery.addEvent({
        data: 'event',
        startDate: '1989-03-21 21:00',
        endDate: '1989-03-21 21:00',
      });

      event.remove();

      const subscriber = autoSubscribe(dateGallery);

      dateGallery.moveEvent(event, {
        startDate: '1989-03-21 21:00',
        endDate: '1989-03-21 21:00',
      });

      expect(subscriber).toBeCalledTimes(0);
    });

    describe('when moving an event update the frames, recalculate overlap, and re-order arrays', () => {
      describe('when isUTC is true', () => {
        test('3 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            isUTC: true,
            numberOfFrames: 3,
            mode: 'day',
            initialDate: '1989-03-21',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21T21:00Z',
            endDate: '1989-03-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.moveEvent(event2, {
            startDate: '1989-05-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 21:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event2,
              time: new Date(),
            }
          );

          event1.move({
            startDate: '1989-01-21T21:00Z',
            endDate: '1989-08-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 22:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 22:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 22:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 22:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 22:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 22:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'za 21-01-1989 21:00',
                  endDate: 'ma 21-08-1989 22:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 21:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event1,
              time: new Date(),
            }
          );
        });

        test('2 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            isUTC: true,
            numberOfFrames: 2,
            mode: 'day',
            initialDate: '1989-03-21',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21T21:00Z',
            endDate: '1989-03-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.moveEvent(event2, {
            startDate: '1989-05-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 21:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event2,
              time: new Date(),
            }
          );

          event1.move({
            startDate: '1989-01-21T21:00Z',
            endDate: '1989-08-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 22:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 22:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 22:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 22:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'za 21-01-1989 21:00',
                  endDate: 'ma 21-08-1989 22:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 21:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event1,
              time: new Date(),
            }
          );
        });

        test('1 frame', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            isUTC: true,
            numberOfFrames: 1,
            mode: 'day',
            initialDate: '1989-03-21',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21T21:00Z',
            endDate: '1989-03-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.moveEvent(event2, {
            startDate: '1989-05-21T20:00Z',
            endDate: '1989-05-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 21:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event2,
              time: new Date(),
            }
          );

          event1.move({
            startDate: '1989-01-21T21:00Z',
            endDate: '1989-08-21T21:00Z',
          });

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: true,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 22:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 22:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'za 21-01-1989 21:00',
                  endDate: 'ma 21-08-1989 22:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 21:00',
                  endDate: 'zo 21-05-1989 22:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event1,
              time: new Date(),
            }
          );
        });
      });

      describe('when isUTC is false', () => {
        test('3 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            numberOfFrames: 3,
            mode: 'day',
            initialDate: '1989-03-21 00:00',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21 21:00',
            endDate: '1989-03-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.moveEvent(event2, {
            startDate: '1989-05-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event2,
              time: new Date(),
            }
          );

          event1.move({
            startDate: '1989-01-21 21:00',
            endDate: '1989-08-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 3,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'do 23-03-1989 00:00',
                  dates: [
                    {
                      date: 'do 23-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'za 21-01-1989 21:00',
                  endDate: 'ma 21-08-1989 21:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event1,
              time: new Date(),
            }
          );
        });

        test('2 frames', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            numberOfFrames: 2,
            mode: 'day',
            initialDate: '1989-03-21 00:00',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21 21:00',
            endDate: '1989-03-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.moveEvent(event2, {
            startDate: '1989-05-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [],
                      hasEvents: false,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event2,
              time: new Date(),
            }
          );

          event1.move({
            startDate: '1989-01-21 21:00',
            endDate: '1989-08-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 2,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
                {
                  anchorDate: 'wo 22-03-1989 00:00',
                  dates: [
                    {
                      date: 'wo 22-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'za 21-01-1989 21:00',
                  endDate: 'ma 21-08-1989 21:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event1,
              time: new Date(),
            }
          );
        });

        test('1 frame', () => {
          const dateGallery: DateGallery<string> = new DateGallery({
            numberOfFrames: 1,
            mode: 'day',
            initialDate: '1989-03-21 00:00',
          });

          const subscriber = autoSubscribe(dateGallery);

          const event1 = dateGallery.addEvent({
            data: 'event1',
            startDate: '1989-03-21 21:00',
            endDate: '1989-03-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(1);

          const event2 = dateGallery.addEvent({
            data: 'event2',
            startDate: '1989-03-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(2);

          dateGallery.moveEvent(event2, {
            startDate: '1989-05-21 20:00',
            endDate: '1989-05-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'di 21-03-1989 21:00',
                          endDate: 'di 21-03-1989 21:00',
                          overlappingEvents: [],
                          isOverlapping: false,
                          spansMultipleDays: false,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: false,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'di 21-03-1989 21:00',
                      endDate: 'di 21-03-1989 21:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'di 21-03-1989 21:00',
                  endDate: 'di 21-03-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event2,
              time: new Date(),
            }
          );

          event1.move({
            startDate: '1989-01-21 21:00',
            endDate: '1989-08-21 21:00',
          });

          expect(subscriber).toBeCalledTimes(4);
          assertLastSubscriber(
            subscriber,
            {
              history: [],
              isUTC: false,
              numberOfFrames: 1,
              mode: 'day',
              firstDayOfWeek: 0,
              firstFrame: frameToTestFrame(dateGallery.frames[0]),
              frames: [
                {
                  anchorDate: 'di 21-03-1989 00:00',
                  dates: [
                    {
                      date: 'di 21-03-1989 00:00',
                      isPadding: false,
                      isSelected: false,
                      isToday: false,
                      events: [
                        {
                          data: 'event1',
                          startDate: 'za 21-01-1989 21:00',
                          endDate: 'ma 21-08-1989 21:00',
                          overlappingEvents: ['event2'],
                          isOverlapping: true,
                          spansMultipleDays: true,
                        },
                      ],
                      hasEvents: true,
                      hasEventsWithOverlap: true,
                    },
                  ],
                  events: [
                    {
                      data: 'event1',
                      startDate: 'za 21-01-1989 21:00',
                      endDate: 'ma 21-08-1989 21:00',
                      overlappingEvents: ['event2'],
                      isOverlapping: true,
                      spansMultipleDays: true,
                    },
                  ],
                },
              ],
              events: [
                {
                  data: 'event1',
                  startDate: 'za 21-01-1989 21:00',
                  endDate: 'ma 21-08-1989 21:00',
                  overlappingEvents: ['event2'],
                  isOverlapping: true,
                  spansMultipleDays: true,
                },
                {
                  data: 'event2',
                  startDate: 'zo 21-05-1989 20:00',
                  endDate: 'zo 21-05-1989 21:00',
                  overlappingEvents: ['event1'],
                  isOverlapping: true,
                  spansMultipleDays: false,
                },
              ],
              selectedDates: [],
              maxSelectionLimit: false,
              maxSelectionLimitBehavior: 'circular',
            },
            {
              type: 'EVENT_MOVED',
              event: event1,
              time: new Date(),
            }
          );
        });
      });
    });
  });

  describe('changeEventData', () => {
    describe('changeEventData', () => {
      test('throws out DateGalleryEventNotFoundError when view is not in views array', () => {
        const dateGallery = new DateGallery<string>();
        const subscriber = autoSubscribe(dateGallery);

        const eventFromOtherChannel = new DateGalleryEvent(
          new DateGallery<string>(),
          'blaat',
          new Date(),
          new Date()
        );

        expect(() => {
          dateGallery.changeEventData(eventFromOtherChannel, 'OK');
        }).toThrowError(
          `uiloos > DateGallery > changeEventData > "DateGalleryEvent" not found in events array`
        );

        expect(() => {
          dateGallery.changeEventData(eventFromOtherChannel, 'OK');
        }).toThrowError(DateGalleryEventNotFoundError);

        // It should not have resulted in any events
        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('throws out DateGalleryEventNotFoundError when event is no longer in events array', () => {
        const dateGallery = new DateGallery<string>();
        const subscriber = autoSubscribe(dateGallery);

        const event = dateGallery.addEvent({
          data: 'HEYO',
          startDate: new Date(),
          endDate: new Date(),
        });
        // One for addEvent
        expect(subscriber).toHaveBeenCalledTimes(1);

        event.remove();
        // One for removed
        expect(subscriber).toHaveBeenCalledTimes(2);

        // Now changeData it should throw an error
        expect(() => {
          dateGallery.changeEventData(event, 'OK');
        }).toThrowError(DateGalleryEventNotFoundError);

        // It should not have resulted in more than 2 events.
        expect(subscriber).toHaveBeenCalledTimes(2);
      });

      test('should change the data and inform subscribers', async () => {
        const dateGallery = new DateGallery<string>({
          mode: 'day',
        });
        const subscriber = autoSubscribe(dateGallery);

        const event = dateGallery.addEvent({
          data: 'HEYO',
          startDate: new Date(),
          endDate: new Date(),
        });
        // One for addEvent
        expect(subscriber).toHaveBeenCalledTimes(1);

        dateGallery.changeEventData(event, 'OK');

        // One for addEvent, one for changeData
        expect(subscriber).toBeCalledTimes(2);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            isUTC: false,
            numberOfFrames: 1,
            mode: 'day',
            firstDayOfWeek: 0,
            firstFrame: frameToTestFrame(dateGallery.frames[0]),
            frames: [
              {
                anchorDate: 'za 01-01-2000 00:00',
                dates: [
                  {
                    date: 'za 01-01-2000 00:00',
                    isPadding: false,
                    isSelected: false,
                    isToday: true,
                    events: [
                      {
                        data: 'OK',
                        startDate: 'za 01-01-2000 01:00',
                        endDate: 'za 01-01-2000 01:00',
                        overlappingEvents: [],
                        isOverlapping: false,
                        spansMultipleDays: false,
                      },
                    ],
                    hasEvents: true,
                    hasEventsWithOverlap: false,
                  },
                ],
                events: [
                  {
                    data: 'OK',
                    startDate: 'za 01-01-2000 01:00',
                    endDate: 'za 01-01-2000 01:00',
                    overlappingEvents: [],
                    isOverlapping: false,
                    spansMultipleDays: false,
                  },
                ],
              },
            ],
            events: [
              {
                data: 'OK',
                startDate: 'za 01-01-2000 01:00',
                endDate: 'za 01-01-2000 01:00',
                overlappingEvents: [],
                isOverlapping: false,
                spansMultipleDays: false,
              },
            ],
            selectedDates: [],
            maxSelectionLimit: false,
            maxSelectionLimitBehavior: 'circular',
          },
          {
            type: 'EVENT_DATA_CHANGED',
            event,
            data: 'OK',
            time: new Date(),
          }
        );
      });

      test('should still inform when data stays the same, for primitives', async () => {
        const dateGallery = new DateGallery<string>({
          mode: 'day',
        });
        const subscriber = autoSubscribe(dateGallery);

        const event = dateGallery.addEvent({
          data: 'same',
          startDate: new Date(),
          endDate: new Date(),
        });
        // One for addEvent
        expect(subscriber).toHaveBeenCalledTimes(1);

        dateGallery.changeEventData(event, 'same');

        // One for addEvent, one for changeData
        expect(subscriber).toBeCalledTimes(2);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            isUTC: false,
            numberOfFrames: 1,
            mode: 'day',
            firstDayOfWeek: 0,
            firstFrame: frameToTestFrame(dateGallery.frames[0]),
            frames: [
              {
                anchorDate: 'za 01-01-2000 00:00',
                dates: [
                  {
                    date: 'za 01-01-2000 00:00',
                    isPadding: false,
                    isSelected: false,
                    isToday: true,
                    events: [
                      {
                        data: 'same',
                        startDate: 'za 01-01-2000 01:00',
                        endDate: 'za 01-01-2000 01:00',
                        overlappingEvents: [],
                        isOverlapping: false,
                        spansMultipleDays: false,
                      },
                    ],
                    hasEvents: true,
                    hasEventsWithOverlap: false,
                  },
                ],
                events: [
                  {
                    data: 'same',
                    startDate: 'za 01-01-2000 01:00',
                    endDate: 'za 01-01-2000 01:00',
                    overlappingEvents: [],
                    isOverlapping: false,
                    spansMultipleDays: false,
                  },
                ],
              },
            ],
            events: [
              {
                data: 'same',
                startDate: 'za 01-01-2000 01:00',
                endDate: 'za 01-01-2000 01:00',
                overlappingEvents: [],
                isOverlapping: false,
                spansMultipleDays: false,
              },
            ],
            selectedDates: [],
            maxSelectionLimit: false,
            maxSelectionLimitBehavior: 'circular',
          },
          {
            type: 'EVENT_DATA_CHANGED',
            event,
            data: 'same',
            time: new Date(),
          }
        );
      });

      test('should still inform when data stays the same, for objects', async () => {
        const dateGallery = new DateGallery<{
          title: string;
          description: string;
        }>({
          mode: 'day',
        });

        const subscriber = jest.fn();
        unsubscribe = dateGallery.subscribe(subscriber);

        const event = dateGallery.addEvent({
          data: {
            title: 'doctors appointment',
            description: 'embarrasing',
          },
          startDate: new Date(),
          endDate: new Date(),
        });
        // One for addEvent
        expect(subscriber).toHaveBeenCalledTimes(1);

        event.data.title = 'private';

        dateGallery.changeEventData(event, event.data);

        // One for present, one for changeData
        assertLastSubscriber(
          subscriber,
          {
            history: [],
            isUTC: false,
            numberOfFrames: 1,
            mode: 'day',
            firstDayOfWeek: 0,
            // @ts-expect-error allow non T = string
            firstFrame: frameToTestFrame(dateGallery.frames[0]),
            frames: [
              {
                anchorDate: 'za 01-01-2000 00:00',
                dates: [
                  {
                    date: 'za 01-01-2000 00:00',
                    isPadding: false,
                    isSelected: false,
                    isToday: true,
                    events: [
                      {
                        // @ts-expect-error allow non T = string
                        data: {
                          title: 'private',
                          description: 'embarrasing',
                        },
                        startDate: 'za 01-01-2000 01:00',
                        endDate: 'za 01-01-2000 01:00',
                        overlappingEvents: [],
                        isOverlapping: false,
                        spansMultipleDays: false,
                      },
                    ],
                    hasEvents: true,
                    hasEventsWithOverlap: false,
                  },
                ],
                events: [
                  {
                    // @ts-expect-error allow non T = string
                    data: {
                      title: 'private',
                      description: 'embarrasing',
                    },
                    startDate: 'za 01-01-2000 01:00',
                    endDate: 'za 01-01-2000 01:00',
                    overlappingEvents: [],
                    isOverlapping: false,
                    spansMultipleDays: false,
                  },
                ],
              },
            ],
            events: [
              {
                // @ts-expect-error allow non T = string
                data: {
                  title: 'private',
                  description: 'embarrasing',
                },
                startDate: 'za 01-01-2000 01:00',
                endDate: 'za 01-01-2000 01:00',
                overlappingEvents: [],
                isOverlapping: false,
                spansMultipleDays: false,
              },
            ],
            selectedDates: [],
            maxSelectionLimit: false,
            maxSelectionLimitBehavior: 'circular',
          },
          {
            type: 'EVENT_DATA_CHANGED',
            event,
            data: {
              title: 'private',
              description: 'embarrasing',
            },
            time: new Date(),
          }
        );
      });
    });

    test('changeEventData via DateGalleryevent', async () => {
      const dateGallery = new DateGallery<string>({
        mode: 'day',
      });
      const subscriber = autoSubscribe(dateGallery);

      const event = dateGallery.addEvent({
        data: 'HEYO',
        startDate: new Date(),
        endDate: new Date(),
      });
      // One for addEvent
      expect(subscriber).toHaveBeenCalledTimes(1);

      event.changeData('OK');

      // One for addEvent, one for changeData
      expect(subscriber).toBeCalledTimes(2);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          isUTC: false,
          numberOfFrames: 1,
          mode: 'day',
          firstDayOfWeek: 0,
          firstFrame: frameToTestFrame(dateGallery.frames[0]),
          frames: [
            {
              anchorDate: 'za 01-01-2000 00:00',
              dates: [
                {
                  date: 'za 01-01-2000 00:00',
                  isPadding: false,
                  isSelected: false,
                  isToday: true,
                  events: [
                    {
                      data: 'OK',
                      startDate: 'za 01-01-2000 01:00',
                      endDate: 'za 01-01-2000 01:00',
                      overlappingEvents: [],
                      isOverlapping: false,
                      spansMultipleDays: false,
                    },
                  ],
                  hasEvents: true,
                  hasEventsWithOverlap: false,
                },
              ],
              events: [
                {
                  data: 'OK',
                  startDate: 'za 01-01-2000 01:00',
                  endDate: 'za 01-01-2000 01:00',
                  overlappingEvents: [],
                  isOverlapping: false,
                  spansMultipleDays: false,
                },
              ],
            },
          ],
          events: [
            {
              data: 'OK',
              startDate: 'za 01-01-2000 01:00',
              endDate: 'za 01-01-2000 01:00',
              overlappingEvents: [],
              isOverlapping: false,
              spansMultipleDays: false,
            },
          ],
          selectedDates: [],
          maxSelectionLimit: false,
          maxSelectionLimitBehavior: 'circular',
        },
        {
          type: 'EVENT_DATA_CHANGED',
          event,
          data: 'OK',
          time: new Date(),
        }
      );
    });
  });

  describe('isSameDay', () => {
    describe('when isUTC is true', () => {
      test('should error when given a malformed date', () => {
        const dateGallery: DateGallery<string> = new DateGallery({
          mode: 'week',
          isUTC: true,
        });

        const subscriber = autoSubscribe(dateGallery);

        expect(() => {
          dateGallery.isSameDay('1990-125-24', '1990-01-01');
        }).toThrowError(DateGalleryInvalidDateError);

        expect(() => {
          dateGallery.isSameDay('1990-125-24', '1990-01-01');
        }).toThrowError(
          'uiloos > DateGallery > isSameDay > "a" is an or contains an invalid date'
        );

        expect(() => {
          dateGallery.isSameDay(
            new Date('1990-125-24'),
            new Date('1990-01-01')
          );
        }).toThrowError(DateGalleryInvalidDateError);

        expect(() => {
          dateGallery.isSameDay(
            new Date('1990-125-24'),
            new Date('1990-01-01')
          );
        }).toThrowError(
          'uiloos > DateGallery > isSameDay > "a" is an or contains an invalid date'
        );

        expect(() => {
          dateGallery.isSameDay('1990-01-01', '1990-125-24');
        }).toThrowError(DateGalleryInvalidDateError);

        expect(() => {
          dateGallery.isSameDay('1990-01-01', '1990-125-24');
        }).toThrowError(
          'uiloos > DateGallery > isSameDay > "b" is an or contains an invalid date'
        );

        expect(() => {
          dateGallery.isSameDay(
            new Date('1990-01-01'),
            new Date('1990-125-24')
          );
        }).toThrowError(DateGalleryInvalidDateError);

        expect(() => {
          dateGallery.isSameDay(
            new Date('1990-01-01'),
            new Date('1990-125-24')
          );
        }).toThrowError(
          'uiloos > DateGallery > isSameDay > "b" is an or contains an invalid date'
        );

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('should know when dates are the same', () => {
        const dateGallery: DateGallery<string> = new DateGallery({
          mode: 'week',
          isUTC: true,
        });

        const subscriber = autoSubscribe(dateGallery);

        expect(dateGallery.isSameDay('2000-01-01', '2000-01-01')).toBe(true);
        expect(
          dateGallery.isSameDay(
            '2000-01-01T00:00-0500',
            '2000-01-01T00:00-0500'
          )
        ).toBe(true);
        expect(
          dateGallery.isSameDay('2000-01-01T13:00Z', '2000-01-01T14:00Z')
        ).toBe(true);
        expect(
          dateGallery.isSameDay('2000-01-01T00:00', '2000-01-01T00:00')
        ).toBe(true);
        expect(
          dateGallery.isSameDay('2000-01-01T00:00Z', '2000-01-01T23:59Z')
        ).toBe(true);

        expect(dateGallery.isSameDay('2000-01-01', '2000-01-02')).toBe(false);
        expect(
          dateGallery.isSameDay(
            '2000-01-01T00:00-0500',
            '2000-01-01T00:00+0500'
          )
        ).toBe(false);

        expect(
          dateGallery.isSameDay(new Date('2000-01-01'), new Date('2000-01-01'))
        ).toBe(true);
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T00:00-0500'),
            new Date('2000-01-01T00:00-0500')
          )
        ).toBe(true);
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T13:00Z'),
            new Date('2000-01-01T14:00Z')
          )
        ).toBe(true);
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T00:00'),
            new Date('2000-01-01T00:00')
          )
        ).toBe(true);
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T00:00Z'),
            new Date('2000-01-01T23:59Z')
          )
        ).toBe(true);

        expect(
          dateGallery.isSameDay(new Date('2000-01-01'), new Date('2000-01-02'))
        ).toBe(false);
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T00:00-0500'),
            new Date('2000-01-01T00:00+0500')
          )
        ).toBe(false);

        expect(subscriber).toHaveBeenCalledTimes(0);
      });
    });

    describe('when isUTC is false', () => {
      test('should error when given a malformed date', () => {
        const dateGallery: DateGallery<string> = new DateGallery({
          mode: 'week',
          isUTC: false,
        });

        const subscriber = autoSubscribe(dateGallery);

        expect(() => {
          dateGallery.isSameDay('1990-125-24', '1990-01-01');
        }).toThrowError(DateGalleryInvalidDateError);

        expect(() => {
          dateGallery.isSameDay('1990-125-24', '1990-01-01');
        }).toThrowError(
          'uiloos > DateGallery > isSameDay > "a" is an or contains an invalid date'
        );

        expect(() => {
          dateGallery.isSameDay(
            new Date('1990-125-24'),
            new Date('1990-01-01')
          );
        }).toThrowError(DateGalleryInvalidDateError);

        expect(() => {
          dateGallery.isSameDay(
            new Date('1990-125-24'),
            new Date('1990-01-01')
          );
        }).toThrowError(
          'uiloos > DateGallery > isSameDay > "a" is an or contains an invalid date'
        );

        expect(() => {
          dateGallery.isSameDay('1990-01-01', '1990-125-24');
        }).toThrowError(DateGalleryInvalidDateError);

        expect(() => {
          dateGallery.isSameDay('1990-01-01', '1990-125-24');
        }).toThrowError(
          'uiloos > DateGallery > isSameDay > "b" is an or contains an invalid date'
        );

        expect(() => {
          dateGallery.isSameDay(
            new Date('1990-01-01'),
            new Date('1990-125-24')
          );
        }).toThrowError(DateGalleryInvalidDateError);

        expect(() => {
          dateGallery.isSameDay(
            new Date('1990-01-01'),
            new Date('1990-125-24')
          );
        }).toThrowError(
          'uiloos > DateGallery > isSameDay > "b" is an or contains an invalid date'
        );

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('should know when dates are the same', () => {
        const dateGallery: DateGallery<string> = new DateGallery({
          mode: 'week',
          isUTC: false,
        });

        const subscriber = autoSubscribe(dateGallery);

        expect(dateGallery.isSameDay('2000-01-01', '2000-01-01')).toBe(true);
        expect(
          dateGallery.isSameDay(
            '2000-01-01T00:00-0500',
            '2000-01-01T00:00-0500'
          )
        ).toBe(true);
        expect(
          dateGallery.isSameDay('2000-01-01T13:00Z', '2000-01-01T14:00Z')
        ).toBe(true);
        expect(
          dateGallery.isSameDay('2000-01-01T00:00', '2000-01-01T00:00')
        ).toBe(true);

        // In samoa this is not the same day, due to the hour difference
        expect(
          dateGallery.isSameDay('2000-01-01T00:00Z', '2000-01-01T23:59Z')
        ).toBe(false);

        // Twist around midnight samoan time
        expect(
          dateGallery.isSameDay('2000-01-01T00:00Z', '1999-12-31T10:59Z')
        ).toBe(false);
        expect(
          dateGallery.isSameDay('2000-01-01T00:00Z', '1999-12-31T11:00Z')
        ).toBe(true);
        expect(
          dateGallery.isSameDay('2000-01-01T00:00Z', '1999-12-31T11:01Z')
        ).toBe(true);

        expect(dateGallery.isSameDay('2000-01-01', '2000-01-02')).toBe(false);

        expect(
          dateGallery.isSameDay(new Date('2000-01-01'), new Date('2000-01-01'))
        ).toBe(true);
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T00:00-0500'),
            new Date('2000-01-01T00:00-0500')
          )
        ).toBe(true);
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T13:00Z'),
            new Date('2000-01-01T14:00Z')
          )
        ).toBe(true);
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T00:00'),
            new Date('2000-01-01T00:00')
          )
        ).toBe(true);

        // In samoa this is not the same day, due to the hour difference
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T00:00Z'),
            new Date('2000-01-01T23:59Z')
          )
        ).toBe(false);

        // Twist around midnight samoan time
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T00:00Z'),
            new Date('1999-12-31T10:59Z')
          )
        ).toBe(false);
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T00:00Z'),
            new Date('1999-12-31T11:00Z')
          )
        ).toBe(true);
        expect(
          dateGallery.isSameDay(
            new Date('2000-01-01T00:00Z'),
            new Date('1999-12-31T11:01Z')
          )
        ).toBe(true);

        expect(
          dateGallery.isSameDay(new Date('2000-01-01'), new Date('2000-01-02'))
        ).toBe(false);

        expect(subscriber).toHaveBeenCalledTimes(0);
      });
    });
  });

  // These test should pass TypeScript checking
  describe('generics', () => {
    describe('T', () => {
      test('when T is an object it should require the data function to return that object', () => {
        const dateGallery = new DateGallery<{
          text: string;
          type: 'work' | 'home';
        }>();

        dateGallery.addEvent({
          data: {
            text: 'Datenight',
            type: 'home',
          },
          startDate: '2000-01-01 12:00',
          endDate: '2000-01-01 14:00',
        });

        dateGallery.addEvent({
          // @ts-expect-error This is a typecheck undefined should keep failing
          data: undefined,
          startDate: '2000-01-01 12:00',
          endDate: '2000-01-01 14:00',
        });
      });

      test('when T not an object but a primitive it should work', () => {
        const dateGallery = new DateGallery<number>();

        dateGallery.addEvent({
          data: 42,
          startDate: '2000-01-01 12:00',
          endDate: '2000-01-01 14:00',
        });

        dateGallery.addEvent({
          // @ts-expect-error This is a typecheck undefined should keep failing
          data: undefined,
          startDate: '2000-01-01 12:00',
          endDate: '2000-01-01 14:00',
        });
      });

      test('when T is not defined all should work', () => {
        const dateGallery = new DateGallery();

        dateGallery.addEvent({
          data: undefined,
          startDate: '2000-01-01 12:00',
          endDate: '2000-01-01 14:00',
        });

        dateGallery.addEvent({
          data: 'yo',
          startDate: '2000-01-01 12:00',
          endDate: '2000-01-01 14:00',
        });

        dateGallery.addEvent({
          data: {
            title: 'Doctors appointment',
            description: 'Yearly checkup',
          },
          startDate: '2000-01-01 12:00',
          endDate: '2000-01-01 14:00',
        });

        dateGallery.addEvent({
          data: () => ({
            title: 'Doctors appointment',
            description: 'Yearly checkup',
          }),
          startDate: '2000-01-01 12:00',
          endDate: '2000-01-01 14:00',
        });
      });
    });
  });

  describe('history', () => {
    test('that a correct history is kept for all events', () => {
      const dateGallery = new DateGallery<string>({
        keepHistoryFor: 100,
        mode: 'day',
      });

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
      ]);

      dateGallery.next();

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),
      ]);

      dateGallery.changeConfig({ mode: 'week' });

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),
      ]);

      dateGallery.selectDate('2001-01-01');

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED',
        }),
      ]);

      dateGallery.deselectDate('2001-01-01');

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED',
        }),
      ]);

      dateGallery.selectRange('2001-01-01', '2001-01-10');

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED_MULTIPLE',
        }),
      ]);

      dateGallery.deselectAll();

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED_MULTIPLE',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED_MULTIPLE',
        }),
      ]);

      const event = dateGallery.addEvent({
        data: 'event',
        startDate: '2000-01-01 12:00',
        endDate: '2000-01-01 16:00',
      });

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED_MULTIPLE',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED_MULTIPLE',
        }),

        expect.objectContaining({
          type: 'EVENT_ADDED',
        }),
      ]);

      dateGallery.moveEvent(event, {
        startDate: '2000-01-01 14:00',
        endDate: '2000-01-01 15:00',
      });

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED_MULTIPLE',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED_MULTIPLE',
        }),

        expect.objectContaining({
          type: 'EVENT_ADDED',
        }),

        expect.objectContaining({
          type: 'EVENT_MOVED',
        }),
      ]);

      dateGallery.changeEventData(event, 'yo');

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED_MULTIPLE',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED_MULTIPLE',
        }),

        expect.objectContaining({
          type: 'EVENT_ADDED',
        }),

        expect.objectContaining({
          type: 'EVENT_MOVED',
        }),

        expect.objectContaining({
          type: 'EVENT_DATA_CHANGED',
        }),
      ]);

      dateGallery.removeEvent(event);

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED_MULTIPLE',
        }),

        expect.objectContaining({
          type: 'DATE_DESELECTED_MULTIPLE',
        }),

        expect.objectContaining({
          type: 'EVENT_ADDED',
        }),

        expect.objectContaining({
          type: 'EVENT_MOVED',
        }),

        expect.objectContaining({
          type: 'EVENT_DATA_CHANGED',
        }),

        expect.objectContaining({
          type: 'EVENT_REMOVED',
        }),
      ]);
    });

    test('that a history is kept for a maximum number of events', () => {
      const dateGallery = new DateGallery<string>({
        keepHistoryFor: 3,
      });

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
      ]);

      dateGallery.next();

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),
      ]);

      dateGallery.changeConfig({ mode: 'week' });

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),
      ]);

      dateGallery.selectDate('2001-01-01');

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),

        expect.objectContaining({
          type: 'DATE_SELECTED',
        }),
      ]);
    });

    test('that initialize resets the history', () => {
      const dateGallery = new DateGallery<string>({
        keepHistoryFor: 3,
      });

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
      ]);

      dateGallery.next();

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),
      ]);

      dateGallery.changeConfig({ mode: 'week' });

      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),

        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),
      ]);

      // Now reset the history, note that if `keepHistoryFor` is zero
      // the `history` array would be empty
      dateGallery.initialize({ keepHistoryFor: 1 });
      expect(dateGallery.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
      ]);
    });
  });

  describe('createDateGallerySubscriberConfig', () => {
    test('that all methods are called correctly', () => {
      jest.useFakeTimers();

      const config: CreateDateGallerySubscriberConfig<string> = {
        onInitialized: jest.fn(),
        onFrameChanged: jest.fn(),
        onConfigChanged: jest.fn(),
        onDateSelected: jest.fn(),
        onDateSelectedMultiple: jest.fn(),
        onDateDeselected: jest.fn(),
        onDateDeselectedMultiple: jest.fn(),
        onEventAdded: jest.fn(),
        onEventRemoved: jest.fn(),
        onEventMoved: jest.fn(),
        onEventDataChanged: jest.fn(),
      };

      const subscriber = createDateGallerySubscriber<string>(config);

      const dateGallery = new DateGallery<string>(
        {
          mode: 'day',
        },
        subscriber
      );

      expect(config.onInitialized).toBeCalledTimes(1);
      expect(config.onInitialized).lastCalledWith(
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        dateGallery
      );

      dateGallery.next();

      expect(config.onFrameChanged).toBeCalledTimes(1);
      expect(config.onFrameChanged).lastCalledWith(
        expect.objectContaining({
          type: 'FRAME_CHANGED',
        }),
        dateGallery
      );

      dateGallery.changeConfig({ mode: 'week' });

      expect(config.onConfigChanged).toBeCalledTimes(1);
      expect(config.onConfigChanged).lastCalledWith(
        expect.objectContaining({
          type: 'CONFIG_CHANGED',
        }),
        dateGallery
      );

      dateGallery.selectDate('2001-01-01');

      expect(config.onDateSelected).toBeCalledTimes(1);
      expect(config.onDateSelected).lastCalledWith(
        expect.objectContaining({
          type: 'DATE_SELECTED',
        }),
        dateGallery
      );

      dateGallery.deselectDate('2001-01-01');

      expect(config.onDateDeselected).toBeCalledTimes(1);
      expect(config.onDateDeselected).lastCalledWith(
        expect.objectContaining({
          type: 'DATE_DESELECTED',
        }),
        dateGallery
      );

      dateGallery.selectRange('2001-01-01', '2001-01-10');

      expect(config.onDateSelectedMultiple).toBeCalledTimes(1);
      expect(config.onDateSelectedMultiple).lastCalledWith(
        expect.objectContaining({
          type: 'DATE_SELECTED_MULTIPLE',
        }),
        dateGallery
      );

      dateGallery.deselectAll();

      expect(config.onDateDeselectedMultiple).toBeCalledTimes(1);
      expect(config.onDateDeselectedMultiple).lastCalledWith(
        expect.objectContaining({
          type: 'DATE_DESELECTED_MULTIPLE',
        }),
        dateGallery
      );

      const event = dateGallery.addEvent({
        data: 'event',
        startDate: '2000-01-01 12:00',
        endDate: '2000-01-01 16:00',
      });

      expect(config.onEventAdded).toBeCalledTimes(1);
      expect(config.onEventAdded).lastCalledWith(
        expect.objectContaining({
          type: 'EVENT_ADDED',
        }),
        dateGallery
      );

      dateGallery.moveEvent(event, {
        startDate: '2000-01-01 14:00',
        endDate: '2000-01-01 15:00',
      });

      expect(config.onEventMoved).toBeCalledTimes(1);
      expect(config.onEventMoved).lastCalledWith(
        expect.objectContaining({
          type: 'EVENT_MOVED',
        }),
        dateGallery
      );

      dateGallery.changeEventData(event, 'yo');

      expect(config.onEventDataChanged).toBeCalledTimes(1);
      expect(config.onEventDataChanged).lastCalledWith(
        expect.objectContaining({
          type: 'EVENT_DATA_CHANGED',
        }),
        dateGallery
      );

      dateGallery.removeEvent(event);

      expect(config.onEventRemoved).toBeCalledTimes(1);
      expect(config.onEventRemoved).lastCalledWith(
        expect.objectContaining({
          type: 'EVENT_REMOVED',
        }),
        dateGallery
      );

      // Check if they are all called at least once.
      for (const spy of Object.values(config)) {
        // @ts-expect-error they are mocks
        expect(spy.mock.calls.length).not.toBe(0);
      }
    });

    describe('when a method is not implemented', () => {
      test('that it logs a warning when debug is true', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        const subscriber = createDateGallerySubscriber<string>({
          debug: true,
        });

        new DateGallery({}, subscriber);

        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
          "uiloos > createDateGallerySubscriber event 'INITIALIZED' was fired but 'onInitialized' method is not implemented, this might not be correct."
        );
      });

      test('that it does not log a warning when debug is false', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        const subscriber = createDateGallerySubscriber<string>({
          debug: false,
        });

        new DateGallery({}, subscriber);

        expect(console.warn).toHaveBeenCalledTimes(0);
      });

      test('that it does not log a warning when debug is undefined', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        const subscriber = createDateGallerySubscriber<string>({});

        new DateGallery({}, subscriber);

        expect(console.warn).toHaveBeenCalledTimes(0);
      });
    });

    test('that created subscribers can be unsubscribed', () => {
      jest.useFakeTimers();

      const config: CreateDateGallerySubscriberConfig<string> = {
        onFrameChanged: jest.fn(),
        onDateSelected: jest.fn(),
      };

      const subscriber = createDateGallerySubscriber<string>(config);

      const dateGallery = new DateGallery<string>({}, subscriber);

      dateGallery.next();
      expect(config.onFrameChanged).toBeCalledTimes(1);

      dateGallery.unsubscribe(subscriber);

      // Should be unsubscribed and therefore 0 and not 1.
      dateGallery.selectDate('2010-03-21');
      expect(config.onDateSelected).toBeCalledTimes(0);
    });
  });

  describe('subscribers', () => {
    test('multiple subscribers', () => {
      const dateGallery = new DateGallery<string>();
      const subscriber = autoSubscribe(dateGallery);

      const secondSubscriber = jest.fn();
      const removeSecondSubscriber = dateGallery.subscribe(secondSubscriber);

      const thirdSubscriber = jest.fn();
      dateGallery.subscribe(thirdSubscriber);

      dateGallery.next();

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      removeSecondSubscriber();

      dateGallery.next();

      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);

      dateGallery.unsubscribe(thirdSubscriber);

      dateGallery.next();

      expect(subscriber).toHaveBeenCalledTimes(3);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);
    });

    test('unsubscribeAll', () => {
      const dateGallery = new DateGallery<string>();
      const subscriber = autoSubscribe(dateGallery);

      const secondSubscriber = jest.fn();
      dateGallery.subscribe(secondSubscriber);

      const thirdSubscriber = jest.fn();
      dateGallery.subscribe(thirdSubscriber);

      // All three should be informed of this
      dateGallery.next();

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      dateGallery.unsubscribeAll();

      // no one should be informed after the unsubscribe all
      dateGallery.next();

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      // Test if a new subscriber can still be added after the clear.
      const newSubscriber = jest.fn();
      dateGallery.subscribe(newSubscriber);

      // Only new one should be informed
      dateGallery.next();

      // New one should be informed
      expect(newSubscriber).toHaveBeenCalledTimes(1);

      // Still not informed
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);
    });
  });
});
