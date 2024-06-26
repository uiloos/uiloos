import { DateGallery } from './DateGallery';
import { DateGalleryDate } from './DateGalleryDate';
import { DateGalleryEvent } from './DateGalleryEvent';

/**
 * Configures the initial state of the `DateGallery`.
 *
 * @since 1.6.0
 */
export type DateGalleryConfig<T> = {
  /**
   * The mode the `DateGallery` is going to start on.
   *
   * Can be one of these modes:
   *
   * 1. 'day': a single day per frame.
   *
   * 2. 'week': seven days per frame, starting at the configured
   *    `firstDayOfWeek`.
   *
   * 3. 'month': all days within a calendar month per frame. A frame
   *     will then always start on the first of the month, and end on
   *     the last day of the month.
   *
   * 4. 'month-six-weeks': all days within a calendar month, but padded
   *    out to six weeks. Meaning that there are always 42 days in the
   *    frame. Useful for when you want you calendar / datepicker to be
   *    visually stable height wise. Starts the days on the configured 
   *    `firstDayOfWeek`.
   *
   * 5. 'month-pad-to-week': all days within a calendar month, but
   *    padded out so it always contains full weeks. Only the smallest 
   *    amount of padding is added to get to the full weeks. Starts 
   *    the days on the configured `firstDayOfWeek`. For example if
   *    the week is configured to start on sunday, and the month starts 
   *    on a tuesday, it will add monday and sunday.
   *
   * 6. 'year': a frame will contain all 365 days (or 366 when a leap year)
   *     within a year.
   *
   * Defaults to 'month-six-weeks'.
   *
   * @since 1.6.0
   */
  mode?: DateGalleryMode;

  /**
   * Whether the `DateGallery` is in UTC mode or not.
   *
   * When the `DateGallery` is in UTC mode all dates that are given
   * to you via the `DateGallery` through a `DateGalleryDate` are
   * given in UTC.
   *
   * Also all operations on `Date` objects within the `DateGallery`
   * or done via the `UTC` variants.
   *
   * UTC is useful for when you want all datepickers / calendars
   * to look the same al around the world, which is not very often.
   *
   * Defaults to `false` meaning the browsers local offset is used.
   *
   * @since 1.6.0
   */
  isUTC?: boolean;

  /**
   * A date that will act as the initial anchor date for the date
   * frame.
   *
   * It will set the date frame to the "closest" date given the
   * `mode`.
   *
   * Can either be a `Date` instance, or a `string` which can be
   * passed to the `Date` constructor to make a date.
   *
   * For example if you use "2023-06-23" as the `initialDate` and the
   * `mode` is set to 'year', the date frame will be the year 2023. If
   * for the same `initialDate` the `mode` was set to `month-six-weeks`
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
   * The `firstDayOfWeek` is a number between 0 and 6, were each
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
   * How many dates can be selected at the same time.
   *
   * When the value of `limit` is `false` there is no limit to the
   * number of active items.
   *
   * Defaults to `false`.
   *
   * @since 1.6.0
   */
  maxSelectionLimit?: number | false;

  /**
   * How the limit is enforced. In other words what the behavior
   * should be when the limit is surpassed.
   *
   * The modes are strings which can be the following values:
   *
   * 1. 'circular': the first date that was selected which will be 
   *    removed so the last selected date  can be added without 
   *    violating the limit. This basically means that the first one in 
   *    is the first one out.
   *
   * 2. 'error': An error is thrown whenever the limit is surpassed,
   *    the error is called the `DateGallerySelectionLimitReachedError`.
   *
   * 3. 'ignore': Nothing happens when an date is selected and the limit
   *    is reached. The date is simply not selected, but no error is
   *    thrown.
   *
   * Defaults to 'circular'.
   *
   * @since 1.6.0
   */
  maxSelectionLimitBehavior?: DateGalleryMaxSelectionLimitBehavior;

  /**
   * The dates that are considered selected when the `DateGallery` is
   * initialized.
   * 
   * The dates you provide will be converted to midnight.
   *
   * Are passed through the `canSelect` predicate any date that 
   * cannot be selected is filtered out of the array.
   * 
   * Defaults to `[]` for no events.
   *
   * @since 1.6.0
   */
  selectedDates?: (Date | string)[];

  /**
   * An optional callback predicate that is given a `DateGalleryDate`
   * and must return a boolean, when the boolean is `true` that date
   * can be selected, when `false` the date cannot be selected.
   * 
   * Useful for when wanting to implement a min and max date, or 
   * prevent the weekends from being selected, or dates that have
   * events.
   * 
   * This callback is called when:
   * 
   * 1. A `DateGalleryDate` is constructed for a frame to determine
   *    the value of the `DateGalleryDate`s `canBeSelected` boolean.
   *    This happens when the frame changes, or when an event is 
   *    added / removed, or a date is selected / deselected.
   * 
   * 2. Whenever a date is about to get selected, to check if that
   *    date can be selected. Happens for example when `selectDate`
   *    or `selectRange` etc etc is called.
   * 
   * IMPORTANT: try to make the predicate pure to make it easier to 
   * reason about. Otherwise you might get a scenario in which a 
   * `DateGalleryDate`s `canBeSelected` is `true`, but can still be 
   * selected via `selectDate`.
   * 
   * Defaults to `undefined` meaning all dates an be selected.
   * 
   * @since 1.6.0
   */
  canSelect?: DateGalleryCanSelectPredicate<T>

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
 * Represents a callback predicate which is given a `DateGalleryDate`
 * and needs to return a boolean, when `true` is returned the 
 * `DateGalleryDate` can be selected, when `false` is returned 
 * the `DateGalleryDate` cannot be selected.
 *
 * @param {DateGalleryDate<T>} dateGalleryDate The DateGalleryDate for which this predicate will determine if it can be selected.
 * @returns {boolean} Whether or not the DateGalleryDate can be selected.
 * 
 * @since 1.6.0
 */
export type DateGalleryCanSelectPredicate<T> = (dateGalleryDate: DateGalleryDate<T>) => boolean 

/**
 * The configuration object for the `DateGallery`'s `changeConfig`
 * method.
 *
 * All properties are optional and can be used in any combination.
 * Meaning you can change the `mode` and `numberOfFrames`, or the
 * `mode` and `initialDate` or just the `numberOfFrames`.
 *
 * @since 1.6.0
 */
export type DateGalleryChangeConfig = {
  /**
   * The mode the `DateGallery` is going to start on.
   *
   * Can be one of these modes:
   *
   * 1. 'day': a single day per frame.
   *
   * 2. 'week': seven days per frame, starting at the configured
   *    `firstDayOfWeek`.
   *
   * 3. 'month': all days within a calendar month per frame. A frame
   *     will then always start on the first of the month, and end on
   *     the last day of the month.
   *
   * 4. 'month-six-weeks': all days within a calendar month, but padded
   *    out to six weeks. Meaning that there are always 42 days in the
   *    frame. Useful for when you want you calendar / datepicker to be
   *    visually stable height wise. Starts the days on the configured 
   *    `firstDayOfWeek`.
   *
   * 5. 'month-pad-to-week': all days within a calendar month, but
   *    padded out so it always contains full weeks. Only the smallest 
   *    amount of padding is added to get to the full weeks. Starts 
   *    the days on the configured `firstDayOfWeek`. For example if
   *    the week is configured to start on sunday, and the month starts 
   *    on a tuesday, it will add monday and sunday.
   *
   * 6. 'year': a frame will contain all 365 days (or 366 when a leap year)
   *     within a year.
   *
   * Defaults to `undefined` meaning the mode is not changed.
   *
   * @since 1.6.0
   */
  mode?: DateGalleryMode;

  /**
   * An optional date that will act as the initial anchor date
   * for the date frame.
   *
   * When no `date` is provided the DateGallery will move to the
   * `anchorDate` of the `firstFrame`.
   *
   * Some examples:
   *
   * 1. When going from `day` to `year` the year will be set to the
   *    year of the `anchorDate`.
   *
   * 2. When moving from `year` to `month` it will go to January
   *    1st of the year of the `anchorDate`
   *
   * 3. When moving from `week` to `month` it will go to the first
   *    of the month from the start of the week.
   *
   * Can either be a `Date` instance, or a `string` which can be
   * passed to the `Date` constructor to make a date.
   *
   * For example if you use "2023-06-23" as the `initialDate` and the
   * `mode` is set to 'year', the date frame will be the year 2023. If
   * for the same `initialDate` the `mode` was set to `month-six-weeks`
   * the month of `June` would have been the date frame instead.
   *
   * Defaults `undefined` meaning the current anchor date is used.
   *
   * @since 1.6.0
   */
  initialDate?: Date | string;

  /**
   * The number of frames that are visible at a time for the end user.
   *
   * This is useful for when you want to show a multiple frames at
   * the same time. For example if you an entire years worth of
   * `month-single-month` calendars you'd set the `numberOfFrames`
   * to `12`.
   *
   * Defaults to `undefined` meaning the current `numberOfFrames`
   * is used
   *
   * @since 1.6.0
   */
  numberOfFrames?: number;
};

/**
 * Represents a frame within the `DateGallery` it is an object
 * containing all dates and events that belong on the frame.
 *
 * @since 1.6.0
 */
export type DateGalleryFrame<T> = {
  /**
   * All dates that belong to this frame.
   *
   * @since 1.6.0
   */
  dates: DateGalleryDate<T>[];

  /**
   * All events that occur within this frame
   *
   * @since 1.6.0
   */
  events: DateGalleryEvent<T>[];

  /**
   * The date this frame is anchored to.
   *
   * For month based modes it is the first date of the month, for
   * `'week'` it is the first day of the week, for `'year'` it is
   * the first day of the year.
   *
   * Basically the same as the first date in the `dates` array which
   * is not a padded date.
   *
   * @since 1.6.0
   */
  anchorDate: Date;
};

/**
 * Holds the configuration of an event which is placed in the
 * `DateGallery`. From this configuration the actual
 * `DateGalleryEvent` is created.
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
   * to the `Date` constructor to make a date.
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
   * to the `Date` constructor to make a date.
   *
   * @since 1.6.0
   */
  endDate: Date | string;
};

/**
 * Represents all valid values that can be given to the
 * `DateGalleryConfig`s `firstDayOfWeek` property.
 *
 * @since 1.6.0
 */
export type DateGalleryDayOfWeek =
  | 0 // 'sunday'
  | 1 // 'monday'
  | 2 // 'tuesday'
  | 3 // 'wednesday'
  | 4 // 'thursday'
  | 5 // 'friday'
  | 6; // 'saturday';

/**
 * An array of strings containing  all predefined modes of the
 * `DateGallery`.
 *
 * @see DateGalleryMode
 * @since 1.6.0
 */
export const DATE_GALLERY_MODES = [
  'day',
  'week',
  'month',
  'month-six-weeks',
  'month-pad-to-week',
  'year',
] as const;

/**
 * All predefined modes of the `DateGallery`:
 *
 * 1. 'day': a single day per frame.
 *
 * 2. 'week': seven days per frame, starting at the configured
 *    `firstDayOfWeek`.
 *
 * 3. 'month': all days within a calendar month per frame. A frame
 *     will then always start on the first of the month, and end on
 *     the last day of the month.
 *
 * 4. 'month-six-weeks': all days within a calendar month, but padded
 *    out to six weeks. Meaning that there are always 42 days in the
 *    frame. Useful for when you want you calendar / datepicker to be
 *    visually stable height wise. Starts the days on the configured 
 *    `firstDayOfWeek`.
 *
 * 5. 'month-pad-to-week': all days within a calendar month, but
 *    padded out so it always contains full weeks. Only the smallest 
 *    amount of padding is added to get to the full weeks. Starts 
 *    the days on the configured `firstDayOfWeek`. For example if
 *    the week is configured to start on sunday, and the month starts 
 *    on a tuesday, it will add monday and sunday.
 *
 * 6. 'year': a frame will contain all 365 days (or 366 when a leap year)
 *     within a year.
 *
 * @since 1.6.0
 */
export type DateGalleryMode = (typeof DATE_GALLERY_MODES)[number];

/**
 * Describes all the behaviors for when the selection limit of the 
 * DateGallery is surpassed.
 *
 * 1. 'circular': the first date that was selected which will be 
 *    removed so the last selected date  can be added without 
 *    violating the limit. This basically means that the first one in 
 *    is the first one out.
 *
 * 2. 'error': An error is thrown whenever the limit is surpassed,
 *    the error is called the `DateGallerySelectionLimitReachedError`.
 *
 * 3. 'ignore': Nothing happens when an date is selected and the limit
 *    is reached. The date is simply not selected, but no error is
 *    thrown.
 * 
 * @since 1.6.0
 */
export type DateGalleryMaxSelectionLimitBehavior =
  | 'circular'
  | 'ignore'
  | 'error';

/**
 * Represents a range of dates, from a start date to and end date.
 *
 * @since 1.6.0
 */
export type DateGalleryRange = {
  /**
   * The start date of the range, includes the time.
   *
   * The `startDate` is inclusive: meaning if the event has a `startDate`
   * which is monday and an `endDate` on wednesday, the range runs on
   * monday, tuesday and wednesday.
   *
   * Can either be a Date instance, or a string which can be passed
   * to the `Date` constructor to make a date.
   *
   * @since 1.6.0
   */
  startDate: Date | string;

  /**
   * The end date of the range, includes the time.
   *
   * The `endDate` is inclusive: meaning if the event has a `startDate`
   * which is monday and an `endDate` on wednesday, the range runs on
   * monday, tuesday and wednesday.
   *
   * Can either be a Date instance, or a string which can be passed
   * to the `Date` constructor to make a date.
   *
   * @since 1.6.0
   */
  endDate: Date | string;
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
 * Represents whether the `DateGallery` changed frames, added an
 * event, selected a date etc etc.
 *
 * @since 1.6.0
 */
export type DateGallerySubscriberEventType =
  | 'INITIALIZED'
  | 'FRAME_CHANGED'
  | 'CONFIG_CHANGED'
  | 'DATE_SELECTED'
  | 'DATE_SELECTED_MULTIPLE'
  | 'DATE_DESELECTED'
  | 'DATE_DESELECTED_MULTIPLE'
  | 'EVENT_ADDED'
  | 'EVENT_REMOVED'
  | 'EVENT_MOVED'
  | 'EVENT_DATA_CHANGED';

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

   /**
   * The date which was deselected, will be `null` when no value
   * was deselected as part of the selection.
   * 
   * A deselection will only happen as part of a selection when 
   * `maxSelectionLimit` is set to a `number` and 
   * `maxSelectionLimitBehavior` is set to `circular`.
   *
   * @since 1.6.0
   */
   deselectedDate: Date | null;
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

   /**
   * The dates which were deselected.
   * 
   * A deselection will only happen as part of a selection when 
   * `maxSelectionLimit` is set to a `number` and 
   * `maxSelectionLimitBehavior` is set to `circular`.
   *
   * @since 1.6.0
   */
   deselectedDates: Date[]
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
 * Represents a changing of the data of an event.
 *
 * @since 1.6.0
 */
export type DateGalleryEventDataChangedEvent<T> = DateGalleryBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'EVENT_DATA_CHANGED';

  /**
   * The event which had its data changed
   *
   * @since 1.6.0
   */
  event: DateGalleryEvent<T>;

  /**
   * The new data for the DateGalleryEvent
   *
   * @since 1.6.0
   */
  data: T;
};

/**
 * Represents a changing in the DateGallery's `mode`, `initialDate`,
 * or `numberOfFrames`
 *
 * @since 1.6.0
 */
export type DateGalleryConfigChangedEvent<T> = DateGalleryBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'CONFIG_CHANGED';

  /**
   * The current `mode` the DateGallery now has.
   *
   * @since 1.6.0
   */
  mode: DateGalleryMode;

  /**
   * The current anchor date the firstFrame of the DateGallery now has.
   *
   * @since 1.6.0
   */
  anchorDate: Date;

  /**
   * The current `numberOfFrames` the DateGallery now has.
   *
   * @since 1.6.0
   */
  numberOfFrames: number;

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
  | DateGalleryDateSelectedMultipleEvent
  | DateGalleryDateDeselectedMultipleEvent
  | DateGalleryEventMovedEvent<T>
  | DateGalleryEventDataChangedEvent<T>
  | DateGalleryConfigChangedEvent<T>;
