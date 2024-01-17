import { DateGallery } from './DateGallery';
import { DateGalleryEvent } from './DateGalleryEvent';

/**
 * Represents a date inside of one of the `DateGallery` frames.
 *
 * A `DateGalleryDate` knows whether it has been selected or not,
 * whether it is a padded date, which `DateGalleryEvent` lie on 
 * the date etc etc.
 * 
 * You should never instantiate a `DateGalleryDate` directly instead
 * the `DateGallery` should provide them to you.
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
   * The date associated with this `DateGalleryDate`, the time of 
   * this date is midnight on 0 offset UTC.
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
   * Padding can only occur in one of the month modes.
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
   * Whether or not this `DateGalleryDate` can be selected, is 
   * determined by calling the `canSelectPredicate` from the 
   * `DateGalleryConfig` at the time of the `DateGalleryDate`
   * construction.
   * 
   * @since 1.6.0
   */
   public canBeSelected: boolean = true;

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
    * Whether or not this `DateGalleryDate` has events that
    * overlap with each other. In other words whether this day has
    * events on the same times as each other.
    *
    * @since 1.6.0
    */
   public hasEventsWithOverlap: boolean;

  /**
   * Creates an DateGalleryDate which belongs to the given DateGallery.
   *
   * Note: you should never create instances of DateGalleryDate yourself. You
   * are supposed to let DateGallery do this for you.
   *
   * @param {DateGallery<T>} dateGallery The DateGallery this DateGalleryDate belongs to.
   * @param {Date} Date The date this `DateGalleryDate` represents.
   * @param {DateGalleryEvent<T>[]} events The events that lie on this date.
   * @param {boolean} isPadding Whether or not this DateGalleryDate is padding.
   * @param {boolean} isSelected Whether or not this DateGalleryDate is selected.
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
    this.hasEventsWithOverlap = this.events.some(e => e.isOverlapping);

    if (dateGallery._canSelect) {
      this.canBeSelected = dateGallery._canSelect(this);
    }
  }

   /**
   * Selects the date represented by this DateGalleryDate.
   *
   * @since 1.6.0
   */
  public select() {
    this.dateGallery.selectDate(this.date);
  }

  /**
   * Deselects the date represented by this DateGalleryDate.
   *
   * @since 1.6.0
   */
  public deselect() {
    this.dateGallery.deselectDate(this.date);
  }

  /**
   * Toggles the date selection the date represented by this 
   * DateGalleryDate. 
   * 
   * If the date is selected it becomes deselected, if the date is 
   * deselected it becomes selected.
   * 
   * @since 1.6.0
   */
  public toggle() {
    this.dateGallery.toggleDateSelection(this.date);
  }
}
