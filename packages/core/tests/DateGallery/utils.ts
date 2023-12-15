import {
  expect,
  jest,
} from '@jest/globals';
import { DateGallery, DateGalleryDate, DateGalleryEvent, DateGalleryFrame, DateGallerySubscriberEvent } from '../../src/DateGallery';

export const samoaFormatter = new Intl.DateTimeFormat('nl-Nl', {
  year: 'numeric',
  month: '2-digit',
  weekday: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Pacific/Samoa',
});

export const europeFormatter = new Intl.DateTimeFormat('nl-Nl', {
  year: 'numeric',
  month: '2-digit',
  weekday: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/London', // 0 UTC but has summertime!
});

export type DateGallerySansDatesAndEvents<T> = Pick<
  DateGallery<T>,
  'history' | 'firstDayOfWeek' | 'mode' | 'isUTC'
>;

type TestFrame<T> = {
  events: TestEvent[];
  dates: TestDate<T>[];
  anchorDate: string;
}

export type TestState<T> = DateGallerySansDatesAndEvents<T> & {
  firstFrame: TestFrame<T>;
  frames: TestFrame<T>[];
  events: TestEvent[];
  selectedDates: string[];
};

export type TestEvent = {
  data: string;
  overlapsWith: string[];
  startDate: string;
  endDate: string;
};

export type TestDate<T> = Pick<
  DateGalleryDate<T>,
  'isPadding' | 'isToday' | 'isSelected' | 'hasEvents' | 'hasEventsWithOverlap'
> & {
  date: string;
  events: TestEvent[];
};

export function assertState(state: DateGallery<string>, expected: TestState<string>) {
  const formatter = expected.isUTC ? europeFormatter : samoaFormatter;

  const callAsTestState: TestState<string> = {
    // maxActivationLimit: state.maxActivationLimit,
    // maxActivationLimitBehavior: state.maxActivationLimitBehavior,
    history: state.history,

    mode: state.mode,
    firstDayOfWeek: state.firstDayOfWeek,
    isUTC: state.isUTC,

    firstFrame: frameToTestFrame(state.firstFrame),

    frames: state.frames.map(frameToTestFrame),

    events: state.events.map(eventToTestEvent),
    selectedDates: state.selectedDates.map((date) => formatter.format(date)),
  };

  expect(callAsTestState).toEqual(expected);
}

export function frameToTestFrame(frame: DateGalleryFrame<string>): TestFrame<string> {
  const formatter = frame.dates[0].dateGallery.isUTC ? europeFormatter : samoaFormatter;

  return {
    dates: frame.dates.map(dateToTestDate),
    events: frame.events.map(eventToTestEvent),
    anchorDate: formatter.format(frame.anchorDate),
  }
}

export function eventToTestEvent(event: DateGalleryEvent<string>): TestEvent {
  expect(event instanceof DateGalleryEvent).toBe(true);

  const formatter = event.dateGallery.isUTC ? europeFormatter : samoaFormatter;

  return {
    data: event.data,
    startDate: formatter.format(event.startDate),
    endDate: formatter.format(event.endDate),

    // To prevent circular references (infinite loop) we only check the 'data'
    overlapsWith: event.overlapsWith.map((e) => {
      expect(e instanceof DateGalleryEvent);
      return e.data;
    }),
  };
}

export function dateToTestDate(date: DateGalleryDate<string>): TestDate<string> {
  expect(date instanceof DateGalleryDate).toBe(true);

  const formatter = date.dateGallery.isUTC ? europeFormatter : samoaFormatter;

  return {
    date: formatter.format(date.date),
    isPadding: date.isPadding,
    events: date.events.map(eventToTestEvent),
    isSelected: date.isSelected,
    isToday: date.isToday,
    hasEvents: date.hasEvents,
    hasEventsWithOverlap: date.hasEventsWithOverlap
  };
}

export function assertLastSubscriber(
  subscriber: jest.Mock,
  expectedState: TestState<string>,
  expectedEvent: DateGallerySubscriberEvent<string>
) {
  const lastCall = subscriber.mock.calls[subscriber.mock.calls.length - 1];
  const state = lastCall[0] as DateGallery<string>;
  const event = lastCall[1] as DateGallerySubscriberEvent<string>;

  assertState(state, expectedState);

  const eventCopy = { ...event };
  // @ts-ignore Just delete it
  delete eventCopy.time;

  const expectedEventCopy = { ...expectedEvent };
  // @ts-ignore Just delete it
  delete expectedEventCopy.time;

  expect(eventCopy).toEqual(expectedEventCopy);
}
