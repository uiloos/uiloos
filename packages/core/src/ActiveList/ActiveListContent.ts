import { ActiveList } from './ActiveList';
import {
  ActiveListActivationOptions,
  ActiveListContentPredicate,
  ActiveListPredicateOptions,
} from './types';

/**
 * Represents a piece of content in the `contents` array of the `ActiveList`.
 *
 * The purpose of the ActiveListContent is to act as a wrapper around the
 * value which is actually in the contents array. It knows things like
 * wether the item is active or not.
 *
 * It also contains methods to activate, remove, swap and move itself
 * within the ActiveList.
 */
export class ActiveListContent<T> {
  /**
   * Reference to the ActiveList is it a part of.
   */
  public activeList: ActiveList<T>;

  /**
   * The index of the `ActiveListContent` which it has within the `contents`.
   */
  public index: number;

  /**
   * The actual `value` of the `ActiveListContent` it can be whatever the
   * developer wants it to be.
   */
  public value: T;

  /**
   * Whether or not the `ActiveListContent` is currently active.
   */
  public isActive = false;

  /**
   * Whether or not the `ActiveListContent` has been active at least once
   * in the past.
   */
  public hasBeenActiveBefore = false;

  /**
   * Whether or not the `ActiveListContent` is considered to be the first
   * item in the `contents`.
   */
  public isFirst = false;

  /**
   * Whether or not the `ActiveListContent` is considered to be the last
   * item in the `contents`.
   */
  public isLast = false;

  /**
   * Whether this `ActiveListContent` has at least one other `ActiveListContent` coming
   * after it in the `contents`
   */
  public hasNext = false;

  /**
   * Whether this `ActiveListContent` has at least one other `ActiveListContent` coming
   * before it in the `contents`
   */
  public hasPrevious = false;

  /**
   * Whether this `ActiveListContent` comes directly after the `ActiveListContent`, in the
   * `contents` array, which is currently the `lastActiveList`.
   */
  public isNext = false;

  /**
   * Whether this `ActiveListContent` comes directly before the `ActiveListContent`, in the
   * `contents` array, which is currently the `lastActiveList`.
   */
  public isPrevious = false;

  /**
   * Creates an ActiveListContent which belongs to the given ActiveList.
   *
   * Note: you should never create instances of ActiveListContent yourself. You
   * are supposed to let ActiveList do this for you.
   *
   * @param {ActiveList<T>} activeList The ActiveList this ActiveListContent belongs to.
   * @param {number} index The index of this ActiveListContent within the ActiveList.
   * @param {T} value The value this ActiveListContent wraps.
   */
  constructor(activeList: ActiveList<T>, index: number, value: T) {
    this.activeList = activeList;
    this.index = index;
    this.value = value;
  }

  /**
   * When calling `activate` it will make this `ActiveListContent` active.
   *
   * @param {ActiveListActivationOptions<T>} [activationOptions] The activation options @see ActiveListActivationOptions<T>
   */
  public activate(activationOptions?: ActiveListActivationOptions<T>): void {
    this.activeList.activateByIndex(this.index, activationOptions);
  }

  /**
   * When calling `deactivate` it will make this `ActiveListContent` inactive.
   *
   * @param {ActiveListActivationOptions<T>} [activationOptions] The activation options @see ActiveListActivationOptions<T>
   */
  public deactivate(activationOptions?: ActiveListActivationOptions<T>): void {
    this.activeList.deactivateByIndex(this.index, activationOptions);
  }

  /**
   * When calling `toggle` it will flip the this `ActiveListContent`
   * `isActive` state.
   *
   * So when `isActive` is `true` and `toggle` is called, `isActive`
   * will become `false`. When `isActive` is `false` and `toggle` is
   * called, `isActive` will become `true`.
   *
   * With the `activationOptions` you can determine the effects
   * on `cooldown` and `autoplay`.
   *
   * @param {ActiveListActivationOptions<T>} [activationOptions] The activation options @see ActiveListActivationOptions<T>
   */
  public toggle(activationOptions?: ActiveListActivationOptions<T>): void {
    this.activeList.toggleByIndex(this.index, activationOptions);
  }

  /**
   * When calling `remove` it will remove this `ActiveListContent`, and return
   * the `value` the ActiveListContent held.
   *
   * @returns {T} The removed value
   */
  public remove(): T {
    return this.activeList.removeByIndex(this.index);
  }

  /**
   * Swaps the `ActiveListContent` with the `ActiveListContent` at the given index.
   *
   * Note: if the active `ActiveListContent` is swapped, it will stay active,
   * it will only get a new position.
   *
   * @param {number} index The index to swap the current `ActiveListContent` with.
   * @throws Item not found error
   */
  public swapWith(item: T): void {
    const itemIndex = this.activeList.getIndex(item);
    this.swapWithByIndex(itemIndex);
  }

  /**
   * Swaps the `ActiveListContent` with the `ActiveListContent` at the given index.
   *
   * Note: if the active `ActiveListContent` is swapped, it will stay active,
   * it will only get a new position.
   *
   * @param {number} index] The index to swap the current `ActiveListContent` with.
   * @throws Index out of bounds error.
   */
  public swapWithByIndex(index: number) {
    this.activeList.swapByIndex(this.index, index);
  }

  /**
   * Swaps the `ActiveListContent` with the next `ActiveListContent` in the sequence.
   *
   * If `isCircular` of the `ActiveList` is `true` swapping whilst on
   * the last index will make this `ActiveListContent` swap with the
   * first index. If `isCircular` is `false` it will do nothing,
   *  and keep the `ActiveListContent` on the last index.
   *
   * Note: if the active `ActiveListContent` is swapped, it will stay active,
   * it will only get a new position.
   */
  public swapWithNext(): void {
    const nextIndex = this.activeList._getBoundedNextIndex(this.index);
    this.swapWithByIndex(nextIndex);
  }

  /**
   * Swaps the `ActiveListContent` with the previous `ActiveListContent` in the sequence.
   *
   * If `isCircular` of the `ActiveList` is `true` swapping whilst on
   * the first index will make this `ActiveListContent` swap with the
   * last index. If `isCircular` is `false` it will do nothing,
   *  and keep the `ActiveListContent` on the first index.
   *
   * Note: if the active `ActiveListContent` is swapped, it will stay active,
   * it will only get a new position.
   */
  public swapWithPrevious(): void {
    const previousIndex = this.activeList._getBoundedPreviousIndex(
      this.index
    );
    this.swapWithByIndex(previousIndex);
  }

  /**
   * Moves the `ActiveListContent` to the position at index "to".
   *
   * It is possible to move the `ActiveListContent` to the last place by making
   * the "to" index the length of the `contents` array.
   *
   * Note: if the active `ActiveListContent` is moved it will stay active,
   * meaning that the activeIndex will get updated.
   *
   * @param {number} to The location the `from` needs to move "to".
   * @throws Index out of bounds error.
   */
  public moveToIndex(to: number) {
    this.activeList.moveByIndex(this.index, to);
  }

  /**
   * Moves the `ActiveListContent` to the position of the item for which
   * the predicate returns `true`.
   *
   * If no item matches the predicate nothing is moved.
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
   * @param {ActiveListContentPredicate<T>} predicate The predicate function which when `true` is returned moves the item to after that position.
   * @param {ActiveListPredicateOptions} options The options for the predicate, when no options are provided the mode will default to "at".
   */
  public moveToPredicate(
    predicate: ActiveListContentPredicate<T>,
    options?: ActiveListPredicateOptions
  ) {
    this.activeList.moveByIndexByPredicate(this.index, predicate, options);
  }

  /**
   * Moves the `ActiveListContent` to the first position in the contents array.
   *
   * Note: if the active `ActiveListContent` is moved it will stay active,
   * meaning that the activeIndex will get updated.
   */
  public moveToFirst() {
    this.activeList.moveByIndex(this.index, 0);
  }

  /**
   * Moves the `ActiveListContent` to the last position in the contents array.
   *
   * Note: if the active `ActiveListContent` is moved it will stay active,
   * meaning that the activeIndex will get updated.
   */
  public moveToLast() {
    this.activeList.moveByIndex(
      this.index,
      this.activeList.getLastIndex()
    );
  }
}
