import { Typewriter } from './Typewriter';
import { TypewriterCursor } from './TypewriterCursor';

/**
 * Represents the selection of a cursor. A selection has a `start`
 * and and `end` which are both numbers representing two positions
 * within a `Typewriter`'s `text` property.
 * 
 * The `start` will always lie before the `end`. 
 * 
 * The `position` of a cursors is always either on the `start` or 
 * `end` of the `selection`.
 * 
 * @since 1.2.0
 */
export type TypewriterCursorSelection = {
  /**
   * The start position of the selection.
   * 
   * @since 1.2.0
   */
  start: number,

  /**
   * The end position of the selection.
   * 
   * @since 1.2.0
   */
  end: number
}

/**
 * Configures the initial state of the `TypewriterCursor`.
 *
 * @since 1.2.0
 */
export type TypewriterCursorConfig = {
  /**
   * The position of the cursor within the `Typewriter` text.
   *
   * @since 1.2.0
   */
  position: number;

  /**
   * The optional name associated with the cursor. Nothing is done 
   * with the name itself by the Typewriter.
   * 
   * You could use the name to:
   * 
   *   1. Give the cursor a label in the animation, telling to which
   *      "user" the cursor belongs.
   * 
   *   2. Give the cursor a name to more easily identify the cursor,
   *      perhaps to give different styling to each individual cursor.
   *      In this case the name might even be a CSS selector.
   *
   * Defaults to an empty string when not provided.
   *
   * @since 1.2.0
   */
  name?: string;

  /**
   * The range of positions which this cursor has selected.
   *
   * Defaults to undefined, meaning no selection has been made.
   * 
   * @since 1.2.0
   */
  selection?: TypewriterCursorSelection;
};

/**
 * Configures the initial state of the `Typewriter`.
 *
 * @since 1.2.0
 */
export type TypewriterConfig = {
  /**
   * The cursors the `Typewriter` is going to have.
   *
   * Defaults to one cursor at the end of the provided `text`
   * with an empty name.
   *
   * @since 1.2.0
   */
  cursors?: TypewriterCursorConfig[];

  /**
   * The actions this `Typewriter` is set to enter. Each stroke
   * represents a key press on the Typewriter. A stroke can add
   * or remove characters, or move the cursor.
   *
   * Defaults to an empty array, meaning no actions will be made.
   *
   * @since 1.2.0
   */
  actions?: TypewriterAction[];

  /**
   * The initial text the `Typewriter` starts with.
   *
   * Defaults to '' meaning that the Typewriter will not have an
   * initial text.
   *
   * @since 1.2.0
   */
  text?: string;

  /**
   * The time it takes until a cursor starts blinking again after 
   * the cursor was used.
   * 
   * A cursor does not blink when it is used until after a certain 
   * time. So if you keep typing the cursor does not blink, until 
   * you stop typing for some "predefined amount" of time. 
   * 
   * The `blinkAfter` is what represents that 'predefined amount' of 
   * time, you can also say this is a debounce time.
   * 
   * Note: when you set the `blinkAfter` to a number lower or equal to
   * the `delay` of a `TypewriterAction`, it will negate the debounce.
   * The effect is that all "CHANGED" events will have a "BLINKING"
   * event. This might not "visually" affect your animation, but 
   * will make the `Typewriter` send extra events. If this happens it
   * is technically as "misconfiguration" on your part, but the 
   * Typewriter will not throw any errors, since visually nothing
   * bad happens. 
   *
   * Defaults to after `250` milliseconds.
   *
   * @since 1.2.0
   */
  blinkAfter?: number;

  /**
   * For how many items the `history` may contain in the `Typewriter`.
   *
   * Defaults to `0` meaning that it will not track history.
   *
   * @since 1.2.0
   */
  keepHistoryFor?: number;

  /**
   * Whether or not the animation will immediately start playing.
   * 
   * When `true` the animation will start playing immediately, when 
   * `false` the animation will start when `play()` is called.
   * 
   * Note: the animation will only start playing when there are 
   * actions defined.
   * 
   * Defaults to `true` meaning that the animation will play instantly.
   * 
   * @since 1.2.0
   */
  autoPlay?: boolean;

  /**
   * Whether or not this animation repeats and how often.
   *
   * There are three ways to define `repeat`.
   *
   *  1. When `repeat` is `false` or `1` it will never repeat the 
   *     animation, the animation will run only once.
   *
   *  2. When `repeat` is `true` it will repeat the animation forever.
   *
   *  3. When `repeat` is a number it will repeat the animation
   *     for given number of times. If the number is 0 or a negative 
   *     number is provided a error occurs.
   *
   * Defaults to `false` meaning that the animation will run once.
   *
   * @since 1.2.0
   */
  repeat?: boolean | number;

  /**
   * The time in milliseconds the animation is paused in between 
   * repeats.
   *
   * Defaults to `0` milliseconds, meaning an almost instant repeat.
   *
   * @since 1.2.0
   */
  repeatDelay?: number;
};

/**
 * The subscriber which is informed of all state changes the
 * Typewriter goes through.
 *
 * @param {Typewriter} typewriter The Typewriter which had changes.
 * @param {TypewriterEvent<T>} event The event that occurred.
 *
 * @since 1.2.0
 */
export type TypewriterSubscriber = (
  typewriter: Typewriter,
  event: TypewriterEvent
) => void;

/**
 * The type of action which occurred on the Typewriter, can either
 * be a keyboard press or a mouse click.
 *
 * @since 1.2.0
 */
export type TypewriterActionType = 'mouse' | 'keyboard';

/**
 * Represents an action taken by the user can either be a key press,
 * or a mouse click.
 *
 * @since 1.2.0
 */
export type BaseTypewriterAction = {
  /**
   * The time in milliseconds after the previous action to wait until 
   * the action is performed.
   *
   * @since 1.2.0
   */
  delay: number;

  /**
   * The type of action which will be taken.
   *
   * @since 1.2.0
   */
  type: TypewriterActionType;

  /**
   * The cursor responsible for the action. Is the value
   * is the index of the cursor in the Typewriters cursors array.
   *
   * @since 1.2.0
   */
  cursor: number; // Has to be a number since the real cursor does not exist yet
};

/**
 * Represents the user entering text via the keyboard.
 *
 * @since 1.2.0
 */
export type TypewriterActionKeyboard = BaseTypewriterAction & {
  /**
   * The type signifying it is a keyboard event.
   *
   * @since 1.2.0
   */
  type: 'keyboard';

  /**
   * The string that was typed in, can either be a word or a single
   * character or a special symbol representing a special key on the
   * keyboard. There are six special keys:
   * 
   * 1. A backspace represented by '⌫'. It will when nothing is 
   *    selected delete the previous character, and when the cursor 
   *    does have a selection, remove all characters in the selection.
   * 
   * 2. 'Clear all' represented by '⎚', it clear the entire text.
   * 
   * 3. The left arrow key represented by '←'. When nothing is 
   *    selected is will move the cursor one position to the left.
   *    When a selection is made it will move the cursor to the start
   *    of the selection. 
   * 
   * 4. The right arrow key represented by '→'. When nothing is 
   *    selected is will move the cursor one position to the right.
   *    When a selection is made it will move the cursor to the end of 
   *    the selection. 
   * 
   * 5. Select left, represented by ⇧←', when repeated grows the
   *    selection.
   * 
   * 6. Select right, represented by ⇧→', when repeated grows the 
   *    selection.
   *
   * @since 1.2.0
   */
  text: string;
};

/**
 * Represents the user clicking somewhere in the text, moving
 * the cursor to the position.
 *
 * @since 1.2.0
 */
export type TypewriterActionMouse = BaseTypewriterAction & {
  /**
   * The type signifying it is a mouse event.
   *
   * @since 1.2.0
   */
  type: 'mouse';

  /**
   * The position the mouse click moves the cursor to.
   *
   * @since 1.2.0
   */
  position: number;

  /**
   * Optionally the selection the mouse made when clicking.
   * 
   * Normally there are two ways a someone can create selections with
   * a mouse: the first is clicking and dragging the mouse, the second
   * is double clicking on a word.
   * 
   * The idea is that the `selection` covers the second use-case: 
   * double clicking on a word. In the animation you will see the 
   * selection happen instantly. 
   * 
   * For first use-case: mouse click selection, it is better to use 
   * a keyboard event using `⇧←` or  `⇧→`. This way you animate the 
   * selection growing.
   *
   * @since 1.2.0
   */
  selection?: TypewriterCursorSelection
};

/**
 * The type of action which occurred on the Typewriter, can either
 * be a keyboard press or a mouse click.
 *
 * @since 1.2.0
 */
export type TypewriterAction =
  | TypewriterActionMouse
  | TypewriterActionKeyboard;

/**
 * Represents whether the `TypewriterEvent` has changed the text,
 * is playing, stopped or paused.
 *
 * @since 1.2.0
 */
export type TypewriterEventType =
  | 'INITIALIZED'
  | 'CHANGED'
  | 'PLAYING'
  | 'PAUSED'
  | 'STOPPED'
  | 'FINISHED'
  | 'BLINKING'
  | 'REPEATING';

/**
 * Represents an event which happened in the Typewriter. Based on the 
 * `type` you can determine which event occurred.
 *
 * @since 1.2.0
 */
export type TypewriterBaseEvent = {
  /**
   * Which event occurred.
   *
   * @since 1.2.0
   */
  type: TypewriterEventType;

  /**
   * The time the event occurred on as a Date object.
   *
   * @since 1.2.0
   */
  time: Date;
};

/**
 * When you loop over a Typewriter, using a `for-of` statement, you 
 * iterate over all positions in the Typewriters text. These positions
 * are represented by a `TypewriterPosition`.
 * 
 * `TypewriterPosition` contains the character for that position, 
 * the position (index) of that character, and all cursors currently
 * on the position. Lastly it will contain all cursors that have 
 * selected the position.
 * 
 * @since 1.2.0
 */
export type TypewriterPosition = {
  /**
   * The position of the 'character' in the text.
   * 
   * IMPORTANT: in JavaScript some unicode characters have a length 
   * bigger than 1. For example "😃".length is 2 not 1.
   * 
   * The Typewriter "normalizes" these so all unicode characters have 
   * a length of 1, by calling `Array.from(text)`.
   * 
   * @since 1.2.0
   */
  position: number;

  /**
   * The character which is at this position in the text.
   * 
   * @since 1.2.0
   */
  character: string;

  /**
   * The cursors that are on this position.
   * 
   * @since 1.2.0
   */
  cursors: TypewriterCursor[];

  /**
   * The cursors that have selected this position.
   * 
   * @since 1.2.0
   */
  selected: TypewriterCursor[];
}

/**
 * Represents the initialization of the Typewriter
 *
 * @since 1.2.0
 */
export type TypewriterInitializedEvent = TypewriterBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.2.0
   */
  type: 'INITIALIZED';
};

/**
 * Represents a change in the text of the typewriter, the moving
 * of a cursor, or a change in a cursors selection.
 *
 * This also means that the typewriter is no longer blinking at
 * this time, until the `BLINKING` event is triggered again.
 *
 * @since 1.2.0
 */
export type TypewriterChangedEvent = TypewriterBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.2.0
   */
  type: 'CHANGED';

  /**
   * The action that happened which triggered this
   * `TypewriterChangedEvent`.
   *
   * @since 1.2.0
   */
  action: TypewriterAction;

  /**
   * The cursor which triggered the changed event
   *
   * @since 1.2.0
   */
  cursor: TypewriterCursor;
};

/**
 * Represents that the Typewriter is currently playing.
 *
 * @since 1.2.0
 */
export type TypewriterPlayingEvent = TypewriterBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.2.0
   */
  type: 'PLAYING';
};

/**
 * Represents that the Typewriter is now paused.
 *
 * @since 1.2.0
 */
export type TypewriterPausedEvent = TypewriterBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.2.0
   */
  type: 'PAUSED';
};

/**
 * Represents that the Typewriter is was stopped.
 *
 * @since 1.2.0
 */
export type TypewriterStoppedEvent = TypewriterBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.2.0
   */
  type: 'STOPPED';
};

/**
 * Represents that the Typewriter has finished the animation.
 * 
 * Important: finishing only refers to the fact that the 'text' will
 * no longer change, but a cursor might start blinking after the 
 * animation is finished. 
 * 
 * Also when you call `play()` again the animation restarts, 
 * for both these reasons "FINISHED" is not necessarily the last 
 * event that will take place.
 *
 * @since 1.2.0
 */
export type TypewriterFinishedEvent = TypewriterBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.2.0
   */
  type: 'FINISHED';

  /**
   * The action that happened which triggered this
   * `TypewriterFinishedEvent`.
   *
   * @since 1.2.0
   */
  action: TypewriterAction;

  /**
   * The cursor which triggered the finished event.
   *
   * @since 1.2.0
   */
  cursor: TypewriterCursor;
};

/**
 * Represents that a Typewriters cursor should now be blinking.
 *
 * @since 1.2.0
 */
export type TypewriterBlinkingEvent = TypewriterBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.2.0
   */
  type: 'BLINKING';

  /**
   * The cursor which has started blinking.
   *
   * @since 1.2.0
   */
  cursor: TypewriterCursor;
};

/**
 * Represents that the Typewriters has started repeating the animation.
 *
 * @since 1.2.0
 */
export type TypewriterRepeatingEvent = TypewriterBaseEvent & {
  /**
   * Which type occurred
   *
   * @since 1.2.0
   */
  type: 'REPEATING';

  /**
   * The cursor which triggered the repeating event.
   *
   * @since 1.2.0
   */
  cursor: TypewriterCursor;
};

/**
 * A TypewriterEvent represents an event happened in the Typewriter.
 * For example changing of the text or finishing the animation.
 *
 * @since 1.2.0
 */
export type TypewriterEvent =
  | TypewriterInitializedEvent
  | TypewriterChangedEvent
  | TypewriterPlayingEvent
  | TypewriterPausedEvent
  | TypewriterStoppedEvent
  | TypewriterFinishedEvent
  | TypewriterBlinkingEvent
  | TypewriterRepeatingEvent;
