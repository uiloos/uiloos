import { DateFrame } from './DateFrame';

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
   * The index of the `DateFrameEvent` which it has within the `contents`.
   *
   * @since 1.6.0
   */
  public index: number;

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
   * The date as a string of the `DateFrameDate` in the format of
   * the `DateFrame.dateFormat`.
   *
   * @since 1.6.0
   */
  public date: string;

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
  constructor(dateFrame: DateFrame<T>, index: number, data: T, date: string) {
    this.dateFrame = dateFrame;
    this.index = index;
    this.data = data;
    this.date = date;
  }
}
