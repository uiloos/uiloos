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
  DateFrameConfig,
  DateFrameSubscriberEvent,
  DateFrameInitializedEvent,
  DateFrameSubscriber,
  DateFrameMode,
  DateFrameDayOfWeek,
  DateFrameFrameChangedEvent,
  DateFrameDateSelectedEvent,
  DateFrameDateDeselectedEvent,
  DateFrameEventConfig,
  DateFrameEventAddedEvent,
  DateFrameEventRemovedEvent,
  DateFrameModeChangedEvent,
  DATE_FRAME_MODES,
  DateFrameDateSelectedMultipleEvent,
  DateFrameDateDeselectedMultipleEvent,
  DateFrameEventMovedEvent,
  DateFrameRange,
} from './types';
import { DateFrameDate } from './DateFrameDate';
import { DateFrameEvent } from './DateFrameEvent';
import { DateFrameModeError } from './errors/DateFrameModeError';
import { DateFrameFirstDayOfWeekError } from './errors/DateFrameFirstDayOfWeekError';
import { DateFrameNumberOfFramesError } from './errors/DateFrameNumberOfFramesError';
import { DateFrameInvalidDateError } from './errors/DateFrameInvalidDateError';
import { DateFrameEventInvalidRangeError } from './errors/DateFrameEventInvalidRangeError';
import { _hasOverlap } from './utils';
import { DateFrameEventNotFoundError } from './errors/DateFrameEventNotFoundError';

/**
 * A DateFrame is a class that represents a frame of dates, a frame
 * of dates is a sequence of chronologically sequential dates of a
 * certain length.
 *
 * The idea is that whenever you are creating components that use
 * sequences of dates, so for example: date pickers, range selectors,
 * or calendars, that you can use the DateFrame class to handle the
 * dates for you.
 *
 * The DateFrame comes in various modes:
 *
 *   // TODO document actual options
 *   1. DAY: a frame that holds a singular day
 *   1. WEEK: a frame that holds all dates of a week.
 *   2. MONTH: a frame that holds all dates of a month.
 *   3. YEAR: a frame that holds all dates of a year.
 *   4. CUSTOM: a frame that holds a custom range of dates.
 *
 * The frame part of a DateFrame is what is visually displayed to a
 * user, when making a monthly based calendar you are making a whole
 * year available but only show one month at a time. The month that
 * you show is a "frame", the dates that are visually displayed.
 *
 * The DateFrame provides methods for navigating through frames,
 * for example you can go to the next / previous frame.
 *
 * TODO: events and activation
 *
 * @since 1.6.0
 */
export class DateFrame<T>
  implements Observable<DateFrame<T>, DateFrameSubscriberEvent<T>>
{
  /**
   * Whether or not to inform subscribers of changes / record history.
   * Used in the `initialize` to temporarily stop subscriptions running
   * the initial activation, and altering the history.
   */
  private _isInitializing = false;

  /**
   * Whether the `DateFrame` is in UTC mode.
   *
   * When the `DateFrame` is in UTC mode all dates are parsed as UTC.
   *
   * TODO: doc this
   *
   * TODO: implement this
   *
   * @since 1.60
   */
  public isUTC = false;

  /**
   * The frames of dates that are currently visible to the user.
   *
   * @since 1.6.0
   */
  public readonly frames: DateFrameDate<T>[][] = [];

  /**
   * The first frame of dates that is visible to the user.
   *
   * Is a shortcut to the first frame in the `frames` property.
   *
   * If `numberOfFrames` is 1 this will be the only visible frame.
   *
   * @since 1.6.0
   */
  public firstFrame: DateFrameDate<T>[] = [];

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
   * All dates which are currently considered selected.
   *
   * @since 1.6.0
   */
  public readonly selectedDates: Date[] = [];

  /**
   * All events, such as birthdays, meetings etc that are associated
   * with this `DateFrame`.
   *
   * Is sorted from old to new, events that appear earlier in the
   * array are earlier than events that appear later in the array.
   *
   * @since 1.6.0
   */
  public readonly events: DateFrameEvent<T>[] = [];

  /**
   * The events that happen within the `firstFrame`.
   *
   * Is sorted from old to new, events that appear earlier in the
   * array are earlier than events that appear later in the array.
   *
   * @since 1.6.0
   */
  public firstFrameEvents: DateFrameEvent<T>[] = [];

  /**
   * Per frame which events belong to that frame.
   *
   * Is sorted from old to new, events that appear earlier in the
   * array are earlier than events that appear later in the array.
   *
   * @since 1.6.0
   */
  public readonly eventsPerFrame: DateFrameEvent<T>[][] = [];

  // TODO docs
  public mode: DateFrameMode = 'month-six-weeks';
  public firstDayOfWeek: DateFrameDayOfWeek = 0;

  /*
    The anchorDate is a reference to what the starting date of a 
    `mode` is.
  */
  private _anchorDate = new Date();

  private _history: _History<DateFrameSubscriberEvent<T>> = new _History();

  /**
   * Contains the history of the changes in the contents array.
   *
   * Tracks 15 types of changes:
   *
   *  1. INITIALIZED: fired when DateFrame is initialized.
   *
   *  TODO
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
   * WARNING: TODO
   *
   * @since 1.6.0
   */
  public readonly history: DateFrameSubscriberEvent<T>[] =
    this._history._events;

  private _observer: _Observer<DateFrame<T>, DateFrameSubscriberEvent<T>> =
    new _Observer();

  /**
   * Creates an DateFrame based on the DateFrameConfig config.
   *
   * You can also optionally provide an subscriber so you can get
   * informed of the changes happening to the DateFrame.
   *
   * @param {DateFrameConfig<T>} config The initial configuration of the DateFrame.
   * @param {DateFrameSubscriber<T> | undefined} subscriber An optional subscriber which responds to changes in the DateFrame.
   * @since 1.6.0
   */
  constructor(
    config: DateFrameConfig<T> = {},
    subscriber?: DateFrameSubscriber<T>
  ) {
    uiloosLicenseChecker.licenseChecker._checkLicense();

    if (subscriber) {
      this.subscribe(subscriber);
    }

    this._doInitialize(config, 'constructor');
  }

  /**
   * Subscribe to changes of the DateFrame. The function you
   * provide will get called whenever changes occur in the
   * DateFrame.
   *
   * Returns an unsubscribe function which when called will unsubscribe
   * from the DateFrame.
   *
   * @param {DateFrameSubscriber<T>} subscriber The subscriber which responds to changes in the DateFrame.
   * @returns {UnsubscribeFunction} A function which when called will unsubscribe from the DateFrame.
   *
   * @since 1.6.0
   */
  public subscribe(subscriber: DateFrameSubscriber<T>): UnsubscribeFunction {
    return this._observer._subscribe(subscriber);
  }

  /**
   * Unsubscribe the subscriber so it no longer receives changes / updates
   * of the state changes of the DateFrame.
   *
   * @param {DateFrameSubscriber<T>} subscriber The subscriber which you want to unsubscribe.
   *
   * @since 1.6.0
   */
  public unsubscribe(subscriber: DateFrameSubscriber<T>): void {
    this._observer._unsubscribe(subscriber);
  }

  /**
   * Unsubscribes all subscribers at once, all subscribers will no
   * longer receives changes / updates of the state changes of
   * the DateFrame.
   *
   * @since 1.6.0
   */
  public unsubscribeAll(): void {
    this._observer._clear();
  }

  /**
   * Initializes the DateFrame based on the config provided. This can
   * effectively reset the DateFrame when called, including the
   * history, autoPlay and cooldown.
   *
   * @param {DateFrameConfig<T>} config The new configuration which will override the old one
   *
   * @throws {DateFrameAutoPlayDurationError} autoPlay duration must be a positive number when defined
   *
   * @since 1.6.0
   */
  public initialize(config: DateFrameConfig<T>): void {
    this._doInitialize(config, 'initialize');
  }

  /**
   * Initializes the DateFrame based on the config provided. This can
   * effectively reset the DateFrame when called, including the
   * history, autoPlay and cooldown.
   *
   * @param {DateFrameConfig<T>} config The new configuration which will override the old one
   *
   * @throws {DateFrameAutoPlayDurationError} autoPlay duration must be a positive number when defined
   *
   * @since 1.6.0
   */
  private _doInitialize(config: DateFrameConfig<T>, method: string): void {
    // Ignore changes for now, we will restore subscriber at the end
    // of the initialization process.
    this._isInitializing = true;

    this.isUTC = config.isUtc ? config.isUtc : false;

    this.mode = config.mode ? config.mode : 'month-six-weeks';
    this._checkMode(this.mode);

    this.firstDayOfWeek = config.firstDayOfWeek ? config.firstDayOfWeek : 0;
    if (this.firstDayOfWeek < 0 || this.firstDayOfWeek > 6) {
      throw new DateFrameFirstDayOfWeekError();
    }

    this.numberOfFrames =
      config.numberOfFrames !== undefined ? config.numberOfFrames : 1;
    if (this.numberOfFrames <= 0) {
      throw new DateFrameNumberOfFramesError();
    }

    // TODO utc
    this._anchorDate = config.initialDate
      ? this._toDate(config.initialDate, method, 'initialDate')
      : new Date();

    this._anchorDate.setHours(0, 0, 0, 0);

    // Second move the anchorDate to the closest start date of the fame
    this._dragAnchor();

    // Empty the contents first before assigning them, so re-init
    // works with a new empty content.
    this.events.length = 0;
    this.selectedDates.length = 0;

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
        e._calcOverlap();
      });
    }

    // Finally set the dates, now that the events and selected dates are set
    this._buildFrames();

    // Configure history
    this._history._events.length = 0;
    this._history._setKeepHistoryFor(config.keepHistoryFor);

    // Now start sending out changes.
    this._isInitializing = false;

    const event: DateFrameInitializedEvent = {
      type: 'INITIALIZED',
      time: new Date(),
    };

    this._inform(event);
  }

  // TODO docs
  public changeMode(mode: DateFrameMode, date?: Date | string) {
    // When the mode is set to be the same mode
    if (this.mode === mode) {
      // Do nothing when anchorDates match
      if (
        !date ||
        this._sameDay(
          this._dragAnchorFor(this._toDate(date, 'changeMode', 'date')),
          this._anchorDate
        )
      ) {
        return;
      }
    }

    this._checkMode(mode);

    this.mode = mode;

    // If a date is provided make it the new achorDate
    if (date) {
      this._anchorDate = this._toDate(date, 'changeMode', 'date');
      this._anchorDate.setHours(0, 0, 0, 0);
    }

    this._dragAnchor();

    this._buildFrames();

    const event: DateFrameModeChangedEvent<T> = {
      type: 'MODE_CHANGED',
      mode,
      frames: this.frames,
      time: new Date(),
    };

    this._inform(event);
  }

  private _buildFrames(inform = false) {
    this.frames.length = 0;
    this.eventsPerFrame.length = 0;

    for (let i = 0; i < this.numberOfFrames; i++) {
      // For each frame this is not the first frame we must first
      // move the anchorDate to the next frame
      if (i !== 0) {
        this._moveFrame(1);
      }

      this.firstFrame.length = 0;
      this.firstFrameEvents.length = 0;

      // Copy the _anchorDate to prevent mutation.
      const anchor = new Date(this._anchorDate);

      if (this.mode === 'day') {
        this.firstFrame.push(this._makeDate(anchor, false));
      } else if (this.mode === 'week') {
        this._addNoDates(anchor, 7);
      } else if (this.mode === 'year') {
        const year = anchor.getFullYear();
        const isLeapYear =
          (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

        this._addNoDates(anchor, isLeapYear ? 366 : 365);
      } else if (this.mode === 'month') {
        this._addMonth(anchor, false);
      } else if (this.mode === 'month-pad-to-week') {
        // Set the date to the first day of the week, this will probably
        // move the day to the previous month.
        const date = this._firstDayOfWeek(anchor);

        // Add the dates until we are in the desired month. // TODO utc
        while (date.getMonth() !== anchor.getMonth()) {
          this._pushDay(date, true);
        }

        // Add the dates until out of the desired month.
        this._addMonth(date, false);

        // Continue into the next month until we are in the new week.
        while (date.getDay() !== this.firstDayOfWeek) {
          this._pushDay(date, true);
        }
      } else if (this.mode === 'month-six-weeks') {
        const date = this._firstDayOfWeek(anchor);

        // TODO: Utc
        const anchorMonth = anchor.getMonth();

        // 6 * 7 = 42;
        this._addNoDates(date, 42, (d) => {
          // A day is padded when the month does not match
          // the anchor's month.
          return d.getMonth() !== anchorMonth;
        });
      }

      this.frames.push([...this.firstFrame]);

      const startDate = new Date(this.firstFrame[0].date);
      const endDate = new Date(
        this.firstFrame[this.firstFrame.length - 1].date
      );

      // Get midnight of the first day.
      startDate.setHours(0, 0, 0, 0);

      // Get midnight of the day after the endDate
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);

      this.events.forEach((event) => {
        if (_hasOverlap({ startDate, endDate }, event)) {
          this.firstFrameEvents.push(event);
        }
      });

      this.eventsPerFrame.push([...this.firstFrameEvents]);
    }

    this.firstFrame = this.frames[0];
    this.firstFrameEvents = this.eventsPerFrame[0];

    if (inform) {
      const event: DateFrameFrameChangedEvent<T> = {
        type: 'FRAME_CHANGED',
        frames: this.frames,
        time: new Date(),
      };

      this._inform(event);
    }
  }

  // TODO: docs
  public next(): void {
    this._moveFrame(1);
    this._buildFrames(true);
  }

  // TODO: docs
  public previous() {
    this._moveFrame(-1, this.numberOfFrames * 2 - 1);
    this._buildFrames(true);
  }

  private _moveFrame(mod: 1 | -1, skip = 1): void {
    // TODO is the copy needed
    const date = new Date(this._anchorDate);

    // TODO UTC
    if (this.mode === 'day') {
      date.setDate(date.getDate() + 1 * skip * mod);
    } else if (this.mode === 'week') {
      date.setDate(date.getDate() + 7 * skip * mod);
    } else if (this.mode === 'year') {
      date.setFullYear(date.getFullYear() + 1 * skip * mod);
    } else {
      // Mode has to be one of the months
      date.setMonth(date.getMonth() + 1 * skip * mod);
    }

    this._anchorDate = date;
  }

  // TODO doc
  public selectDate(date: string | Date): void {
    const method = 'selectDate';
    const _date = this._toDate(date, method, 'date');

    const [index] = this._indexOfDate(_date, method);

    if (index === -1) {
      this._doSelectDate(_date, method);
    }
  }

  public _doSelectDate(date: Date, method: string): void {
    const midnight = this._toDate(date, method, 'date');
    midnight.setHours(0, 0, 0, 0);

    this.selectedDates.push(midnight);

    // Sort by past to future
    this.selectedDates.sort((a, b) => {
      return a.getTime() - b.getTime();
    });

    this._setIsSelected();

    const event: DateFrameDateSelectedEvent = {
      type: 'DATE_SELECTED',
      date: midnight,
      time: new Date(),
    };

    this._inform(event);
  }

  // TODO doc
  public deselectDate(date: string | Date): void {
    const [index, _date] = this._indexOfDate(date, 'deselectDate');

    if (index === -1) {
      return;
    }

    this._doDeselectDate(index, _date);
  }

  public _doDeselectDate(index: number, date: Date): void {
    this.selectedDates.splice(index, 1);

    this._setIsSelected();

    const event: DateFrameDateDeselectedEvent = {
      type: 'DATE_DESELECTED',
      date,
      time: new Date(),
    };

    this._inform(event);
  }

  // TODO doc
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

  // TODO: docs
  public deselectAll() {
    // Do nothing when no dates are selected
    if (this.selectedDates.length === 0) {
      return;
    }

    const dates = [...this.selectedDates];

    this.selectedDates.length = 0;

    this._setIsSelected();

    const e: DateFrameDateDeselectedMultipleEvent = {
      type: 'DATE_DESELECTED_MULTIPLE',
      dates,
      time: new Date(),
    };

    this._inform(e);
  }

  // TODO: docs
  public activateRange(a: Date | string, b: Date | string) {
    const aDate = this._toDate(a, 'activateRange', 'a');
    const bDate = this._toDate(b, 'activateRange', 'b');

    const startDate = bDate.getTime() > aDate.getTime() ? aDate : bDate;
    const endDate = aDate === startDate ? bDate : aDate;

    // Do nothing if they start on the same day
    if (this._sameDay(startDate, endDate)) {
      return;
    }

    startDate.setHours(0, 0, 0, 0);

    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    const dates = [];

    const date = new Date(startDate);

    while (!this._sameDay(date, endDate)) {
      const index = this.selectedDates.findIndex((s) => {
        return this._sameDay(s, date);
      });

      if (index === -1) {
        dates.push(new Date(date));
        this.selectedDates.push(new Date(date));
      }

      date.setDate(date.getDate() + 1);
    }

    // If nothing happened do not inform
    if (dates.length === 0) {
      return;
    }

    // Sort by past to future
    this.selectedDates.sort((a, b) => {
      return a.getTime() - b.getTime();
    });

    this._setIsSelected();

    const event: DateFrameDateSelectedMultipleEvent = {
      type: 'DATE_SELECTED_MULTIPLE',
      dates: dates,
      time: new Date(),
    };

    this._inform(event);
  }

  // TODO: docs
  public addEvent(event: DateFrameEventConfig<T>): DateFrameEvent<T> {
    const addedEvent = this._doAddEvent(event, 'addEvent');

    this.events.forEach((e) => {
      e._calcOverlap();
    });

    this._moveFrame(-1, this.numberOfFrames - 1);

    this._buildFrames();

    const e: DateFrameEventAddedEvent<T> = {
      type: 'EVENT_ADDED',
      event: addedEvent,
      time: new Date(),
    };

    this._inform(e);

    return addedEvent;
  }

  private _doAddEvent(
    config: DateFrameEventConfig<T>,
    method: string
  ): DateFrameEvent<T> {
    const startDate = this._toDate(config.startDate, method, 'event.startDate');
    const endDate = this._toDate(config.endDate, method, 'event.endDate');

    if (startDate.getTime() > endDate.getTime()) {
      throw new DateFrameEventInvalidRangeError();
    }

    const event = new DateFrameEvent(this, config.data, startDate, endDate);

    this.events.push(event);

    // Sort by past to future
    this.events.sort((a, b) => {
      return a.startDate.getTime() - b.startDate.getTime();
    });

    return event;
  }

  // TODO: docs
  public removeEvent(event: DateFrameEvent<T>): DateFrameEvent<T> {
    const index = this.events.indexOf(event);

    if (index === -1) {
      return event;
    }

    this.events.splice(index, 1);

    // Remove the removed event from all events it overlaps with
    this.events.forEach((e) => {
      const index = e.overlapsWith.indexOf(event);

      if (index !== -1) {
        e.overlapsWith.splice(index, 1);
      }
    });

    this._moveFrame(-1, this.numberOfFrames - 1);
    this._buildFrames();

    const e: DateFrameEventRemovedEvent<T> = {
      type: 'EVENT_REMOVED',
      event,
      time: new Date(),
    };

    this._inform(e);

    return event;
  }

  // TODO: docs
  public moveEvent(
    event: DateFrameEvent<T>,
    range: DateFrameRange
  ): void {
    const startDate = this._toDate(range.startDate, 'moveEvent', 'range.startDate');
    const endDate = this._toDate(range.endDate, 'moveEvent', 'range.endDate');

    if (startDate.getTime() > endDate.getTime()) {
      throw new DateFrameEventInvalidRangeError();
    }

    if (
      startDate.getTime() === event.startDate.getTime() &&
      endDate.getTime() === event.endDate.getTime()
    ) {
      return;
    }

    const index = this.events.indexOf(event);

    if (index === -1) {
      throw new DateFrameEventNotFoundError();
    }

    event.startDate = startDate;
    event.endDate = endDate;

     // Sort by past to future
     this.events.sort((a, b) => {
      return a.startDate.getTime() - b.startDate.getTime();
    });

    this.events.forEach((e) => {
      e._calcOverlap();
    });

    this._moveFrame(-1, this.numberOfFrames - 1);
    this._buildFrames();

    const e: DateFrameEventMovedEvent<T> = {
      type: 'EVENT_MOVED',
      event,
      time: new Date(),
    };

    this._inform(e);
  }

  private _dragAnchor() {
    this._anchorDate = this._dragAnchorFor(this._anchorDate);
  }

  private _dragAnchorFor(date: Date): Date {
    if (this.mode === 'year') {
      date.setDate(1);
      date.setMonth(0);
    } else if (this.mode === 'week') {
      date = this._firstDayOfWeek(date);
    } else if (this.mode.startsWith('month')) {
      date.setDate(1);
    }

    // When mode is 'day' do nothing

    return date;
  }

  public _inform(event: DateFrameSubscriberEvent<T>): void {
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
      throw new DateFrameInvalidDateError(method, dateName);
    }
  }

  private _firstDayOfWeek(date: Date): Date {
    const copy = new Date(date);

    // TODO utc
    while (copy.getDay() !== this.firstDayOfWeek) {
      copy.setDate(copy.getDate() - 1);
    }

    return copy;
  }

  private _addNoDates(
    date: Date,
    amount: number,
    isPadding?: (date: Date) => boolean
  ): void {
    for (let i = 0; i < amount; i++) {
      this._pushDay(date, isPadding ? isPadding(date) : false);
    }
  }

  private _addMonth(date: Date, isPadding: boolean): void {
    while (date.getMonth() === this._anchorDate.getMonth()) {
      this._pushDay(date, isPadding);
    }
  }

  private _pushDay(date: Date, isPadding: boolean): void {
    this.firstFrame.push(this._makeDate(date, isPadding));

    date.setDate(date.getDate() + 1);
  }

  private _makeDate(date: Date, isPadding: boolean): DateFrameDate<T> {
    return new DateFrameDate<T>(
      this,
      new Date(date),
      this.events.filter((event) => {
        // Check if on the same day:
        const time = date.getTime();

        // Move start to midnight
        const start = new Date(event.startDate).setHours(0, 0, 0, 0);

        // Move end to midnight of next day
        const endDate = new Date(event.endDate);
        endDate.setDate(event.endDate.getDate() + 1);
        const end = endDate.setHours(0, 0, 0, 0);

        return time >= start && time < end;
      }),
      isPadding,
      this.selectedDates.some((selected) => {
        return this._sameDay(selected, date);
      })
    );
  }

  public _sameDay(a: Date, b: Date) {
    // TODO: UTC
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private _checkMode(mode: DateFrameMode) {
    if (!DATE_FRAME_MODES.includes(mode)) {
      throw new DateFrameModeError(mode);
    }
  }

  private _setIsSelected() {
    this.frames.forEach((frame) => {
      frame.forEach((d) => {
        d.isSelected = this.selectedDates.some((selected) => {
          return this._sameDay(selected, d.date);
        });
      });
    });
  }
}
