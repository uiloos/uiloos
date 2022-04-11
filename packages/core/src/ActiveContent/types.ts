import { ActiveContent } from './ActiveContent';
import { Content } from './Content';

/**
 * Configures the initial state of the `ActiveContent`
 */
export type ActiveContentConfig<T> = {
  /**
   * The contents which you want to display, can be an array of anything
   * you want.
   *
   * Note: the `ActiveContent` will wrap each item in the `contents` array
   * inside of a `Content` item.
   */
  contents: T[];

  /**
   * How many items can be active at the same time.
   *
   * When the value of `limit` is `false` there is no limit to the
   * number of active items.
   *
   * Defaults to 1.
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
   * 2. 'error': An error is thrown whenever the limit is surpassed.: TODO: ERROR HERE
   * 
   * 3. 'ignore': Nothing happens when an item is added and the limit 
   *    is ignored. The item is simply not added, but no error is 
   *    thrown.
   *
   * Defaults to 'circular'.
   */
  maxActivationLimitBehavior?: ActiveContentMaxActivationLimitBehavior;

  /**
   * Which item or items in the content array are currently active.
   *
   * When the `active` is an array each item in the array is activated 
   * from left to right one at a time.
   * 
   * Note: "active" is chosen over the "activeIndexes" property.
   * 
   * Defaults to `[]` meaning no content is active.
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
   */
  activeIndexes?: number | number[];

  /**
   * Whether or not the content starts back at the beginning when
   * the end of the content is reached, and whether the content should
   * go to the end when moving left of the start.
   *
   * Defaults to `true`.
   */
  isCircular?: boolean;

  /**
   * Whether or not `autoplay` is enabled. When `autoplay` is enabled
   * it will automatically move to the next content, based on the
   * `duration`.
   *
   * When `isCircular` is `true` content will move to the right
   * indefinitely. When `isCircular` is `false` it will stop autoplay
   * at the end of the content.
   * 
   * Note: autoplay will only start when one or more contents are 
   * currently active. The reason for this is that the `duration`, is 
   * based on the `ActiveContent`'s `lastActivatedContent` property.  
   * Whenever there are no more active contents the autoplay will 
   * stop. 
   */
  autoplay?: AutoplayConfig<T>;

  /**
   * Describes which strings should be associated with what
   * direction, will be the value of the `ActiveContent` property
   * `direction`.
   *
   * So when setting the direction `next` to "up"` and the content
   * moves up, the `ActiveContent.direction` will be "up". Useful when
   * wanting to apply CSS classes based on the direction.
   *
   * Defaults to `{ next: 'right', previous: 'left' }`.
   */
  directions?: Direction;

  /**
   * For how many items the `history` may contain in the `ActiveContent`.
   *
   * Defaults to `0` meaning that it will not track history.
   */
  keepHistoryFor?: number;

  /**
   * The `cooldown` is the number of milliseconds before another
   * interaction is allowed. For example if the `cooldown` is `5000`
   * the `ActiveContent` will not allow transitions until after
   * 5 seconds have passed. Any user interaction in that period
   * will simply be ignored.
   *
   * This can be useful when you have an animation which should be
   * finished before allowing user interaction again.
   *
   * This global `cooldown` is the same for all transitions you might trigger.
   * If you want a `cooldown` that differs per button use the `cooldown`
   * in the `ActivationOptions` instead.
   *
   * Note that the `cooldown` options with the `ActivationOptions` takes
   * precedence over this more global cooldown.
   *
   * IMPORTANT: `cooldown` is only ran when `isUserInteraction` within
   * the `ActivationOptions` is `true`. This means that `autoplay`, which
   * is not a user interaction, ignores the `cooldown`.
   */
  cooldown?: CooldownCallback<T> | number;
};

/**
 * Describes all the behaviors for when the limit of the ActiveContent
 * is surpassed.
 */
 export type ActiveContentMaxActivationLimitBehavior = 'circular' | 'ignore' | 'error';

/**
 * Represents opt``Zions for activation / deactivation methods.
 */
export type ActivationOptions<T> = {
  /**
   * Whether or not the action was taken by a user / human.
   * This affects the `autoplay` when `stopsOnUserInteraction`
   * is `true`, the `autoplay` stops.
   *
   * Also affects the `cooldown` when `isUserInteraction`
   * is `true`, the `cooldown` is checked, otherwise when `false`
   * the `cooldown` is ignored.
   */
  isUserInteraction?: boolean;

  /**
   * The `cooldown` is the number of milliseconds before another
   * interaction is allowed. For example if the `cooldown` is `5000`
   * the `ActiveContent` will not allow transitions until after
   * 5 seconds have passed. Any user interaction in that period
   * will simply be ignored.
   *
   * This can be useful when you have an animation which should be
   * finished before allowing user interaction again.
   *
   * Note that the `cooldown` options within the `ActivationOptions` takes
   * precedence over the `cooldown` in the `Config`.
   *
   * The benefit of this `cooldown` over the `cooldown` in the
   * `Config`, is that this `cooldown` can be different for different
   * actions. For example: it allows you to create two buttons each with a
   * different cooldown.
   *
   * IMPORTANT: the `cooldown` is only applied for the current action
   * the `ActivationOptions` is used for. Meaning that if you set
   * the cooldown to 5000 with one button, and to 1000 in another, and
   * 1001 seconds pass the transition will be triggered. It does not
   * REMEMBER the 5000 milliseconds cooldown from the other button.
   *
   * IMPORTANT: `cooldown` is only ran when `isUserInteraction` within
   * the `ActivationOptions` is `true`. This means that `autoplay`, which
   * is not a user interaction, ignores the `cooldown`.
   */
  cooldown?: CooldownConfig<T>;
};

/**
 * The subscriber which is informed of all state changes the
 * ActiveContent goes through.
 *
 * @param {ActiveContent<T>} activeContent The active content which had changes.
 */
export type ActiveContentSubscriber<T> = (
  activeContent: ActiveContent<T>
) => void;

/**
 * A function which when called will unsubscribe from the ActiveContent.
 */
export type UnsubscribeFunction = () => void;

/**
 * Represents a bundle of data which is given as the first parameter
 * to the ContentPredicate function. Based on this data the 
 * ContentPredicate must either return `true` or `false`.
 */
 export type ContentPredicateData<T> = {
  /**
   * The value the Content wraps.
   */
  value: T,

  /**
   * The index the Content has within the ActiveContent
   */
  index: number,

  /**
   * A reference to the Content which wraps the value.
   */
  content: Content<T>,

  /**
   * A reference to the ActiveContent itself.
   */
  activeContent: ActiveContent<T>,
}

/**
 * Represents a callback which is given all relevant data for the
 * action, and expects either `true` or `false` to be returned. If
 * `true` is returned will perform the action.
 *
 * @param {ContentPredicateData<T>} data The data for which this predicate will determine if the action needs to be performed.
 * @returns {boolean} Whether or not to perform the action associated with the predicate based on the given item and index.
 */
 export type ContentPredicate<T> = (data: ContentPredicateData<T>) => boolean;

/**
 * Represents a bundle of data which is given whenever the 
 * AutoplayDurationCallbackData function must determine the number 
 * of milliseconds the content should be active for.
 */
 export type AutoplayDurationCallbackData<T> = {
  /**
   * The value which is currently asking which autoplay duration it should have.
   */
  value: T,

  /**
   * The index the value has within the ActiveContent
   */
  index: number,

  /**
   * A reference to the Content which wraps the value.
   */
  content: Content<T>,

  /**
   * A reference to the ActiveContent itself.
   */
  activeContent: ActiveContent<T>,
}

/**
 * Represents a callback function which is given all relevant autoplay 
 * duration data, and expects to be given back the number of 
 * milliseconds the content should be active before Autoplay moves on.
 *
 * @param {AutoplayDurationCallbackData} data An object containing all relevant duration data for which the callback function must determine the number of milliseconds the content is active for.
 * @returns {number} The time in milliseconds the content is active for the given AutoplayDurationCallbackData.
 */
export type AutoplayDurationCallback<T> = (config: AutoplayDurationCallbackData<T>) => number;

/**
 * Represents the configuration of the cooldown.
 *
 * Can be two possible things:
 *
 * 1. A callback function which receives the item and index, and which
 *    is required to return the duration in milliseconds. Useful for
 *    providing a different cooldown for different items.
 *
 * 2. A number in milliseconds. When it is a number all items will
 *    have the same cooldown.
 */
export type CooldownConfig<T> = CooldownCallback<T> | number;

/**
 * Represents a callback which is given the active item, and the
 * active index for that item, and expects to be given the number of
 * milliseconds the item will not respond to interaction.
 *
 * @param {T} item The item for which the callback function must determine the cooldown duration.
 * @param {number} index The index of the item within the ActiveContent.
 * @returns {number} The time in milliseconds of the duration of the cooldown for the given item and index.
 */
export type CooldownCallback<T> = (item: T, index: number) => number;

/**
 * Represents the configuration for Autoplay. Autoplay means
 * that the ActiveContent will move to the next content by itself
 * after a duration.
 */
export type AutoplayConfig<T> = {
  /**
   * The time in milliseconds the Content should remain active, before
   * moving to the next Content.
   */
  duration: AutoplayDurationCallback<T> | number;

  /**
   * Whether or not the user interacting with the component should
   * stop the autoplay.
   *
   * Defaults to `true`.
   */
  stopsOnUserInteraction?: boolean;
};

/**
 * Describes which strings should be associated with what
 * direction. For example it could be "right" and "left",
 * or "down" and "up".
 *
 * Will be the value of the `ActiveContent` property `direction`.
 *
 * Useful for when animations have a certain direction and you
 * name your animation CSS classes `left-animation` and
 * `right-animation`.
 */
export type Direction = {
  /**
   * The name of the direction when moving to the next item of the
   * `ActiveContent`.
   *
   * Could for example be "right" or "down".
   */
  next: string;

  /**
   * The name of the direction when moving to the previous item of the
   * `ActiveContent`.
   *
   * Could for example be "left" or "up".
   */
  previous: string;
};

/**
 * Represents whether the `HistoryItem` was added, removed, activated
 * or swapped.
 */
export type HistoryAction =
  | 'INSERTED'
  | 'REMOVED'
  | 'ACTIVATED'
  | 'SWAPPED'
  | 'MOVED'
  | 'DEACTIVATED';

/**
 * Represents an item in the `history` array of the state. Based
 * on the `type` you can determine which action occurred.
 */
export type BaseHistoryItem = {
  /**
   * Which action occurred
   */
  action: HistoryAction;

  /**
   * The time the event occurred on as a Date object.
   */
  time: Date;
};

/**
 * Represents an insertion into the ActiveContent.
 */
export type InsertedHistoryItem<T> = BaseHistoryItem & {
  /**
   * Which action occurred
   */
  action: 'INSERTED';

  /**
   * The value which was inserted
   */
  value: T;

  /**
   * The index of the insertion.
   *
   * Note: this was the index at the time of the insertion, it might
   * nog longer be accurate.
   */
  index: number;
};

/**
 * Represents an removal of an item of the ActiveContent.
 */
export type RemovedHistoryItem<T> = BaseHistoryItem & {
  /**
   * Which action occurred
   */
  action: 'REMOVED';

  /**
   * The value which was removed
   */
  value: T;

  /**
   * The index of removed item.
   *
   * Note: this was the index at the time of the removal, it might
   * nog longer be accurate.
   */
  index: number;
};

/**
 * Represents an activation of an ActiveContent.
 */
export type ActivatedHistoryItem<T> = BaseHistoryItem & {
  /**
   * Which action occurred
   */
  action: 'ACTIVATED';

  /**
   * The value which was activated
   */
  value: T;

  /**
   * The index of the activated item.
   *
   * Note: this was the index at the time of the activation, it might
   * nog longer be accurate.
   */
  index: number;
};

/**
 * Represents a deactivation of an ActiveContent.
 */
 export type DeactivatedHistoryItem<T> = BaseHistoryItem & {
  /**
   * Which action occurred
   */
  action: 'DEACTIVATED';

  /**
   * The value which was deactivated
   */
  value: T;

  /**
   * The index of the deactivated item.
   *
   * Note: this was the index at the time of the deactivation, it might
   * nog longer be accurate.
   */
  index: number;
};

/**
 * Represents an activation of an ActiveContent.
 */
export type SwappedHistoryItem<T> = BaseHistoryItem & {
  /**
   * Which action occurred
   */
  action: 'SWAPPED';

  /**
   * An object containing the value of the items which were swapped.
   */
  value: {
    /**
     * The value of the first item which was swapped
     */
    a: T;

    /**
     * The value of the second item which was swapped
     */
    b: T;
  };

  /**
   * An object containing the indexes of the items which were swapped.
   */
  index: {
    /**
     * The index of the first item before it was swapped.
     *
     * Note: this was the index at the time of the activation, it might
     * nog longer be accurate.
     */
    a: number;

    /**
     * The index of the second item before it was swapped.
     *
     * Note: this was the index at the time of the activation, it might
     * nog longer be accurate.
     */
    b: number;
  };
};

/**
 * Represents an activation of an ActiveContent.
 */
export type MovedHistoryItem<T> = BaseHistoryItem & {
  /**
   * Which action occurred
   */
  action: 'MOVED';

  /**
   * The value which was moved
   */
  value: T;

  /**
   * An object containing the "from" and "to" index of the item which
   * were moved.
   *
   * Note: this was the index at the time of the activation, it might
   * nog longer be accurate.
   */
  index: {
    /**
     * The index of the "from" item before it was moved.
     *
     * Note: this was the index at the time of the activation, it might
     * nog longer be accurate.
     */
    from: number;

    /**
     * The index of the "to" item before it was moved.
     *
     * Note: this was the index at the time of the activation, it might
     * nog longer be accurate.
     */
    to: number;
  };
};

/**
 * A HistoryItem represents an event happened in the ActiveContent.
 * For example the insertion, removal, or activation of a Content<T>.
 */
export type HistoryItem<T> =
  | InsertedHistoryItem<T>
  | RemovedHistoryItem<T>
  | ActivatedHistoryItem<T>
  | SwappedHistoryItem<T>
  | MovedHistoryItem<T>
  | DeactivatedHistoryItem<T>;
