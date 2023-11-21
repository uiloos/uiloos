import { DateFrame } from './DateFrame';
import { DateFrameDate } from './DateFrameDate';

export type DateFrameDateRepresentation = {
  day: number;
  month: number;
  year: number;
};

export type DateFrameDateTime = DateFrameDateRepresentation & {
  hour: number;
  minute: number;
  seconds: number;
};


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
   * The format used for the dates as provided in the frame.
   *
   * Defaults to 'YYYY-MM-DD'.
   *
   * @since 1.6.0
   */
  dateFormat?: DateFrameDateFormat;

  /**
   * A date as a string in the same format as the `dateFormat`, it
   * acts as the initial date for the date frame.
   *
   * It will set the date frame to the "closest" date given the
   * `mode`.
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
  initialDate?: string;

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
  selectedDates?: string[];
};

type DateFrameEventConfig<T> = {
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
   * The date as a string of the `DateFrameDate` which it has within
   * the `contents`. In the format of the `DateFrame.dateFormat`.
   *
   * @since 1.6.0
   */
  date: string;
};

export type DateFrameDateFormat = 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'MM-DD-YYYY';

export type DateFrameDayOfWeek =
  | 0 // 'sunday'
  | 1 // 'monday'
  | 2 // 'tuesday'
  | 3 // 'wednesday'
  | 4 // 'thursday'
  | 5 // 'friday'
  | 6; // 'saturday';

export type DateFrameMode =
  | 'day'
  | 'week'
  | 'month-calendar-month'
  | 'month-six-weeks'
  | 'month-pad-to-week'
  | 'year';

type DateRep = {
  day: number;
  month: number;
   year: number;
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
  | 'DATE_SELECTED'
  | 'DATE_DESELECTED';

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
   * The new date frame.
   * 
   * @since 1.6.0
   */
  dates: DateFrameDate<T>[];
};

/**
 * Represents the fact that the date frame has how changed, this
 * occurs when the frame is moved to the next or previous frame.
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
  date: string
};

/**
 * Represents the fact that the date frame has how changed, this
 * occurs when the frame is moved to the next or previous frame.
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
  date: string
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
  | DateFrameDateDeselectedEvent;
