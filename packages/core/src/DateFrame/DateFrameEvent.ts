import { DateFrame } from './DateFrame';
import { _hasOverlap } from './utils';

/**
 * Represents a piece of content in the `events` array of the `DateFrame`.
 *
 * TODO more
 *
 * @since 1.6.0
 */
export class DateFrameEvent<T> {
  /**
   * Reference to the DateFrame is it a part of.
   *
   * @since 1.6.0
   */
  public dateFrame: DateFrame<T>;

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
   * The other events in the `DateFrame` this event overlaps with.
   *
   * @since 1.6.0
   */
  public readonly overlapsWith: DateFrameEvent<T>[] = [];

  /**
   * Creates an DateFrameEvent which belongs to the given DateFrame.
   *
   * Note: you should never create instances of DateFrameEvent
   * yourself. You are supposed to let DateFrame do this for you.
   *
   * @param {DateFrame<T>} dateFrame The DateFrame this DateFrameEvent belongs to.
   * @param {T} index The index of this DateFrameEvent within the DateFrame.
   * @param {T} data The data of this DateFrameEvent
   *
   * @since 1.6.0
   */
  constructor(
    dateFrame: DateFrame<T>,
    data: T,
    startDate: Date,
    endDate: Date
  ) {
    this.dateFrame = dateFrame;
    this.data = data;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  // Calculates the overlapping events
  public _calcOverlap() {
    // Reset overlap
    this.overlapsWith.length = 0;

    // Check for overlap
    this.dateFrame.events.forEach((other) => {
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
    this.dateFrame.removeEvent(this);
  }

  // TODO: docs
  public move(startDate: Date | string, endDate: Date | string) {
    this.dateFrame.moveEvent(this, startDate, endDate);
  }
}
