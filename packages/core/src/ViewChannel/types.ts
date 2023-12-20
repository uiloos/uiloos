import { ViewChannel } from './ViewChannel';
import { ViewChannelView } from './ViewChannelView';

/**
 * Configures the initial state of the `ViewChannel`.
 *
 * @since 1.0.0
 */
export type ViewChannelConfig = {
  /**
   * For how many items the `history` may contain in the `ViewChannel`.
   *
   * Defaults to `0` meaning that it will not track history.
   *
   * @since 1.0.0
   */
  keepHistoryFor?: number;
};

/**
 * Represents the configuration for AutoDismiss. AutoDismiss means
 * that the ViewChannelView will remove itself after a duration.
 *
 * @since 1.0.0
 */
export type ViewChannelViewAutoDismissConfig<R> = {
  /**
   * The amount of milliseconds the view should remain visible to
   * the user. Once the duration has passed the view is removed
   * from the `ViewChannel` automatically.
   *
   * @since 1.0.0
   */
  duration: number;

  /**
   * The value (R) to resolve the promise of the `ViewChannelView`
   * with. This allows you to distinguish between user events,
   * such as clicking a cancel / save button or an auto dismissal.
   *
   * @since 1.0.0
   */
  result: R;
};

/**
 * AutoDismiss means that the ViewChannelView will dismiss itself
 * after a duration.
 *
 * Contains wether or not the autoDismiss is playing via `isPlaying`
 * and the current duration via `duration`.
 *
 * @since 1.0.0
 */
export type ViewChannelViewAutoDismiss = {
  /**
   * Whether or not the ViewChannelView is playing. In other words
   * whether or not the ViewChannelView is going to be autoDismissed
   * after a duration.
   *
   * @since 1.0.0
   */
  isPlaying: boolean;

  /**
   * The amount of milliseconds the view should remain visible to
   * the user. Once the duration has passed the view is removed
   * from the `ViewChannel` automatically.
   *
   * This duration is the duration for when the ViewChannelView
   * started playing. It is not affected by calling pause, meaning
   * that when the duration is set to 200ms and you pause after
   * 100ms, the duration will still be 200ms.
   *
   * When calling `stop`, or when the ViewChannelView is dismissed
   * the duration will be set to zero.
   *
   * @since 1.0.0
   */
  duration: number;
};

/**
 * Holds the configuration of a view which is placed in the
 * `ViewChannel`. From this configuration the actual
 * `ViewChannelView` is created.
 *
 * @since 1.0.0
 */
export type ViewChannelViewConfig<T, R> = {
  /**
   * The data for the presented view, "data" can be be anything from
   * an object, string, array etc etc. It is used to pass along data
   * to the view you might need to display the view, such as the
   * text for a flash message or confirmation dialog.
   *
   * By default the value is `undefined`.
   *
   * @since 1.0.0
   */
  data: T;

  /**
   * Whether or not `autoDismiss` is enabled. When `autoDismiss` is
   * enabled it will dismiss the view, based on the `duration`.
   *
   * Defaults to no autoDismiss, meaning it will stay visible forever,
   * until it is dismissed.
   *
   * @since 1.0.0
   */
  autoDismiss?: ViewChannelViewAutoDismissConfig<R>;

  /**
   * The priority the `ViewChannelView` will have within the
   * `ViewChannel`. The lower the priority the closer it will be to
   * the start of the `ViewChannel` views array.
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
   *
   * @since 1.0.0
   */
  priority?: number | number[];
};

/**
 * The subscriber which is informed of all state changes the
 * ViewChannel goes through.
 *
 * @param {ViewChannel<T, R>} viewChannel The ViewChannel which had changes.
 * @param {ViewChannelEvent<T>} event The event that occurred.
 *
 * @since 1.0.0
 */
export type ViewChannelSubscriber<T, R> = (
  viewChannel: ViewChannel<T, R>,
  event: ViewChannelEvent<T, R>
) => void;

/**
 * Represents whether the `ViewChannelEvent` was presented, dismissed
 * or initialized.
 *
 * @since 1.0.0
 */
export type ViewChannelEventType =
  | 'INITIALIZED'
  | 'PRESENTED'
  | 'DISMISSED'
  | 'DISMISSED_ALL'
  | 'AUTO_DISMISS_PLAYING'
  | 'AUTO_DISMISS_PAUSED'
  | 'AUTO_DISMISS_STOPPED'
  | 'DATA_CHANGED';

/**
 * Represents an event which happened in the ViewChannel. Based
 * on the `type` you can determine which event occurred.
 *
 * @since 1.0.0
 */
export type ViewChannelBaseEvent = {
  /**
   * Which event occurred
   *
   * @since 1.0.0
   */
  type: ViewChannelEventType;

  /**
   * The time the event occurred on as a Date object.
   *
   * @since 1.0.0
   */
  time: Date;
};

/**
 * Represents the initialization of the ViewChannel
 *
 * @since 1.0.0
 */
export type ViewChannelInitializedEvent = ViewChannelBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'INITIALIZED';
};

/**
 * Represents an insertion of a ViewChannelView into the ViewChannel.
 *
 * @since 1.0.0
 */
export type ViewChannelViewPresentedEvent<T, R> = ViewChannelBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'PRESENTED';

  /**
   * The view which was inserted.
   *
   * Note: this was the view at the time of insertion, it might
   * currently be removed, so be aware that this view might no
   * longer be displayed in the `ViewChannel`.
   *
   * @since 1.0.0
   */
  view: ViewChannelView<T, R>;

  /**
   * The index of the insertion.
   *
   * Note: this was the index at the time of the insertion, it might
   * no longer be accurate.
   *
   * @since 1.0.0
   */
  index: number;
};

/**
 * The reason for dismissal, this can either be because the
 * `duration` of the view passed, in which case it is
 * `DURATION_PASSED`, or because the user closed the View, then
 * the reason will be `USER_INTERACTION`.
 *
 * @since 1.0.0
 */
export type ViewChannelViewDismissedEventReason =
  | 'AUTO_DISMISS'
  | 'USER_INTERACTION';

/**
 * Represents a dismissal of an ViewChannelView of the ViewChannel.
 *
 * Note: when this event is fired the "AUTO_DISMISS_STOPPED" event
 * will not be fired even when autoDismiss is playing. The reason for
 * this is because on "DISMISSED" the entire view should be cleared.
 *
 * @since 1.0.0
 */
export type ViewChannelViewDismissedEvent<T, R> = ViewChannelBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'DISMISSED';

  /**
   * The reason for dismissal, this can either be because the
   * `duration` of the view passed, in which case it is
   * `DURATION_PASSED`, or because the user closed the View, then
   * the reason will be `USER_INTERACTION`.
   *
   * @since 1.0.0
   */
  reason: ViewChannelViewDismissedEventReason;

  /**
   * The view which was removed.
   *
   * @since 1.0.0
   */
  view: ViewChannelView<T, R>;

  /**
   * The index of removed item.
   *
   * Note: this was the index at the time of the dismissal, it might
   * no longer be accurate.
   *
   * @since 1.0.0
   */
  index: number;
};

/**
 * Represents an dismissal of all ViewChannelViews of the ViewChannel.
 *
 * @since 1.0.0
 */
export type ViewChannelViewDismissedAllEvent<T, R> = ViewChannelBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'DISMISSED_ALL';

  /**
   * The views which were removed.
   *
   * @since 1.0.0
   */
  views: ViewChannelView<T, R>[];

  /**
   * The indexes of the dismissed views.
   *
   * Note: there are the indexes at the time of the dismissal, it might
   * no longer be accurate.
   *
   * @since 1.0.0
   */
  indexes: number[];
};

/**
 * Represents a ViewChannelView autoDismiss being restarted again
 * when it was stopped or paused.
 *
 * Note: this event is not fired when a ViewChannelView is presented
 * initially, even though this does start the autoDismiss.
 *
 * @since 1.0.0
 */
export type ViewChannelViewAutoDismissPlayingEvent<T, R> =
  ViewChannelBaseEvent & {
    /**
     * Which type occurred
     *
     * @since 1.0.0
     */
    type: 'AUTO_DISMISS_PLAYING';

    /**
     * The view which had its auto dismiss started / played.
     *
     * @since 1.0.0
     */
    view: ViewChannelView<T, R>;

    /**
     * The index of the view which had its auto dismiss started /
     * played.
     *
     * Note: this was the index at the time of playing, it might no
     * longer be accurate.
     *
     * @since 1.0.0
     */
    index: number;
  };

/**
 * Represents a ViewChannelView autoDismiss being paused of the given
 * ViewChannel.
 *
 * @since 1.0.0
 */
export type ViewChannelViewAutoDismissPausedEvent<T, R> =
  ViewChannelBaseEvent & {
    /**
     * Which type occurred
     *
     * @since 1.0.0
     */
    type: 'AUTO_DISMISS_PAUSED';

    /**
     * The view which had its auto dismiss paused.
     *
     * @since 1.0.0
     */
    view: ViewChannelView<T, R>;

    /**
     * The index of the view which had its auto dismiss paused.
     *
     * Note: this was the index at the time of pausing, it might no
     * longer be accurate.
     *
     * @since 1.0.0
     */
    index: number;
  };

/**
 * Represents a ViewChannelView autoDismiss being stopped of the given
 * ViewChannel.
 *
 * @since 1.0.0
 */
export type ViewChannelViewAutoDismissStoppedEvent<T, R> =
  ViewChannelBaseEvent & {
    /**
     * Which type occurred
     *
     * @since 1.0.0
     */
    type: 'AUTO_DISMISS_STOPPED';

    /**
     * The view which had its auto dismiss stopped.
     *
     * @since 1.0.0
     */
    view: ViewChannelView<T, R>;

    /**
     * The index of the view which had its auto dismiss stopped.
     *
     * Note: this was the index at the time of stopping, it might no
     * longer be accurate.
     *
     * @since 1.0.0
     */
    index: number;
  };

/**
 * Represents a changing of the data of a ViewChannelView
 *
 * @since 1.6.0
 */
export type ViewChannelViewDataChangedEvent<T, R> = ViewChannelBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.6.0
   */
  type: 'DATA_CHANGED';

  /**
   * The views which had its data changed
   *
   * @since 1.6.0
   */
  view: ViewChannelView<T, R>;

  /**
   * The new data for the ViewChannelView
   *
   * @since 1.6.0
   */
  data: T;

  /**
   * The index of the view which had its data changed
   *
   * Note: this was the index at the time of changing, it might no
   * longer be accurate.
   *
   * @since 1.6.0
   */
  index: number;
};

/**
 * A ViewChannelEvent represents an event happened in the ViewChannel.
 * For example the presented and dismissal of the ViewChannelView.
 *
 * @since 1.0.0
 */
export type ViewChannelEvent<T, R> =
  | ViewChannelInitializedEvent
  | ViewChannelViewPresentedEvent<T, R>
  | ViewChannelViewDismissedEvent<T, R>
  | ViewChannelViewDismissedAllEvent<T, R>
  | ViewChannelViewAutoDismissPlayingEvent<T, R>
  | ViewChannelViewAutoDismissPausedEvent<T, R>
  | ViewChannelViewAutoDismissStoppedEvent<T, R>
  | ViewChannelViewDataChangedEvent<T,R>;