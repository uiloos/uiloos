import { TypewriterBlinkingEvent, TypewriterCursorSelection } from './types';
import { Typewriter } from './Typewriter';

/**
 * Represents a cursor within a Typewriter.
 *
 * Note: when `initialize` is called on a `Typewriter` all cursors
 * are reset, and the previously attached cursors become detached,
 * this means that the positions of the cursors are no longer
 * accurate.
 * 
 * You should never instantiate a `TypewriterCursor` directly. It 
 * should always be given to you by the `Typewriter`.
 *
 * @since 1.2.0
 */
export class TypewriterCursor<T> {
  private _typewriter: Typewriter<T>;

  /**
   * The position of the cursor within the `Typewriter` text.
   * 
   * If the cursor also has a `selection`, the `position` will always 
   * either on the `start` or `end` of the `selection`.
   *
   * Note: when `initialize` is called on a `Typewriter` all cursors
   * become detached, and the position is no longer accurate.
   *
   * @since 1.2.0
   */
  public position: number;

  /**
   * The data for the cursor, "data" can be be anything from an 
   * object, string, array etc etc. The idea is that you can store
   * any information here you need to render the cursor. For example
   * you could set the data to an object, containing the "name" and
   * "color" for that cursor.
   *
   * By default the value is `undefined`.
   * 
   * @since 1.2.0
   */
  data?: T;

  /**
   * The range of positions which this cursor has selected, or when
   * it is `undefined` signifying no selection.
   * 
   * The `position` of a cursors is always either on the `start` or 
   * `end` of the `selection`.
   *
   * Note: whenever the cursor stops selecting text the selection
   * will be turned into `undefined`. So be careful not to keep any
   * references to selections.
   * 
   * @since 1.2.0
   */
  public selection?: TypewriterCursorSelection;

  /**
   * Whether or not this cursor is blinking.
   *
   * A cursor does not blink when the user is typing, only when the
   * user has stopped typing then after a little while the cursor
   * will start blinking again.
   * 
   * The time until the cursors blinks again is the `Typewriter`'s
   * `blinkAfter` property.
   *
   * @since 1.2.0
   */
  public isBlinking: boolean = true;

  /*
     The timeoutId given back by calling window.setTimeout for the
     blinking interval. Is kept here so it can be cleared via
     window.clearTimeout.
   */
  private _blinkTimeoutId: number | null = null;

   /**
   * Creates an TypewriterCursor which belongs to the given Typewriter.
   *
   * Note: you should never create instances of TypewriterCursor 
   * yourself. You are supposed to let the Typewriter do this for you.
   *
   * @param {Typewriter<T>} typewriter The Typewriter this TypewriterCursor belongs to.
   * @param {number} position The position of this TypewriterCursor within the Typewriter text.
   * @param {T} data The data for this TypewriterCursor
   * @param {selection} selection The selection of the TypewriterCursor
   * 
   * @since 1.2.0
   */
  constructor(
    typewriter: Typewriter<T>,
    position: number,
    data?: T,
    selection?: TypewriterCursorSelection,
  ) {
    this._typewriter = typewriter;
    this.position = position;
    this.selection = selection;
    this.data = data;
  }

  // Start blinking after the configured _blinkAfter delay
  public _startBlink(): void {
    // Don't blink when already blinking
    if (this.isBlinking) {
      return;
    }

    this._clearBlink();

    this._blinkTimeoutId = window.setTimeout(() => {
      this.isBlinking = true;

      const event: TypewriterBlinkingEvent<T> = {
        type: 'BLINKING',
        time: new Date(),
        cursor: this,
      };

      this._typewriter._inform(event);
    }, this._typewriter.blinkAfter);
  }

  public _clearBlink(): void {
    if (this._blinkTimeoutId) {
      window.clearTimeout(this._blinkTimeoutId);

      // This is just a very minor performance boost. One other reason
      // to do this is that when debugging this code, it is slightly
      // easier to follow due to the `_blinkTimeoutId` getting
      // cleaned up, otherwise it looks like the timeout is still in
      // progress.
      this._blinkTimeoutId = null;
    }
  }
}
