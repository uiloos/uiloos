import { TypewriterBlinkingEvent, TypewriterCursorSelection } from './types';
import { Typewriter } from './Typewriter';

/**
 * Represents a cursor within the Typewriter.
 *
 * @since 1.2.0
 */
export class TypewriterCursor {
  /**
   * The position of the cursor within the `Typewriter` text.
   *
   * @since 1.2.0
   *
   */
  private _typewriter: Typewriter;

  /**
   * The position of the cursor within the `Typewriter` text.
   *
   * @since 1.2.0
   *
   */
  public position: number;

  /**
   * The name associated with the cursor.
   *
   * @since 1.2.0
   */
  public name: string;

  /**
   * The range of positions which this cursor has selected, or when
   * it is `undefined signifying no selection.
   * 
   * Note: whenever the cursor stops selecting text the selection
   * will be turned into `undefined`. This means that this is one of
   * the few objects in uiloos that can change its reference.
   */
  public selection?: TypewriterCursorSelection;

  /**
   * Whether or not this cursor is blinking.
   *
   * A cursor does not blink when the user is typing, only when the
   * user has stopped typing then after a little while the cursor
   * will start blinking.
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

  constructor(
    typewriter: Typewriter,
    position: number,
    name: string,
    selection?: TypewriterCursorSelection
  ) {
    this._typewriter = typewriter;
    this.position = position;
    this.name = name;
    this.selection = selection;
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

      const event: TypewriterBlinkingEvent = {
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
