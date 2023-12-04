import { DateFrame } from './DateFrame';
import { DateFrameDate } from './DateFrameDate';
import { DateFrameEvent } from './DateFrameEvent';

/**
 * Configures the initial state of the `DateFrame`
 *
 * @since 1.6.0
 */
export type DateFrameConfig<T> = {
  /**
   * The range the `DateFrame` is going to show.
   *
   * Can be one of these modes: TODO
   *
   * Defaults to 'month-six-weeks'.
   *
   * @since 1.6.0
   */
  mode?: DateFrameMode;

  /**
   * Whether the `DateFrame` is in UTC mode.
   *
   * When the `DateFrame` is in UTC mode all dates are parsed as UTC.
   *
   * TODO: doc this
   *
   * TODO: implement this
   *
   * Defaults to `false` meaning the browsers local timezone is used.
   *
   * @since 1.60
   */
  isUtc?: boolean;

  /**
   * A date that will act as the initial date for the date frame.
   *
   * It will set the date frame to the "closest" date given the
   * `mode`.
   *
   * Can either be a Date instance, or a string which can be passed
   * to the Date constructor to make a date. TODO UTC
   *
   * For example if you use "2023-06-23" as the `anchorDate` and the
   * `mode` is set to 'year', the date frame will be the year 2023. If
   * for the same `anchorDate` the `mode` was set to `month-six-weeks`
   * the month of `June` would have been the date frame instead.
   *
   * Defaults to the current date.
   *
   * @since 1.6.0
   */
  initialDate?: Date | string;

  /**
   * What is to be considered the first day of the week, is used in
   * modes such as 'week' to determine on which day of the week to
   * start the frame.
   *
   * The `firstDayOfTheWeek` is a number between 0 and 6, were each
   * number represents a day of the week:
   *
   * 0 = Sunday
   * 1 = Monday
   * 2 = Tuesday
   * 3 = Wednesday
   * 4 = Thursday
   * 5 = Friday
   * 6 = Saturday
   *
   * Defaults to '0' which is 'sunday'.
   *
   * @since 1.6.0
   */
  firstDayOfWeek?: DateFrameDayOfWeek;

  /**
   * For how many items the `history` may contain in the `DateFrame`.
   *
   * Defaults to `0` meaning that it will not track history.
   *
   * @since 1.6.0
   */
  keepHistoryFor?: number;

  /**
   * The initial events the `DateFrame` will start out with. Events
   * in the sense of events on a calendar: birthdays / dentist
   * appointments etc.
   *
   * Defaults to `[]` for no events.
   *
   * @since 1.6.0
   */
  events?: DateFrameEventConfig<T>[];

  /**
   * The dates that are considered selected when the `DateFrame` is
   * initialized. Must be in the same format of the `dateFormat`.
   *
   * Defaults to `[]` for no events.
   *
   * @since 1.6.0
   */
  selectedDates?: (Date | string)[];

  /**
   * The number of frames that are visible at a time for the end user.
   *
   * This is useful for when you want to show a multiple frames at
   * the same time. For example if you an entire years worth of
   * `month-single-month` calendars you'd set the `numberOfFrames`
   * to `12`.
   *
   * Defaults to `1` for a single frame at a time.
   *
   * @since 1.6.0
   */
  numberOfFrames?: number;
};

/**
 * TODO docs
 *
 * @since 1.6.0
 */
export type DateFrameEventConfig<T> = {
  /**
   * The data for this event, "data" can be be anything from an
   * object, string, array etc etc. It is used to pass along data
   * to the event you might need to display the event, such as the
   * text for the event.
   *
   * By default the value is `undefined`.
   *
   * @since 1.6.0
   */
  data: T;

  /**
   * The start date of the event, includes the time.
   *
   * The `startDate` is inclusive: meaning if the event has a `startDate`
   * which is monday and an `endDate` on wednesday, the event runs on
   * monday, tuesday and wednesday.
   *
   * Can either be a Date instance, or a string which can be passed
   * to the Date constructor to make a date. TODO UTC
   *
   * TODO: string examples
   *
   * @since 1.6.0
   */
  startDate: Date | string;

  /**
   * The end date of the event, includes the time.
   *
   * The `endDate` is inclusive: meaning if the event has a `startDate`
   * which is monday and an `endDate` on wednesday, the event runs on
   * monday, tuesday and wednesday.
   *
   * Can either be a Date instance, or a string which can be passed
   * to the Date constructor to make a date. TODO UTC
   *
   * @since 1.6.0
   */
  endDate: Date | string;
};

// TODO doc
export type DateFrameDayOfWeek =
  | 0 // 'sunday'
  | 1 // 'monday'
  | 2 // 'tuesday'
  | 3 // 'wednesday'
  | 4 // 'thursday'
  | 5 // 'friday'
  | 6; // 'saturday';

  // TODO doc
export const DATE_FRAME_MODES = [
  'day',
  'week',
  'month',
  'month-six-weeks',
  'month-pad-to-week',
  'year'
] as const;

// TODO doc
export type DateFrameMode = typeof DATE_FRAME_MODES[number];

// TODO doc
export type DateFrameRange = {
  startDate: Date | string,
  endDate: Date | string
};

/**
 * The subscriber which is informed of all state changes the
 * DateFrame goes through.
 *
 * @param {DateFrame<T>} dateFrame The DateFrame which had changes.
 * @param {DateFrameSubscriberEvent<T>} event The event that occurred.
 *
 * @since 1.6.0
 */
export type DateFrameSubscriber<T> = (
  dateFrame: DateFrame<T>,
  event: DateFrameSubscriberEvent<T>
) => void;

/**
 * TODO
 *
 * @since 1.6.0
 */
export type DateFrameSubscriberEventType =
  | 'INITIALIZED'
  | 'FRAME_CHANGED'
  | 'MODE_CHANGED'
  | 'DATE_SELECTED'
  | 'DATE_SELECTED_MULTIPLE'
  | 'DATE_DESELECTED'
  | 'DATE_DESELECTED_MULTIPLE'
  | 'EVENT_ADDED'
  | 'EVENT_REMOVED'
  | 'EVENT_MOVED'

/**
 * Represents an event which happened in the DateFrame. Based
 * on the `type` you can determine which event occurred.
 *
 * @since 1.6.0
 */
export type DateFrameBaseEvent = {
  /**
   * Which event occurred
   *
   * @since 1.6.0
   */
  type: DateFrameSubscriberEventType;

  /**
   * The time the event occurred on as a Date object.
   *
   * @since 1.6.0
   */
  time: Date;
};

/**
 * Represents the initialization of the DateFrame
 *
 * @since 1.6.0
 */
export type DateFrameInitializedEvent = DateFrameBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'INITIALIZED';
};

/**
 * Represents the fact that the date frame has how changed, this
 * occurs when the frame is moved to the next or previous frame.
 *
 * @since 1.6.0
 */
export type DateFrameFrameChangedEvent<T> = DateFrameBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'FRAME_CHANGED';

  /**
   * The newly visible frames.
   *
   * @since 1.6.0
   */
  frames: DateFrameDate<T>[][];
};

/**
 * Represents the fact that a date has been selected.
 *
 * @since 1.6.0
 */
export type DateFrameDateSelectedEvent = DateFrameBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'DATE_SELECTED';

  /**
   * The date that was selected.
   *
   * @since 1.6.0
   */
  date: Date;
};

/**
 * Represents the fact that multiple dates have been selected.
 *
 * @since 1.6.0
 */
export type DateFrameDateSelectedMultipleEvent = DateFrameBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'DATE_SELECTED_MULTIPLE';

  /**
   * The dates that were selected.
   *
   * @since 1.6.0
   */
  dates: Date[];
};

/**
 * Represents the fact that a date has been deselected
 *
 * @since 1.6.0
 */
export type DateFrameDateDeselectedEvent = DateFrameBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'DATE_DESELECTED';

  /**
   * The date that was deselected.
   *
   * @since 1.6.0
   */
  date: Date;
};

/**
 * Represents the fact that multiple dates have been deselected
 *
 * @since 1.6.0
 */
export type DateFrameDateDeselectedMultipleEvent = DateFrameBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'DATE_DESELECTED_MULTIPLE';

  /**
   * The dates that were deselected.
   *
   * @since 1.6.0
   */
  dates: Date[];
};

/**
 * Represents the fact that an event has been added to the 
 * DateFrame.
 *
 * @since 1.6.0
 */
export type DateFrameEventAddedEvent<T> = DateFrameBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'EVENT_ADDED';

  /**
   * The event that was added
   *
   * @since 1.6.0
   */
  event: DateFrameEvent<T>;
};

/**
 * Represents the fact that an event has been removed from the 
 * DateFrame.
 *
 * @since 1.6.0
 */
export type DateFrameEventRemovedEvent<T> = DateFrameBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'EVENT_REMOVED';

  /**
   * The event that was removed
   *
   * @since 1.6.0
   */
  event: DateFrameEvent<T>;
};

/**
 * Represents the fact that an event was moved, it got either
 * a new start or end date.
 *
 * @since 1.6.0
 */
export type DateFrameEventMovedEvent<T> = DateFrameBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'EVENT_MOVED';

  /**
   * The event that was moved
   *
   * @since 1.6.0
   */
  event: DateFrameEvent<T>;
};

/**
 * Represents the fact that the date frames mode has changed.
 *
 * @since 1.6.0
 */
export type DateFrameModeChangedEvent<T> = DateFrameBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'MODE_CHANGED';

  /**
   * The new mode.
   *
   * @since 1.6.0
   */
  mode: DateFrameMode;

  /**
   * The newly visible frames.
   *
   * @since 1.6.0
   */
  frames: DateFrameDate<T>[][];
};

/**
 * A DateFrameSubscriberEvent represents an event happened in the DateFrame.
 * For example the insertion, removal, or activation of a
 * DateFrameContent<T>.
 *
 * @since 1.6.0
 */
export type DateFrameSubscriberEvent<T> =
  | DateFrameInitializedEvent
  | DateFrameFrameChangedEvent<T>
  | DateFrameDateSelectedEvent
  | DateFrameDateDeselectedEvent
  | DateFrameEventAddedEvent<T>
  | DateFrameEventRemovedEvent<T>
  | DateFrameModeChangedEvent<T>
  | DateFrameDateSelectedMultipleEvent
  | DateFrameDateDeselectedMultipleEvent
  | DateFrameEventMovedEvent<T>;