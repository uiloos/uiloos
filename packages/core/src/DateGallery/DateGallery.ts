/*
  This import will be removed during the minification build so terser
  leaves it alone. Make sure that it is not committed into git as an 
  uncommented line!

  If you run build and the line below is commented you will get
  this error: `Cannot find name 'uiloosLicenseChecker'`.

  See rollup.minification.config.js for more information
*/
import * as uiloosLicenseChecker from '../license/license';

import { Observable, UnsubscribeFunction } from '../generic/types';
import { _History } from '../private/History';
import { _Observer } from '../private/Observer';
import {
  DATE_GALLERY_MODES,
  DateGalleryCanSelectPredicate,
  DateGalleryChangeConfig,
  DateGalleryConfig,
  DateGalleryConfigChangedEvent,
  DateGalleryDateDeselectedEvent,
  DateGalleryDateDeselectedMultipleEvent,
  DateGalleryDateSelectedEvent,
  DateGalleryDateSelectedMultipleEvent,
  DateGalleryDayOfWeek,
  DateGalleryEventAddedEvent,
  DateGalleryEventConfig,
  DateGalleryEventDataChangedEvent,
  DateGalleryEventMovedEvent,
  DateGalleryEventRemovedEvent,
  DateGalleryFrame,
  DateGalleryFrameChangedEvent,
  DateGalleryInitializedEvent,
  DateGalleryMaxSelectionLimitBehavior,
  DateGalleryMode,
  DateGalleryRange,
  DateGallerySubscriber,
  DateGallerySubscriberEvent,
} from './types';
import { DateGalleryDate } from './DateGalleryDate';
import { _hasOverlap } from './utils';
import { DateGalleryEvent } from './DateGalleryEvent';
import { DateGalleryEventInvalidRangeError } from './errors/DateGalleryEventInvalidRangeError';
import { DateGalleryEventNotFoundError } from './errors/DateGalleryEventNotFoundError';
import { DateGalleryFirstDayOfWeekError } from './errors/DateGalleryFirstDayOfWeekError';
import { DateGalleryInvalidDateError } from './errors/DateGalleryInvalidDateError';
import { DateGalleryModeError } from './errors/DateGalleryModeError';
import { DateGalleryNumberOfFramesError } from './errors/DateGalleryNumberOfFramesError';
import { DateGallerySelectionLimitReachedError } from './errors/DateGallerySelectionLimitReachedError';

/**
 * A DateGallery is a class that represents a frame of dates, a frame
 * of dates is a sequence of chronologically sequential dates of a
 * certain length.
 *
 * The idea is that whenever you are creating components that use
 * sequences of dates, so for example: date pickers, range selectors,
 * or calendars, that you can use the DateGallery class to handle the
 * dates for you.
 *
 * The DateGallery comes in various modes:
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
 * The frame part of a DateGallery is what is visually displayed to a
 * user, when making a monthly based calendar you are making a whole
 * year available but only show one month at a time. The month that
 * you show is a "frames", the dates that are visually displayed.
 *
 * The DateGallery provides methods for navigating through frames,
 * for example you can go to the next / previous frame.
 *
 * You can ask the DateGallery for multiple frames at the same time
 * by stetting the `numberOfFrames` property, this allows you to for
 * example display three months at the same time, or five years at
 * the same time.
 *
 * DateGallery also supports having events such as birthdays or
 * holidays. For each "frame" that the DateGallery provides it will
 * also tell you which events fall on that frame. Events also know
 * if they are overlapping with other events.
 *
 * Finally the DateGallery can help you select dates. It will also
 * put this information in each frame so you know which dates are
 * selected.
 *
 * @since 1.6.0
 */
export class DateGallery<T>
  implements Observable<DateGallery<T>, DateGallerySubscriberEvent<T>>
{
  /**
   * Whether or not to inform subscribers of changes / record history.
   * Used in the `initialize` to temporarily stop subscriptions running
   * the initial activation, and altering the history.
   */
  private _isInitializing = false;

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
   * @since 1.60
   */
  public isUTC = false;

  /**
   * The frames of dates that are currently visible to the user.
   *
   * @since 1.6.0
   */
  public readonly frames: DateGalleryFrame<T>[] = [];

  /**
   * The first frame of dates that is visible to the user.
   *
   * Is a shortcut to the first frame in the `frames` property.
   *
   * If `numberOfFrames` is 1 this will be the only visible frame.
   *
   * @since 1.6.0
   */
  public firstFrame: DateGalleryFrame<T> = {
    dates: [],
    events: [],
    anchorDate: new Date(),
  };

  /**
   * The number of frames that are visible at a time for the end user.
   *
   * This is useful for when you want to show a multiple frames at
   * the same time. For example if you an entire years worth of
   * `month-single-month` calendars you'd set the `numberOfFrames`
   * to `12`.
   *
   * @since 1.6.0
   */
  public numberOfFrames = 1;

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
  public maxSelectionLimit: number | false = false;

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
  public maxSelectionLimitBehavior: DateGalleryMaxSelectionLimitBehavior =
    'circular';

  /**
   * All dates which are currently considered selected.
   *
   * All dates will have their time set at midnight.
   * 
   * The array is not sorted, the items will appear in insertion 
   * order.
   *
   * @since 1.6.0
   */
  public readonly selectedDates: Date[] = [];

  public _canSelect: DateGalleryCanSelectPredicate<T> | undefined = undefined;

  /**
   * All events, such as birthdays, meetings etc that are associated
   * with this `DateGallery`.
   *
   * Is sorted from old to new, events that appear earlier in the
   * array are earlier than events that appear later in the array.
   *
   * @since 1.6.0
   */
  public readonly events: DateGalleryEvent<T>[] = [];

  /**
   * The mode the `DateGallery` is on.
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
   *    visually stable height wise. Starts the days on the 
   *    configured `firstDayOfWeek`.
   *
   * 5. 'month-pad-to-week': all days within a calendar month, but
   *    padded out to the closest `firstDayOfWeek`.
   *
   *    For example given that firstDayOfWeek is set to 0 / Sunday:
   *    if the first day of the month starts on Wednesday it will pad to
   *    the previous Sunday of the previous month.
   *
   *    If the month ends on a friday, it will add the next saturday
   *    of the next month.
   *
   *    Starts the days on the configured `firstDayOfWeek`.
   *
   * 6. 'year': a frame will contain all 365 days (or 366 when a leap year)
   *     within a year.
   *
   * @since 1.6.0
   */
  public mode: DateGalleryMode = 'month-six-weeks';

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
   * @since 1.6.0
   */
  public firstDayOfWeek: DateGalleryDayOfWeek = 0;

  /*
    The anchorDate is a reference to what the starting date of a 
    `mode` is.
  */
  private _anchorDate = new Date();

  private _history: _History<DateGallerySubscriberEvent<T>> = new _History();

  /**
   * Contains the history of the changes in the contents array.
   *
   * Tracks 11 types of changes:
   *
   *  1. INITIALIZED: fired when DateGallery is initialized.
   *
   *  2. FRAME_CHANGED: fired when the frames changes.
   *
   *  3. CONFIG_CHANGED: fires when the config is changed.
   *
   *  4. DATE_SELECTED: fires when a date is selected.
   *
   *  5. DATE_SELECTED_MULTIPLE: fires when multiple dates are selected.
   *
   *  6. DATE_DESELECTED: fires when a date is deselected.
   *
   *  7. DATE_DESELECTED_MULTIPLE: fires when multiple dates are
   *     deselected.
   *
   *  8. EVENT_ADDED: fires when an event such as a birthday /
   *     appointment is added.
   *
   *  9. EVENT_REMOVED:  fires when an event such as a birthday /
   *     appointment is removed.
   *
   *  10. EVENT_MOVED':  fires when an event such as a birthday /
   *      appointment is moved.
   *
   *  11. EVENT_MOVED':  fires when an event such as a birthday /
   *      appointment has its data changed.
   *
   * Goes only as far back as configured in the `Config` property
   * `keepHistoryFor`, to prevent an infinitely growing history.
   * Note that by default no history is kept, as `keepHistoryFor`
   * is zero by default.
   *
   * The last item in the `history` is the current active item. The
   * further to the left the further in the past you go.
   *
   * This means that a history at index 0 is further in the past than
   * an item at index 1.
   *
   * @since 1.6.0
   */
  public readonly history: DateGallerySubscriberEvent<T>[] =
    this._history._events;

  private _observer: _Observer<DateGallery<T>, DateGallerySubscriberEvent<T>> =
    new _Observer();

  /**
   * Creates an DateGallery based on the DateGalleryConfig config.
   *
   * You can also optionally provide an subscriber so you can get
   * informed of the changes happening to the DateGallery.
   *
   * @param {DateGalleryConfig<T>} config The initial configuration of the DateGallery.
   * @param {DateGallerySubscriber<T> | undefined} subscriber An optional subscriber which responds to changes in the DateGallery.
   * @throws {DateGalleryEventInvalidRangeError} an events start date must lie before on on the end date.
   * @throws {DateGalleryFirstDayOfWeekError} the configured day of the week must be between 0 and 6 inclusive.
   * @throws {DateGalleryInvalidDateError} dates provided must be valid dates
   * @throws {DateGalleryModeError} the mode must be one of the predefined modes
   * @throws {DateGallerySelectionLimitReachedError} thrown when maxSelectionLimit is exceeded, and maxSelectionLimitBehavior is "error".
   * @since 1.6.0
   */
  constructor(
    config: DateGalleryConfig<T> = {},
    subscriber?: DateGallerySubscriber<T>
  ) {
    uiloosLicenseChecker.licenseChecker._checkLicense();

    if (subscriber) {
      this.subscribe(subscriber);
    }

    this._doInitialize(config, 'constructor');
  }

  /**
   * Subscribe to changes of the DateGallery. The function you
   * provide will get called whenever changes occur in the
   * DateGallery.
   *
   * Returns an unsubscribe function which when called will unsubscribe
   * from the DateGallery.
   *
   * @param {DateGallerySubscriber<T>} subscriber The subscriber which responds to changes in the DateGallery.
   * @returns {UnsubscribeFunction} A function which when called will unsubscribe from the DateGallery.
   *
   * @since 1.6.0
   */
  public subscribe(subscriber: DateGallerySubscriber<T>): UnsubscribeFunction {
    return this._observer._subscribe(subscriber);
  }

  /**
   * Unsubscribe the subscriber so it no longer receives changes / updates
   * of the state changes of the DateGallery.
   *
   * @param {DateGallerySubscriber<T>} subscriber The subscriber which you want to unsubscribe.
   *
   * @since 1.6.0
   */
  public unsubscribe(subscriber: DateGallerySubscriber<T>): void {
    this._observer._unsubscribe(subscriber);
  }

  /**
   * Unsubscribes all subscribers at once, all subscribers will no
   * longer receives changes / updates of the state changes of
   * the DateGallery.
   *
   * @since 1.6.0
   */
  public unsubscribeAll(): void {
    this._observer._clear();
  }

  /**
   * Initializes the DateGallery based on the config provided. This can
   * effectively reset the DateGallery when called, including the
   * frames and history.
   *
   * @param {DateGalleryConfig<T>} config The new configuration which will override the old one
   * @throws {DateGalleryEventInvalidRangeError} an events start date must lie before on on the end date.
   * @throws {DateGalleryFirstDayOfWeekError} the configured day of the week must be between 0 and 6 inclusive.
   * @throws {DateGalleryInvalidDateError} dates provided must be valid dates
   * @throws {DateGalleryModeError} the mode must be one of the predefined modes
   * @throws {DateGalleryNumberOfFramesError} numberOfFrames must be a positive number when defined
   * @throws {DateGallerySelectionLimitReachedError} thrown when maxSelectionLimit is exceeded, and maxSelectionLimitBehavior is "error".
   * @since 1.6.0
   */
  public initialize(config: DateGalleryConfig<T>): void {
    this._doInitialize(config, 'initialize');
  }

  private _doInitialize(config: DateGalleryConfig<T>, method: string): void {
    // Ignore changes for now, we will restore subscriber at the end
    // of the initialization process.
    this._isInitializing = true;

    this.isUTC = config.isUTC !== undefined ? config.isUTC : false;

    this.mode = config.mode ? config.mode : 'month-six-weeks';
    this._checkMode(this.mode);

    this.firstDayOfWeek = config.firstDayOfWeek ? config.firstDayOfWeek : 0;
    if (this.firstDayOfWeek < 0 || this.firstDayOfWeek > 6) {
      throw new DateGalleryFirstDayOfWeekError();
    }

    this.numberOfFrames =
      config.numberOfFrames !== undefined ? config.numberOfFrames : 1;
    if (this.numberOfFrames <= 0) {
      throw new DateGalleryNumberOfFramesError();
    }

    this.maxSelectionLimit =
      config.maxSelectionLimit !== undefined ? config.maxSelectionLimit : false;

    this.maxSelectionLimitBehavior =
      config.maxSelectionLimitBehavior !== undefined
        ? config.maxSelectionLimitBehavior
        : 'circular';

    this._anchorDate = config.initialDate
      ? this._toDate(config.initialDate, method, 'initialDate')
      : new Date();

    // Now drag the anchorDate to midnight, toMidnight handles UTC
    this._toMidnight(this._anchorDate);

    // Second move the anchorDate to the closest start date of the fame
    this._dragAnchor();

    // Empty the contents first before assigning them, so re-init
    // works with a new empty content.
    this.events.length = 0;
    this.selectedDates.length = 0;

    // Before setting the selectedDates update the _canSelect
    this._canSelect = config.canSelect;

    // First set the selectedDates
    if (config.selectedDates) {
      config.selectedDates.forEach((s) => {
        this.selectDate(this._toDate(s, method, 'selectedDates'));
      });
    }

    // Second set the events.
    if (config.events) {
      config.events.forEach((config) => {
        this._doAddEvent(config, method);
      });

      this.events.forEach((e) => {
        e._recalculate();
      });
    }

    // Finally set the dates, now that the events and selected dates are set
    this._buildFrames();

    // Configure history
    this._history._events.length = 0;
    this._history._setKeepHistoryFor(config.keepHistoryFor);

    // Now start sending out changes.
    this._isInitializing = false;

    const event: DateGalleryInitializedEvent = {
      type: 'INITIALIZED',
      time: new Date(),
    };

    this._inform(event);
  }

  /**
   * Changes the configuration of the DateGallery, allowing you
   * to change the `mode` the initial date and `numberOfFrames`.
   *
   * All properties are optional and can be used in any combination.
   * Meaning you can change the `mode` and `numberOfFrames`, or the
   * `mode` and `initialDate` or just the `numberOfFrames`.
   *
   * Note: the `events` and `selectedDates` are kept as is.
   *
   * @param {DateGalleryChangeConfig} config The new configuration.
   * @throws {DateGalleryModeError} the mode must be one of the predefined modes
   * @throws {DateGalleryInvalidDateError} the initialDate when provided must be valid date
   * @throws {DateGalleryNumberOfFramesError} numberOfFrames must be a positive number when defined
   * @since 1.6.0
   */
  public changeConfig(config: DateGalleryChangeConfig): void {
    // When no new configs are provided do nothing.
    if (
      config.initialDate === undefined &&
      config.mode === undefined &&
      config.numberOfFrames === undefined
    ) {
      return;
    }

    let changed = false;
    let drag = false;

    const method = 'changeConfig';

    if (config.mode !== undefined) {
      this._checkMode(config.mode);

      if (this.mode !== config.mode) {
        this.mode = config.mode;
        changed = true;
        drag = true;
      }
    }

    if (config.initialDate !== undefined) {
      const date = this._toDate(config.initialDate, method, 'initialDate');
      this._toMidnight(date);

      if (!this._sameDay(date, this._anchorDate)) {
        this._anchorDate = date;
        changed = true;
        drag = true;
      }
    }

    if (config.numberOfFrames !== undefined) {
      if (config.numberOfFrames <= 0) {
        throw new DateGalleryNumberOfFramesError();
      }

      if (this.numberOfFrames !== config.numberOfFrames) {
        this.numberOfFrames = config.numberOfFrames;
        changed = true;
      }
    }

    if (changed) {
      if (drag) {
        this._dragAnchor();
      }

      this._buildFrames();

      const event: DateGalleryConfigChangedEvent<T> = {
        type: 'CONFIG_CHANGED',
        mode: this.mode,
        anchorDate: new Date(this._anchorDate),
        numberOfFrames: this.numberOfFrames,
        frames: this.frames,
        time: new Date(),
      };

      this._inform(event);
    }
  }

  /**
   * Changes the anchor date of the DateGallery to today.
   *
   * @since 1.6.0
   */
  public today() {
    this.changeConfig({
      initialDate: new Date(),
    });
  }

  private _buildFrames(inform = false): void {
    this.frames.length = 0;

    /*
      We need to restore to whatever the anchor was at the end of
     `buildFrames`, the reason for this is as follows: 
     
     Say you have a year view consisting of 12 months, the mode you 
     set to `month` and the numberOfFrames to `12`.

     The user expects that when he goes from `year` to `month`, (note
     that these are not modes) that the month he is going to is 
     January, if we we did not restore it would be December.

     The reason for this is that the anchorDate is mutated for each
     frame in the for-loops body below, so the anchorDate would be 
     December if we did not restore it.
    */
    const anchorAtStart = this._anchorDate;

    for (let i = 0; i < this.numberOfFrames; i++) {
      // For each frame this is not the first frame we must first
      // move the anchorDate to the next frame
      if (i !== 0) {
        this._moveFrame(1);
      }

      const frame: DateGalleryFrame<T> = {
        dates: [],
        events: [],
        anchorDate: new Date(this._anchorDate),
      };

      // Copy the _anchorDate to prevent mutation.
      const anchor = new Date(this._anchorDate);

      if (this.mode === 'day') {
        frame.dates.push(this._makeDate(anchor));
      } else if (this.mode === 'week') {
        this._addNoDates(anchor, 7, frame);
      } else if (this.mode === 'year') {
        const year = this._getFullYear(anchor);
        const isLeapYear =
          (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

        this._addNoDates(anchor, isLeapYear ? 366 : 365, frame);
      } else if (this.mode === 'month') {
        const anchorMonth = this._getMonth(anchor);

        this._addMonth(anchor, anchorMonth, frame);
      } else if (this.mode === 'month-pad-to-week') {
        // Set the date to the first day of the week, this will probably
        // move the day to the previous month.
        const date = this._firstDayOfWeek(anchor);

        const anchorMonth = this._getMonth(anchor);

        // Add the dates until we are in the desired month.
        while (this._getMonth(date) !== anchorMonth) {
          this._pushDay(date, frame);
        }

        // Add the dates until out of the desired month.
        this._addMonth(date, anchorMonth, frame);

        // Continue into the next month until we are in the new week.
        while (this._getDay(date) !== this.firstDayOfWeek) {
          this._pushDay(date, frame);
        }
      } else if (this.mode === 'month-six-weeks') {
        const date = this._firstDayOfWeek(anchor);

        // 6 * 7 = 42;
        this._addNoDates(date, 42, frame);
      }

      this.frames.push(frame);

      const startDate = new Date(frame.dates[0].date);
      const endDate = new Date(frame.dates[frame.dates.length - 1].date);

      // Get midnight of the first day.
      this._toMidnight(startDate);

      // Get midnight of the day after the endDate
      this._moveDateBy(endDate, 1);
      this._toMidnight(endDate);

      this.events.forEach((event) => {
        if (_hasOverlap({ startDate, endDate }, event)) {
          frame.events.push(event);
        }
      });
    }

    // Restore the anchorDate
    this._anchorDate = anchorAtStart;

    this.firstFrame = this.frames[0];

    if (inform) {
      const event: DateGalleryFrameChangedEvent<T> = {
        type: 'FRAME_CHANGED',
        frames: this.frames,
        time: new Date(),
      };

      this._inform(event);
    }
  }

  /**
   * Moves the frame of the DateGallery to the next frame.
   *
   * For example if the mode is set to `month` and the current anchor
   * date is in March it will move to April.
   *
   * @since 1.6.0
   */
  public next(): void {
    // Move the number of frames forward
    this._moveFrame(this.numberOfFrames);
    this._buildFrames(true);
  }

  /**
   * Moves the frame of the DateGallery to the previous frame.
   *
   * For example if the mode is set to `month` and the current anchor
   * date is in April it will move to March.
   *
   * @since 1.6.0
   */
  public previous() {
    this._moveFrame(-this.numberOfFrames);
    this._buildFrames(true);
  }

  private _moveFrame(mod: number): void {
    const date = new Date(this._anchorDate);

    if (this.mode === 'day') {
      this._moveDateBy(date, 1 * mod);
    } else if (this.mode === 'week') {
      this._moveDateBy(date, 7 * mod);
    } else if (this.mode === 'year') {
      if (this.isUTC) {
        date.setUTCFullYear(date.getUTCFullYear() + 1 * mod);
      } else {
        date.setFullYear(date.getFullYear() + 1 * mod);
      }
    } else {
      // Mode has to be one of the months

      if (this.isUTC) {
        date.setUTCMonth(date.getUTCMonth() + 1 * mod);
      } else {
        date.setMonth(date.getMonth() + 1 * mod);
      }
    }

    this._anchorDate = date;
  }

  /**
   * Selects the given date, the date can either be a `Date` instance,
   * or a `string` which can be passed to the `Date`constructor to
   * make a date.
   *
   * The given date will be converted to midnight, so all times in
   * the `selectedDates` array are always at midnight.
   * 
   * When a `canSelect` predicate is configured, the date is first 
   * checked to see if it can be added. When a date does not pass the 
   * check nothing happens, and no error is thrown. 
   *
   * @param {Date | string} date An optional date to act as the new initial date
   * @throws {DateGalleryModeError} the mode must be one of the predefined modes
   * @throws {DateGalleryInvalidDateError} date provided must be valid date
   * @throws {DateGallerySelectionLimitReachedError} thrown when maxSelectionLimit is exceeded, and maxSelectionLimitBehavior is "error".
   * @since 1.6.0
   */
  public selectDate(date: string | Date): void {
    const method = 'selectDate';
    const _date = this._toDate(date, method, 'date');

    const [index] = this._indexOfDate(_date, method);

    if (index === -1) {
      this._doSelectDate(_date, method);
    }
  }

  public _doSelectDate(date: Date, method: string): void {
    const deselectedDates: Date[] = [];
    const midnight = this._pushSelectDate(date, method, deselectedDates);

    // If the push failed due to maxSelectionLimit / predicate return nothing.
    if (!midnight) {
      return;
    }

    this._buildFrames();

    let deselectedDate: Date | null = deselectedDates[0];
    if (!deselectedDate) {
      deselectedDate = null;
    }

    const event: DateGalleryDateSelectedEvent = {
      type: 'DATE_SELECTED',
      date: new Date(midnight),
      deselectedDate,
      time: new Date(),
    };

    this._inform(event);
  }

  public _pushSelectDate(
    date: Date,
    method: string,
    deselectedDates: Date[]
  ): Date | null {
    const midnight = this._toDate(date, method, 'date');
    this._toMidnight(midnight);

    // If the date cannot be selected do nothing.
    if (this._canSelect && !this._canSelect(this._makeDate(midnight))) {
      return null;
    }

    const limitReached =
      this.maxSelectionLimit === false
        ? false
        : this.maxSelectionLimit === this.selectedDates.length;

    if (limitReached) {
      if (this.maxSelectionLimitBehavior === 'error') {
        throw new DateGallerySelectionLimitReachedError(method);
      } else if (this.maxSelectionLimitBehavior === 'ignore') {
        return null;
      } else {
        const deselected = this.selectedDates.shift();

        if (deselected) {
          deselectedDates.push(deselected);
        }
      }
    }

    this.selectedDates.push(midnight);
    return midnight;
  }

  /**
   * Deselects the given date, the date can either be a `Date`
   * instance, or a `string` which can be passed to the `Date`
   * constructor to make a date.
   *
   * The given date will be converted to midnight so it better matches
   * the `selectedDates` which are always at midnight.
   *
   * @param {Date | string} date An optional date to act as the new initial date
   * @throws {DateGalleryModeError} the mode must be one of the predefined modes
   * @throws {DateGalleryInvalidDateError} date provided must be valid date
   * @since 1.6.0
   */
  public deselectDate(date: string | Date): void {
    const [index, _date] = this._indexOfDate(date, 'deselectDate');

    if (index === -1) {
      return;
    }

    this._doDeselectDate(index, _date);
  }

  public _doDeselectDate(index: number, date: Date): void {
    this.selectedDates.splice(index, 1);

    this._buildFrames();

    const event: DateGalleryDateDeselectedEvent = {
      type: 'DATE_DESELECTED',
      date,
      time: new Date(),
    };

    this._inform(event);
  }

  /**
   * Toggles the date selection of the given date, if the date is
   * selected it becomes deselected, if the date is deselected it
   * becomes selected.
   *
   * The given date can either be a `Date` instance, or a `string`
   * which can be passed to the `Date` constructor to make a date.
   * 
   * The given date will be converted to midnight, so all times in
   * the `selectedDates` array are always at midnight.
   * 
   * When a `canSelect` predicate is configured, the date is first 
   * checked to see if it can be added. When a date does not pass the 
   * check nothing happens, and no error is thrown. 
   *
   * @param {Date | string} date An optional date to act as the new initial date
   * @throws {DateGalleryModeError} the mode must be one of the predefined modes
   * @throws {DateGalleryInvalidDateError} date provided must be valid date
   * @throws {DateGallerySelectionLimitReachedError} thrown when maxSelectionLimit is exceeded, and maxSelectionLimitBehavior is "error".
   * @since 1.6.0
   */
  public toggleDateSelection(date: string | Date): void {
    const [index, _date] = this._indexOfDate(date, 'toggleDateSelection');

    if (index === -1) {
      this._doSelectDate(_date, 'toggleDateSelection');
    } else {
      this._doDeselectDate(index, _date);
    }
  }

  private _indexOfDate(date: Date | string, method: string) {
    const _date = this._toDate(date, method, 'date');

    const index = this.selectedDates.findIndex((s) => {
      return this._sameDay(s, _date);
    });

    return [index, _date] as const;
  }

  /**
   * Deselects all dates, effectively clearing the `selectedDates`
   * property.
   *
   * @since 1.6.0
   */
  public deselectAll(): void {
    // Do nothing when no dates are selected
    if (this.selectedDates.length === 0) {
      return;
    }

    const dates = [...this.selectedDates];

    this.selectedDates.length = 0;

    this._buildFrames();

    const e: DateGalleryDateDeselectedMultipleEvent = {
      type: 'DATE_DESELECTED_MULTIPLE',
      dates,
      time: new Date(),
    };

    this._inform(e);
  }

  /**
   * Selects all dates from within the given date range.
   *
   * If the range is end inclusive meaning if the starts on Monday
   * and end ends on Friday: Monday, Tuesday, Wednesday, Thursday
   * and Friday are selected.
   *
   * The given dates can either be a `Date` instance, or a `string`
   * which can be passed to the `Date` constructor to make a date.
   *
   * The order of the two parameters does not matter as `selectRange`
   * will check whether `a` or `b` is the earlier date.
   *
   * If a date is already selected and falls within the range the date 
   * will stay selected.
   * 
   * When a `canSelect` predicate is configured, the date is first 
   * checked to see if it can be added. When a date does not pass the 
   * check nothing happens, and no error is thrown. 
   *
   * Dates can also become deselected if the `maxSelection` is set
   * to a number and the `maxSelectionLimitBehavior` is set to
   * "circular", if space needs to be made for the new dates.
   *
   * When `maxSelectionLimitBehavior` is set to "error", all dates
   * that can be accommodated become selected, but when the limit is
   * exceeded the selection stops. The subscribers are then informed
   * of which dates were selected, and then the error is thrown.
   *
   * Even through each date is selected sequentially, only one event
   * is emitted, and one call is made to the subscribers, even if
   * multiple dates are selected and deselected.
   *
   * Within the `DateGalleryDateSelectedMultipleEvent` only the end
   * activate / deactivate results are reported.
   *
   * @param {Date | string} a the start or end date of the range
   * @param {Date | string} b The start or end date of the range
   * @throws {DateGalleryInvalidDateError} dates provided must be valid dates
   * @throws {DateGallerySelectionLimitReachedError} thrown when maxSelectionLimit is exceeded, and maxSelectionLimitBehavior is "error".
   * @since 1.6.0
   */
  public selectRange(a: Date | string, b: Date | string): void {
    const method = 'selectRange';

    const aDate = this._toDate(a, method, 'a');
    const bDate = this._toDate(b, method, 'b');

    const startDate = bDate.getTime() > aDate.getTime() ? aDate : bDate;
    const endDate = aDate === startDate ? bDate : aDate;

    this._toMidnight(startDate);

    this._moveDateBy(endDate, 1);
    this._toMidnight(endDate);

    const date = new Date(startDate);

    // Reference to what was selected before selectRange
    // was called, used to calculate the diff.
    const oldSelected = [...this.selectedDates];

    // These arrays collect what selectRange has selected and
    // deselected during this call.
    const selectedCollector: Date[] = [];
    const deselectedCollector: Date[] = [];

    // Might get filled with an DateGallerySelectionLimitReachedError
    let error = null;

    try {
      while (!this._sameDay(date, endDate)) {
        const index = this.selectedDates.findIndex((s) => {
          return this._sameDay(s, date);
        });

        if (index === -1) {
          const midnight = this._pushSelectDate(
            date,
            method,
            deselectedCollector
          );

          // If the push succeeded to get past maxSelectionLimit or
          // predicate then add it.
          if (midnight) {
            selectedCollector.push(midnight);
          }
        }

        this._moveDateBy(date, 1);
      }
    } catch (e) {
      if (e instanceof DateGallerySelectionLimitReachedError) {
        error = e;
      }
    }

    // Due to 'circular' a date that was 'selected' might also get
    // removed within selectRange, these must be treated as if they
    // where never selected in the first place.
    const reportedSelectedDates = selectedCollector.filter(
      (selectedDate) => !deselectedCollector.includes(selectedDate)
    );

    // If nothing happened do not inform, not that if nothing got
    // selected nothing had to make space when 'circular'.
    if (reportedSelectedDates.length === 0) {
      // If an `DateGallerySelectionLimitReachedError` was thrown
      // re-throw it. That happens when the limit is reached on
      // the first push.
      if (error) {
        throw error;
      }

      return;
    }

    // The deselected dates are all dates that previously were in the
    // oldSelected but are selected no more.
    const deselectedDates = oldSelected.filter(
      (oldSelect) =>
        !this.selectedDates.some((selectedDate) =>
          this._sameDay(oldSelect, selectedDate)
        )
    );

    this._buildFrames();

    const event: DateGalleryDateSelectedMultipleEvent = {
      type: 'DATE_SELECTED_MULTIPLE',
      dates: reportedSelectedDates.map((d) => new Date(d)),
      deselectedDates: deselectedDates.map((d) => new Date(d)),
      time: new Date(),
    };

    this._inform(event);

    // If an `DateGallerySelectionLimitReachedError` was thrown re-throw it.
    if (error) {
      throw error;
    }
  }

  /**
   * Takes a `DateGalleryEventConfig` and adds that config as a
   * `DateGalleryEvent` to the `DateGallery`.
   *
   * @param {DateGalleryEventConfig<T>} event The config of the event you want to add.
   * @throws {DateGalleryEventInvalidRangeError} an events start date must lie before on on the end date.
   * @throws {DateGalleryInvalidDateError} dates provided must be valid dates
   * @returns {DateGalleryEvent} The created DateGalleryEvent.
   * @since 1.6.0
   */
  public addEvent(event: DateGalleryEventConfig<T>): DateGalleryEvent<T> {
    const addedEvent = this._doAddEvent(event, 'addEvent');

    this.events.forEach((e) => {
      e._recalculate();
    });

    this._buildFrames();

    const e: DateGalleryEventAddedEvent<T> = {
      type: 'EVENT_ADDED',
      event: addedEvent,
      time: new Date(),
    };

    this._inform(e);

    return addedEvent;
  }

  private _doAddEvent(
    config: DateGalleryEventConfig<T>,
    method: string
  ): DateGalleryEvent<T> {
    const startDate = this._toDate(config.startDate, method, 'event.startDate');
    const endDate = this._toDate(config.endDate, method, 'event.endDate');

    if (startDate.getTime() > endDate.getTime()) {
      throw new DateGalleryEventInvalidRangeError();
    }

    const event = new DateGalleryEvent(this, config.data, startDate, endDate);

    this.events.push(event);

    // Sort by past to future
    this.events.sort((a, b) => {
      return a.startDate.getTime() - b.startDate.getTime();
    });

    return event;
  }

  /**
   * Takes a `DateGalleryEvent` and removes that event from this
   * `DateGallery`, and all associated frames.
   *
   * Note: if the event cannot be found within the `DateGallery`
   * nothing happens.
   *
   * @param {DateGalleryEvent<T>} event The event you want to remove.
   * @returns {DateGalleryEvent} The removed DateGalleryEvent.
   * @since 1.6.0
   */
  public removeEvent(event: DateGalleryEvent<T>): DateGalleryEvent<T> {
    const index = this.events.indexOf(event);

    if (index === -1) {
      return event;
    }

    this.events.splice(index, 1);

    this.events.forEach((e) => {
      e._recalculate();
    });

    this._buildFrames();

    const e: DateGalleryEventRemovedEvent<T> = {
      type: 'EVENT_REMOVED',
      event,
      time: new Date(),
    };

    this._inform(e);

    return event;
  }

  /**
   * Takes a `DateGalleryEvent` and moves that event chronologically,
   * in other words it changes the events start and end time to the
   * given range.
   *
   * @param {DateGalleryEvent<T>} event The event you want to move / change the start / end time for.
   * @param {DateGalleryRange} range The new start and end times of the event.
   * @throws {DateGalleryEventInvalidRangeError} an events start date must lie before on on the end date.
   * @throws {DateGalleryEventNotFoundError} the provided event must be part of the DateGallery.
   * @since 1.6.0
   */
  public moveEvent(event: DateGalleryEvent<T>, range: DateGalleryRange): void {
    const startDate = this._toDate(
      range.startDate,
      'moveEvent',
      'range.startDate'
    );
    const endDate = this._toDate(range.endDate, 'moveEvent', 'range.endDate');

    if (startDate.getTime() > endDate.getTime()) {
      throw new DateGalleryEventInvalidRangeError();
    }

    if (
      startDate.getTime() === event.startDate.getTime() &&
      endDate.getTime() === event.endDate.getTime()
    ) {
      return;
    }

    const index = this.events.indexOf(event);

    if (index === -1) {
      throw new DateGalleryEventNotFoundError('moveEvent');
    }

    event.startDate = startDate;
    event.endDate = endDate;

    // Sort by past to future
    this.events.sort((a, b) => {
      return a.startDate.getTime() - b.startDate.getTime();
    });

    this.events.forEach((e) => {
      e._recalculate();
    });

    this._buildFrames();

    const e: DateGalleryEventMovedEvent<T> = {
      type: 'EVENT_MOVED',
      event,
      time: new Date(),
    };

    this._inform(e);
  }

  /**
   * Changes the data of the given DateGalleryEvent, and informs
   * the subscribers of the change.
   *
   * Note: if you provide the exact same `data` it will still set the
   * `data` and inform the subscribers, even though nothing has
   * actually changed.
   *
   * This way, when `data` is an object or an array, you can mutate
   * the object / array directly, and pass in the same `data` object
   * to the `changeData`, without having to create copies.
   *
   * @param {DateGalleryEvent<T>} view The DateGalleryEvent to change the data for
   * @param {T} data The new data for the DateGalleryEvent
   * @throws {DateGalleryEventNotFoundError} item must be in the views array based on === equality
   * @since 1.6.0
   */
  public changeEventData(event: DateGalleryEvent<T>, data: T): void {
    const index = this.events.indexOf(event);

    if (index === -1) {
      throw new DateGalleryEventNotFoundError('changeEventData');
    }

    event.data = data;

    const e: DateGalleryEventDataChangedEvent<T> = {
      type: 'EVENT_DATA_CHANGED',
      event,
      data,
      time: new Date(),
    };

    this._inform(e);
  }

  private _dragAnchor() {
    if (this.mode === 'year') {
      if (this.isUTC) {
        this._anchorDate.setUTCDate(1);
        this._anchorDate.setUTCMonth(0);
      } else {
        this._anchorDate.setDate(1);
        this._anchorDate.setMonth(0);
      }
    } else if (this.mode === 'week') {
      this._anchorDate = this._firstDayOfWeek(this._anchorDate);
    } else if (this.mode.startsWith('month')) {
      if (this.isUTC) {
        this._anchorDate.setUTCDate(1);
      } else {
        this._anchorDate.setDate(1);
      }
    }

    // When mode is 'day' do nothing
  }

  public _inform(event: DateGallerySubscriberEvent<T>): void {
    if (this._isInitializing) {
      return;
    }

    this._history._push(event);

    this._observer._inform(this, event);
  }

  private _toDate(date: Date | string, method: string, dateName: string): Date {
    if (date instanceof Date) {
      this._checkDate(date, method, dateName);
    }

    // Make a copy if it is a Date, otherwise convert the
    // string to a date.
    const result = new Date(date);

    this._checkDate(result, method, dateName);

    return result;
  }

  private _checkDate(date: Date, method: string, dateName: string) {
    const isValid =
      Object.prototype.toString.call(date) === '[object Date]' &&
      !isNaN(date.valueOf());

    if (!isValid) {
      throw new DateGalleryInvalidDateError(method, dateName);
    }
  }

  private _firstDayOfWeek(date: Date): Date {
    const copy = new Date(date);

    while (this._getDay(copy) !== this.firstDayOfWeek) {
      this._moveDateBy(copy, -1);
    }

    return copy;
  }

  private _addNoDates(
    date: Date,
    amount: number,
    frame: DateGalleryFrame<T>
  ): void {
    for (let i = 0; i < amount; i++) {
      this._pushDay(date, frame);
    }
  }

  private _addMonth(
    date: Date,
    month: number,
    frame: DateGalleryFrame<T>
  ): void {
    while (this._getMonth(date) === month) {
      this._pushDay(date, frame);
    }
  }

  private _pushDay(date: Date, frame: DateGalleryFrame<T>): void {
    frame.dates.push(this._makeDate(date));

    this._moveDateBy(date, 1);
  }

  private _makeDate(date: Date): DateGalleryDate<T> {
    const _date = new Date(date);
    this._toMidnight(_date);

    // By default there is no padding.
    let isPadding = false;

    // Only when the mode is one of the modes that have padding
    // calculate if this date has padding.
    if (this.mode === 'month-pad-to-week' || this.mode === 'month-six-weeks') {
      const anchorMonth = this._getMonth(this._anchorDate);
      isPadding = this._getMonth(_date) !== anchorMonth;
    }

    return new DateGalleryDate<T>(
      this,
      _date,
      this.events.filter((event) => {
        // Check if on the same day:
        const time = _date.getTime();

        // Move start to midnight
        const startDate = new Date(event.startDate);
        const start = this._toMidnight(startDate);

        // Move end to midnight of next day
        const endDate = new Date(event.endDate);

        this._moveDateBy(endDate, 1);
        const end = this._toMidnight(endDate);

        return time >= start && time < end;
      }),
      isPadding,
      this.selectedDates.some((selected) => {
        return this._sameDay(selected, _date);
      })
    );
  }

  /**
   * Compares two dates and returns whether or not they are on the
   * same date.
   *
   * The given dates can either be a `Date` instance, or a `string`
   * which can be passed to the `Date` constructor to make a date.
   *
   * Takes into account the `isUTC` of the `DateGallery` when UTC is
   * `true` it will compare the UTC dates.
   *
   * @param {Date | string} a The first date you want to check
   * @param {Date | string} b The second date you want to check
   * @throws {DateGalleryInvalidDateError} dates provided must be valid dates
   * @returns {boolean} whether or not the dates are on the same date.
   * @since 1.6.0
   */
  public isSameDay(a: Date | string, b: Date | string): boolean {
    const method = 'isSameDay';
    return this._sameDay(
      this._toDate(a, method, 'a'),
      this._toDate(b, method, 'b')
    );
  }

  public _sameDay(a: Date, b: Date) {
    return (
      this._getFullYear(a) === this._getFullYear(b) &&
      this._getMonth(a) === this._getMonth(b) &&
      this._getDate(a) === this._getDate(b)
    );
  }

  private _getFullYear(date: Date): number {
    return this.isUTC ? date.getUTCFullYear() : date.getFullYear();
  }

  private _getMonth(date: Date): number {
    return this.isUTC ? date.getUTCMonth() : date.getMonth();
  }

  private _getDate(date: Date): number {
    return this.isUTC ? date.getUTCDate() : date.getDate();
  }

  private _getDay(date: Date): number {
    return this.isUTC ? date.getUTCDay() : date.getDay();
  }

  private _checkMode(mode: DateGalleryMode) {
    if (!DATE_GALLERY_MODES.includes(mode)) {
      throw new DateGalleryModeError(mode);
    }
  }

  private _toMidnight(date: Date): number {
    if (this.isUTC) {
      return date.setUTCHours(0, 0, 0, 0);
    } else {
      return date.setHours(0, 0, 0, 0);
    }
  }

  private _moveDateBy(date: Date, mod: number) {
    if (this.isUTC) {
      date.setUTCDate(date.getUTCDate() + mod);
    } else {
      date.setDate(date.getDate() + mod);
    }
  }
}
