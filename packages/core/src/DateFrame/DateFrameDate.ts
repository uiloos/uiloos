import { DateFrame } from './DateFrame';
import { DateFrameEvent } from './DateFrameEvent';

/**
 * Represents a piece of content in the `contents` array of the `DateFrame`.
 *
 * The purpose of the DateFrameDate is to act as a wrapper around the
 * value which is actually in the contents array. It knows things like
 * whether the item is active or not.
 *
 * It also contains methods to activate, remove, swap and move itself
 * within the DateFrame.
 *
 * @since 1.6.0
 */
export class DateFrameDate<T> {
  /**
   * Reference to the DateFrame is it a part of.
   *
   * @since 1.6.0
   */
  public dateFrame: DateFrame<T>;

  /**
   * The date associated with this `DateFrameDate`.
   *
   * @since 1.6.0
   */
  public date: Date;

  /**
   * The events that occur on this date.
   *
   * @since 1.6.0
   */
  public events: DateFrameEvent<T>[];

  /**
   * Whether or not this `DateFrameDate` is padding for the date
   * frame. Visually these are often "greyed out" dates on month
   * calendars, used to pad out the calendar for a nicer visual.
   *
   * @since 1.6.0
   */
  public isPadding: boolean;

  /**
   * Whether or not this `DateFrameDate` is selected.
   *
   * @since 1.6.0
   */
  public isSelected: boolean;

  /**
   * Whether or not this `DateFrameDate` represents a date which is
   * today.
   *
   * @since 1.6.0
   */
  public isToday: boolean;

   /**
   * Whether or not this `DateFrameDate` has any events.
   *
   * @since 1.6.0
   */
   public hasEvents: boolean;

  /**
   * Creates an DateFrameDate which belongs to the given DateFrame.
   *
   * Note: you should never create instances of DateFrameDate yourself. You
   * are supposed to let DateFrame do this for you.
   *
   * // TODO expand params
   * @param {DateFrame<T>} dateFrame The DateFrame this DateFrameDate belongs to.
   * @param {number} index The index of this DateFrameDate within the DateFrame.
   * @param {T} value The value this DateFrameDate wraps.
   *
   * @since 1.6.0
   */
  constructor(
    dateFrame: DateFrame<T>,
    date: Date,
    events: DateFrameEvent<T>[],
    isPadding: boolean,
    isSelected: boolean
  ) {
    this.dateFrame = dateFrame;
    this.date = date;
    this.events = events;
    this.isPadding = isPadding;
    this.isSelected = isSelected;

    this.isToday = dateFrame._sameDay(new Date(), date);
    this.hasEvents = events.length > 0;
  }

  // TODO: docs
  public select() {
    this.dateFrame.selectDate(this.date);
  }

  // TODO: docs
  public deselect() {
    this.dateFrame.deselectDate(this.date);
  }

  public toggle() {
    this.dateFrame.toggleDateSelection(this.date);
  }
}
