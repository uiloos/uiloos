import { Content } from './Content';
import { CooldownTimer } from './CooldownTimer';
import {
  ActionOptions,
  Autoplay,
  ActiveContentConfig,
  Direction,
  HistoryItem,
  ItemPredicate,
  ActiveContentSubscriber,
} from './types';

/**
 * ActiveContent is an automata which represents visual elements which
 * have multiple pieces of content, but only one piece of content which
 * is active at a time.
 *
 * This pattern is seen in many visual elements / components for
 * example:
 * 
 *  1. A tabs element: the user can select a singular tab.
 *
 *  2. A carrousel element: the user sees single slide, which my
 *     autoplay to the next slide automatically.
 *
 *  3. A dropdown menu with one active menu item.
 *
 * The ActiveContent automata seeks to support all these elements,
 * and more.
 */
export class ActiveContent<T> {
  // The observer / subscriber of the state of the ActiveContent.
  private subscriber: ActiveContentSubscriber<T> = () => undefined;

  /*
    The timeoutId given back by calling window.setTimeout for when 
    autoplay is enabled. Is kept here so it can be cleared via
    window.clearTimeout.
  */
  private autoplayTimeoutId: number | null = null;

  /**
   * The `Content` which the `ActiveContent` holds.
   */
  public contents: Content<T>[] = [];

  /**
   * Which `value` from within a `Content` which is currently active.
   */
  public active: T | null = null;

  /**
   * Which `Content` is currently active.
   */
  public activeContent: Content<T> | null = null;

  /**
   * Which index of the `contents` array is currently active.
   *
   */
  public activeIndex: number = -1;

  /**
   * Whether or not the content starts back at the beginning when
   * the end of the content is reached, and whether the content should
   * go to the end when moving left of the start.
   */
  public isCircular: boolean = false;

  /**
   * Whether or not autoplay is enabled. When autoplay is enabled
   * it will automatically move the content to the right.
   *
   * When `isCircular` is `true` content will move to the right
   * indefinitely. When `isCircular` is `false` it will stop autoplay
   * at the end of the content.
   */
  private _autoplay: Autoplay<T> | false = false;

  /**
   * The direction the `ActiveContent` has previously moved to.
   *
   * Defaults to the value of the `Config` property `direction.next`.
   */
  public direction: string = 'right';

  /**
   * Contains the history of the changes in the contents array.
   *
   * Tracks four types of changes:
   *
   *  1. INSERTED, fired when an item is added.
   *  2. REMOVED, fired when an item is removed.
   *  3. ACTIVATED, fired when an item is activated.
   *  4. SWAPPED, fired when an item is swapped.
   *  5. MOVED, fired when an item is moved.
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
   */
  public history: HistoryItem<T>[] = [];

  /**
   * Whether or not the `active` item has changed at least once.
   * Useful when you want to know if the `ActiveContent` is still
   * in its initial state.
   *
   * Note: when the `initialize` method of the `Actions` is called this
   * boolean is reset.
   */
  public hasActiveChangedAtLeastOnce: boolean = false;

  // The cooldown timer for activation
  private activationCooldownTimer!: CooldownTimer<T>;

  // The amount items that should be remembered in the history.
  private keepHistoryFor!: number;

  // Stores the current direction configuration
  private directions!: Direction;

  /**
   * Creates an ActiveContent based on the ActiveContentConfig config.
   * 
   * @param {ActiveContentConfig<T>} config The initial configuration of the ActiveContent.
   */
  constructor(config: ActiveContentConfig<T>) {
    this.initialize(config);
  }

  /**
   * Set the subscriber of the ActiveContent which will get notified
   * of all changes in the ActiveContent.
   * 
   * @param {ActiveContentSubscriber<T>} subscriber The subscriber which responds to changes in the active content.
   */
  public setSubscriber(subscriber: ActiveContentSubscriber<T>) {
    this.subscriber = subscriber;
  }

  /**
   * Initializes the ActiveContent based on the config provided.
   * This can effectively resets the Active content when called,
   * including the history.
   *
   * @param {ActiveContentConfig<T>} config The new configuration which will override the old one
   */
  public initialize(config: ActiveContentConfig<T>) {
    // Ignore changes for now, we will restore subscriber at the end
    // of the initialization process.
    const nextSubscriber = this.subscriber;
    this.subscriber = () => undefined;

    // It is important that isCircular is set before initializeABrokenContent
    // because initializeABrokenContent uses isCircular.
    this.isCircular = !!config.isCircular;

    // Contents is not actually correct yet at this point because the
    // `isPrevious` and `isNext` are still incorrectly set.
    // Only when the "Startup" is done by calling 'activate' will it become
    // a valid Content.
    this.contents = config.contents.map((c, index) =>
      this.initializeABrokenContent(c, index, config.contents)
    );

    // Configure directions
    this.directions = config.directions
      ? config.directions
      : { next: 'right', previous: 'left' };

    // Configure history
    this.history = [];
    this.keepHistoryFor =
      config.keepHistoryFor !== undefined ? config.keepHistoryFor : 0;
    if (this.keepHistoryFor > 0) {
      const length = this.contents.length;
      for (let i = 0; i < length; i++) {
        this.pushHistory(() => ({
          action: 'INSERTED',
          value: this.contents[i].value,
          index: i,
          time: new Date(),
        }));
      }
    }

    // Reset the active content
    this.becameEmpty();

    // Set activate the content if it exists.
    this.activationCooldownTimer = new CooldownTimer(config.cooldown);

    if (config.active !== undefined) {
      this.activate(config.active, { isUserInteraction: false });
    } else if (config.activeIndex !== undefined) {
      this.activateByIndex(config.activeIndex, {
        isUserInteraction: false,
      });
    } else if (config.contents.length > 0) {
      this.activateByIndex(0, { isUserInteraction: false });
    }

    // Set hasChanged to false again after activateByIndex has set it
    // to true. For the same reason set the direction to 'next';
    this.hasActiveChangedAtLeastOnce = false;
    this.direction = this.directions.next;

    // Begin the autoplay
    this._autoplay = config.autoplay !== undefined ? config.autoplay : false;
    this.autoplay = this._autoplay;

    // Now start sending out changes.
    this.subscriber = nextSubscriber;

    this.subscriber(this);
  }

  // Creates a broken content which contains lies and deceptions...
  private initializeABrokenContent(
    value: T,
    index: number,
    contents: T[] | Content<T>[]
  ): Content<T> {
    const content = new Content(this, index, value);

    // Repair part of the broken content.
    this.repairContent(content, index, contents);

    return content;
  }

  /**
   * Activates an item based on the index in the content array.
   *
   * If the index does not exist an error will be thrown.
   *
   * With the `actionOptions` you can determine the effects
   * on `cooldown` and `autoplay`.
   *
   * @param {number} index The index to activate
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @throws Index out of bounds error.
   */
  public activateByIndex(
    index: number,
    actionOptions: ActionOptions<T> = {
      isUserInteraction: true,
      cooldown: undefined,
    }
  ) {
    if (index < 0 || index >= this.contents.length) {
      throw new Error(
        'automata > ActiveContent.activateByIndex > could not activate: index out of bounds'
      );
    }

    // Do nothing when the index did not change.
    if (index === this.activeIndex) {
      return;
    }

    // Do nothing when a cooldown is active.
    if (
      this.activationCooldownTimer.isActive(
        actionOptions,
        // This works because activateByIndex checks if the index is in
        // bounds. This means that the state.active has been set by
        // the state contents loop.
        this.active as T,
        this.activeIndex
      )
    ) {
      return;
    }

    const nextIndex = this.getNextIndex(index);
    const previousIndex = this.getPreviousIndex(index);

    this.contents.forEach((content, i) => {
      // If the content.active is true we found the old active item, 
      // because it was already active when we encountered it. 
      content.wasActiveBeforeLast = content.active;

      content.active = index === i;
      content.isNext = nextIndex === i;
      content.isPrevious = previousIndex === i;

      // We found the new active item make it the new state.active
      if (content.active) {
        this.active = content.value;
        this.activeContent = content;

        // Next calculate the direction of the motion, before
        // setting the active index, because we need to know the
        // old active index.
        this.direction = this.getDirectionWhenMovingToIndex(i);

        // Next mark the content that is has been activated at least once
        content.hasBeenActiveBefore = true;

        // Finally set the new active index.
        this.activeIndex = i;
      }
    });

    if (this.autoplay) {
      if (
        actionOptions &&
        actionOptions.isUserInteraction &&
        this.autoplay.stopsOnUserInteraction
      ) {
        // Stop when autoPlay.stopsOnUserInteraction is true and this
        // is a user interaction.
        this.autoplay = false;
      } else if (this.isCircular === false && index === this.getLastIndex()) {
        // When the ActiveContent is linear stop autoplay at the end.
        this.autoplay = false;
      } else {
        // Move the autoplay to the next "timer", needed because
        // each "item" can have a unique "interval" in which it
        // is active.

        // Store the old autoplay so we can continue with the settings.
        const rememberedAutoplay = this._autoplay;

        // Cancel the autoplay clear the timeout
        this.autoplay = false;

        // Now re-active the autoplay again, this will trigger the next
        // timeout.
        this.autoplay = rememberedAutoplay;
      }
    }

    this.pushHistory(() => ({
      action: 'ACTIVATED',
      // This works because activateByIndex checks if the index is in
      // bounds. This means that the state.active has been set by
      // the state contents loop.
      value: this.active as T,
      index: this.activeIndex,
      time: new Date(),
    }));

    // Mark that the ActiveContent has at least moved once.
    this.hasActiveChangedAtLeastOnce = true;

    // Mark the time in unix epoch when the last activation occurred.
    this.activationCooldownTimer.setLastTime();

    // Inform the subscriber
    this.subscriber(this);
  }

  /**
   * Activates the given item based on identity by comparing the item
   * via a `===` check. When multiple items match on `===` only the 
   * first matching item is activated.
   *
   * If the item does not exist in the content array it will
   * throw an error.
   *
   * With the `actionOptions` you can determine the effects
   * on `cooldown` and `autoplay`.
   *
   * @param {T} item The item to activate
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @throws Item not found error
   */
  public activate(item: T, actionOptions?: ActionOptions<T>) {
    const index = this.getIndex(item);
    this.activateByIndex(index, actionOptions);
  }

  /**
   * Activates one item based on whether the predicate provided
   * returns `true` for the item. Only the first item matching the
   * predicate will be activated.
   *
   * If no items match the predicate nothing happens.
   *
   * With the `actionOptions` you can determine the effects
   * on `cooldown` and `autoplay`.
   *
   * @param {ItemPredicate<T>} predicate The predicate function which when `true` is returned is returned activates that item.
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   */
  public activateByPredicate(
    predicate: ItemPredicate<T>,
    actionOptions?: ActionOptions<T>
  ) {
    const contents = this.contents;
    const length = contents.length;

    for (let index = 0; index < length; index++) {
      if (predicate(contents[index].value, index)) {
        this.activateByIndex(index, actionOptions);
        return;
      }
    }
  }

  /**
   * Activates the next item in the sequence.
   *
   * When on the last position: if `isCircular` is `true` it will circle
   * around and activate the first position. When `isCircular` is `false`
   * it will stay on the last position and do nothing.
   *
   * With the `actionOptions` you can determine the effects
   * on `cooldown` and `autoplay`.
   *
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   */
  public next(actionOptions?: ActionOptions<T>) {
    // Beware we cannot use `this.getNextIndex` because it does not limit
    // the index to the last possible index.

    let index = this.activeIndex + 1;
    if (index >= this.contents.length) {
      index = this.isCircular ? 0 : this.getLastIndex();
    }

    this.activateByIndex(index, actionOptions);
  }

  /**
   * Activates the previous item in the sequence.
   *
   * When on the first position: if `isCircular` is `true` it will circle
   * around and activate the last position. When `isCircular` is `false`
   * it will stay on the first position and do nothing.
   *
   * With the `actionOptions` you can determine the effects
   * on `cooldown` and `autoplay`.
   *
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   */
  public previous(actionOptions?: ActionOptions<T>) {
    // Beware we cannot use `this.getPreviousIndex` because it does not limit
    // the index to the last possible index.

    let index = this.activeIndex - 1;
    if (index < 0) {
      index = this.isCircular ? this.getLastIndex() : 0;
    }

    this.activateByIndex(index, actionOptions);
  }

  /**
   * Activates the first item of the contents.
   *
   * When the contents are empty nothing happens.
   *
   * With the `actionOptions` you can determine the effects
   * on `cooldown` and `autoplay`.
   *
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   */
  public first(actionOptions?: ActionOptions<T>) {
    // Do nothing when content is empty
    if (this.isEmpty()) {
      return;
    }

    this.activateByIndex(0, actionOptions);
  }

  /**
   * Activates the last item of the contents.
   *
   * When the contents are empty nothing happens.
   *
   * With the `actionOptions` you can determine the effects
   * on `cooldown` and `autoplay`.
   *
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   */
  public last(actionOptions?: ActionOptions<T>) {
    // Do nothing when content is empty
    if (this.isEmpty()) {
      return;
    }

    this.activateByIndex(this.getLastIndex(), actionOptions);
  }

  /**
   * Whether or not autoplay is enabled. When autoplay is enabled
   * it will automatically move the content to the right.
   *
   * When `isCircular` is `true` content will move to the right
   * indefinitely. When `isCircular` is `false` it will stop autoplay
   * at the end of the content.
   */
  public get autoplay(): Autoplay<T> | false {
    return this._autoplay;
  }

  /**
   * When given an Autoplay it will activate the autoplay. When
   * given `false` it will shut down the autoplay.
   *
   * Autoplay will shut down automatically when there is no content.
   *
   * The autoplay will make the active content move on its own.
   *
   * @param {(Autoplay<T> | false)} Autoplay
   * @throws Interval cannot be negative or zero error
   */
  public set autoplay(autoPlayConfig: Autoplay<T> | false) {
    this._autoplay = autoPlayConfig;

    if (this.autoplayTimeoutId !== null) {
      window.clearTimeout(this.autoplayTimeoutId);
      this.autoplayTimeoutId = null;
    }

    // Top the interval when autoplay is false or when the content
    // has become empty.
    if (this.autoplay === false || this.isEmpty()) {
      return;
    }

    const interval =
      typeof this.autoplay.interval === 'number'
        ? this.autoplay.interval
        : this.autoplay.interval(
            // This cast is valid because there is content at this point
            // and one content must always be active.
            this.active as T,
            this.activeIndex
          );

    if (interval <= 0) {
      throw new Error(
        'automata > ActiveContent.autoplay interval cannot be negative or zero'
      );
    }

    this.autoplayTimeoutId = window.setTimeout(() => {
      // It could happen that during the interval the contents is
      // now empty due to a removal, in this case we simply want to
      // do nothing.
      if (this.isEmpty()) {
        return;
      }

      this.next({ isUserInteraction: false });
      this.autoplay = this._autoplay;
    }, interval);
  }

  /**
   * Will add an item to the `contents` array, at the specified `index`.
   *
   * Note: `insertAtIndex` will not allow holes to be created, this
   * means that the index can only be between `0` and `contents.length`.
   * If you give it a larger or smaller index it will throw an error.
   *
   * When calling this method results in the insertion of the first item.
   * The first item will become the active item, it then uses the
   * `options` parameter to determine the effects on `cooldown`
   * and `autoplay` the inserted item has.
   *
   * @param {T} item The item to add.
   * @param {number} index The index at which to insert the item.
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @returns {Content<T>} The newly inserted item wrapped in a `Content`
   * @throws Index out of bounds error.
   */
  public insertAtIndex(
    item: T,
    index: number,
    actionOptions?: ActionOptions<T>
  ): Content<T> {
    if (index < 0 || index > this.contents.length) {
      throw new Error(
        'automata > ActiveContent.insertAtIndex > could not insert: index out of bounds'
      );
    }

    // Create the new content
    const content: Content<T> = this.initializeABrokenContent(
      item,
      index,
      this.contents
    );

    // Insert the new content at the correct position.
    this.contents.splice(index, 0, content);

    // When inserted at the active index it does not replace
    // the current active index, so we must fix the activeIndex.
    if (index === this.activeIndex) {
      this.activeIndex = index + 1;
    }

    this.repairContents(true);

    this.pushHistory(() => ({
      action: 'INSERTED',
      value: item,
      index,
      time: new Date(),
    }));

    // When inserting the first element activate it,
    // activateByIndex will trigger the subscriber.
    if (index === 0 && this.contents.length === 1) {
      this.activateByIndex(0, actionOptions);
    } else {
      this.subscriber(this);
    }

    return content;
  }

  /**
   * Will add an item to the end of the `contents` array.
   *
   * When calling this method results in the insertion of the first item.
   * The first item will become the active item, it then uses the
   * `options` parameter to determine the effects on `cooldown`
   * and `autoplay` the inserted item has.
   *
   * @param {T} item The item to add.
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @returns {Content<T>} The newly inserted item wrapped in a `Content`
   */
  public push(item: T, actionOptions?: ActionOptions<T>): Content<T> {
    return this.insertAtIndex(item, this.contents.length, actionOptions);
  }

  /**
   * Will add an item at the start of the `contents` array.
   *
   * When calling this method results in the insertion of the first item.
   * The first item will become the active item, it then uses the
   * `options` parameter to determine the effects on `cooldown`
   * and `autoplay` the inserted item has.
   *
   * @param {T} item The item to add.
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @returns {Content<T>} The newly inserted item wrapped in a `Content`
   */
  public unshift(item: T, actionOptions?: ActionOptions<T>): Content<T> {
    return this.insertAtIndex(item, 0, actionOptions);
  }

  private insertPredicateWithMod(
    item: T,
    predicate: ItemPredicate<T>,
    mod: number,
    actionOptions?: ActionOptions<T>
  ): Content<T> | null {
    const contents = this.contents;
    const length = contents.length;

    for (let index = 0; index < length; index++) {
      if (predicate(contents[index].value, index)) {
        const atIndex = Math.max(0, index + mod);

        return this.insertAtIndex(item, atIndex, actionOptions);
      }
    }

    return null;
  }

  /**
   * Will add an item at the position in the `contents` array when when
   * the predicate returns `true` for the `item` and `index`.
   *
   * If no item matches the predicate nothing is inserted and `null`
   * will be returned.
   *
   * When calling this method results in the insertion of the first item.
   * The first item will become the active item, it then uses the
   * `actionOptions` parameter to determine the effects on `cooldown`
   * and `autoplay` the inserted item has.
   *
   * @param {T} item The item to add.
   * @param {ItemPredicate<T>} predicate The predicate function which when `true` is returned inserts the item in that position.
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @returns {Content<T>} The newly inserted item wrapped in a `Content`
   */
  public insertAtPredicate(
    item: T,
    predicate: ItemPredicate<T>,
    actionOptions?: ActionOptions<T>
  ): Content<T> | null {
    return this.insertPredicateWithMod(item, predicate, 0, actionOptions);
  }

  /**
   * Will add an item before the position in the `contents` array when when
   * the predicate returns `true` for the `item` and `index`.
   *
   * If no item matches the predicate nothing is inserted and `null`
   * will be returned.
   *
   * If the predicate matches at the first item, it will be inserted
   * at the start of the `contents` array.
   *
   * When calling this method results in the insertion of the first item.
   * The first item will become the active item, it then uses the
   * `actionOptions` parameter to determine the effects on `cooldown`
   * and `autoplay` the inserted item has.
   *
   * @param {T} item The item to add.
   * @param {ItemPredicate<T>} predicate The predicate function which when `true` is returned inserts the item before that position.
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @returns {Content<T>} The newly inserted item wrapped in a `Content`
   */
  public insertBeforePredicate(
    item: T,
    predicate: ItemPredicate<T>,
    actionOptions?: ActionOptions<T>
  ): Content<T> | null {
    return this.insertPredicateWithMod(item, predicate, -1, actionOptions);
  }

  /**
   * Will add an item after the position in the `contents` array when when
   * the predicate returns true for the `item` and `index`.
   *
   * If no item matches the predicate nothing is inserted and `null`
   * will be returned.
   *
   * If the predicate matches at the last item, it will be inserted
   * at the end of the `contents` array.
   *
   * When calling this method results in the insertion of the first item.
   * The first item will become the active item, it then uses the
   * `actionOptions` parameter to determine the effects on `cooldown`
   * and `autoplay` the inserted item has.
   *
   * @param {T} item The item to add.
   * @param {ItemPredicate<T>} predicate The predicate function which when `true` is returned inserts the item after that position.
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @returns {Content<T>} The newly inserted item wrapped in a `Content`
   */
  public insertAfterPredicate(
    item: T,
    predicate: ItemPredicate<T>,
    actionOptions?: ActionOptions<T>
  ): Content<T> | null {
    return this.insertPredicateWithMod(item, predicate, 1, actionOptions);
  }

  /**
   * Will remove an item in the `contents` array, at the specified `index`.
   *
   * When removing the current active item a new active item will be
   * selected via the following rules:
   *
   *  1. If only one item remains after the removal that item
   *     will become the new active item.
   *
   *  2. The previous item will be selected when a previous item exits.
   *
   *  3. If the first item was removed, and `isCircular` is `false`
   *     the next item is selected.
   *
   *  4. If the first item was removed, and `isCircular` is `true`
   *     it will circle around and activate the last item.
   *
   * In all of the above cases it then uses the `ActionOptions`
   * to determine the effects on `cooldown` and `autoplay` for the
   * new activation.
   *
   * If after removal no items remain the activeIndex will become -1.
   *
   * Throws an error if the index does not exist within the `contents`
   * array.
   *
   * @param {number} index The index at which to remove the item.
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @returns {T} The removed value
   * @throws Index out of bounds error.
   */
  public removeByIndex(index: number, actionOptions?: ActionOptions<T>): T {
    const value = this.doRemoveAtIndex(index);

    const isContentEmpty = this.isEmpty();

    // When removing at the active index we will activate
    // the previous index.
    if (index === this.activeIndex && !isContentEmpty) {
      // If the first item was removed set the activeIndex to -1
      // so it passes this.activateByIndex's guard.
      if (index === 0) {
        this.activeIndex = -1;
      }

      this.repairContents(false);

      // Will move to previous when circular, and stay on zero
      // when the index is zero.
      this.previous(actionOptions);
      return value;
    } else if (isContentEmpty) {
      this.becameEmpty();
    } else {
      // When a not active index was removed we need to repair the
      // active index, as it has now moved, because the array has
      // changed.

      const nextIndex = Math.max(0, this.activeIndex - 1);

      this.activeIndex = nextIndex;
    }

    // Only when this.previous has not been called call inform,
    // because it also informs.

    this.repairContents(false);
    this.subscriber(this);

    return value;
  }

  private doRemoveAtIndex(index: number): T {
    if (index < 0 || index > this.contents.length) {
      throw new Error(
        'automata > ActiveContent.removeByIndex > could not remove: index out of bounds'
      );
    }

    const value: T = this.contents[index].value;

    // Remove the content from the array
    this.contents.splice(index, 1);

    this.pushHistory(() => ({
      action: 'REMOVED',
      value,
      index,
      time: new Date(),
    }));

    return value;
  }

  /**
   * Removes the given item based on identity by comparing the item
   * via a `===` check. When multiple items match on `===` only the 
   * first matching item is removed.
   *
   * If the item does not exist in the content array it will
   * throw an error.
   *
   * When removing the current active item a new active item will be
   * selected via the following rules:
   *
   *  1. If only one item remains after the removal that item
   *     will become the new active item.
   *
   *  2. The previous item will be selected when a previous item exits.
   *
   *  3. If the first item was removed, and `isCircular` is `false`
   *     the next item is selected.
   *
   *  4. If the first item was removed, and `isCircular` is `true`
   *     it will circle around and activate the last item.
   *
   * In all of the above cases it then uses the `ActionOptions`
   * to determine the effects on `cooldown` and `autoplay` for the
   * new activation.
   *
   * If after removal no items remain the activeIndex will become -1.
   *
   * @param {T} item The item to remove
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @returns {T} The removed item wrapped in a `Content`
   * @throws Item not found error
   */
  public remove(item: T, actionOptions?: ActionOptions<T>): T {
    const index = this.getIndex(item);
    return this.removeByIndex(index, actionOptions);
  }

  /**
   * Removes the last item to the of the `contents` array.
   *
   * If the `contents` array at the time of the `pop` is empty
   * `undefined` is returned.
   *
   * When removing the current active item a new active item will be
   * selected via the following rules:
   *
   *  1. If only one item remains after the removal that item
   *     will become the new active item.
   *
   *  2. The previous item will be selected when a previous item exits.
   *
   *  3. If the first item was removed, and `isCircular` is `false`
   *     the next item is selected.
   *
   *  4. If the first item was removed, and `isCircular` is `true`
   *     it will circle around and activate the last item.
   *
   * In all of the above cases it then uses the `ActionOptions`
   * to determine the effects on `cooldown` and `autoplay` for the
   * new activation.
   *
   * If after removal no items remain the activeIndex will become -1.
   *
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @returns {T} The removed value
   */
  public pop(actionOptions?: ActionOptions<T>): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    return this.removeByIndex(this.getLastIndex(), actionOptions);
  }

  /**
   * Removes the first item to the of the `contents` array.
   *
   * If the `contents` array at the time of the `shift` is empty
   * `undefined` is returned.
   *
   * When removing the current active item a new active item will be
   * selected via the following rules:
   *
   *  1. If only one item remains after the removal that item
   *     will become the new active item.
   *
   *  2. The previous item will be selected when a previous item exits.
   *
   *  3. If the first item was removed, and `isCircular` is `false`
   *     the next item is selected.
   *
   *  4. If the first item was removed, and `isCircular` is `true`
   *     it will circle around and activate the last item.
   *
   * In all of the above cases it then uses the `ActionOptions`
   * to determine the effects on `cooldown` and `autoplay` for the
   * new activation.
   *
   * If after removal no items remain the activeIndex will become -1.
   *
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @returns {T} The removed value
   */
  public shift(actionOptions?: ActionOptions<T>): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    return this.removeByIndex(0, actionOptions);
  }

  /**
   * Will remove all items from the `contents` array for which the
   * predicate based on the `item` and `index` returns `true`.
   *
   * When removing the current active item a new active item will be
   * selected via the following rules:
   *
   *  1. If only one item remains after the removal that item
   *     will become the new active item.
   *
   *  2. The previous item will be selected when a previous item exits.
   *
   *  3. If the first item was removed, and `isCircular` is `false`
   *     the next item is selected.
   *
   *  4. If the first item was removed, and `isCircular` is `true`
   *     it will circle around and activate the last item.
   *
   * In all of the above cases it then uses the `ActionOptions`
   * to determine the effects on `cooldown` and `autoplay` for the
   * new activation.
   *
   * If after removal no items remain the activeIndex will become -1.
   *
   * @param {T} item The item to add.
   * @param {ItemPredicate<T>} predicate The predicate function which when `true` is returned removes the item.
   * @param {ActionOptions<T>} [actionOptions] The action options @see ActionOptions<T>
   * @returns {Content<T>[]} The removed items wrapped in a `Content`.
   */
  public removeByPredicate(
    predicate: ItemPredicate<T>,
    actionOptions?: ActionOptions<T>
  ): T[] {
    if (this.isEmpty()) {
      return [];
    }

    const removed: Content<T>[] = [];

    const contents = this.contents;
    const length = contents.length;

    // The tricky bit about this is that the index will
    // shuffle when removing an item mid air. So we
    // put the matching items in the array first
    // for later processing.

    for (let index = 0; index < length; index++) {
      const content = contents[index];
      if (predicate(contents[index].value, index)) {
        removed.push(content);
      }
    }

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
      this.doRemoveAtIndex(actualIndex);

      removedIndexes.push(content.index);
    });

    let previousCalled = false;

    // Check if the active index was removed
    if (this.isEmpty()) {
      this.becameEmpty();
    } else {
      const removedAfterActiveIndex = removedIndexes.filter(
        (r) => r < this.activeIndex
      ).length;

      const nextActiveIndex = this.activeIndex - removedAfterActiveIndex;

      // Must happen before the set in the statement below, otherwise
      // it looks at the new active index instead of the old active index.
      const removedActiveIndex = removedIndexes.indexOf(this.activeIndex) >= 0;

      this.activeIndex = Math.max(0, nextActiveIndex);

      if (removedActiveIndex) {
        if (this.activeIndex === 0) {
          this.activeIndex = -1;
        }

        this.repairContents(false);
        this.previous(actionOptions);
        previousCalled = true;
      }
    }

    if (removedIndexes.length > 0 && !previousCalled) {
      this.repairContents(false);
      this.subscriber(this);
    }

    return removed.map((r) => r.value);
  }

  /**
   * Swaps the `Content` at index a, with the `Content` at index b.
   *
   * Note: if the active `Content` is swapped, it will stay active,
   * it will only get a new position.
   *
   * @param {number} a The first index to swap.
   * @param {number} b The second index to swap.
   * @throws Index out of bounds error.
   */
  public swapByIndex(a: number, b: number): void {
    if (a < 0 || a >= this.contents.length) {
      throw new Error(
        'automata > ActiveContent.swapByIndex > could not swap: index a out of bounds'
      );
    }

    if (b < 0 || b >= this.contents.length) {
      throw new Error(
        'automata > ActiveContent.swapByIndex > could not swap: index b out of bounds'
      );
    }

    // This is a developer mistake which is ok because nothing bad happens
    // we do not have to throw an error.
    if (a === b) {
      return;
    }

    const itemA = this.contents[a];
    const itemB = this.contents[b];

    // When swapping the active index fix the activeIndex's state
    if (this.activeIndex === itemA.index) {
      this.activeIndex = itemB.index;
    } else if (this.activeIndex === itemB.index) {
      this.activeIndex = itemA.index;
    }

    itemA.index = b;
    itemB.index = a;

    this.contents[a] = itemB;
    this.contents[b] = itemA;

    this.repairContents(false);

    this.pushHistory(() => ({
      action: 'SWAPPED',
      value: {
        a: itemA.value,
        b: itemB.value,
      },
      index: {
        a,
        b,
      },
      time: new Date(),
    }));

    this.subscriber(this);
  }

  /**
   * Swaps the `Content` with item a, with the `Content` with
   * item b. Swaps the items based on identity by comparing the items 
   * via a `===` check. When multiple items match on `===` only the 
   * first matching item is swapped.
   *
   * Note: if the active `Content` is swapped, it will stay active,
   * it will only get a new position.
   *
   * @param {T} a The first item to swap.
   * @param {T} b The second item to swap.
   * @throws Item not found error
   */
  public swap(a: T, b: T): void {
    const indexA = this.getIndex(a);
    const indexB = this.getIndex(b);

    this.swapByIndex(indexA, indexB);
  }

  /**
   * Moves the `Content` at index "from", to the position at index "to".
   *
   * It is possible to move the `Content` to the last place by making
   * the "to" index the length of the `contents` array.
   *
   * Note: if the active `Content` is moved it will stay active,
   * meaning that the activeIndex will get updated.
   *
   * @param {number} from The "from" index which needs to be moved
   * @param {number} to The location the `from` needs to move "to".
   * @throws Index out of bounds error.
   */
  public moveByIndex(from: number, to: number): void {
    if (from < 0 || from >= this.contents.length) {
      throw new Error(
        'automata > ActiveContent.moveByIndex > could not swap: index "from" out of bounds'
      );
    }

    if (to < 0 || to >= this.contents.length) {
      throw new Error(
        'automata > ActiveContent.moveByIndex > could not swap: index "to" out of bounds'
      );
    }

    // This can happen when the developer gives a predicate which matches
    // the item being moved. This is a developer mistake which is ok,
    // so we do not have to throw an error.
    if (from === to) {
      return;
    }

    /*
      Hopefully all possible movement scenarios and their effects on 
      the active index and the value of the "to" when doing the insert.
      
      Note: capital letter indicates the active `Content`.

      Scenario 1: moving from before the activeIndex to beyond the activeIndex:
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
          active index = 3 -> 2; DEC
          to           = 4 -> 4; SAME

      Scenario 2: moving from before the active index to directly onto the activeIndex:
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
          active index = 3 -> 2; DEC
          to           = 2 -> 2; SAME

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
          active index = 3 -> 2; DEC
          to           = 6 -> 6; SAME

      Scenario 4: moving from beyond the activeIndex to before the active index:
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
          active index = 3 -> 4; INC
          to           = 1 -> 1; SAME

      Scenario 5: moving from beyond the activeIndex to directly onto the active index:
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
          active index = 3 -> 4; INC
          to           = 3 -> 3; SAME
      
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
          active index = 3 -> 4; INC
          to           = 0 -> 0; SAME

      Scenario 7: moving from beyond the activeIndex to beyond the active index:
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
          active index = 3 -> 3; SAME
          to           = 5 -> 5; SAME

      Scenario 8: moving from before the activeIndex to before the active index:
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
          active index = 3 -> 3; SAME
          to           = 1 -> 1; SAME

      Scenario 9: moving from active to beyond active:
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
          active index = 3 -> 4; REPLACES
          to           = 0 -> 0; SAME

      Scenario 10: moving from active to before active:
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
          active index = 3 -> 2; REPLACES
          to           = 2 -> 2; SAME

      Scenario 11: moving from active to first:
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
          active index = 3 -> 0; REPLACES
          to           = 0 -> 0; SAME
      
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
          active index = 3 -> 6; REPLACES
          to           = 0 -> 0; SAME
    */

    const activeIndex = this.activeIndex;

    if (activeIndex === from) {
      // Update the active index when it is moved
      this.activeIndex = to;
    } else if (to === activeIndex && from > activeIndex) {
      this.activeIndex += 1;
    } else if (to === activeIndex && from < activeIndex) {
      this.activeIndex -= 1;
    } else if (to > activeIndex && from < activeIndex) {
      this.activeIndex -= 1;
    } else if (to < activeIndex && from > activeIndex) {
      this.activeIndex += 1;
    }

    // First store the fromItem so we can add it back later.
    const fromItem = this.contents[from];

    // Now remove the "from" item.
    this.contents.splice(from, 1);

    // Finally insert it the "from" into the correct spot.
    this.contents.splice(to, 0, fromItem);

    this.repairContents(false);

    this.pushHistory(() => ({
      action: 'MOVED',
      value: fromItem.value,
      index: {
        from,
        to,
      },
      time: new Date(),
    }));

    this.subscriber(this);
  }

  /**
   * Moves the item, to the position at index "to".
   *
   * It is possible to move the `Content` to the last place by making
   * the "to" index the length of the `contents` array.
   *
   * Note: if the active `Content` is moved it will stay active,
   * meaning that the activeIndex will get updated.
   *
   * @param {T} item The item to move
   * @param {number} to The location the `item` needs to move "to".
   * @throws Item not found error
   * @throws Index out of bounds error.
   */
  public move(item: T, to: number): void {
    const from = this.getIndex(item);
    this.moveByIndex(from, to);
  }

  private moveByIndexPredicateWithMod(
    fromIndex: number,
    predicate: ItemPredicate<T>,
    mod: number
  ): void {
    const contents = this.contents;
    const length = contents.length;

    for (let index = 0; index < length; index++) {
      if (predicate(contents[index].value, index)) {
        const atIndex = Math.min(Math.max(0, index + mod), length - 1);

        this.moveByIndex(fromIndex, atIndex);
        return;
      }
    }
  }

  /**
   * Moves the `Content`, at the index, to the position of the
   * item for which the predicate returns `true`.
   *
   * If no item matches the predicate nothing is moved.
   *
   * @param {number} index The index to move.
   * @param {ItemPredicate<T>} predicate The predicate function which when `true` is returned moves the item to that position.
   */
  public moveByIndexAtPredicate(
    index: number,
    predicate: ItemPredicate<T>
  ): void {
    this.moveByIndexPredicateWithMod(index, predicate, 0);
  }

  /**
   * Moves the `Content`, at the index, to the position before the
   * item for which the predicate returns `true`.
   *
   * If no item matches the predicate nothing is moved.
   *
   * @param {number} index The index to move.
   * @param {ItemPredicate<T>} predicate The predicate function which when `true` is returned moves the item to before that position.
   */
  public moveByIndexBeforePredicate(
    index: number,
    predicate: ItemPredicate<T>
  ): void {
    this.moveByIndexPredicateWithMod(index, predicate, -1);
  }

  /**
   * Moves the `Content`, at the index, to the position after the
   * item for which the predicate returns `true`.
   *
   * If no item matches the predicate nothing is moved.
   *
   * @param {number} index The index to move.
   * @param {ItemPredicate<T>} predicate The predicate function which when `true` is returned moves the item to after that position.
   */
  public moveByIndexAfterPredicate(
    index: number,
    predicate: ItemPredicate<T>
  ): void {
    this.moveByIndexPredicateWithMod(index, predicate, 1);
  }

  /**
   * Moves the `Content` which matches the value of the item based
   * on `===` equality. To the position of the item for which
   * the predicate returns `true`.
   *
   * When multiple items match on `===` only the first matching item is moved.
   *
   * If no item matches the predicate nothing is moved.
   *
   * @param {T} item The item to move.
   * @param {ItemPredicate<T>} predicate The predicate function which when `true` is returned moves the item to after that position.
   * @throws Item not found error
   */
  public moveAtPredicate(item: T, predicate: ItemPredicate<T>): void {
    const index = this.getIndex(item);
    this.moveByIndexPredicateWithMod(index, predicate, 0);
  }

  /**
   * Moves the `Content` which matches the value of the item based
   * on `===` equality. To the position before the item for which
   * the predicate returns `true`.
   *
   * When multiple items match on `===` only the first matching item is moved.
   *
   * If no item matches the predicate nothing is moved.
   *
   * @param {number} index The index to move.
   * @param {ItemPredicate<T>} predicate The predicate function which when `true` is returned moves the item to after that position.
   */
  public moveBeforePredicate(item: T, predicate: ItemPredicate<T>): void {
    const index = this.getIndex(item);
    this.moveByIndexPredicateWithMod(index, predicate, -1);
  }

  /**
   * Moves the `Content` which matches the value of the item based
   * on `===` equality. To the position after the item for which
   * the predicate returns `true`.
   *
   * When multiple items match on `===` only the first matching item is moved.
   *
   * If no item matches the predicate nothing is moved.
   *
   * @param {number} index The index to move.
   * @param {ItemPredicate<T>} predicate The predicate function which when `true` is returned moves the item to after that position.
   */
  public moveAfterPredicate(item: T, predicate: ItemPredicate<T>): void {
    const index = this.getIndex(item);
    this.moveByIndexPredicateWithMod(index, predicate, 1);
  }

  /**
   * Gets the index for a given item.
   * 
   * If the item does not exist in the content array it will
   * throw an error.
   * 
   * @param {T} item The item to get the index for.
   * @returns {number} The index of the given item.
   * @throws Item not found error
   */
   public getIndex(item: T): number {
    const contents = this.contents;
    const length = contents.length;

    for (let i = 0; i < length; i++) {
      if (contents[i].value === item) {
        return i;
      }
    }

    throw new Error(
      'automata > ActiveContent.getIndex could not get index for item. Item not in contents array'
    );
  }

  /**
   * Returns the final index available in the contents array.
   *
   * @returns {number} The last index of the contents array.
   */
  public getLastIndex(): number {
    return this.contents.length - 1;
  }

  /**
   * Get the next index of the sequence.
   *
   * When on the last position: if `isCircular` is `true` it will
   * circle around and return 0. When `isCircular` is `false` it will
   * stay on the last position and return the last index of the array.
   *
   * @returns {number} The next index of the sequence.
   */
  public getNextIndex(index: number): number {
    const nextIndex = index + 1;

    if (this.isCircular && nextIndex === this.contents.length) {
      return 0;
    }

    return nextIndex;
  }

  /**
   * Get the previous index of the sequence.
   *
   * When on the first position: if `isCircular` is `true` it will
   * circle around and return the last index of the array. When
   * `isCircular` is `false` it will stay on the first position and
   * return 0.
   *
   *  @returns {number} The previous index of the sequence.
   */
  public getPreviousIndex(index: number): number {
    const previousIndex = index - 1;

    if (this.isCircular && previousIndex < 0) {
      return this.getLastIndex();
    }

    return previousIndex;
  }

  /**
   * Wether or not the contents is an empty array or not.
   */
  public isEmpty(): boolean {
    return this.contents.length === 0;
  }

  // Helpers

  private getDirectionWhenMovingToIndex(next: number): string {
    const activeIndex = this.activeIndex;

    if (this.isCircular) {
      const end = this.getLastIndex();

      if (activeIndex === 0 && next === end) {
        return this.directions.previous;
      } else if (activeIndex === end && next === 0) {
        return this.directions.next;
      }
    }

    return next >= activeIndex
      ? this.directions.next
      : this.directions.previous;
  }

  // Restore the content after a mutation on the state has occurred.
  private repairContents(alterActive: boolean): void {
    const nextIndex = this.getNextIndex(this.activeIndex);
    const previousIndex = this.getPreviousIndex(this.activeIndex);

    // Correctly set the state of the content
    this.contents.forEach((content, index) => {
      content.index = index;

      if (alterActive) {
        content.active = index === this.activeIndex;
      }

      content.isNext = nextIndex === index;
      content.isPrevious = previousIndex === index;

      this.repairContent(content, index, this.contents);
    });
  }

  // The shared logic for fixing a broken Content.
  private repairContent(
    content: Content<T>,
    index: number,
    contents: T[] | Content<T>[]
  ) {
    content.isFirst = index === 0;
    content.isLast = index === contents.length - 1;

    if (this.isCircular) {
      // When circular next and a previous when there is actual content
      const hasLength = contents.length > 0;

      content.hasNext = hasLength;
      content.hasPrevious = hasLength;
    } else {
      content.hasNext = index + 1 < contents.length;
      content.hasPrevious = index - 1 >= 0;
    }
  }

  private becameEmpty() {
    this.activeIndex = -1;
    this.active = null;
    this.activeContent = null;

    // When becoming empty it has changed
    this.hasActiveChangedAtLeastOnce = true;
  }

  private pushHistory(item: () => HistoryItem<T>) {
    // Track history if the developer wants it.
    if (this.keepHistoryFor > 0) {
      this.history.push(item());

      // Prevent from growing infinitely
      if (this.history.length - 1 === this.keepHistoryFor) {
        this.history.shift();
      }
    }
  }
}
