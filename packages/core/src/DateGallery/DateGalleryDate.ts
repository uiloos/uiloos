import { DateGallery } from './DateGallery';
import { DateGalleryEvent } from './DateGalleryEvent';

/**
 * Represents a piece of content in the `contents` array of the `DateGallery`.
 *
 * The purpose of the DateGalleryDate is to act as a wrapper around the
 * value which is actually in the contents array. It knows things like
 * whether the item is active or not.
 *
 * It also contains methods to activate, remove, swap and move itself
 * within the DateGallery.
 *
 * @since 1.6.0
 */
export class DateGalleryDate<T> {
  /**
   * Reference to the DateGallery is it a part of.
   *
   * @since 1.6.0
   */
  public dateGallery: DateGallery<T>;

  /**
   * The date associated with this `DateGalleryDate`.
   *
   * @since 1.6.0
   */
  public date: Date;

  /**
   * The events that occur on this date.
   *
   * @since 1.6.0
   */
  public events: DateGalleryEvent<T>[];

  /**
   * Whether or not this `DateGalleryDate` is padding for the date
   * frame. Visually these are often "greyed out" dates on month
   * calendars, used to pad out the calendar for a nicer visual.
   *
   * @since 1.6.0
   */
  public isPadding: boolean;

  /**
   * Whether or not this `DateGalleryDate` is selected.
   *
   * @since 1.6.0
   */
  public isSelected: boolean;

  /**
   * Whether or not this `DateGalleryDate` represents a date which is
   * today.
   *
   * @since 1.6.0
   */
  public isToday: boolean;

   /**
   * Whether or not this `DateGalleryDate` has any events.
   *
   * @since 1.6.0
   */
   public hasEvents: boolean;

  /**
   * Creates an DateGalleryDate which belongs to the given DateGallery.
   *
   * Note: you should never create instances of DateGalleryDate yourself. You
   * are supposed to let DateGallery do this for you.
   *
   * // TODO expand params
   * @param {DateGallery<T>} dateGallery The DateGallery this DateGalleryDate belongs to.
   * @param {number} index The index of this DateGalleryDate within the DateGallery.
   * @param {T} value The value this DateGalleryDate wraps.
   *
   * @since 1.6.0
   */
  constructor(
    dateGallery: DateGallery<T>,
    date: Date,
    events: DateGalleryEvent<T>[],
    isPadding: boolean,
    isSelected: boolean
  ) {
    this.dateGallery = dateGallery;
    this.date = date;
    this.events = events;
    this.isPadding = isPadding;
    this.isSelected = isSelected;

    this.isToday = dateGallery._sameDay(new Date(), date);
    this.hasEvents = events.length > 0;
  }

  // TODO: docs
  public select() {
    this.dateGallery.selectDate(this.date);
  }

  // TODO: docs
  public deselect() {
    this.dateGallery.deselectDate(this.date);
  }

  public toggle() {
    this.dateGallery.toggleDateSelection(this.date);
  }
}
