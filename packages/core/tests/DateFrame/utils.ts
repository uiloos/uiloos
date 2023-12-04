import {
  expect,
  jest,
} from '@jest/globals';

import { DateFrame, DateFrameDate, DateFrameEvent, DateFrameSubscriberEvent, DateFrameSubscriberEventType } from "../../src/DateFrame";


export const formatter = new Intl.DateTimeFormat('nl-Nl', {
  year: 'numeric',
  month: '2-digit',
  weekday: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/London', // +0 utc, but does have a summertime!
});

export type DateFrameSansDatesAndEvents<T> = Pick<
  DateFrame<T>,
  'history' | 'firstDayOfWeek' | 'mode' | 'isUTC'
>;

export type TestState<T> = DateFrameSansDatesAndEvents<T> & {
  firstFrame: TestDate<T>[];
  firstFrameEvents: TestEvent[];
  frames: TestDate<T>[][];
  events: TestEvent[];
  eventsPerFrame: TestEvent[][];
  selectedDates: string[];
};

export type TestEvent = {
  data: string;
  overlapsWith: string[];
  startDate: string;
  endDate: string;
};

export type TestDate<T> = Pick<
  DateFrameDate<T>,
  'isPadding' | 'isToday' | 'isSelected' | 'hasEvents'
> & {
  date: string;
  events: TestEvent[];
};

export function assertState(state: DateFrame<string>, expected: TestState<string>) {
  const callAsTestState: TestState<string> = {
    // maxActivationLimit: state.maxActivationLimit,
    // maxActivationLimitBehavior: state.maxActivationLimitBehavior,
    history: state.history,

    mode: state.mode,
    firstDayOfWeek: state.firstDayOfWeek,
    isUTC: state.isUTC,

    firstFrame: state.firstFrame.map(dateToTestDate),

    frames: state.frames.map((frame) => frame.map(dateToTestDate)),

    events: state.events.map(eventToTestEvent),
    firstFrameEvents: state.firstFrameEvents.map(eventToTestEvent),
    eventsPerFrame: state.eventsPerFrame.map((frameEvents) =>
      frameEvents.map(eventToTestEvent)
    ),
    selectedDates: state.selectedDates.map((date) => formatter.format(date)),
  };

  expect(callAsTestState).toEqual(expected);
}

export function eventToTestEvent(event: DateFrameEvent<string>): TestEvent {
  expect(event instanceof DateFrameEvent).toBe(true);

  return {
    data: event.data,
    startDate: formatter.format(event.startDate),
    endDate: formatter.format(event.endDate),

    // To prevent circular references (infinite loop) we only check the 'data'
    overlapsWith: event.overlapsWith.map((e) => {
      expect(e instanceof DateFrameEvent);
      return e.data;
    }),
  };
}

export function dateToTestDate(date: DateFrameDate<string>): TestDate<string> {
  expect(date instanceof DateFrameDate).toBe(true);

  return {
    date: formatter.format(date.date),
    isPadding: date.isPadding,
    events: date.events.map(eventToTestEvent),
    isSelected: date.isSelected,
    isToday: date.isToday,
    hasEvents: date.hasEvents,
  };
}

export function assertLastSubscriber(
  subscriber: jest.Mock,
  expectedState: TestState<string>,
  expectedEvent: DateFrameSubscriberEvent<string>
) {
  const lastCall = subscriber.mock.calls[subscriber.mock.calls.length - 1];
  const state = lastCall[0] as DateFrame<string>;
  const event = lastCall[1] as DateFrameSubscriberEvent<string>;

  assertState(state, expectedState);

  const eventCopy = { ...event };
  // @ts-ignore Just delete it
  delete eventCopy.time;

  const expectedEventCopy = { ...expectedEvent };
  // @ts-ignore Just delete it
  delete expectedEventCopy.time;

  expect(eventCopy).toEqual(expectedEventCopy);
}
