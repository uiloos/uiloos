import { DateGallery } from './DateGallery';
import { DateGalleryRange } from './types';
import { _hasOverlap } from './utils';

/**
 * A `DateGalleryEvent` represents things like birthdays, meetings 
 * doctors appointments etc etc inside of a `DateGallery`.
 * 
 * A `DateGalleryEvent` keeps track of the events start and end date.
 * 
 * Custom pieces of information can be found in the `data` property, 
 * which can be anything you'd like, from an object to a string. For
 * example you could store the title and description of the event
 * there.
 * 
 * The `overlapsWith` property will tell you all the events that this
 * event currently overlaps with.
 *
 * You should never instantiate a `DateGalleryEvent` directly, instead
 * you should call `addEvent` on the `DateGallery` and provide a
 * `DateGalleryEventConfig` from which the `DateGalleryEvent` is
 * instantiated.
 * 
 * Alternatively you can also provide events via the 
 * `DateGalleryConfig`s `events` property.
 * 
 * @since 1.6.0
 */
export class DateGalleryEvent<T> {
  /**
   * Reference to the DateGallery is it a part of.
   *
   * @since 1.6.0
   */
  public dateGallery: DateGallery<T>;

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
  public data: T;

  /**
   * The start date of the event, includes the time.
   *
   * The `startDate` is inclusive: meaning if the event has a `startDate`
   * which is monday and an `endDate` on wednesday, the event runs on
   * monday, tuesday and wednesday.
   *
   * @since 1.6.0
   */
  public startDate: Date;

  /**
   * The end date of the event, includes the time.
   *
   * The `endDate` is inclusive: meaning if the event has a `startDate`
   * which is monday and an `endDate` on wednesday, the event runs on
   * monday, tuesday and wednesday.
   *
   * @since 1.6.0
   */
  public endDate: Date;

  /**
   * The other events in the `DateGallery` this event overlaps with.
   *
   * @since 1.6.0
   */
  public readonly overlapsWith: DateGalleryEvent<T>[] = [];

   /**
    * Whether or not this events spans over multiple days.
    *
    * Is `false` when the `startDate` and `endDate` are on the same 
    * day, is `true` when the `startDate` and `endDate` are
    * on different days.
    * 
    * @since 1.6.0
    */
   public spansMultipleDays: boolean = false;

  /**
   * Creates an DateGalleryEvent which belongs to the given DateGallery.
   *
   * Note: you should never create instances of DateGalleryEvent
   * yourself. You are supposed to let DateGallery do this for you.
   *
   * @param {DateGallery<T>} dateGallery The DateGallery this DateGalleryEvent belongs to.
   * @param {T} index The index of this DateGalleryEvent within the DateGallery.
   * @param {T} data The data of this DateGalleryEvent
   *
   * @since 1.6.0
   */
  constructor(
    dateGallery: DateGallery<T>,
    data: T,
    startDate: Date,
    endDate: Date
  ) {
    this.dateGallery = dateGallery;
    this.data = data;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  // Calculates the computed properties.
  public _recalculate() {
    // Reset overlap
    this.overlapsWith.length = 0;

    // Check for overlap
    this.dateGallery.events.forEach((other) => {
      if (other === this) {
        return;
      }

      if (_hasOverlap(this, other)) {
        this.overlapsWith.push(other);
      }
    });

    this.overlapsWith.sort((a, b) => {
      return a.startDate.getTime() - b.startDate.getTime();
    });

    this.spansMultipleDays = !this.dateGallery._sameDay(this.startDate, this.endDate);
  }

  /**
   * Removes this `DateGalleryEvent` from the `DateGallery` it belongs
   * to.
   * 
   * @param {DateGalleryEvent<T>} event The event you want to remove.
   * @since 1.6.0
   */
  public remove() {
    this.dateGallery.removeEvent(this);
  }

  /**
   * Moves this `DateGalleryEvent` chronologically, or in other words 
   * it changes the events start and end time to the given range.
   * 
   * @param {DateGalleryRange} range The new start and end times of the event.
   * @throws {DateGalleryEventInvalidRangeError} an events start date must lie before on on the end date.
   * @throws {DateGalleryEventNotFoundError} the provided event must be part of the DateGallery.
   * @since 1.6.0
   */
  public move(range: DateGalleryRange) {
    this.dateGallery.moveEvent(this, range);
  }

  /**
   * Changes the data of this `DateGalleryEvent`, and informs the 
   * subscribers of the change. 
   * 
   * Note: if you provide the exact same `data` it will still set the 
   * `data` and inform the subscribers, even though nothing has
   * actually changed. 
   * 
   * This way, when `data` is an object or an array, you can mutate
   * the object / array directly, and pass in the same `data` object
   * to the `changeData`, without having to create copies.
   *
   * @param {T} data The new data for this DateGalleryEvent
   * @since 1.6.0
   */
  public changeData(data: T): void {
    this.dateGallery.changeEventData(this, data);
  }
}
