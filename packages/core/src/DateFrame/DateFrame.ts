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
  DateFrameDateFormat,
  DateFrameDayOfWeek,
  DateFrameFrameChangedEvent,
  DateFrameDateSelectedEvent,
  DateFrameDateDeselectedEvent,
} from './types';
import { DateFrameDate } from './DateFrameDate';
import { DateFrameEvent } from './DateFrameEvent';

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
   * The frame of dates that are currently visible to the user.
   *
   * @since 1.6.0
   */
  public readonly dates: DateFrameDate<T>[] = [];

  /**
   * All dates which are currently considered selected.
   *
   * The dates are a strings in the same format of the `dateFormat`.
   *
   * @since 1.6.0
   */
  public readonly selectedDates: string[] = [];

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
   * Only the events, such as birthdays, meetings etc that are
   * currently visible to the user, in other words all events
   * that fall within the `dates` date frame.
   * 
   * Is sorted from old to new, events that appear earlier in the 
   * array are earlier than events that appear later in the array.
   *
   * @since 1.6.0
   */
  public readonly activeEvents: DateFrameEvent<T>[] = [];

  // TODO docs
  public mode: DateFrameMode = 'month-six-weeks';
  public dateFormat: DateFrameDateFormat = 'YYYY-MM-DD';
  public firstDayOfWeek: DateFrameDayOfWeek = 0;

  public readonly daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /*
    The anchorDate is a reference to what the starting date of a 
    `mode` is.
  */
  private readonly _anchorDate: DateRep = {
    day: 0,
    month: 0,
    year: 0,
  };

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

    this.initialize(config);
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
    // Ignore changes for now, we will restore subscriber at the end
    // of the initialization process.
    this._isInitializing = true;

    this.mode = config.mode ? config.mode : 'month-six-weeks';
    this.dateFormat = config.dateFormat ? config.dateFormat : 'YYYY-MM-DD';
    this.firstDayOfWeek = config.firstDayOfWeek ? config.firstDayOfWeek : 0;

    // First simply set the anchorDate
    if (config.initialDate) {
      const values = config.initialDate.split('-');

      if (values.length !== 3) {
        // TODO throw error
      }

      // TODO check if initialDate has correct format or throw

      const numbers = values.map((v) => parseInt(v));

      if (this.dateFormat === 'DD-MM-YYYY') {
        this._anchorDate.year = numbers[2];
        this._anchorDate.month = numbers[1];
        this._anchorDate.day = numbers[0];
      } else if (this.dateFormat === 'YYYY-MM-DD') {
        this._anchorDate.year = numbers[0];
        this._anchorDate.month = numbers[1];
        this._anchorDate.day = numbers[2];
      } else {
        // MM-DD-YYYY
        this._anchorDate.year = numbers[2];
        this._anchorDate.month = numbers[0];
        this._anchorDate.day = numbers[1];
      }
    } else {
      this._setAnchorDate(new Date());
    }

    // Second move the anchorDate to the closest start date of the fame

    if (this.mode === 'year') {
      this._anchorDate.month = 1;
      this._anchorDate.day = 1;
    } else if (this.mode === 'week') {
      const date = this._firstDayOfWeekDateFromRep(this._anchorDate);

      this._setAnchorDate(date);
    } else if (this.mode.startsWith('month')) {
      this._anchorDate.day = 1;
    }

    // Empty the contents first before assigning them, so re-init
    // works with a new empty content.
    this.activeEvents.length = 0;
    this.events.length = 0;
    this.selectedDates.length = 0;

    this._setDates();

    if (config.events) {
      config.events.forEach((c, index) => {
        this.events[index] = new DateFrameEvent(this, index, c.data, c.date);
      });
    }

    if (config.selectedDates) {
      config.selectedDates.forEach((s, index) => {
        this.selectedDates[index] = s;
      });
    }

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

  public next(): void {
    this._moveFrame(1);
  }

  public previous() {
    this._moveFrame(-1);
  }

  private _moveFrame(mod: 1 | -1): void {
    const date = new Date(this._dateRepToString(this._anchorDate));

    if (this.mode === 'day') {
      date.setDate(date.getDate() + 1 * mod);
    } else if (this.mode === 'week') {
      date.setDate(date.getDate() + 7 * mod);
    } else if (this.mode === 'year') {
      date.setFullYear(date.getFullYear() + 1 * mod);
    } else {
      // Mode has to be one of the months
      date.setMonth(date.getMonth() + 1 * mod);
    }

    this._setAnchorDate(date);

    this._setDates();
  }

  // TODO doc
  public selectDate(date: string): void {
    if (this.selectedDates.includes(date)) {
      return;
    }

    this.selectedDates.push(date);

    const event: DateFrameDateSelectedEvent = {
      type: 'DATE_SELECTED',
      date,
      time: new Date(),
    };

    this._inform(event);
  }

  // TODO doc
  public deselectDate(date: string): void {
    const index = this.selectedDates.indexOf(date);

    if (index === -1) {
      return;
    }

    this.selectedDates.splice(index, 1);

    const event: DateFrameDateDeselectedEvent = {
      type: 'DATE_DESELECTED',
      date,
      time: new Date(),
    };

    this._inform(event);
  }

  // TODO doc
  public toggleDateSelection(date: string): void {
    // Small performance hit as we check it again in `selectDate` and `deselectDate`.
    if (this.selectedDates.indexOf(date) === -1) {
      this.selectDate(date);
    } else {
      this.deselectDate(date);
    }
  }

  private _setDates() {
    this.dates.length = 0;

    if (this.mode === 'day') {
      const date = this._dateRepToString(this._anchorDate);

      this.dates.push(this._makeDate(date, 0, false));
    } else if (this.mode === 'week') {
      const date = new Date(this._dateRepToString(this._anchorDate));

      this._datesAddAmount(date, 7, false);
    } else if (this.mode === 'year') {
      const date = new Date(this._dateRepToString(this._anchorDate));

      const year = this._anchorDate.year;
      const isLeapYear =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

      this._datesAddAmount(date, isLeapYear ? 366 : 365, false);
    } else if (this.mode === 'month-calendar-month') {
      const date = new Date(this._dateRepToString(this._anchorDate));

      this._addDesiredMonth(date, 0, false);
    } else if (this.mode === 'month-pad-to-week') {
      // Set the date to the first day of the week, this will probably
      // move the day to the previous month.
      const date = this._firstDayOfWeekDateFromRep(this._anchorDate);

      let i = 0;

      // Add the dates until we are in the desired month.
      while (date.getMonth() !== this._anchorDate.month) {
        i = this._pushDay(date, i, true);
      }

      // Add the dates until out of the desired month.
      i = this._addDesiredMonth(date, i, false);

      // Continue into the next month until we are in the new week.
      while (date.getDay() !== this.firstDayOfWeek) {
        i = this._pushDay(date, i, true);
      }
    } else if (this.mode === 'month-six-weeks') {
      const date = this._firstDayOfWeekDateFromRep(this._anchorDate);

      // 6 * 7 = 42;
      this._datesAddAmount(date, 42, false);
    }

    const event: DateFrameFrameChangedEvent<T> = {
      type: 'FRAME_CHANGED',
      dates: this.dates,
      time: new Date(),
    };

    this._inform(event);
  }

  public _inform(event: DateFrameSubscriberEvent<T>): void {
    if (this._isInitializing) {
      return;
    }

    this._history._push(event);

    this._observer._inform(this, event);
  }

  private _dateToString(date: Date) {
    const year = date.getFullYear().toString();
    const month = this._zeroPad(date.getMonth() + 1);
    const day = this._zeroPad(date.getDate());

    return this._format(year, month, day);
  }

  private _dateRepToString(rep: DateRep) {
    const year = rep.year.toString();
    const month = this._zeroPad(rep.month);
    const day = this._zeroPad(rep.day);

    return this._format(year, month, day);
  }

  private _setAnchorDate(date: Date) {
    this._anchorDate.year = date.getFullYear();
    this._anchorDate.month = date.getMonth() + 1;
    this._anchorDate.day = date.getDate();
  }

  private _format(year: string, month: string, day: string): string {
    if (this.dateFormat === 'DD-MM-YYYY') {
      return [day, month, year].join('-');
    } else if (this.dateFormat === 'MM-DD-YYYY') {
      return [day, month, year].join('-');
    } else {
      return [year, month, day].join('-');
    }
  }

  private _zeroPad(number: number): string {
    if (number < 10) {
      return '0' + number;
    } else {
      return number.toString();
    }
  }

  private _firstDayOfWeekDateFromRep(rep: DateRep): Date {
    const date = new Date(rep.year, rep.month - 1, rep.day);

    while (date.getDay() !== this.firstDayOfWeek) {
      date.setDate(date.getDate() - 1);
    }

    return date;
  }

  private _datesAddAmount(date: Date, amount: number, isPadding: boolean) {
    for (let i = 0; i < amount; i++) {
      this._pushDay(date, i, isPadding);
    }
  }

  private _addDesiredMonth(date: Date, i: number, isPadding: boolean): number {
    while (date.getMonth() + 1 === this._anchorDate.month) {
      i = this._pushDay(date, i, isPadding);
    }

    return i;
  }

  private _pushDay(date: Date, i: number, isPadding: boolean): number {
    const dateStr = this._dateToString(date);

    this.dates.push(this._makeDate(dateStr, i, isPadding));

    date.setDate(date.getDate() + 1);

    i++;

    return i;
  }

  private _makeDate(
    date: string,
    index: number,
    isPadding: boolean
  ): DateFrameDate<T> {
    return new DateFrameDate<T>(
      this,
      index,
      date,
      this.events.filter((event) => event.date === date),
      isPadding,
      this.selectedDates.includes(date)
    );
  }
}

/*
  Ideas

  1. Move through frame dates, in DAY, MONTH, YEAR

  2. Keep list of activated / selected dates
     - maxLimit
     - maxLimitBehavior
     - activate(date)
     - activateRange(start, end)
     - deactivate(date)
     - deactivateRange(start, end)

  3. Keep list of events ordered chronologically. The higher index
     in the array the later the date.

  4. DateFrameDate
      - isMonday, isTuesday, etc etc
      - isToday
      - isFirstDayOfMonth
      - isInWeekend

      - activate
      - deactivate

      - events array
*/

type DateRep = {
  day: number;
  month: number;
  year: number;
};
