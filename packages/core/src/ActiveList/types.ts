import { ActiveList } from './ActiveList';
import { ActiveListContent } from './ActiveListContent';

/**
 * Configures the initial state of the `ActiveList`
 *
 * @since 1.0.0
 */
export type ActiveListConfig<T> = {
  /**
   * The contents which you want to display, can be an array of anything
   * you want.
   *
   * Note: the `ActiveList` will wrap each item in the `contents` array
   * inside of a `ActiveListContent` item.
   *
   * Defaults to `[]` meaning there is no content.
   *
   * @since 1.0.0
   */
  contents?: T[];

  /**
   * How many items can be active at the same time.
   *
   * When the value of `limit` is `false` there is no limit to the
   * number of active items.
   *
   * Defaults to `1`.
   *
   * @since 1.0.0
   */
  maxActivationLimit?: number | false;

  /**
   * How the limit is enforced. In other words what the behavior
   * should be when the limit is surpassed.
   *
   * The modes are strings which can be the following values:
   *
   * 1. 'circular': the first item which was added will be removed so
   *    the last item can be added without violating the limit. This
   *    basically means that the first one in is the first one out.
   *
   * 2. 'error': An error is thrown whenever the limit is surpassed,
   *    the error is called the `ActiveListActivationLimitReachedError`.
   *
   * 3. 'ignore': Nothing happens when an item is added and the limit
   *    is ignored. The item is simply not added, but no error is
   *    thrown.
   *
   * Defaults to 'circular'.
   *
   * @since 1.0.0
   */
  maxActivationLimitBehavior?: ActiveListMaxActivationLimitBehavior;

  /**
   * Which item or items in the content array are currently active.
   *
   * When the `active` is an array each item in the array is activated
   * from left to right one at a time.
   *
   * Note: "active" is chosen over the "activeIndexes" property.
   *
   * Defaults to `[]` meaning no content is active.
   *
   * @since 1.0.0
   */
  active?: T | T[];

  /**
   * Which index or indexes of the content array are currently active.
   *
   * When the `activeIndexes` is an array each index in the array
   * is activated from left to right one at a time.
   *
   * Note: "active" is chosen over the "activeIndexes" property.
   *
   * Defaults to `[]` meaning no content is active.
   *
   * @since 1.0.0
   */
  activeIndexes?: number | number[];

  /**
   * Whether or not the content starts back at the beginning when
   * the end of the content is reached, and whether the content should
   * go to the end when moving left of the start.
   *
   * Defaults to `true`.
   *
   * @since 1.0.0
   */
  isCircular?: boolean;

  /**
   * Whether or not `autoPlay` is enabled. When `autoPlay` is enabled
   * it will automatically move to the next content, based on the
   * `duration`.
   *
   * When `isCircular` is `true` content will move to the right
   * indefinitely. When `isCircular` is `false` it will stop autoPlay
   * at the end of the content.
   *
   * Note: autoPlay will only start when one or more contents are
   * currently active. The reason for this is that the `duration`, is
   * based on the `ActiveList` `lastActivatedContent` property.
   * Whenever there are no more items to activate the autoPlay will
   * stop.
   *
   * Defaults to no autoPlay.
   *
   * @since 1.0.0
   */
  autoPlay?: ActiveListAutoPlayConfig<T>;

  /**
   * Describes which strings should be associated with what
   * direction, will be the value of the `ActiveList` property
   * `direction`.
   *
   * So when setting the direction `next` to "up"` and the content
   * moves up, the `ActiveList.direction` will be "up". Useful when
   * wanting to apply CSS classes based on the direction.
   *
   * Defaults to `{ next: 'right', previous: 'left' }`.
   *
   * @since 1.0.0
   */
  directions?: ActiveListDirection;

  /**
   * For how many items the `history` may contain in the `ActiveList`.
   *
   * Defaults to `0` meaning that it will not track history.
   *
   * @since 1.0.0
   */
  keepHistoryFor?: number;

  /**
   * The `cooldown` is the number of milliseconds before another
   * activation / deactivation is allowed. For example if the
   * `cooldown` is `5000` the `ActiveList` will not allow
   * transitions until after 5 seconds have passed. Any activation /
   * deactivation in that period will simply be ignored.
   *
   * This can be useful when you have an animation which should be
   * finished before allowing user interaction again.
   *
   * This global `cooldown` is the same for all transitions you might trigger.
   * If you want a `cooldown` that differs per button use the `cooldown`
   * in the `ActiveListActivationOptions` instead.
   *
   * Note that the `cooldown` options with the `ActiveListActivationOptions` takes
   * precedence over this more global cooldown.
   *
   * IMPORTANT: `cooldown` is only ran when `isUserInteraction` within
   * the `ActiveListActivationOptions` is `true`. This means that `autoPlay`, which
   * is not a user interaction, ignores the `cooldown`.
   *
   * @since 1.0.0
   */
  cooldown?: ActiveListCooldownConfig<T>;
};

/**
 * Describes all the behaviors for when the limit of the ActiveList
 * is surpassed.
 *
 * 1. 'circular': the first item which was added will be removed so
 *    the last item can be added without violating the limit. This
 *    basically means that the first one in is the first one out.
 *
 * 2. 'error': An error is thrown whenever the limit is surpassed,
 *    the error is called the `ActiveListActivationLimitReachedError`.
 *
 * 3. 'ignore': Nothing happens when an item is added and the limit
 *    is ignored. The item is simply not added, but no error is
 *    thrown.
 */
export type ActiveListMaxActivationLimitBehavior =
  | 'circular'
  | 'ignore'
  | 'error';

/**
 * Represents options for activation / deactivation methods.
 *
 * @since 1.0.0
 */
export type ActiveListActivationOptions<T> = {
  /**
   * Whether or not the action was taken by a user / human. This
   * affects the `autoPlay` when `stopsOnUserInteraction` is `true`,
   * the `autoPlay` stops, when `false` the autoPlay is debounced.
   *
   * Also affects the `cooldown` when `isUserInteraction` is `true`,
   * the `cooldown` is checked, otherwise when `false`
   * the `cooldown` is ignored.
   *
   * Defaults to `true`.
   *
   * @since 1.0.0
   */
  isUserInteraction?: boolean;

  /**
   * The `cooldown` is the number of milliseconds before another
   * activation / deactivation is allowed. For example if the
   * `cooldown` is `5000` the `ActiveList` will not allow
   * transitions until after 5 seconds have passed. Any activation /
   * deactivation in that period will simply be ignored.
   *
   * This can be useful when you have an animation which should be
   * finished before allowing user interaction again.
   *
   * The benefit of this `cooldown` over the `cooldown` in the
   * `Config`, is that this `cooldown` can be different for different
   * actions. For example: it allows you to create two buttons each
   * with a different cooldown.
   *
   * Note that the `cooldown` options within the `ActiveListActivationOptions`
   * takes precedence over the `cooldown` in the `Config`.
   *
   * IMPORTANT: `cooldown` is only ran when `isUserInteraction` within
   * the `ActiveListActivationOptions` is `true`. This means that
   * `autoPlay`, which is not a user interaction, ignores the
   * `cooldown`.
   *
   * @since 1.0.0
   */
  cooldown?: ActiveListCooldownConfig<T>;
};

/**
 * The subscriber which is informed of all state changes the
 * ActiveList goes through.
 *
 * @param {ActiveList<T>} activeList The ActiveList which had changes.
 * @param {ActiveListEvent<T>} event The event that occurred.
 *
 * @since 1.0.0
 */
export type ActiveListSubscriber<T> = (
  activeList: ActiveList<T>,
  event: ActiveListEvent<T>
) => void;

/**
 * Represents a bundle of data which is given as the first parameter
 * to the ContentPredicate function. Based on this data the
 * ContentPredicate must either return `true` or `false`.
 *
 * @since 1.0.0
 */
export type ActiveListContentPredicateData<T> = {
  /**
   * The value the ActiveListContent wraps.
   *
   * @since 1.0.0
   */
  value: T;

  /**
   * The index the ActiveListContent has within the ActiveList
   *
   * @since 1.0.0
   */
  index: number;

  /**
   * A reference to the ActiveListContent which wraps the value.
   *
   * @since 1.0.0
   */
  content: ActiveListContent<T>;

  /**
   * A reference to the ActiveList itself.
   *
   * @since 1.0.0
   */
  activeList: ActiveList<T>;
};

/**
 * Represents a callback which is given all relevant data for the
 * action, and expects either `true` or `false` to be returned. If
 * `true` is returned will perform the action.
 *
 * @param {ActiveListContentPredicateData<T>} data The data for which this predicate will determine if the action needs to be performed.
 * @returns {boolean} Whether or not to perform the action associated with the predicate based on the given item and index.
 *
 * @since 1.0.0
 */
export type ActiveListContentPredicate<T> = (
  data: ActiveListContentPredicateData<T>
) => boolean;

/**
 * Represents a bundle of data which is given whenever the
 * AutoPlayDurationCallbackData function must determine the number
 * of milliseconds the content should be active for.
 *
 * @since 1.0.0
 */
export type ActiveListAutoPlayDurationCallbackData<T> = {
  /**
   * The value which is currently asking which autoPlay duration it should have.
   *
   * @since 1.0.0
   */
  value: T;

  /**
   * The index the value has within the ActiveList
   *
   * @since 1.0.0
   */
  index: number;

  /**
   * A reference to the ActiveListContent which wraps the value.
   *
   * @since 1.0.0
   */
  content: ActiveListContent<T>;

  /**
   * A reference to the ActiveList itself.
   *
   * @since 1.0.0
   */
  activeList: ActiveList<T>;
};

/**
 * Represents a callback function which is given all relevant autoPlay
 * duration data, and expects to be given back the number of
 * milliseconds the content should be active before autoPlay moves on.
 *
 * @param {ActiveListAutoPlayDurationCallbackData<T>} data An object containing all relevant duration data for which the callback function must determine the number of milliseconds the content is active for.
 * @returns {number} The time in milliseconds the content is active for the given AutoPlayDurationCallbackData.
 *
 * @since 1.0.0
 */
export type ActiveListAutoPlayDurationCallback<T> = (
  config: ActiveListAutoPlayDurationCallbackData<T>
) => number;

/**
 * Represents the configuration for AutoPlay. AutoPlay means
 * that the ActiveList will move to the next content by itself
 * after a duration.
 *
 * @since 1.0.0
 */
export type ActiveListAutoPlayConfig<T> = {
  /**
   * The time in milliseconds the ActiveListContent should remain active, before
   * moving to the next ActiveListContent.
   *
   * @since 1.0.0
   */
  duration: ActiveListAutoPlayDurationCallback<T> | number;

  /**
   * Whether or not the user interacting with the component should
   * stop the autoPlay.
   *
   * When `true` any activation / deactivation method called on
   * the `ActiveList` will stop the autoPlay. When `false` it will
   * debounce the autoPlay instead by the duration.
   *
   * Defaults to `false`.
   *
   * @since 1.0.0
   */
  stopsOnUserInteraction?: boolean;
};

/**
 * AutoPlay means that the ActiveList will move to the next content by
 * itself after a duration.
 *
 * Contains wether or not the autoPlay is playing via `isPlaying` and
 * the current duration via `duration`.
 *
 * @since 1.0.0
 */
export type ActiveListAutoPlay = {
  /**
   * Whether or not the ActiveList is playing. In other words whether
   * or not the ActiveList is going to cycle through the content
   * automatically.
   *
   * @since 1.0.0
   */
  isPlaying: boolean;

  /**
   * The amount of milliseconds the item should remain active before
   * jumping to the next item.
   *
   * This duration is the duration for the current item which is
   * playing. It is not affected by calling pause, meaning that
   * when the duration is set to 200ms and you pause after 100ms,
   * the duration will still be 200ms.
   *
   * When calling `stop`, or when `stop` is called when the autoPlay
   * reaches the end, the duration will be set to zero.
   *
   * @since 1.0.0
   */
  duration: number;

  /**
   * Whether or not the ActiveList had the autoPlay stopped at one
   * point before.
   *
   * Use case: say you are making a carousel which should stop on
   * any user interaction, so you set `stopsOnUserInteraction` to
   * `true`. Say you also have another feature: a pause whenever
   * the user hovers over the carousel. These two features would cause
   * a conflict:
   *
   * Whenever the mouse over happens you call `play()`, which negates
   * the `stopsOnUserInteraction`, causing the carousel to play again.
   *
   * To fix this problem you should on the mouse over not call
   * `play()` whenever `hasBeenStoppedBefore` is `true`.
   *
   * @since 1.1.0
   */
  hasBeenStoppedBefore: boolean;
};

/**
 * Represents the configuration of the cooldown.
 *
 * Can be two possible things:
 *
 * 1. A callback function which receives the relevant cooldown data,
 *    and which is required to return the duration in milliseconds.
 *    Useful for providing a different cooldown for different items.
 *
 * 2. A number in milliseconds. When it is a number all items will
 *    have the same cooldown.
 *
 * @since 1.0.0
 */
export type ActiveListCooldownConfig<T> =
  | ActiveListCooldownDurationCallback<T>
  | number;

/**
 * Represents a bundle of data which is given whenever the
 * CooldownDurationCallback function must determine what the number of
 * milliseconds the content should be in a cooldown state.
 *
 * @since 1.0.0
 */
export type ActiveListCooldownDurationCallbackData<T> = {
  /**
   * The value which is currently asking which cooldown it should have.
   *
   * @since 1.0.0
   */
  value: T;

  /**
   * The index the value has within the ActiveList
   *
   * @since 1.0.0
   */
  index: number;

  /**
   * A reference to the ActiveListContent which wraps the value.
   *
   * @since 1.0.0
   */
  content: ActiveListContent<T>;

  /**
   * A reference to the ActiveList itself.
   *
   * @since 1.0.0
   */
  activeList: ActiveList<T>;
};

/**
 * Represents a callback function which is given all relevant cooldown
 * duration data, and expects to be given back the number of
 * milliseconds the content should be cooled down before it responds
 * to user interaction again.
 *
 * WARNING: do not return a negative number or zero in this callback
 * as this results in a `ActiveListCooldownDurationError`. The action
 * will still occur however, this means that the ActiveList is invalid
 * when this happens.
 *
 * @param {ActiveListCooldownDurationCallbackData<T>} data An object containing all relevant cooldown data for which the callback function must determine the cooldown duration in number of milliseconds.
 * @returns {number} The time in milliseconds of the duration of the cooldown for the given CooldownCallbackData.
 *
 * @since 1.0.0
 */
export type ActiveListCooldownDurationCallback<T> = (
  data: ActiveListCooldownDurationCallbackData<T>
) => number;

/**
 * A Cooldown is a time period in which all user made activations
 * and deactivations are prevented / ignored. Activations and
 * deactivations where the `isUserInteraction` is set to `false`
 * always bypass the cooldown.
 *
 * The use-case is a cooldown can guarantees that animations are
 * completed, before another is triggered.
 *
 * Contains wether or not the cooldown is active via `isActive` and
 * the current duration via `duration`.
 *
 * @since 1.0.0
 */
export type ActiveListCooldown = {
  /**
   * Whether or not the ActiveList is currently in the cooldown state.
   * When in cooldown all activations and deactivations are ignored.
   *
   * @since 1.0.0
   */
  isActive: boolean;

  /**
   * The amount of milliseconds the ActiveList should remain in
   * the cooldown state.
   *
   * @since 1.0.0
   */
  duration: number;
};

/**
 * Describes which strings should be associated with what
 * direction. For example it could be "right" and "left",
 * or "down" and "up".
 *
 * Will be the value of the `ActiveList` property `direction`.
 *
 * Useful for when animations have a certain direction and you
 * name your animation CSS classes `left-animation` and
 * `right-animation`.
 *
 * @since 1.0.0
 */
export type ActiveListDirection = {
  /**
   * The name of the direction when moving to the next item of the
   * `ActiveList`.
   *
   * Could for example be "right" or "down".
   *
   * @since 1.0.0
   */
  next: string;

  /**
   * The name of the direction when moving to the previous item of the
   * `ActiveList`.
   *
   * Could for example be "left" or "up".
   *
   * @since 1.0.0
   */
  previous: string;
};

/**
 * Represents whether the `ActiveListEvent` was inserted, removed, activated
 * swapped, etc etc.
 *
 * @since 1.0.0
 */
export type ActiveListEventType =
  | 'INITIALIZED'
  | 'INSERTED'
  | 'REMOVED'
  | 'REMOVED_MULTIPLE'
  | 'ACTIVATED'
  | 'ACTIVATED_MULTIPLE'
  | 'SWAPPED'
  | 'MOVED'
  | 'DEACTIVATED'
  | 'DEACTIVATED_MULTIPLE'
  | 'AUTO_PLAY_PLAYING'
  | 'AUTO_PLAY_PAUSED'
  | 'AUTO_PLAY_STOPPED'
  | 'COOLDOWN_STARTED'
  | 'COOLDOWN_ENDED';

/**
 * Represents an event which happened in the ActiveList. Based
 * on the `type` you can determine which event occurred.
 *
 * @since 1.0.0
 */
export type ActiveListBaseEvent = {
  /**
   * Which event occurred
   *
   * @since 1.0.0
   */
  type: ActiveListEventType;

  /**
   * The time the event occurred on as a Date object.
   *
   * @since 1.0.0
   */
  time: Date;
};

/**
 * Represents the initialization of the ActiveList
 *
 * @since 1.0.0
 */
export type ActiveListInitializedEvent<T> = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'INITIALIZED';

  /**
   * The values which were active upon initialization.
   *
   * Note: there are the values at the time of the initialization, they might
   * no longer be accurate. Keep in mind that when the `value` is
   * an object or an array, they can still be mutated, because no
   * copy is made.
   *
   * @since 1.0.0
   */
  values: T[];

  /**
   * The indexes of the values which were active upon initialization.
   *
   * Note: there are the indexes at the time of the initialization, it might
   * no longer be accurate.
   *
   * @since 1.0.0
   */
  indexes: number[];
};

/**
 * Represents an insertion into the ActiveList.
 */
export type ActiveListInsertedEvent<T> = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'INSERTED';

  /**
   * The value which was inserted.
   *
   * Note: this was the value at the time of insertion, it might
   * no longer be accurate. Keep in mind that when the `value` is
   * an object or an array, they can still be mutated, because no
   * copy is made.
   *
   * @since 1.0.0
   */
  value: T;

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
 * Represents an removal of an item of the ActiveList.
 *
 * @since 1.0.0
 */
export type ActiveListRemovedEvent<T> = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'REMOVED';

  /**
   * The value which was removed.
   *
   * Note: this was the value at the time of removal, it might
   * no longer be accurate. Keep in mind that when the `value` is
   * an object or an array, they can still be mutated, because no
   * copy is made.
   *
   * @since 1.0.0
   */
  value: T;

  /**
   * The index of removed item.
   *
   * Note: this was the index at the time of the removal, it might
   * no longer be accurate.
   *
   * @since 1.0.0
   */
  index: number;
};

/**
 * Represents multiple removals of items in the ActiveList.
 */
export type ActiveListRemovedMultipleEvent<T> = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'REMOVED_MULTIPLE';

  /**
   * The values which were removed
   *
   * Note: there are the values at the time of removal, they might
   * no longer be accurate. Keep in mind that when the `value` is
   * an object or an array, they can still be mutated, because no
   * copy is made.
   *
   * @since 1.0.0
   */
  values: T[];

  /**
   * The indexes of the removed items.
   *
   * Note: there are the indexes at the time of the removal, it might
   * no longer be accurate.
   *
   * @since 1.0.0
   */
  indexes: number[];
};

/**
 * Represents an activation of an ActiveList.
 */
export type ActiveListActivatedEvent<T> = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'ACTIVATED';

  /**
   * The value which was activated.
   *
   * Note: this was the value at the time of activation, it might
   * no longer be accurate. Keep in mind that when the `value` is
   * an object or an array, they can still be mutated, because no
   * copy is made.
   *
   * @since 1.0.0
   */
  value: T;

  /**
   * The index of the activated item.
   *
   * Note: this was the index at the time of the activation, it might
   * no longer be accurate.
   *
   * @since 1.0.0
   */
  index: number;
};

/**
 * Represents multiple activations happening at the same time in an
 * ActiveList.
 *
 * @since 1.0.0
 */
export type ActiveListActivatedMultipleEvent<T> = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'ACTIVATED_MULTIPLE';

  /**
   * The values which were activated.
   *
   * Note: there are the values at the time of deactivation, they might
   * no longer be accurate. Keep in mind that when the `value` is
   * an object or an array, they can still be mutated, because no
   * copy is made.
   *
   * @since 1.0.0
   */
  values: T[];

  /**
   * The indexes of the activated items.
   *
   * Note: these are the indexes at the time of the deactivation, it might
   * no longer be accurate.
   *
   * @since 1.0.0
   */
  indexes: number[];
};

/**
 * Represents a deactivation of an ActiveList.
 */
export type ActiveListDeactivatedEvent<T> = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'DEACTIVATED';

  /**
   * The value which was deactivated.
   *
   * Note: this was the value at the time of deactivation, it might
   * no longer be accurate. Keep in mind that when the `value` is
   * an object or an array, they can still be mutated, because no
   * copy is made.
   *
   * @since 1.0.0
   */
  value: T;

  /**
   * The index of the deactivated item.
   *
   * Note: this was the index at the time of the deactivation, it might
   * no longer be accurate.
   *
   * @since 1.0.0
   */
  index: number;
};

/**
 * Represents multiple deactivations happening at the same time in an
 * ActiveList.
 */
export type ActiveListDeactivatedMultipleEvent<T> = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'DEACTIVATED_MULTIPLE';

  /**
   * The values which were deactivated.
   *
   * Note: there are the values at the time of deactivation, they might
   * no longer be accurate. Keep in mind that when the `value` is
   * an object or an array, they can still be mutated, because no
   * copy is made.
   *
   * @since 1.0.0
   */
  values: T[];

  /**
   * The indexes of the deactivated items.
   *
   * Note: these are the indexes at the time of the deactivation, it might
   * no longer be accurate.
   *
   * @since 1.0.0
   */
  indexes: number[];
};

/**
 * Represents an activation of an ActiveList.
 *
 * @since 1.0.0
 */
export type ActiveListSwappedEvent<T> = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'SWAPPED';

  /**
   * An object containing the value of the items which were swapped.
   *
   * @since 1.0.0
   */
  value: {
    /**
     * The value of the first item which was swapped.
     *
     * Note: this was the value at the time of the swap, it might
     * no longer be accurate. Keep in mind that when the `value` is
     * an object or an array, they can still be mutated, because no
     * copy is made.
     *
     * @since 1.0.0
     */
    a: T;

    /**
     * The value of the second item which was swapped.
     *
     *  Note: this was the value at the time of the swap, it might
     * no longer be accurate. Keep in mind that when the `value` is
     * an object or an array, they can still be mutated, because no
     * copy is made.
     *
     * @since 1.0.0
     */
    b: T;
  };

  /**
   * An object containing the indexes of the items which were swapped.
   *
   * @since 1.0.0
   */
  index: {
    /**
     * The index of the first item before it was swapped.
     *
     * Note: this was the index at the time of the activation, it might
     * no longer be accurate.
     *
     * @since 1.0.0
     */
    a: number;

    /**
     * The index of the second item before it was swapped.
     *
     * Note: this was the index at the time of the activation, it might
     * no longer be accurate.
     *
     * @since 1.0.0
     */
    b: number;
  };
};

/**
 * Represents an activation of an ActiveList.
 */
export type ActiveListMovedEvent<T> = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'MOVED';

  /**
   * The value which was moved.
   *
   * Note: this was the value at the time of the move, it might
   * no longer be accurate. Keep in mind that when the `value` is
   * an object or an array, they can still be mutated, because no
   * copy is made.
   *
   * @since 1.0.0
   */
  value: T;

  /**
   * An object containing the "from" and "to" index of the item which
   * were moved.
   *
   * Note: this was the index at the time of the activation, it might
   * no longer be accurate.
   *
   * @since 1.0.0
   */
  index: {
    /**
     * The index of the "from" item before it was moved.
     *
     * Note: this was the index at the time of the activation, it might
     * no longer be accurate.
     *
     * @since 1.0.0
     */
    from: number;

    /**
     * The index of the "to" item before it was moved.
     *
     * Note: this was the index at the time of the activation, it might
     * no longer be accurate.
     *
     * @since 1.0.0
     */
    to: number;
  };
};

/**
 * Represents an ActiveList autoPlay being restarted again when it was
 * stopped or paused.
 *
 * Note: this event is not fired when a ActiveList is initialized
 * even though this does start the autoPlay.
 *
 * @since 1.0.0
 */
export type ActiveListAutoPlayPlayingEvent = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'AUTO_PLAY_PLAYING';
};

/**
 * Represents an ActiveList autoPlay being paused.
 *
 * @since 1.0.0
 */
export type ActiveListAutoPlayPausedEvent = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'AUTO_PLAY_PAUSED';
};

/**
 * Represents an ActiveList autoPlay being stopped.
 *
 * Can be fired for four reasons:
 *
 * 1. The `stop` method on the `ActiveList` is called.
 *
 * 2. The autoPlay reached the last of the items, which can only
 *    happen when `isCircular` is `false`.
 *
 * 3. When all content items are removed when the autoPlay is playing.
 *    It will then stop automatically since there are no more items.
 *
 * 4. When no more items are left active, in this case the autoPlay
 *    will stop as well.
 *
 * Note: due to reasons 3 and 4 this event can be fired right before
 * a 'REMOVED', 'REMOVED_MULTIPLE', 'DEACTIVATED' and
 * 'DEACTIVATED_MULTIPLE' event.
 *
 * @since 1.0.0
 */
export type ActiveListAutoPlayStoppedEvent = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'AUTO_PLAY_STOPPED';
};

/**
 * Represents an ActiveList being in a cooldown state, meaning no
 * activations or deactivations can occur.
 *
 * @since 1.0.0
 */
export type ActiveListCooldownStartedEvent = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'COOLDOWN_STARTED';
};

/**
 * Represents an ActiveList moving out of the cooldown state, meaning
 * all activation and deactivations can occur again.
 *
 * @since 1.0.0
 */
export type ActiveListCooldownEndedEvent = ActiveListBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.0.0
   */
  type: 'COOLDOWN_ENDED';
};

/**
 * A ActiveListEvent represents an event happened in the ActiveList.
 * For example the insertion, removal, or activation of a
 * ActiveListContent<T>.
 *
 * @since 1.0.0
 */
export type ActiveListEvent<T> =
  | ActiveListInitializedEvent<T>
  | ActiveListInsertedEvent<T>
  | ActiveListRemovedEvent<T>
  | ActiveListRemovedMultipleEvent<T>
  | ActiveListActivatedEvent<T>
  | ActiveListActivatedMultipleEvent<T>
  | ActiveListSwappedEvent<T>
  | ActiveListMovedEvent<T>
  | ActiveListDeactivatedEvent<T>
  | ActiveListDeactivatedMultipleEvent<T>
  | ActiveListAutoPlayPlayingEvent
  | ActiveListAutoPlayPausedEvent
  | ActiveListAutoPlayStoppedEvent
  | ActiveListCooldownStartedEvent
  | ActiveListCooldownEndedEvent;

/**
 * Represents where the action needs to take place for when a
 * predicate is provided.
 *
 * 1. When the mode is 'at', the `ActiveListContent` is inserted to the
 *    position where the predicate matches. This is the `default`
 *    mode.
 *
 * 2. When the mode is 'after', the `ActiveListContent` is inserted to after
 *    the position where the predicate matches.
 *
 * 3. When the mode is 'before', the `ActiveListContent` is inserted to
 *    before the position where the predicate matches.
 *
 * @since 1.0.0
 */
export type ActiveListPredicateMode = 'at' | 'before' | 'after';

/**
 * Represents options for methods which require predicates.
 *
 * @since 1.0.0
 */
export type ActiveListPredicateOptions = {
  /**
   * Represents where the action needs to take place for when a
   * predicate is provided.
   *
   * Represents where the action needs to take place for when a
   * predicate is provided.
   *
   * 1. When the mode is 'at', the `ActiveListContent` is inserted to the
   *    position where the predicate matches. This is the `default`
   *    mode.
   *
   * 2. When the mode is 'after', the `ActiveListContent` is inserted to after
   *    the position where the predicate matches.
   *
   * 3. When the mode is 'before', the `ActiveListContent` is inserted to
   *    before the position where the predicate matches.
   *
   * @since 1.0.0
   */
  mode: ActiveListPredicateMode;
};
