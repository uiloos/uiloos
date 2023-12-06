import { DateGallery } from './DateGallery';
import { DateGalleryDate } from './DateGalleryDate';
import { DateGalleryEvent } from './DateGalleryEvent';

/**
 * Configures the initial state of the `DateGallery`
 *
 * @since 1.6.0
 */
export type DateGalleryConfig<T> = {
  /**
   * The range the `DateGallery` is going to show.
   *
   * Can be one of these modes: TODO
   *
   * Defaults to 'month-six-weeks'.
   *
   * @since 1.6.0
   */
  mode?: DateGalleryMode;

  /**
   * Whether the `DateGallery` is in UTC mode.
   *
   * When the `DateGallery` is in UTC mode all dates are parsed as UTC.
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
  firstDayOfWeek?: DateGalleryDayOfWeek;

  /**
   * For how many items the `history` may contain in the `DateGallery`.
   *
   * Defaults to `0` meaning that it will not track history.
   *
   * @since 1.6.0
   */
  keepHistoryFor?: number;

  /**
   * The initial events the `DateGallery` will start out with. Events
   * in the sense of events on a calendar: birthdays / dentist
   * appointments etc.
   *
   * Defaults to `[]` for no events.
   *
   * @since 1.6.0
   */
  events?: DateGalleryEventConfig<T>[];

  /**
   * The dates that are considered selected when the `DateGallery` is
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

export type DateGalleryFrame<T> = {
  dates: DateGalleryDate<T>[];
  events: DateGalleryEvent<T>[];
};

/**
 * TODO docs
 *
 * @since 1.6.0
 */
export type DateGalleryEventConfig<T> = {
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
export type DateGalleryDayOfWeek =
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
export type DateGalleryMode = typeof DATE_FRAME_MODES[number];

// TODO doc
export type DateGalleryRange = {
  startDate: Date | string,
  endDate: Date | string
};

/**
 * The subscriber which is informed of all state changes the
 * DateGallery goes through.
 *
 * @param {DateGallery<T>} DateGallery The DateGallery which had changes.
 * @param {DateGallerySubscriberEvent<T>} event The event that occurred.
 *
 * @since 1.6.0
 */
export type DateGallerySubscriber<T> = (
  DateGallery: DateGallery<T>,
  event: DateGallerySubscriberEvent<T>
) => void;

/**
 * TODO
 *
 * @since 1.6.0
 */
export type DateGallerySubscriberEventType =
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
 * Represents an event which happened in the DateGallery. Based
 * on the `type` you can determine which event occurred.
 *
 * @since 1.6.0
 */
export type DateGalleryBaseEvent = {
  /**
   * Which event occurred
   *
   * @since 1.6.0
   */
  type: DateGallerySubscriberEventType;

  /**
   * The time the event occurred on as a Date object.
   *
   * @since 1.6.0
   */
  time: Date;
};

/**
 * Represents the initialization of the DateGallery
 *
 * @since 1.6.0
 */
export type DateGalleryInitializedEvent = DateGalleryBaseEvent & {
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
export type DateGalleryFrameChangedEvent<T> = DateGalleryBaseEvent & {
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
  frames: DateGalleryFrame<T>[];
};

/**
 * Represents the fact that a date has been selected.
 *
 * @since 1.6.0
 */
export type DateGalleryDateSelectedEvent = DateGalleryBaseEvent & {
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
export type DateGalleryDateSelectedMultipleEvent = DateGalleryBaseEvent & {
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
export type DateGalleryDateDeselectedEvent = DateGalleryBaseEvent & {
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
export type DateGalleryDateDeselectedMultipleEvent = DateGalleryBaseEvent & {
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
 * DateGallery.
 *
 * @since 1.6.0
 */
export type DateGalleryEventAddedEvent<T> = DateGalleryBaseEvent & {
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
  event: DateGalleryEvent<T>;
};

/**
 * Represents the fact that an event has been removed from the 
 * DateGallery.
 *
 * @since 1.6.0
 */
export type DateGalleryEventRemovedEvent<T> = DateGalleryBaseEvent & {
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
  event: DateGalleryEvent<T>;
};

/**
 * Represents the fact that an event was moved, it got either
 * a new start or end date.
 *
 * @since 1.6.0
 */
export type DateGalleryEventMovedEvent<T> = DateGalleryBaseEvent & {
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
  event: DateGalleryEvent<T>;
};

/**
 * Represents the fact that the date frames mode has changed.
 *
 * @since 1.6.0
 */
export type DateGalleryModeChangedEvent<T> = DateGalleryBaseEvent & {
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
  mode: DateGalleryMode;

  /**
   * The newly visible frames.
   *
   * @since 1.6.0
   */
  frames: DateGalleryFrame<T>[];
};

/**
 * A DateGallerySubscriberEvent represents an event happened in the DateGallery.
 * For example the insertion, removal, or activation of a
 * DateGalleryContent<T>.
 *
 * @since 1.6.0
 */
export type DateGallerySubscriberEvent<T> =
  | DateGalleryInitializedEvent
  | DateGalleryFrameChangedEvent<T>
  | DateGalleryDateSelectedEvent
  | DateGalleryDateDeselectedEvent
  | DateGalleryEventAddedEvent<T>
  | DateGalleryEventRemovedEvent<T>
  | DateGalleryModeChangedEvent<T>
  | DateGalleryDateSelectedMultipleEvent
  | DateGalleryDateDeselectedMultipleEvent
  | DateGalleryEventMovedEvent<T>;