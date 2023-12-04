import { DateGallery } from './DateGallery';
import { DateGalleryRange } from './types';
import { _hasOverlap } from './utils';

/**
 * Represents a piece of content in the `events` array of the `DateGallery`.
 *
 * TODO more
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

  // Calculates the overlapping events
  public _calcOverlap() {
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
  }

  // TODO: docs
  public remove() {
    this.dateGallery.removeEvent(this);
  }

  // TODO: docs
  public move(range: DateGalleryRange) {
    this.dateGallery.moveEvent(this, range);
  }
}
