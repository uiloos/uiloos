import { ActiveContent } from './ActiveContent';
import { ActivationOptions, ContentPredicate } from './types';

/**
 * Represents a piece of content in the `contents` array of the `ActiveContent`.
 *
 * The purpose of the Content is to act as a wrapper around the
 * value which is actually in the contents array. It knows things like
 * wether the item is active or not.
 *
 * It also contains methods to activate, remove, swap and move itself
 * within the ActiveContent.
 */
export class Content<T> {
  /**
   * Reference to the active content is it a part of.
   */
  public activeContent: ActiveContent<T>;

  /**
   * The index of the `Content` which it has within the `contents`.
   */
  public index: number;

  /**
   * The actual `value` of the `Content` it can be whatever the
   * developer wants it to be.
   */
  public value: T;

  /**
   * Whether or not the `Content` is currently active, only one `Content`
   * can be active at a time.
   */
  public active = false;

  /**
   * Whether or not the `Content` has been active at least once
   * in the past.
   */
  public hasBeenActiveBefore = false;

  /**
   * Whether or not the `Content` is considered to be the first
   * item in the `contents`.
   */
  public isFirst = false;

  /**
   * Whether or not the `Content` is considered to be the last
   * item in the `contents`.
   */
  public isLast = false;

  /**
   * Whether this `Content` has at least one other `Content` coming
   * after it in the `contents`
   */
  public hasNext = false;

  /**
   * Whether this `Content` has at least one other `Content` coming
   * before it in the `contents`
   */
  public hasPrevious = false;

  /**
   * Whether this `Content` comes directly after the `Content`, in the
   * `contents` array, which is currently the `lastActiveContent`.
   */
  public isNext = false;

  /**
   * Whether this `Content` comes directly before the `Content`, in the
   * `contents` array, which is currently the `lastActiveContent`.
   */
  public isPrevious = false;

  /**
   * Creates an Content which belongs to the given ActiveContent.
   *
   * Note: you should never create instances of Content yourself. You
   * are supposed to let ActiveContent do this for you.
   *
   * @param {ActiveContent<T>} activeContent The ActiveContent this Content belongs to.
   * @param {number} index The index of this Content withing the ActiveContent.
   * @param {T} value The value this Content wraps.
   */
  constructor(activeContent: ActiveContent<T>, index: number, value: T) {
    this.activeContent = activeContent;
    this.index = index;
    this.value = value;
  }

  /**
   * When calling `activate` it will make this `Content` active.
   *
   * @param {ActivationOptions<T>} [activationOptions] The activation options @see ActivationOptions<T>
   */
  public activate(activationOptions?: ActivationOptions<T>): void {
    this.activeContent.activateByIndex(this.index, activationOptions);
  }

  /**
   * When calling `deactivate` it will make this `Content` inactive.
   *
   * @param {ActivationOptions<T>} [activationOptions] The activation options @see ActivationOptions<T>
   */
   public deactivate(activationOptions?: ActivationOptions<T>): void {
    this.activeContent.deactivateByIndex(this.index, activationOptions);
  }

  /**
   * When calling `remove` it will remove this `Content`, and return
   * the `value` the Content held.
   * 
   * @returns {T} The removed value
   */
  public remove(): T {
    return this.activeContent.removeByIndex(this.index);
  }

  /**
   * Swaps the `Content` with the `Content` at the given index.
   *
   * Note: if the active `Content` is swapped, it will stay active,
   * it will only get a new position.
   *
   * @param {number} index The index to swap the current `Content` with.
   * @throws Item not found error
   */
  public swapWith(item: T): void {
    const itemIndex = this.activeContent.getIndex(item);
    this.swapWithByIndex(itemIndex);
  }

  /**
   * Swaps the `Content` with the `Content` at the given index.
   *
   * Note: if the active `Content` is swapped, it will stay active,
   * it will only get a new position.
   *
   * @param {number} index] The index to swap the current `Content` with.
   * @throws Index out of bounds error.
   */
  public swapWithByIndex(index: number) {
    this.activeContent.swapByIndex(this.index, index);
  }

  /**
   * Swaps the `Content` with the next `Content` in the sequence.
   *
   * Note: if the active `Content` is swapped, it will stay active,
   * it will only get a new position.
   */
  public swapWithNext(): void {
    const index = this.activeContent.getNextIndex(this.index);
    this.swapWithByIndex(index);
  }

  /**
   * Swaps the `Content` with the previous `Content` in the sequence.
   *
   * Note: if the active `Content` is swapped, it will stay active,
   * it will only get a new position.
   *
   * @throws Index out of bounds error.
   */
  public swapWithPrevious(): void {
    const index = this.activeContent.getPreviousIndex(this.index);
    this.swapWithByIndex(index);
  }

  /**
   * Moves the `Content` to the position at index "to".
   *
   * It is possible to move the `Content` to the last place by making
   * the "to" index the length of the `contents` array.
   *
   * Note: if the active `Content` is moved it will stay active,
   * meaning that the activeIndex will get updated.
   *
   * @param {number} to The location the `from` needs to move "to".
   * @throws Index out of bounds error.
   */
  public moveToIndex(to: number) {
    this.activeContent.moveByIndex(this.index, to);
  }

  /**
   * Moves the `Content` to the position of the item for which
   * the predicate returns `true`.
   *
   * If no item matches the predicate nothing is moved.
   *
   * @param {ContentPredicate<T>} predicate The predicate function which when `true` is returned moves the item to after that position.
   */
  public moveToAtPredicate(predicate: ContentPredicate<T>) {
    this.activeContent.moveByIndexAtPredicate(this.index, predicate);
  }

  /**
   * Moves the `Content` to the position before the item for which
   * the predicate returns `true`.
   *
   * If no item matches the predicate nothing is moved.
   *
   * @param {ContentPredicate<T>} predicate The predicate function which when `true` is returned moves the item to after that position.
   */
  public moveToBeforePredicate(predicate: ContentPredicate<T>) {
    this.activeContent.moveByIndexBeforePredicate(this.index, predicate);
  }

  /**
   * Moves the `Content` too the position after the item for which
   * the predicate returns `true`.
   *
   * If no item matches the predicate nothing is moved.
   *
   * @param {ContentPredicate<T>} predicate The predicate function which when `true` is returned moves the item to after that position.
   */
  public moveToAfterPredicate(predicate: ContentPredicate<T>) {
    this.activeContent.moveByIndexAfterPredicate(this.index, predicate);
  }

  /**
   * Moves the `Content` to the first position in the contents array.
   *
   * Note: if the active `Content` is moved it will stay active,
   * meaning that the activeIndex will get updated.
   */
  public moveToFirst() {
    this.activeContent.moveByIndex(this.index, 0);
  }

  /**
   * Moves the `Content` to the last position in the contents array.
   *
   * Note: if the active `Content` is moved it will stay active,
   * meaning that the activeIndex will get updated.
   */
  public moveToLast() {
    this.activeContent.moveByIndex(
      this.index,
      this.activeContent.getLastIndex()
    );
  }
}
