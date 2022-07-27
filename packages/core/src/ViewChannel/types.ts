import { ViewChannel } from './ViewChannel';
import { ViewChannelView } from './ViewChannelView';

/**
 * Configures the initial state of the `ViewChannel`.
 */
export type ViewChannelConfig = {
  /**
   * For how many items the `history` may contain in the `ViewChannel`.
   *
   * Defaults to `0` meaning that it will not track history.
   */
  keepHistoryFor?: number;
};

/**
 * Represents the configuration for AutoDismiss. AutoDismiss means
 * that the ViewChannelView will remove itself after a duration.
 */
export type ViewChannelAutoDismiss<R> = {
  /**
   * The amount of milliseconds the view should remain visible to
   * the user. Once the duration has passed the view is removed
   * from the `ViewChannel` automatically.
   */
  duration: number;

  /**
   * The value (R) to resolve the promise of the `ViewChannelView`
   * with. This allows you to distinguish between user events,
   * such as clicking a cancel / save button or an auto dismissal.
   */
  result: R;
};

/**
 * Holds the configuration of a view which is placed in the
 * `ViewChannel`. From this configuration the actual
 * `ViewChannelView` is created.
 */
export type ViewChannelViewConfig<T, R> = {
  /**
   * The data for the presented view, "data" can be be anything from 
   * an object, string, array etc etc. It is used to pass along data 
   * to the view you might need to display the view, such as the 
   * text for a flash message or confirmation dialog.
   * 
   * By default the value is `undefined`.
   */
  data: T;

  /**
   * Whether or not `autoDismiss` is enabled. When `autoDismiss` is
   * enabled it will dismiss the view, based on the `duration`.
   *
   * Defaults to no autoDismiss, meaning it will stay visible forever,
   * until it is dismissed.
   */
  autoDismiss?: ViewChannelAutoDismiss<R>;

  /**
   * The priority the `ViewChannelView` will have within the
   * `ViewChannel` the lower the priority the closer it will be to the
   * start of the `ViewChannel`'s views array.
   *
   * A priority is expressed as an array of numbers, each index in the
   * array represents a "level" in the priority, the earlier levels
   * (the lower indexes) have higher priority over the later levels
   * (the higher indexes).
   *
   * If two priorities are compared, first the level at index zero
   * is compared, if they are the same the index at the second level
   * is compared, if the second level is also the same the third
   * level is compared, and so on and so on until there are no more
   * levels.
   *
   * A couple examples:
   *
   * 1. [0, 0, 0] has a higher priority than [1, 0, 0]
   *
   * 2. [1, 0, 0] has a higher priority than [2, 0, 0]
   *
   * 3. [0, 0, 0] has a higher priority than [0, 1, 0]
   *
   * 4. [0, 1, 0] has a higher priority than [0, 2, 0]
   *
   * 5. [0, 0, 0] has a higher priority than [0, 0, 1]
   *
   * 6. [0, 0, 1] has a higher priority than [0, 0, 2]
   *
   * 7. [0, 0, 1] has a higher priority than [1, 0, 0]
   *
   * If the priority arrays when compared differ in size, the missing
   * items are considered zeros. So for example:
   *
   * 1. [0] has a higher priority than [1, 0, 0]
   *
   * 2. [0, 0] has a higher priority than [0, 1, 1]
   *
   * If two priorities match exactly the view is placed after the
   * existing view with the same priority. This means that the
   * order will be the order of insertion.
   *
   * Note: you can provide a number instead of an array instead, in
   * this case an array is created with the provided number as the
   * first value in the array. So providing `5` will be treated as
   * `[5]`.
   *
   * Defaults to `[0]` when no priority is given, this makes it the
   * highest priority.
   */
  priority?: number | number[];
};

/**
 * The subscriber which is informed of all state changes the
 * ViewChannel goes through.
 *
 * @param {ViewChannel<T, C>} viewChannel The ViewChannel which had changes.
 * @param {ViewChannelEvent<T>} event The event that occurred.
 */
export type ViewChannelSubscriber<T, R> = (
  viewChannel: ViewChannel<T, R>,
  event: ViewChannelEvent<T, R>
) => void;

/**
 * Represents whether the `ViewChannelEvent` was presented, dismissed
 * or initialized.
 */
export type ViewChannelEventType = 'INITIALIZED' | 'PRESENTED' | 'DISMISSED';

/**
 * Represents an event which happened in the ViewChannel. Based
 * on the `type` you can determine which event occurred.
 */
export type ViewChannelBaseEvent = {
  /**
   * Which event occurred
   */
  type: ViewChannelEventType;

  /**
   * The time the event occurred on as a Date object.
   */
  time: Date;
};

/**
 * Represents the initialization of the ViewChannel
 */
export type ViewChannelInitializedEvent = ViewChannelBaseEvent & {
  /**
   * Which type occurred
   */
  type: 'INITIALIZED';
};

/**
 * Represents an insertion of a ViewChannelView into the ViewChannel.
 */
export type ViewChannelViewPresentedEvent<T, R> = ViewChannelBaseEvent & {
  /**
   * Which type occurred
   */
  type: 'PRESENTED';

  /**
   * The view which was inserted.
   *
   * Note: this was the view at the time of insertion, it might
   * currently be removed, so be aware that this view might no
   * longer be displayed in the `ViewChannel`.
   */
  view: ViewChannelView<T, R>;

  /**
   * The index of the insertion.
   *
   * Note: this was the index at the time of the insertion, it might
   * no longer be accurate.
   */
  index: number;
};

/**
 * The reason for removal, this can either be because the
 * `duration` of the view passed, in which case it is
 * `DURATION_PASSED`, or because the user closed the View, then
 * the reason will be `USER_INTERACTION`.
 */
export type ViewChannelViewDismissedEventReason =
  | 'AUTO_DISMISS'
  | 'USER_INTERACTION';

/**
 * Represents an removal of an ViewChannelView of the ViewChannel.
 */
export type ViewChannelViewDismissedEvent<T, R> = ViewChannelBaseEvent & {
  /**
   * Which type occurred
   */
  type: 'DISMISSED';

  /**
   * The reason for removal, this can either be because the
   * `duration` of the view passed, in which case it is
   * `DURATION_PASSED`, or because the user closed the View, then
   * the reason will be `USER_INTERACTION`.
   */
  reason: ViewChannelViewDismissedEventReason;

  /**
   * The view which was removed.
   */
  view: ViewChannelView<T, R>;

  /**
   * The index of removed item.
   *
   * Note: this was the index at the time of the removal, it might
   * no longer be accurate.
   */
  index: number;
};

/**
 * A ViewChannelEvent represents an event happened in the ViewChannel.
 * For example the insertion, removal, or activation of a
 * ViewChannelView<T>.
 */
export type ViewChannelEvent<T, R> =
  | ViewChannelInitializedEvent
  | ViewChannelViewPresentedEvent<T, R>
  | ViewChannelViewDismissedEvent<T, R>;
