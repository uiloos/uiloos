/*
  This import will be removed during the minification build so terser
  leaves it alone. Make sure that it is not committed into git as an 
  uncommented line!

  If you run build and the line below is commented you will get
  this error: `Cannot find name 'uiloosLicenseChecker'`.

  See rollup.minification.config.js for more information
*/
import * as uiloosLicenseChecker from '../license/license';

import { UnsubscribeFunction, Observable } from '../generic/types';
import { _AutoPlay } from './AutoPlay';
import { ActiveListContent } from './ActiveListContent';
import { _CooldownTimer } from './CooldownTimer';
import { ActiveListActivationLimitReachedError } from './errors/ActiveListActivationLimitReachedError';
import { throwIndexOutOfBoundsError } from './errors/ActiveListIndexOutOfBoundsError';
import { ActiveListItemNotFoundError } from './errors/ActiveListItemNotFoundError';
import {
  ActiveListActivationOptions,
  ActiveListAutoPlayConfig,
  ActiveListConfig,
  ActiveListDirection,
  ActiveListEvent,
  ActiveListContentPredicate,
  ActiveListSubscriber,
  ActiveListMaxActivationLimitBehavior,
  ActiveListContentPredicateData,
  ActiveListInitializedEvent,
  ActiveListActivatedEvent,
  ActiveListDeactivatedEvent,
  ActiveListInsertedEvent,
  ActiveListRemovedEvent,
  ActiveListSwappedEvent,
  ActiveListMovedEvent,
  ActiveListRemovedMultipleEvent,
  ActiveListDeactivatedMultipleEvent,
  ActiveListActivatedMultipleEvent,
  ActiveListPredicateMode,
  ActiveListPredicateOptions,
  ActiveListAutoPlay,
  ActiveListCooldown,
} from './types';
import { _History } from '../private/History';
import { _Observer } from '../private/Observer';

/**
 * ActiveList is a class which represents visual elements which
 * have multiple pieces of content which can be active or inactive.
 *
 * The `ActiveList` can be used to implement multiple types of
 * components:
 *
 *  1. A tabs component for which one tab can be active at a time.
 *
 *  2. A carrousel component: the user sees single slide, which will
 *     autoPlay to the next slide automatically.
 *
 *  3. A dropdown menu with one active menu item.
 *
 *  4. A accordion component from which the user can open multiple
 *     items at once.
 *
 *  5. A list the user can sort and move around.
 *
 *  6. Etc etc
 *
 * Another way of defining the ActiveList is that it is an array
 * / list like data structure, because it supports things like
 * insertion and removal.
 *
 * ActiveList will make sure that when content is inserted, that
 * the active content is not affected.
 *
 * @since 1.0.0
 */
export class ActiveList<T>
  implements Observable<ActiveList<T>, ActiveListEvent<T>>
{
  /**
   * Whether or not to inform subscribers of changes / record history.
   * Used in the `initialize` to temporarily stop subscriptions running
   * the initial activation, and altering the history.
   */
  private _isInitializing = false;

  /**
   * The `ActiveListContent` instances which the `ActiveList` holds.
   *
   * @since 1.0.0
   */
  public readonly contents: ActiveListContent<T>[] = [];

  /**
   * How many items can be active at the same time.
   *
   * When the value of `limit` is `false` there is no limit to the
   * number of active items.
   *
   * Defaults to 1.
   *
   * @since 1.0.0
   */
  public maxActivationLimit: number | false = 1;

  /**
   * How the `maxActivationLimit` is enforced. In other words what the
   * behavior should be when the limit is surpassed.
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
  public maxActivationLimitBehavior: ActiveListMaxActivationLimitBehavior =
    'circular';

  /**
   * All `value` of the content which are currently considered active.
   *
   * @since 1.0.0
   */
  public readonly active: T[] = [];

  /**
   * All `ActiveListContent` which are currently considered active.
   *
   * @since 1.0.0
   */
  public readonly activeContents: ActiveListContent<T>[] = [];

  /**
   * All indexes of which are currently considered active.
   *
   * @since 1.0.0
   */
  public readonly activeIndexes: number[] = [];

  /**
   * Which `value` from within an `ActiveListContent` was the last
   * value which was activated.
   *
   * In other words: of all active values which value was activated
   * the last chronologically.
   *
   * When nothing is activated in the `ActiveList` the value of
   * `lastActivated` will be `null.
   *
   * @since 1.0.0
   */
  public lastActivated: T | null = null;

  /**
   * Which `ActiveListContent` is the last ActiveListContent which
   * was activated.
   *
   * In other words: of all active contents which content was
   * activated the last chronologically.
   *
   * When nothing is activated in the `ActiveList` the value of
   * `lastActivatedContent` will be `null.
   *
   * @since 1.0.0
   */
  public lastActivatedContent: ActiveListContent<T> | null = null;

  /**
   * Which index of the `contents` array was the last index which
   * was activated.
   *
   * In other words: of all active indexes which index was activated
   * the last chronologically.
   *
   * When nothing is activated in the `ActiveList` the value of
   * `lastActivatedIndex` will be `-1`.
   *
   * @since 1.0.0
   */
  public lastActivatedIndex: number = -1;

  /**
   * Which `value` from within an `ActiveListContent` was the last
   * value which was deactivated.
   *
   * When nothing was deactivated previously in the `ActiveList` the
   * value of `lastDeactivated` will be `null.
   *
   * @since 1.5.0
   */
  public lastDeactivated: T | null = null;

  /**
   * Which `ActiveListContent` is the last ActiveListContent which
   * was deactivated.
   *
   * When nothing was deactivated previously in the `ActiveList` the
   * value of `lastDeactivatedContent` will be `null.
   *
   * @since 1.5.0
   */
  public lastDeactivatedContent: ActiveListContent<T> | null = null;

  /**
   * Which index of the `contents` array was the last index which
   * was deactivated.
   *
   * When nothing was deactivated previously in the `ActiveList` the
   * value of `lastDeactivatedIndex` will be `-1`.
   *
   * @since 1.5.0
   */
  public lastDeactivatedIndex: number = -1;

  /**
   * Whether or not the content starts back at the beginning when
   * the end of the content is reached, and whether the content should
   * go to the end when moving left of the start.
   *
   * Defaults to `false`.
   *
   * @since 1.0.0
   */
  public isCircular: boolean = false;

  /**
   * The direction the `ActiveList` has previously moved to on
   * activation or deactivation.
   *
   * Useful for when animating the `ActiveList` when wanting to
   * animate differently based on the direction the content is
   * activating towards.
   *
   * The direction is determined using the following rules for
   * activation:
   *
   * 1. When `isCircular` is `false`:
   *
   *  a. If the `lastActivatedIndex` is -1 the direction is always `next`.
   *     The `lastActivatedIndex` is -1 when no item is active.
   *
   *  b. If the `lastActivatedIndex` lies before the activated index the
   *    direction is `next`.
   *
   *  c. If the `lastActivatedIndex` lies after the activated index the
   *    direction is `previous`.
   *
   * 2. When `isCircular` is `true`,
   *
   *  a. If the `lastActivatedIndex` is -1 the direction is always `next`.
   *     The `lastActivatedIndex` is -1 when no item is active.
   *
   *  b. The direction is determined by checking which direction
   *     is the shortest path. If the shortest paths are tied, the
   *     direction will become `next`.
   *
   * Note: the direction is only changed upon activation and
   * deactivation. Removing / inserting, moving and swapping do not
   * affect the direction.
   *
   * Defaults to the value of the `Config` property `direction.next`.
   *
   * @since 1.0.0
   */
  public direction: string = 'right';

  private _history: _History<ActiveListEvent<T>> = new _History();

  /**
   * Contains the history of the changes in the contents array.
   *
   * Tracks 15 types of changes:
   *
   *  1. INITIALIZED: fired when ActiveList is initialized.
   *
   *  2. INSERTED: fired when an item is added.
   *
   *  3. REMOVED: fired when an item is removed.
   *
   *  4. REMOVED_MULTIPLE: fired when multiple items are removed with a predicate.
   *
   *  5. ACTIVATED: fired when an item is activated.
   *
   *  6  ACTIVATED_MULTIPLE: fired when multiple items are activated with a predicate.
   *
   *  7. DEACTIVATED: fired when an item is deactivated.
   *
   *  8. DEACTIVATED_MULTIPLE: fired when multiple items are deactivated with a predicate.
   *
   *  9. SWAPPED: fired when an item is swapped.
   *
   *  10. MOVED: fired when an item is moved.
   *
   *  11. AUTO_PLAY_PLAYING: fired when play is called.
   *
   *  12. AUTO_PLAY_PAUSED: fired when pause is called.
   *
   *  13. AUTO_PLAY_STOPPED: fired when stop is called, or the autoPlay stops due to a condition.
   *
   *  14. COOLDOWN_STARTED: fired when ActiveList goes into cooldown state
   *
   *  15. COOLDOWN_ENDED: fired when ActiveList goes out of cooldown state
   *
   * Goes only as far back as configured in the `Config` property
   * `keepHistoryFor`, to prevent an infinitely growing history.
   * Note that by default no history is kept, as `keepHistoryFor`
   * is zero by default.
   *
   * The last item in the `history` is the current active item. The
   * further to the left the further in the past you go.
   *
   * This means that a history at index 0 is further in the past than
   * an item at index 1.
   *
   * WARNING: all events store indexes, values and combinations thereof.
   * The `index` of an item in the history may no longer be accurate, it
   * is the index at the time of the event. Same goes for the `value`
   * when it is an array of object, as it might have been mutated, the
   * history items do not store copies of the values.
   *
   * @since 1.0.0
   */
  public readonly history: ActiveListEvent<T>[] = this._history._events;

  private _observer: _Observer<ActiveList<T>, ActiveListEvent<T>> =
    new _Observer();

  /**
   * Whether or not the `active` item has changed at least once.
   * Useful when you want to know if the `ActiveList` is still
   * in its initial state.
   *
   * Note: when the `initialize` method of the `Actions` is called this
   * boolean is reset.
   *
   * @since 1.0.0
   */
  public hasActiveChangedAtLeastOnce: boolean = false;

  // The cooldown timer for activation
  private _activationCooldownTimer!: _CooldownTimer<T>;

  /**
   * A Cooldown is a time period in which all user made activations
   * and deactivations are prevented / ignored. Activations and
   * deactivations where the `isUserInteraction` is set to `false`
   * always bypass the cooldown.
   *
   * The use-case is a cooldown can guarantees that animations are
   * completed, before another is triggered.
   *
   * Contains whether or not the cooldown is active via `isActive` and
   * the current duration via `duration`.
   *
   * @since 1.0.0
   */
  public readonly cooldown: ActiveListCooldown = {
    isActive: false,
    duration: 0,
  };

  // The AutoPlay instance for all autoPlay related code.
  // Note that it is undefined during initialization when
  // activateByIndex / deactivateByIndex is called.
  // But we lie about the type because otherwise there would
  // be to many checks.
  private _autoPlay!: _AutoPlay<T>;

  /**
   * AutoPlay means that the ActiveList will move to the next content by
   * itself after a duration.
   *
   * Contains whether or not the autoPlay is playing via `isPlaying`,
   * the current duration via `duration`, and whether or not the
   * autoPlay has been stopped before via `hasBeenStoppedBefore`
   *
   * @since 1.0.0
   */
  public readonly autoPlay: ActiveListAutoPlay = {
    isPlaying: false,
    duration: 0,
    hasBeenStoppedBefore: false,
  };

  // Stores the current direction configuration
  private _directions!: ActiveListDirection;

  /**
   * Creates an ActiveList based on the ActiveListConfig config.
   *
   * You can also optionally provide an subscriber so you can get
   * informed of the changes happening to the ActiveList.
   *
   * @param {ActiveListConfig<T>} config The initial configuration of the ActiveList.
   * @param {ActiveListSubscriber<T> | undefined} subscriber An optional subscriber which responds to changes in the ActiveList.
   * @throws {ActiveListAutoPlayDurationError} autoPlay duration must be a positive number when defined
   * @since 1.0.0
   */
  constructor(
    config: ActiveListConfig<T> = {},
    subscriber?: ActiveListSubscriber<T>
  ) {
    uiloosLicenseChecker.licenseChecker._checkLicense();

    if (subscriber) {
      this.subscribe(subscriber);
    }

    this.initialize(config);
  }

  /**
   * Subscribe to changes of the ActiveList. The function you
   * provide will get called whenever changes occur in the
   * ActiveList.
   *
   * Returns an unsubscribe function which when called will unsubscribe
   * from the ActiveList.
   *
   * @param {ActiveListSubscriber<T>} subscriber The subscriber which responds to changes in the ActiveList.
   * @returns {UnsubscribeFunction} A function which when called will unsubscribe from the ActiveList.
   *
   * @since 1.0.0
   */
  public subscribe(subscriber: ActiveListSubscriber<T>): UnsubscribeFunction {
    return this._observer._subscribe(subscriber);
  }

  /**
   * Unsubscribe the subscriber so it no longer receives changes / updates
   * of the state changes of the ActiveList.
   *
   * @param {ActiveListSubscriber<T>} subscriber The subscriber which you want to unsubscribe.
   *
   * @since 1.0.0
   */
  public unsubscribe(subscriber: ActiveListSubscriber<T>): void {
    this._observer._unsubscribe(subscriber);
  }

  /**
   * Initializes the ActiveList based on the config provided. This can
   * effectively reset the ActiveList when called, including the
   * history, autoPlay and cooldown.
   *
   * @param {ActiveListConfig<T>} config The new configuration which will override the old one
   *
   * @throws {ActiveListAutoPlayDurationError} autoPlay duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public initialize(config: ActiveListConfig<T>): void {
    // Ignore changes for now, we will restore subscriber at the end
    // of the initialization process.
    this._isInitializing = true;

    this.maxActivationLimit =
      config.maxActivationLimit !== undefined ? config.maxActivationLimit : 1;
    this.maxActivationLimitBehavior = config.maxActivationLimitBehavior
      ? config.maxActivationLimitBehavior
      : 'circular';

    // It is important that isCircular is set before initializeABrokenContent
    // because initializeABrokenContent uses isCircular.
    this.isCircular = !!config.isCircular;

    const contents = config.contents ? config.contents : [];

    // Empty the contents first before assigning them, so re-init
    // works with a new empty content.
    this.contents.length = 0;

    // Contents is not actually correct yet at this point because the
    // `isPrevious` and `isNext` are still incorrectly set.
    // Only when the "Startup" is done by calling 'activate' will it become
    // a valid ActiveListContent.
    contents.forEach((c, index) => {
      this.contents[index] = this._initializeABrokenContent(c, index, contents);
    });

    // Configure directions
    this._directions = config.directions
      ? config.directions
      : { next: 'right', previous: 'left' };

    // Configure history
    this._history._events.length = 0;
    this._history._setKeepHistoryFor(config.keepHistoryFor);

    // Reset the ActiveList
    this._becameEmpty();

    // Setup the activation cooldown timer instance, because we
    // are going to activate the items with `isUserInteraction`
    // `false` below the cooldown will not have any effect during
    // initialization.
    this._activationCooldownTimer = new _CooldownTimer(this, config.cooldown);

    // Reset the cooldown
    this.cooldown.isActive = false;
    this.cooldown.duration = 0;

    if (config.active !== undefined) {
      if (Array.isArray(config.active)) {
        config.active.forEach((active) =>
          this.activate(active, { isUserInteraction: false })
        );
      } else {
        this.activate(config.active, { isUserInteraction: false });
      }
    } else if (config.activeIndexes !== undefined) {
      if (Array.isArray(config.activeIndexes)) {
        config.activeIndexes.forEach((index) =>
          this.activateByIndex(index, {
            isUserInteraction: false,
          })
        );
      } else {
        this.activateByIndex(config.activeIndexes, {
          isUserInteraction: false,
        });
      }
    }

    // Reset lastDeactivated
    this._emptyLastDeactivated();

    // Set hasChanged to false again after activateByIndex has set it
    // to true. For the same reason set the direction to 'next';
    this.hasActiveChangedAtLeastOnce = false;
    this.direction = this._directions.next;

    // Reset autoPlay
    this.autoPlay.isPlaying = false;
    this.autoPlay.duration = 0;
    this.autoPlay.hasBeenStoppedBefore = false;

    // Begin the autoPlay if it is configured
    this._autoPlay = new _AutoPlay(
      this,
      config.autoPlay ? config.autoPlay : null
    );

    this._autoPlay._play(false);

    // Now start sending out changes.
    this._isInitializing = false;

    const event: ActiveListInitializedEvent<T> = {
      type: 'INITIALIZED',
      values: [...this.active],
      indexes: [...this.activeIndexes],
      time: new Date(),
    };

    this._inform(event);
  }

  // Creates a broken content which contains lies and deceptions...
  private _initializeABrokenContent(
    value: T,
    index: number,
    contents: T[] | ActiveListContent<T>[]
  ): ActiveListContent<T> {
    const content = new ActiveListContent(this, index, value);

    // Repair part of the broken content.
    this._repairContent(content, index, contents);

    return content;
  }

  /**
   * Activates an item based on the index in the content array.
   *
   * If the index does not exist an error will be thrown.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`.
   *
   * @param {number} index The index to activate
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @throws {ActiveListIndexOutOfBoundsError} index cannot be out of bounds
   * @throws {ActiveListActivationLimitReachedError} thrown when maxActivationLimit is exceeded, and maxActivationLimitBehavior is "error".
   * @throws {ActiveListCooldownDurationError} cooldown duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public activateByIndex(
    index: number,
    activationOptions: ActiveListActivationOptions<T> = {
      isUserInteraction: true,
      cooldown: undefined,
    }
  ): void {
    const activatedContent = this._doActivateByIndex(index, activationOptions);

    if (!activatedContent) {
      return;
    }

    const event: ActiveListActivatedEvent<T> = {
      type: 'ACTIVATED',
      value: activatedContent.value,
      index,
      time: new Date(),
    };

    this._inform(event);

    // Set the cooldown, if it is needed.
    this._activationCooldownTimer._setCooldown(
      // Note that at this point a `ActiveListCooldownDurationError`
      // can be thrown, this means that the item is activated!
      activationOptions,
      // This works as we guard against indexes not being present
      this.lastActivatedContent as ActiveListContent<T>
    );
  }

  private _doActivateByIndex(
    index: number,
    activationOptions: ActiveListActivationOptions<T>
  ): ActiveListContent<T> | null {
    if (this._checkIndex(index)) {
      throwIndexOutOfBoundsError('activateByIndex', 'index');
    }

    // Do nothing when the index is already active.
    if (this.activeIndexes.includes(index)) {
      return null;
    }

    // Do nothing when a cooldown is active.
    if (this._activationCooldownTimer._isActive(activationOptions)) {
      return null;
    }

    const limitReached =
      this.maxActivationLimit === false
        ? false
        : this.maxActivationLimit === this.activeIndexes.length;

    if (limitReached) {
      if (this.maxActivationLimitBehavior === 'error') {
        throw new ActiveListActivationLimitReachedError();
      } else if (this.maxActivationLimitBehavior === 'ignore') {
        return null;
      }
    }

    const nextIndex = this._getUnboundedNextIndex(index);
    const previousIndex = this._getUnboundedPreviousIndex(index);

    this.contents.forEach((content, i) => {
      content.isActive = content.isActive ? content.isActive : index === i;
      content.isNext = nextIndex === i;
      content.isPrevious = previousIndex === i;

      // We found the item to be activated, now activate it.
      if (index === i) {
        // First add the content to the actives
        this.activeIndexes.push(i);
        this.activeContents.push(content);
        this.active.push(content.value);

        // If the limit is reached here it has to be 'circular' here
        // due to the checks for 'error' and 'ignore' earlier.
        if (limitReached) {
          // By shifting we make sure that the limit is never exceeded.
          this.activeIndexes.shift();
          this.active.shift();

          // The content needs to be made inactive, otherwise it will
          // stay active even through it has been deactivated.
          const content = this.activeContents.shift();
          if (content) {
            this._deactivateContent(content);
          }
        }

        // Next calculate the direction of the motion, before setting
        // the lastActivatedIndex, because we need to know the old active
        // index.
        this.direction = this._getDirectionWhenMovingToIndex(i);

        // then set this item to be the last active item
        this.lastActivated = content.value;
        this.lastActivatedContent = content;
        this.lastActivatedIndex = i;

        // Finally mark the content that is has been activated at least once
        content.hasBeenActiveBefore = true;
      }
    });

    // During initialization the autoPlay is still undefined. This
    // means that we lie about the type of this._autoPlay.
    if (this._autoPlay) {
      this._autoPlay.onActiveIndexChanged(index, activationOptions);
    }

    // Mark that the ActiveList has at least moved once.
    this.hasActiveChangedAtLeastOnce = true;

    return this.lastActivatedContent;
  }

  /**
   * Activates the given item based on identity by comparing the item
   * via a `===` check. When multiple items match on `===` only the
   * first matching item is activated.
   *
   * If the item does not exist in the content array it will
   * throw an error.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`.
   *
   * @param {T} item The item to activate
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @throws {ActiveListItemNotFoundError} item must be in the contents array based on === equality
   * @throws {ActiveListActivationLimitReachedError} thrown when maxActivationLimit is exceeded, and maxActivationLimitBehavior is "error".
   * @throws {ActiveListCooldownDurationError} cooldown duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public activate(
    item: T,
    activationOptions?: ActiveListActivationOptions<T>
  ): void {
    const index = this.getIndex(item);
    this.activateByIndex(index, activationOptions);
  }

  /**
   * Activates all items based on whether the predicate provided
   * returns `true` for the item.
   *
   * If no items match the predicate nothing happens.
   *
   * If multiple items match they will be activated in order of
   * appearance in the contents array. Only one call is made to the
   * subscribers, even if multiple items are activated.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`. When the cooldown is configured
   * as a function, the last activated content will be the parameter
   * to the cooldown function.
   *
   * @param {ActiveListContentPredicate<T>} predicate A predicate function, when the predicate returns `true` it will activate that item.
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @throws {ActiveListActivationLimitReachedError} thrown when maxActivationLimit is exceeded, and maxActivationLimitBehavior is "error".
   * @throws {ActiveListCooldownDurationError} cooldown duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public activateByPredicate(
    predicate: ActiveListContentPredicate<T>,
    activationOptions: ActiveListActivationOptions<T> = {
      isUserInteraction: true,
      cooldown: undefined,
    }
  ) {
    // Do nothing when a cooldown is active.
    if (this._activationCooldownTimer._isActive(activationOptions)) {
      return null;
    }

    const activatedIndexes: number[] = [];
    const activatedValues: T[] = [];

    let lastActivated = null;

    this._execPred(predicate, (index) => {
      const content = this._doActivateByIndex(index, activationOptions);

      if (content) {
        activatedIndexes.push(content.index);
        activatedValues.push(content.value);

        lastActivated = content;
      }
    });

    const event: ActiveListActivatedMultipleEvent<T> = {
      type: 'ACTIVATED_MULTIPLE',
      values: activatedValues,
      indexes: activatedIndexes,
      time: new Date(),
    };

    this._inform(event);

    if (lastActivated) {
      // Set the cooldown, if it is needed.
      this._activationCooldownTimer._setCooldown(
        // Note that at this point a `ActiveListCooldownDurationError`
        // can be thrown, this means that the items are activated!
        activationOptions,
        lastActivated
      );
    }
  }

  /**
   * Activates the next item in the sequence based on the `lastActivated`
   * ActiveListContent.
   *
   * If no `lastActivated` is present when `activateNext` is called
   * the first element is activated.
   *
   * If the `contents` are empty when `activateNext` is called
   * nothing will happen.
   *
   * When on the last position: if `isCircular` is `true` it will circle
   * around and activate the first position. When `isCircular` is `false`
   * it will stay on the last position and do nothing.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`.
   *
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @throws {ActiveListActivationLimitReachedError} thrown when maxActivationLimit is exceeded, and maxActivationLimitBehavior is "error".
   * @throws {ActiveListCooldownDurationError} cooldown duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public activateNext(
    activationOptions?: ActiveListActivationOptions<T>
  ): void {
    if (this.isEmpty()) {
      return;
    }

    const index = this._getBoundedNextIndex(this.lastActivatedIndex);
    this.activateByIndex(index, activationOptions);
  }

  /**
   * Activates the previous item in the sequence based on the
   * `lastActivated` ActiveListContent.
   *
   * If no `lastActivated` is present when `activatePrevious` is called
   * the first element is activated.
   *
   * If the `contents` are empty when `activatePrevious` is called
   * nothing will happen.
   *
   * When on the first position: if `isCircular` is `true` it will circle
   * around and activate the last position. When `isCircular` is `false`
   * it will stay on the first position and do nothing.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`.
   *
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @throws {ActiveListActivationLimitReachedError} thrown when maxActivationLimit is exceeded, and maxActivationLimitBehavior is "error".
   * @throws {ActiveListCooldownDurationError} cooldown duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public activatePrevious(
    activationOptions?: ActiveListActivationOptions<T>
  ): void {
    if (this.isEmpty()) {
      return;
    }

    const index = this._getBoundedPreviousIndex(this.lastActivatedIndex);
    this.activateByIndex(index, activationOptions);
  }

  /**
   * Activates the first item of the contents.
   *
   * If the `contents` are empty when `activateFirst` is called
   * nothing will happen.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`.
   *
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @throws {ActiveListActivationLimitReachedError} thrown when maxActivationLimit is exceeded, and maxActivationLimitBehavior is "error".
   * @throws {ActiveListCooldownDurationError} cooldown duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public activateFirst(
    activationOptions?: ActiveListActivationOptions<T>
  ): void {
    if (this.isEmpty()) {
      return;
    }

    this.activateByIndex(0, activationOptions);
  }

  /**
   * Activates the last item of the contents.
   *
   * If the `contents` are empty when `activateLast` is called
   * nothing will happen.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`.
   *
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @throws {ActiveListActivationLimitReachedError} thrown when maxActivationLimit is exceeded, and maxActivationLimitBehavior is "error".
   * @throws {ActiveListCooldownDurationError} cooldown duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public activateLast(
    activationOptions?: ActiveListActivationOptions<T>
  ): void {
    if (this.isEmpty()) {
      return;
    }

    this.activateByIndex(this.getLastIndex(), activationOptions);
  }

  /**
   * Deactivates an item based on the index in the content array.
   *
   * If the index does not exist an error will be thrown.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`.
   *
   * @param {number} index The index to deactivate
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @throws {ActiveListIndexOutOfBoundsError} index cannot be out of bounds
   * @throws {ActiveListCooldownDurationError} cooldown duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public deactivateByIndex(
    index: number,
    activationOptions: ActiveListActivationOptions<T> = {
      isUserInteraction: true,
      cooldown: undefined,
    }
  ): void {
    const deactivatedContent = this._doDeactivateByIndex(
      index,
      activationOptions
    );

    if (!deactivatedContent) {
      return;
    }

    const event: ActiveListDeactivatedEvent<T> = {
      type: 'DEACTIVATED',
      value: this.contents[index].value,
      index,
      time: new Date(),
    };

    this._inform(event);

    // Set the cooldown, if it is needed.
    this._activationCooldownTimer._setCooldown(
      // Note that at this point a `ActiveListCooldownDurationError`
      // can be thrown, this means that the item is deactivated!
      activationOptions,
      deactivatedContent
    );
  }

  private _doDeactivateByIndex(
    index: number,
    activationOptions: ActiveListActivationOptions<T>
  ): ActiveListContent<T> | null {
    /*
      Thoughts on deactivation:

      At first glance deactivation is not really that complex, if the
      item is active you deactivate it. 
      
      But there are some very subtile interactions when deactivating
      item, in multiple ways: (Q & A with myself.)

      1. limit: what effect does the `limit` have on deactivation?
         When the limit is one we always strive to keep one item
         active at the time. But if that item is specifically 
         deactivated, should we not deactivate it?

         A: If the limit is 1 and the user deactivates it by force,
            I think it is safe to allow the deactivation, it should
            empty the lastActivated.

      2. lastActivated: these set of variables keep track of which
         content was activated last. When the current active item is
         disabled, what do we set the lastActivated to?

         A: When actives becomes empty set all lastActivated to empty 
            (null / -1). When not empty should make the lastActivated
            the last index of the activeIndexes, this way it will
            truly represent the lastActivated.

            This is because lastActivated answers this question:
            Which value was the last value that was activated 
            chronologically?

      3. direction: when an item is activated we track to which
         direction the ActiveList moves. This is done so the user
         can perform different animations. 
         
         The `direction` is normally calculated from the activated 
         index in relation to the `lastActivatedIndex`. 
         
         What will the effect of deactivating the current active item 
         be?

         A: This one is tricky because there are two options that make
            sense to me:

            1. The direction is never changed upon deactivation. We 
               then document direction as something that only changes
               upon activation not deactivation.

            2. The direction is based on the `lastActivatedIndex` which
               is changed as well, see the answer to the second 
               question about the lastActivated, so why not change the
               direction based on the new lastActivatedIndex.

               This way the direction will mean: we deactivated an
               item, and based from the deactivated item the 
               `lastActivatedIndex` lies in this direction.

               When the ActiveList is `isCircular` it should 
               pick the "closest" direction.

            I think that leaving the direction as it is means lying
            about what has happened. Think about it: the direction
            is tied to the lastActivatedIndex, which has changed ergo
            the direction also needs updating. 

            This means that the direction should change based what
            is the new lastActivatedIndex. If the lastActivatedIndex is -1
            it should become direction.next.

      4. next and previous: the next and previous are based on the 
         lastActivatedIndex. Should it move when lastActivated is changed?

         A: Yes they should, because they are linked, like the 
            direction is linked as well.

      5. autoPlay: the idea of the autoPlay is that you can 
        automatically "move" through the content. The poster boy being 
        a carrousel. But what happens when autoPlay is on and 
        something is deactivated?
  
        A: The autoPlay should be cancelled when `isUserInteraction`
           is `true`. The reason is the same as for the activation:
           because the end-user is interacting with the component,
           the autoPlay should stop.

      6. cooldown: for animation purposes we can set an activation 
         cooldown. The idea is to allow an animation to finish before
         allowing another state change. Is deactivation another state
         change?

         A: Yes it is another state change, the cooldown should work
           as well. An animation deactivation is as important as
           one for activation.
    */

    if (this._checkIndex(index)) {
      throwIndexOutOfBoundsError('deactivateByIndex', 'index');
    }

    const indexOfIndex = this.activeIndexes.indexOf(index);

    // Do nothing when the index is already inactive.
    if (indexOfIndex === -1) {
      return null;
    }

    // Do nothing when a cooldown is active.
    if (this._activationCooldownTimer._isActive(activationOptions)) {
      return null;
    }

    const deactivatedContent = this.activeContents[indexOfIndex];

    // First lets do what we came for deactivate the item.
    this._deactivateContent(deactivatedContent);

    // Remove the now deactivated item from the trackers.
    this.activeIndexes.splice(indexOfIndex, 1);
    this.active.splice(indexOfIndex, 1);
    this.activeContents.splice(indexOfIndex, 1);

    // When empty we go into a special reset routine.
    if (this.activeIndexes.length === 0) {
      this._emptyLastActives();

      this.direction = 'right';
    } else {
      // If not empty we must now fix the trackers by selecting the
      // last of the `activeIndexes` as the new `lastActivated`. This
      // basically selects the second to last item from before the
      // splicing.
      this._setLastActives();

      // Get the direction based on the removed index.
      this.direction = this._getDirectionWhenMovingToIndex(
        deactivatedContent.index
      );

      // The direction should be inverted because we requested the
      // direction based on deactivation, and `getDirectionWhenMovingToIndex`
      // returns the direction based on activation.
      this.direction =
        this.direction === this._directions.next
          ? this._directions.previous
          : this._directions.next;
    }

    // Repair the next and previous
    this._repairContents();

    // Mark that the ActiveList has at least moved once.
    this.hasActiveChangedAtLeastOnce = true;

    // During initialization the autoPlay is still undefined. This
    // means that we lie about the type of this._autoPlay.
    if (this._autoPlay) {
      this._autoPlay._onDeactivation(activationOptions);
    }

    return deactivatedContent;
  }

  /**
   * Deactivates the given item based on identity by comparing the item
   * via a `===` check. When multiple items match on `===` only the
   * first matching item is activated.
   *
   * If the item does not exist in the content array it will
   * throw an error.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`.
   *
   * @param {T} item The item to deactivate
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @throws {ActiveListItemNotFoundError} item must be in the contents array based on === equality
   * @throws {ActiveListCooldownDurationError} cooldown duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public deactivate(
    item: T,
    activationOptions?: ActiveListActivationOptions<T>
  ): void {
    const index = this.getIndex(item);
    this.deactivateByIndex(index, activationOptions);
  }

  /**
   * Deactivates all items based on whether the predicate provided
   * returns `true` for the item.
   *
   * If no items match the predicate nothing happens.
   *
   * If multiple items match they will be deactivated in order of
   * appearance in the contents array. Only one call is made to the
   * subscribers, even if multiple items are deactivated.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`. When the cooldown is configured
   * as a function, the last deactivated content will be the parameter
   * to the cooldown function.
   *
   * @param {ActiveListContentPredicate<T>} predicate A predicate function, when the predicate returns `true` it will deactivate that item.
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @throws {ActiveListCooldownDurationError} cooldown duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public deactivateByPredicate(
    predicate: ActiveListContentPredicate<T>,
    activationOptions: ActiveListActivationOptions<T> = {
      isUserInteraction: true,
      cooldown: undefined,
    }
  ) {
    // Do nothing when a cooldown is active.
    if (this._activationCooldownTimer._isActive(activationOptions)) {
      return null;
    }

    const deactivatedIndexes: number[] = [];
    const deactivatedValues: T[] = [];

    let lastRemoved = null;

    this._execPred(predicate, (index) => {
      const content = this._doDeactivateByIndex(index, activationOptions);

      if (content) {
        deactivatedIndexes.push(content.index);
        deactivatedValues.push(content.value);

        lastRemoved = content;
      }
    });

    const event: ActiveListDeactivatedMultipleEvent<T> = {
      type: 'DEACTIVATED_MULTIPLE',
      values: deactivatedValues,
      indexes: deactivatedIndexes,
      time: new Date(),
    };

    this._inform(event);

    if (lastRemoved) {
      // Set the cooldown, if it is needed.
      this._activationCooldownTimer._setCooldown(
        // Note that at this point a `ActiveListCooldownDurationError`
        // can be thrown, this means that the items are deactivated!
        activationOptions,
        lastRemoved
      );
    }
  }

  /**
   * When calling `toggleByIndex` it will flip the `ActiveListContent`
   * which resides on the index `isActive` state .
   *
   * So when `isActive` is `true` and `toggle` is called, `isActive`
   * will become `false`. When `isActive` is `false` and `toggle` is
   * called, `isActive` will become `true`.
   *
   * If the index does not exist an error will be thrown.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`.
   *
   * @param {number} index The index to activate
   * @param {ActiveListActivationOptions<T>} [activationOptions] The activation options
   * @throws {ActiveListIndexOutOfBoundsError} index cannot be out of bounds
   *
   * @since 1.0.0
   */
  public toggleByIndex(
    index: number,
    activationOptions?: ActiveListActivationOptions<T>
  ): void {
    if (this._checkIndex(index)) {
      throwIndexOutOfBoundsError('toggleByIndex', 'index');
    }

    if (this.contents[index].isActive) {
      this.deactivateByIndex(index, activationOptions);
    } else {
      this.activateByIndex(index, activationOptions);
    }
  }

  /**
   * Toggles the given item based on identity by comparing the item
   * via a `===` check. When multiple items match on `===` only the
   * first matching item is activated.
   *
   * So when `isActive` is `true` and `toggle` is called, `isActive`
   * will become `false`. When `isActive` is `false` and `toggle` is
   * called, `isActive` will become `true`.
   *
   * If the item does not exist in the content array it will
   * throw an error.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoPlay`.
   *
   * @param {T} item The item to toggle
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @throws {ActiveListItemNotFoundError} item must be in the contents array based on === equality
   *
   * @since 1.0.0
   */
  public toggle(
    item: T,
    activationOptions?: ActiveListActivationOptions<T>
  ): void {
    const index = this.getIndex(item);

    this.toggleByIndex(index, activationOptions);
  }

  /**
   * Will start playing the ActiveList based on the active
   * autoPlayConfig. When `autoPlayConfig` is not defined nothing
   * will happen when calling play.
   *
   * When there is no more content the playing will stop automatically.
   *
   * Note: autoPlay will only start when one or more contents are
   * currently active. The reason for this is that the `duration`, is
   * based on the `ActiveList` `lastActivatedContent` property.
   * Whenever there are no more items to activate the autoPlay will
   * stop.
   *
   * @throws {ActiveListAutoPlayDurationError} autoPlay duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public play(): void {
    this._autoPlay._play(true);
  }

  /**
   * When the ActiveList is playing it will pause the autoPlay.
   *
   * When paused, the current autoPlay duration is remember and resumed
   * from that position, when `play` is called again.
   *
   * For example: when the duration is 1 second and the `pause` is
   * called after 0.8 seconds, it will after `play` is called, take
   * 0.2 seconds to go to the next content.
   *
   * Note: if the autoPlay is already paused calling `pause` again
   * will do nothing, the time used for the remaining duration is
   * based on the first pause.
   *
   * @since 1.0.0
   */
  public pause(): void {
    this._autoPlay._pause();
  }

  /**
   * When the ActiveList is playing it will stop the autoPlay.
   *
   * By calling `play` again it is possible to restart the autoPlay.
   * However the duration will behave in this scenario as it if was
   * reset.
   *
   * For example: when the duration is 1 second and the `stop` is
   * called after 0.8 seconds, it will after `play` is called, take
   * 1 second to go to the next content.
   *
   * @since 1.0.0
   */
  public stop(): void {
    this._autoPlay._stop();
  }

  /**
   * Configures the autoPlay, when the autoPlay is `null` the autoPlay
   * is stopped.
   *
   * Can be used to reconfigure the speed of the autoPlay after the
   * ActiveList has been created.
   *
   * Note: calling `configureAutoPlay` will not set (reset) the
   * hasBeenStoppedBefore` to `false` when called.
   *
   * @param {ActiveListAutoPlayConfig<T> | null} autoPlayConfig The new autoPlay configuration
   * @throws {ActiveListAutoPlayDurationError} autoPlay duration must be a positive number when defined
   *
   * @since 1.0.0
   */
  public configureAutoPlay(
    autoPlayConfig: ActiveListAutoPlayConfig<T> | null
  ): void {
    this._autoPlay._setConfig(autoPlayConfig);

    if (autoPlayConfig) {
      this._autoPlay._play(true);
    } else {
      // Stop autoPlay when the config is not set.
      this._autoPlay._stop();
    }
  }

  /**
   * Will add an item to the `contents` array, at the specified `index`.
   *
   * Note: `insertAtIndex` will not allow holes to be created, this
   * means that the index can only be between `0` and `contents.length`.
   * If you give it a larger or smaller index it will throw an error.
   *
   * @param {T} item The item to insert.
   * @param {number} index The index at which to insert the item.
   * @returns {ActiveListContent<T>} The newly inserted item wrapped in an `ActiveListContent`
   * @throws {ActiveListIndexOutOfBoundsError} index cannot be out of bounds
   *
   * @since 1.0.0
   */
  public insertAtIndex(item: T, index: number): ActiveListContent<T> {
    if (index < 0 || index > this.contents.length) {
      throwIndexOutOfBoundsError('insertAtIndex', 'index');
    }

    // Create the new content
    const content: ActiveListContent<T> = this._initializeABrokenContent(
      item,
      index,
      this.contents
    );

    // We are about to insert the index, before we can do that we
    // must first increase all indexes by one which are larger or
    // equal to the the index we are inserting. Otherwise the indexes
    // are no longer synced.
    this.activeIndexes.forEach((i, aiIndex) => {
      this.activeIndexes[aiIndex] = i >= index ? i + 1 : i;
    });

    // Insert the new content at the correct position.
    this.contents.splice(index, 0, content);

    // When inserted at the lastActivatedIndex it does not replace
    // the current lastActivatedIndex, so we must fix the lastActivatedIndex.
    // Of course when inserting before the active index, the lastActivatedIndex
    // must be fixed as well.
    if (index <= this.lastActivatedIndex) {
      this.lastActivatedIndex += 1;
    }

    this._repairContents();

    const event: ActiveListInsertedEvent<T> = {
      type: 'INSERTED',
      value: item,
      index,
      time: new Date(),
    };

    this._inform(event);

    return content;
  }

  /**
   * Will add an item to the end of the `contents` array.
   *
   * @param {T} item The item to insert.
   * @returns {ActiveListContent<T>} The newly inserted item wrapped in an `ActiveListContent`
   *
   * @since 1.0.0
   */
  public push(item: T): ActiveListContent<T> {
    return this.insertAtIndex(item, this.contents.length);
  }

  /**
   * Will add an item at the start of the `contents` array.
   *
   * @param {T} item The item to insert.
   * @returns {ActiveListContent<T>} The newly inserted item wrapped in an `ActiveListContent`
   *
   * @since 1.0.0
   */
  public unshift(item: T): ActiveListContent<T> {
    return this.insertAtIndex(item, 0);
  }

  /**
   * Will add an item at the position in the `contents` array when when
   * the predicate returns `true` for the `item` and `index`.
   *
   * If no item matches the predicate nothing is inserted and `null`
   * will be returned.
   *
   * The position to where the `ActiveListContent` is inserted can be altered by
   * providing a mode:
   *
   *  1. When the mode is 'at', the `ActiveListContent` is inserted to the
   *     position where the predicate matches. This is the `default`
   *     mode.
   *
   *  2. When the mode is 'after', the `ActiveListContent` is inserted to after
   *     the position where the predicate matches.
   *
   *  3. When the mode is 'before', the `ActiveListContent` is inserted to
   *     before the position where the predicate matches.
   *
   * @param {T} item The item to insert.
   * @param {ActiveListContentPredicate<T>} predicate A predicate function, when the predicate returns `true` it will move the item to that position.
   * @param {ActiveListPredicateOptions} options The options for the predicate, when no options are provided the mode will default to "at".
   *
   * @since 1.0.0
   */
  public insertByPredicate(
    item: T,
    predicate: ActiveListContentPredicate<T>,
    options: ActiveListPredicateOptions = { mode: 'at' }
  ): ActiveListContent<T> | null {
    const mod = this._modeToMod(options.mode);

    return this._execPred(predicate, (index) => {
      const atIndex = Math.max(0, index + mod);

      return this.insertAtIndex(item, atIndex);
    });
  }

  /**
   * Will remove an item in the `contents` array, at the specified `index`.
   *
   * If you remove the `lastDeactivated` item it will be set to null.
   * 
   * Throws an error if the index does not exist within the `contents`
   * array.
   *
   * @param {number} index The index at which to remove the item.
   * @returns {T} The removed value
   * @throws {ActiveListIndexOutOfBoundsError} index cannot be out of bounds
   *
   * @since 1.0.0
   */
  public removeByIndex(index: number): T {
    const value = this._doRemoveAtIndex(index);

    const indexOfIndex = this.activeIndexes.indexOf(index);
    if (indexOfIndex !== -1) {
      this.activeIndexes.splice(indexOfIndex, 1);
      this.active.splice(indexOfIndex, 1);
      this.activeContents.splice(indexOfIndex, 1);

      // Removing active items means that the active has changed.
      this.hasActiveChangedAtLeastOnce = true;
    }

    // Sync all remaining active indexes
    this.activeIndexes.map((i, aiIndex) => {
      this.activeIndexes[aiIndex] = i >= index ? i - 1 : i;
    });

    if (this.isEmpty()) {
      this._becameEmpty();

      // Stop autoPlay when there are no more items
      this._autoPlay._stop();
    } else {
      this._setLastActives();
    }

    this._repairContents();

    const event: ActiveListRemovedEvent<T> = {
      type: 'REMOVED',
      value,
      index,
      time: new Date(),
    };

    this._inform(event);

    return value;
  }

  private _doRemoveAtIndex(index: number): T {
    if (this._checkIndex(index)) {
      throwIndexOutOfBoundsError('removeByIndex', 'index');
    }

    if (this.lastDeactivated && this.lastDeactivatedIndex === index) {
      this._emptyLastDeactivated();
    }

    const value: T = this.contents[index].value;

    // Remove the content from the array
    this.contents.splice(index, 1);

    return value;
  }

  /**
   * Removes the given item based on identity by comparing the item
   * via a `===` check. When multiple items match on `===` only the
   * first matching item is removed.
   *
   * If you remove the `lastDeactivated` item it will be set to null.
   * 
   * If the item does not exist in the content array it will
   * throw an error.
   *
   * @param {T} item The item to remove
   * @returns {T} The removed item
   * @throws {ActiveListItemNotFoundError} item must be in the contents array based on === equality
   *
   * @since 1.0.0
   */
  public remove(item: T): T {
    const index = this.getIndex(item);
    return this.removeByIndex(index);
  }

  /**
   * Removes the last item of the of the `contents` array.
   *
   * If you remove the `lastDeactivated` item it will be set to null.
   * 
   * If the `contents` array at the time of the `pop` is empty
   * `undefined` is returned.
   *
   * @param {ActiveListActivationOptions<T>} ActiveListActivationOptions The activation options
   * @returns {T | undefined} The removed value, or undefined if the `contents` array is empty.
   *
   * @since 1.0.0
   */
  public pop(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    return this.removeByIndex(this.getLastIndex());
  }

  /**
   * Removes the first item of the `contents` array.
   *
   * If you remove the `lastDeactivated` item it will be set to null.
   * 
   * If the `contents` array at the time of the `shift` is empty
   * `undefined` is returned.
   *
   * @returns {T | undefined} The removed value, or undefined if the `contents` array is empty.
   *
   * @since 1.0.0
   */
  public shift(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    return this.removeByIndex(0);
  }

  /**
   * Will remove all items from the `contents` array for which the
   * predicate based on the `item` and `index` returns `true`.
   *
   * If you remove the `lastDeactivated` item it will be set to null.
   * 
   * @param {T} item The item to insert.
   * @param {ActiveListContentPredicate<T>} predicate A predicate function, when the predicate returns `true` it will remove the item.
   * @returns {T[]} The removed items.
   *
   * @since 1.0.0
   */
  public removeByPredicate(predicate: ActiveListContentPredicate<T>): T[] {
    if (this.isEmpty()) {
      return [];
    }

    const removed: ActiveListContent<T>[] = [];

    // The tricky bit about this is that the index will shuffle when
    // removing an item mid air. So we put the matching items in the
    // array first for later processing.
    this._execPred(predicate, (index) => {
      const content = this.contents[index];
      removed.push(content);
    });

    const removedIndexes: number[] = [];

    removed.forEach((content, index) => {
      /*
        Say we have an array of letters:

          0    1    2    3    4    5    6
        ["a", "b", "c", "d", "e", "f", "g"]

        And we remove "b", "d" and "f", the following index need to be
        removed:

        Iteration 1: remove "b" at index 1:

          0    2    3    4    5    6
        ["a", "c", "d", "e", "f", "g"]

        Iteration 2: remove "d" at index 2:

          0    1    2    3    4    5
        ["a", "c", "d", "e", "f", "g"]

        Iteration 3: remove "f" at index 3:

          0    1    2    3    4
        ["a", "c", "e", "f", "g"]

        Finished state:

          0    1    2    3
        ["a", "c", "e", "g"]

        This means that for each deletion the index should be
        decreased by the amount of iterations already performed.
      */
      const actualIndex = content.index - index;

      // We have to remove by index instead of by item, because
      // with primitives we might remove items by mistake when the
      // predicate uses the second index parameter.
      this._doRemoveAtIndex(actualIndex);

      removedIndexes.push(content.index);
    });

    // Check if the active index was removed
    if (this.isEmpty()) {
      this._becameEmpty();

      // Stop autoPlay when there are no more items
      this._autoPlay._stop();
    } else {
      removedIndexes.forEach((index) => {
        const indexOfIndex = this.activeIndexes.indexOf(index);

        if (indexOfIndex !== -1) {
          this.activeIndexes.splice(indexOfIndex, 1);
          this.active.splice(indexOfIndex, 1);
          this.activeContents.splice(indexOfIndex, 1);

          // Removing active items means that the active has changed.
          this.hasActiveChangedAtLeastOnce = true;
        }
      });

      // Sync all remaining active indexes
      removedIndexes.forEach((removed) => {
        this.activeIndexes.forEach((index, aiIndex) => {
          this.activeIndexes[aiIndex] = index >= removed ? index - 1 : index;
        });
      });

      this._setLastActives();
    }

    const removedValues = removed.map((r) => r.value);

    if (removedIndexes.length > 0) {
      this._repairContents();

      const event: ActiveListRemovedMultipleEvent<T> = {
        type: 'REMOVED_MULTIPLE',
        indexes: [...removedIndexes],
        values: [...removedValues],
        time: new Date(),
      };

      this._inform(event);
    }

    return removedValues;
  }

  /**
   * Swaps the `ActiveListContent` at index a, with the `ActiveListContent` at index b.
   *
   * Note: if the active `ActiveListContent` is swapped, it will stay active,
   * it will only get a new position.
   *
   * @param {number} a The first index to swap.
   * @param {number} b The second index to swap.
   * @throws {ActiveListIndexOutOfBoundsError} index cannot be out of bounds
   *
   * @since 1.0.0
   */
  public swapByIndex(a: number, b: number): void {
    if (this._checkIndex(a)) {
      throwIndexOutOfBoundsError('swapByIndex', 'a');
    }

    if (this._checkIndex(b)) {
      throwIndexOutOfBoundsError('swapByIndex', 'b');
    }

    // This is a developer mistake which is ok because nothing bad happens
    // we do not have to throw an error.
    if (a === b) {
      return;
    }

    const itemA = this.contents[a];
    const itemB = this.contents[b];

    // When swapping the active index fix the lastActivatedIndex's state
    if (this.lastActivatedIndex === itemA.index) {
      this.lastActivatedIndex = itemB.index;
    } else if (this.lastActivatedIndex === itemB.index) {
      this.lastActivatedIndex = itemA.index;
    }

    // Fix the activeIndexes if they contained item A or B.
    const indexOfA = this.activeIndexes.indexOf(itemA.index);
    const indexOfB = this.activeIndexes.indexOf(itemB.index);

    if (indexOfA !== -1) {
      this.activeIndexes[indexOfA] = itemB.index;
    }

    if (indexOfB !== -1) {
      this.activeIndexes[indexOfB] = itemA.index;
    }

    itemA.index = b;
    itemB.index = a;

    this.contents[a] = itemB;
    this.contents[b] = itemA;

    this._repairContents();

    const event: ActiveListSwappedEvent<T> = {
      type: 'SWAPPED',
      value: {
        a: itemA.value,
        b: itemB.value,
      },
      index: {
        a,
        b,
      },
      time: new Date(),
    };

    this._inform(event);
  }

  /**
   * Swaps the `ActiveListContent` with item a, with the `ActiveListContent` with
   * item b. Swaps the items based on identity by comparing the items
   * via a `===` check. When multiple items match on `===` only the
   * first matching item is swapped.
   *
   * Note: if the active `ActiveListContent` is swapped, it will stay active,
   * it will only get a new position.
   *
   * @param {T} a The first item to swap.
   * @param {T} b The second item to swap.
   * @throws {ActiveListItemNotFoundError} item must be in the contents array based on === equality
   *
   * @since 1.0.0
   */
  public swap(a: T, b: T): void {
    const indexA = this.getIndex(a);
    const indexB = this.getIndex(b);

    this.swapByIndex(indexA, indexB);
  }

  /**
   * Moves the `ActiveListContent` at index "from", to the position at index "to".
   *
   * It is possible to move the `ActiveListContent` to the last place by making
   * the "to" index the length of the `contents` array.
   *
   * Note: if the active `ActiveListContent` is moved it will stay active,
   * meaning that the lastActivatedIndex will get updated.
   *
   * @param {number} from The "from" index which needs to be moved
   * @param {number} to The location the `from` needs to move "to".
   * @throws {ActiveListIndexOutOfBoundsError} index cannot be out of bounds
   *
   * @since 1.0.0
   */
  public moveByIndex(from: number, to: number): void {
    if (this._checkIndex(from)) {
      throwIndexOutOfBoundsError('moveByIndex', 'from');
    }

    if (this._checkIndex(to)) {
      throwIndexOutOfBoundsError('moveByIndex', 'to');
    }

    // This can happen when the developer gives a predicate which matches
    // the item being moved. This is a developer mistake which is ok
    // because nothing bad will happen, so we do not have to throw an error.
    if (from === to) {
      return;
    }

    /*
      Hopefully all possible movement scenarios and their effects on
      the lastActivatedIndex and the value of the "to" when doing the insert.

      Note: capital letter indicates the active `ActiveListContent`.

      Scenario 1: moving from before the lastActivatedIndex to beyond the lastActivatedIndex:
        ACTION: 1 --> 4 === 'b' --> 'e'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['a', 'c', 'D', 'e', 'f', 'g']
        a.splice(4, 0, 'b')

        FINAL:
          0    1    2    3    4    5    6
        ['a', 'c', 'D', 'e', 'b', 'f', 'g']

        Result:
          lastActivatedIndex = 3 -> 2; DEC
          to              = 4 -> 4; SAME

      Scenario 2: moving from before the lastActivatedIndex to directly onto the lastActivatedIndex:
        ACTION: 2 --> 3 === 'c' --> 'D'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['a', 'b', 'D', 'e', 'f', 'g']
        a.splice(3, 0, 'c')

        FINAL:
          0    1    2    3    4    5    6
        ['a', 'b', 'D', 'c', 'e', 'f', 'g']

        Result:
          lastActivatedIndex = 3 -> 2; DEC
          to              = 2 -> 2; SAME

      Scenario 3: moving from first to last:
        ACTION: 0 --> 6 === 'a' --> 'g'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['b', 'c', 'D', 'e', 'f', 'g']
        a.splice(6, 0, 'a')

        FINAL:
          0    1    2    3    4    5    6
        ['b', 'c', 'D', 'e', 'f', 'g', 'a']

        Result:
          lastActivatedIndex = 3 -> 2; DEC
          to              = 6 -> 6; SAME

      Scenario 4: moving from beyond the lastActivatedIndex to before the lastActivatedIndex:
        ACTION: 4 --> 1 === 'e' --> 'b'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['a', 'b', 'c', 'D', 'f', 'g']
        a.splice(1, 0, 'e')

        FINAL:
          0    1    2    3    4    5    6
        ['a', 'e', 'b', 'c', 'D', 'f', 'g']

        Result:
          lastActivatedIndex = 3 -> 4; INC
          to              = 1 -> 1; SAME

      Scenario 5: moving from beyond the lastActivatedIndex to directly onto the lastActivatedIndex:
        ACTION: 4 --> 3 === 'e' --> 'D'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['a', 'b', 'c', 'D', 'f', 'g']
        a.splice(3, 0, 'e')

        FINAL:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'e', 'D', 'f', 'g']

        Result:
          lastActivatedIndex = 3 -> 4; INC
          to              = 3 -> 3; SAME

      Scenario 6: moving from last to first:
        ACTION: 6 --> 0 === 'g' --> 'a'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['a', 'b', 'c', 'D', 'e', 'f']
        a.splice(0, 0, 'g')

        FINAL:
          0    1    2    3    4    5    6
        ['g', 'a', 'b', 'c', 'D', 'e', 'f']

        Result:
          lastActivatedIndex = 3 -> 4; INC
          to              = 0 -> 0; SAME

      Scenario 7: moving from beyond the lastActivatedIndex to beyond the lastActivatedIndex:
        ACTION: 4 --> 5 === 'e' --> 'f'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['a', 'b', 'c', 'D', 'f', 'g']
        a.splice(5, 0, 'e')

        FINAL:
           0    1    2    3    4    5    6
         ['a', 'b', 'c', 'D', 'f', 'e', 'g']

        Result:
          lastActivatedIndex = 3 -> 3; SAME
          to              = 5 -> 5; SAME

      Scenario 8: moving from before the lastActivatedIndex to before the lastActivatedIndex:
        ACTION: 2 --> 1 === 'c' --> 'b'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['a', 'b', 'D', 'e', 'f', 'g']
        a.splice(1, 0, 'c')

        FINAL:
          0    1    2    3    4    5    6
        ['a', 'c', 'b', 'D', 'e', 'f', 'g']

        Result:
          lastActivatedIndex = 3 -> 3; SAME
          to              = 1 -> 1; SAME

      Scenario 9: moving from lastActivatedIndex to beyond lastActivatedIndex:
        ACTION: 3 --> 4 === 'D' --> 'e'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['a', 'b', 'c', 'e', 'f', 'g']
        a.splice(4, 0, 'D')

        FINAL:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'e', 'D', 'f', 'g']

        Result:
          lastActivatedIndex = 3 -> 4; REPLACES
          to           = 0 -> 0; SAME

      Scenario 10: moving from lastActivatedIndex to before lastActivatedIndex:
        ACTION: 3 --> 2 === 'D' --> 'c'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['a', 'b', 'c', 'e', 'f', 'g']
        a.splice(2, 0, 'D')

        FINAL:
          0    1    2    3    4    5    6
        ['a', 'b', 'D', 'c', 'e', 'f', 'g']

        Result:
          lastActivatedIndex = 3 -> 2; REPLACES
          to              = 2 -> 2; SAME

      Scenario 11: moving from lastActivatedIndex to first:
        ACTION: 3 --> 0 === 'D' --> 'a'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['a', 'b', 'c', 'e', 'f', 'g']
        a.splice(0, 0, 'D')

        FINAL:
          0    1    2    3    4    5    6
        ['D', 'a', 'b', 'c', 'e', 'f', 'g']

        Result:
          lastActivatedIndex = 3 -> 0; REPLACES
          to              = 0 -> 0; SAME

      Scenario 12: moving from active to last:
        ACTION: 3 --> 6 === 'D' --> 'g'

        INIT:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'D', 'e', 'f', 'g']

        INTERMEDIATE:
                    0    1    2    3    4    5
        const a = ['a', 'b', 'c', 'e', 'f', 'g']
        a.splice(6, 0, 'D')

        FINAL:
          0    1    2    3    4    5    6
        ['a', 'b', 'c', 'e', 'f', 'g', 'D']

        Result:
          lastActivatedIndex = 3 -> 6; REPLACES
          to              = 0 -> 0; SAME
    */

    const lastActivatedIndex = this.lastActivatedIndex;

    if (lastActivatedIndex === from) {
      // Update the active index when it is moved
      this.lastActivatedIndex = to;
    } else if (to === lastActivatedIndex && from > lastActivatedIndex) {
      this.lastActivatedIndex += 1;
    } else if (to === lastActivatedIndex && from < lastActivatedIndex) {
      this.lastActivatedIndex -= 1;
    } else if (to > lastActivatedIndex && from < lastActivatedIndex) {
      this.lastActivatedIndex -= 1;
    } else if (to < lastActivatedIndex && from > lastActivatedIndex) {
      this.lastActivatedIndex += 1;
    }

    // Lets fix the activeIndexes now.
    this.activeIndexes.forEach((index, aiIndex) => {
      // If the index is the `from`, we know already where he goes `to`
      if (index === from) {
        this.activeIndexes[aiIndex] = to;
        return;
      }

      // If the `index` is completely beyond the `from and` `to`, nothing
      // needs to happen because it is not affected.
      if (index > from && index > to) {
        this.activeIndexes[aiIndex] = index;
        return;
      }

      // If the `index` is completely before the `from` and `to`, nothing
      // needs to happen because it is not affected.
      if (index < from && index < to) {
        this.activeIndexes[aiIndex] = index;
        return;
      }

      // If the `from` is larger than the `to` a move to the left is
      // made, if the "from" is smaller than the "to" the right is made.
      this.activeIndexes[aiIndex] = from > to ? index + 1 : index - 1;
    });

    // First store the fromItem so we can add it back later.
    const fromItem = this.contents[from];

    // Now remove the "from" item.
    this.contents.splice(from, 1);

    // Finally insert it the "from" into the correct spot.
    this.contents.splice(to, 0, fromItem);

    this._repairContents();

    const event: ActiveListMovedEvent<T> = {
      type: 'MOVED',
      value: fromItem.value,
      index: {
        from,
        to,
      },
      time: new Date(),
    };

    this._inform(event);
  }

  /**
   * Moves the item, to the position at index "to".
   *
   * It is possible to move the `ActiveListContent` to the last place by making
   * the "to" index the length of the `contents` array.
   *
   * Note: if the active `ActiveListContent` is moved it will stay active,
   * meaning that the lastActivatedIndex will get updated.
   *
   * @param {T} item The item to move
   * @param {number} to The location the `item` needs to move "to".
   * @throws {ActiveListItemNotFoundError} item must be in the contents array based on === equality
   * @throws {ActiveListIndexOutOfBoundsError} index cannot be out of bounds
   *
   * @since 1.0.0
   */
  public move(item: T, to: number): void {
    const from = this.getIndex(item);
    this.moveByIndex(from, to);
  }

  /**
   * Moves the `ActiveListContent`, at the index, to the position of the
   * item for which the predicate returns `true`.
   *
   * If no item matches the predicate nothing is moved.
   *
   * The position to where the `ActiveListContent` moves can be altered by
   * providing a mode:
   *
   *  1. When the mode is 'at', the `ActiveListContent` is moved to the position
   *     where the predicate matches. This is the `default` mode.
   *
   *  2. When the mode is 'after', the `ActiveListContent` is moved to after the
   *     position where the predicate matches.
   *
   *  3. When the mode is 'before', the `ActiveListContent` is moved to before
   *     the position where the predicate matches.
   *
   * @param {number} index The index to move.
   * @param {ActiveListContentPredicate<T>} predicate A predicate function, when the predicate returns `true` it will move the item to that position.
   * @param {ActiveListPredicateOptions} options The options for the predicate, when no options are provided the mode will default to "at".
   *
   * @since 1.0.0
   */
  public moveByIndexByPredicate(
    index: number,
    predicate: ActiveListContentPredicate<T>,
    options: ActiveListPredicateOptions = { mode: 'at' }
  ): void {
    const mod = this._modeToMod(options.mode);

    this._execPred(predicate, (i, length) => {
      const atIndex = Math.min(Math.max(0, i + mod), length - 1);

      this.moveByIndex(index, atIndex);

      // By returning something `execPred` stops.
      return true;
    });
  }

  /**
   * Moves the `ActiveListContent` which matches the value of the item based
   * on `===` equality. To the position of the item for which
   * the predicate returns `true`.
   *
   * When multiple items match on `===` only the first matching item is moved.
   *
   * If no item matches the predicate nothing is moved.
   *
   * The position to where the `ActiveListContent` moves can be altered by
   * providing a mode:
   *
   *  1. When the mode is 'at', the `ActiveListContent` is moved to the position
   *     where the predicate matches. This is the `default` mode.
   *
   *  2. When the mode is 'after', the `ActiveListContent` is moved to after the
   *     position where the predicate matches.
   *
   *  3. When the mode is 'before', the `ActiveListContent` is moved to before
   *     the position where the predicate matches.
   *
   * @param {T} item The item to move.
   * @param {ActiveListContentPredicate<T>} predicate A predicate function, when the predicate returns `true` it will move the item to after that position.
   * @param {ActiveListPredicateOptions} options The options for the predicate, when no options are provided the mode will default to "at".
   * @throws {ActiveListItemNotFoundError} item must be in the contents array based on === equality
   *
   * @since 1.0.0
   */
  public moveByPredicate(
    item: T,
    predicate: ActiveListContentPredicate<T>,
    options?: ActiveListPredicateOptions
  ): void {
    const index = this.getIndex(item);
    this.moveByIndexByPredicate(index, predicate, options);
  }

  /**
   * Gets the index for a given item.
   *
   * If the item does not exist in the content array it will
   * throw an error.
   *
   * @param {T} item The item to get the index for.
   * @returns {number} The index of the given item.
   * @throws {ActiveListItemNotFoundError} item must be in the contents array based on === equality
   *
   * @since 1.0.0
   */
  public getIndex(item: T): number {
    const contents = this.contents;
    const length = contents.length;

    for (let i = 0; i < length; i++) {
      if (contents[i].value === item) {
        return i;
      }
    }

    throw new ActiveListItemNotFoundError();
  }

  /**
   * Returns the final index available in the contents array.
   *
   * @returns {number} The last index of the contents array.
   *
   * @since 1.0.0
   */
  public getLastIndex(): number {
    return this.contents.length - 1;
  }

  // Get the next index based on the lastActivatedIndex, but make sure it
  // never goes out of "bounds". Used to activate "next", or "swap"
  // with the next. Takes `isCircular` into account.
  public _getBoundedNextIndex(index: number): number {
    let nextIndex = index + 1;

    // Prevent the index from going out of bounds.
    if (nextIndex >= this.contents.length) {
      nextIndex = this.isCircular ? 0 : this.getLastIndex();
    }

    return nextIndex;
  }

  // Get the previous index based on the lastActivatedIndex, but make sure it
  // never goes out of "bounds". Used to activate "previous", or "swap"
  // with the previous. Takes `isCircular` into account
  public _getBoundedPreviousIndex(index: number): number {
    let previousIndex = index - 1;

    // Prevent the index from going out of bounds.
    if (previousIndex < 0) {
      previousIndex = this.isCircular ? this.getLastIndex() : 0;
    }

    return previousIndex;
  }

  // Given the index what is the next index. Used to set the isNext
  // property of the ActiveListContent. When not isCircular it allows
  // the nextIndex to fall out of bounds.
  public _getUnboundedNextIndex(index: number): number {
    const nextIndex = index + 1;

    if (this.isCircular && nextIndex === this.contents.length) {
      return 0;
    }

    return nextIndex;
  }

  // Given the index what is the next index. Used to set the isPrevious
  // property of the ActiveListContent. When not isCircular it allows
  // the previousIndex to fall out of bounds.
  public _getUnboundedPreviousIndex(index: number): number {
    const previousIndex = index - 1;

    if (this.isCircular && previousIndex < 0) {
      return this.getLastIndex();
    }

    return previousIndex;
  }

  /**
   * Whether or not the contents is an empty array.
   *
   * @since 1.0.0
   */
  public isEmpty(): boolean {
    return this.contents.length === 0;
  }

  // Helpers

  private _getDirectionWhenMovingToIndex(next: number): string {
    const lastActivatedIndex = this.lastActivatedIndex;

    if (this.isCircular) {
      /*

        C = Current last active
        N = Next active index

        There are two formulas for calculating the left and right 
        distance, one for when the C > N and one for when C < N.

        In the end the winner is the smaller distance, when there
        is a tie we must default to `distances.next`.

        C < N
        formulaRight = N - C
        
        C > N
        formulaRight = 1 + N + ( lastIndex - C)
        
        C < N
        formulaLeft = (lastIndex - N) + C + 1
        
        C > N
        formulaLeft = C - N

        Scenario: right is closer over edge, and current is on edge:
                 N                 C
           0  1  2  3  4  5  6  7  8
          [a, b, c, d, e, f, g, h, i]

          leftDistance  = 6;
          rightDistance = 3;

          direction = "right"

          formulaRight = 1 + 2 + (8 - 8) = 3
          formulaLeft  = 8 - 2 = 6
      
        Scenario: right is closer over edge, and current is before edge:
                 N              C  
           0  1  2  3  4  5  6  7  8
          [a, b, c, d, e, f, g, h, i]

          leftDistance  = 5;
          rightDistance = 4;

          direction = "right"

          formulaRight = 1 + 2 + (8 - 7) = 4
          formulaLeft  = 7 - 2 = 5

        Scenario: left is closer over edge, and current is on edge
           C                 N     
           0  1  2  3  4  5  6  7  8
          [a, b, c, d, e, f, g, h, i]

          leftDistance  = 3;
          rightDistance = 6;

          direction = "left"

          formulaRight = 6 - 0 = 6
          formulaLeft  = (8 - 6) + 0 + 1 = 3

        Scenario: left is closer over edge, and current after edge
              C              N     
           0  1  2  3  4  5  6  7  8
          [a, b, c, d, e, f, g, h, i]

          leftDistance  = 4;
          rightDistance = 5;

          direction = "left"

          formulaRight = 6 - 1 = 5
          formulaLeft  = (8 - 6) + 1 + 1 = 4

        Scenario: equal distance left edge:
          C  N 
          0  1 
          [a, b]
          
          leftDistance  = 1;
          rightDistance = 1;

          direction = "right"

          formulaRight = 1 - 0 = 1
          formulaLeft  = (1 - 1) + 0 + 1 = 1

        Scenario: equal distance right edge:
          N  C 
          0  1 
          [a, b]
          
          leftDistance  = 1;
          rightDistance = 1;

          direction = "right"

          formulaRight = 1 + 0 + ( 1 - 1) = 1
          formulaLeft  = 1 - 0 = 1
      */

      if (this.lastActivatedIndex === -1) {
        return this._directions.next;
      }

      const lastActivatedLargerThanNext = this.lastActivatedIndex > next;

      const lastIndex = this.getLastIndex();

      const leftDistance = lastActivatedLargerThanNext
        ? this.lastActivatedIndex - next
        : lastIndex - next + this.lastActivatedIndex + 1;

      const rightDistance = lastActivatedLargerThanNext
        ? 1 + next + (lastIndex - this.lastActivatedIndex)
        : next - this.lastActivatedIndex;

      return leftDistance >= rightDistance
        ? this._directions.next
        : this._directions.previous;
    } else {
      return next >= lastActivatedIndex
        ? this._directions.next
        : this._directions.previous;
    }
  }

  // Restore the content after a mutation on the state has occurred.
  private _repairContents(): void {
    let nextIndex: null | number = null;
    let previousIndex: null | number = null;
    if (this.lastActivatedIndex !== -1) {
      nextIndex = this._getUnboundedNextIndex(this.lastActivatedIndex);
      previousIndex = this._getUnboundedPreviousIndex(this.lastActivatedIndex);
    }

    // Correctly set the state of the content
    this.contents.forEach((content, index) => {
      content.index = index;

      content.isNext = nextIndex === index;
      content.isPrevious = previousIndex === index;

      this._repairContent(content, index, this.contents);
    });
  }

  // The shared logic for fixing a broken ActiveListContent.
  private _repairContent(
    content: ActiveListContent<T>,
    index: number,
    contents: T[] | ActiveListContent<T>[]
  ): void {
    content.isFirst = index === 0;
    content.isLast = index === contents.length - 1;

    if (this.isCircular) {
      // When circular there is always a next and previous, because
      // a ActiveListContent will then point to himself. The fact that we
      // have a `content` here means that the `ActiveList` is not
      // empty
      content.hasNext = true;
      content.hasPrevious = true;
    } else {
      content.hasNext = index + 1 < contents.length;
      content.hasPrevious = index - 1 >= 0;
    }
  }

  private _emptyLastActives() {
    this.lastActivatedIndex = -1;
    this.lastActivated = null;
    this.lastActivatedContent = null;
  }

  private _emptyLastDeactivated() {
    this.lastDeactivatedIndex = -1;
    this.lastDeactivated = null;
    this.lastDeactivatedContent = null;
  }

  private _becameEmpty(): void {
    this._emptyLastDeactivated();

    this._emptyLastActives();

    this.activeContents.length = 0;
    this.activeIndexes.length = 0;
    this.active.length = 0;

    // When becoming empty we will reset hasActiveChangedAtLeastOnce
    this.hasActiveChangedAtLeastOnce = true;
  }

  private _setLastActives() {
    if (this.activeIndexes.length === 0) {
      this._emptyLastActives();
      return;
    }

    const newLastActiveIndex =
      this.activeIndexes[this.activeIndexes.length - 1];

    const newLastActiveList = this.contents[newLastActiveIndex];

    this.lastActivated = newLastActiveList.value;
    this.lastActivatedContent = newLastActiveList;
    this.lastActivatedIndex = newLastActiveIndex;
  }

  private _deactivateContent(content: ActiveListContent<T>) {
    content.isActive = false;

    // Now make content the last deactivated item.
    this.lastDeactivated = content.value;
    this.lastDeactivatedContent = content;
    this.lastDeactivatedIndex = content.index;
  }

  // exists only for code reduction, not to make things clearer
  private _execPred<R>(
    predicate: ActiveListContentPredicate<T>,
    action: (index: number, length: number) => R
  ): R | null {
    const contents = this.contents;
    const length = contents.length;

    for (let index = 0; index < length; index++) {
      const content = this.contents[index];

      const data: ActiveListContentPredicateData<T> = {
        index,
        content,
        value: content.value,
        activeList: this,
      };

      if (predicate(data)) {
        const result = action(index, length);

        // If something is returned we stop.
        if (result !== undefined) {
          return result;
        }
      }
    }

    // If nothing was ever returned we return zero.
    return null;
  }

  public _inform(event: ActiveListEvent<T>): void {
    if (this._isInitializing) {
      return;
    }

    this._history._push(event);

    this._observer._inform(this, event);
  }

  private _checkIndex(index: number): boolean {
    return index < 0 || index >= this.contents.length;
  }

  private _modeToMod(mode: ActiveListPredicateMode): number {
    return mode === 'at' ? 0 : mode === 'after' ? 1 : -1;
  }
}
