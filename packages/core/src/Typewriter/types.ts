import { Typewriter } from './Typewriter';

/**
 * Represents a backspace key for when text needs to be removed
 * from the `Typewriter`.
 *
 * @since 1.2.0
 */
export const typewriterKeyStrokeBackspace = Symbol();

/**
 * Represents the user clearing all text from the `Typewriter` sort
 * of a: select all and hit backspace scenario.
 *
 * @since 1.2.0
 */
export const typewriterKeyStrokeClearAll = Symbol();

/**
 * Represents the key / character being pressed. Can be any string,
 * or special keys such as the backspace key.
 *
 * @since 1.2.0
 */
export type TypewriterKey =
  | string
  | typeof typewriterKeyStrokeBackspace
  | typeof typewriterKeyStrokeClearAll;

/**
 * Represents the typing in of a key including the delay before
 * typing in the key.
 *
 * @since 1.2.0
 */
export type TypewriterKeystroke = {
  /**
   * The time in milliseconds to wait until the keystroke should
   * be made.
   *
   * @since 1.2.0
   */
  delay: number;

  /**
   * The key which will be typed when this keystroke is made.
   *
   * @since 1.2.0
   */
  key: TypewriterKey;
};
/**
 * Configures the initial state of the `Typewriter`.
 *
 * @since 1.2.0
 */
export type TypewriterConfig = {
  /**
   * The keystrokes this `Typewriter` is set to enter. Each stroke
   * represents a letter to be added to the `text.
   *
   * Defaults to an empty array, meaning no keystrokes will be made.
   *
   * @since 1.2.0
   */
  keystrokes?: TypewriterKeystroke[];

  /**
   * The initial text the `Typewriter` starts with.
   *
   * Defaults to `` meaning that the typewriter will not have any
   * initial text.
   *
   * @since 1.2.0
   */
  text?: string;

  /**
   * The time it takes until the cursor starts blinking.
   *
   * Defaults to after `50` milliseconds.
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
   * Whether or not this animation repeats and how often. 
   * 
   * There are three ways to define `repeat`.
   * 
   *  1. When `repeat` is `false` it will never repeat the animation,
   *     the animation will run once.
   * 
   *  2. When `repeat` is `true` it will loop the animation forever.
   * 
   *  3. When `repeat` is a number it will repeat the animation 
   *     for the number of times. If 0 or a negative number is 
   *     provided a error occurs.
   * 
   * Defaults to `false` meaning that the animation will run once.
   *
   * @since 1.2.0
   */
  repeat?: boolean | number;

  /**
   * The time in milliseconds the animation is paused in between repeats. 
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
 * Represents an event which happened in the Typewriter. Based
 * on the `type` you can determine which event occurred.
 *
 * @since 1.2.0
 */
export type TypewriterBaseEvent = {
  /**
   * Which event occurred
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
 * Represents a change in the text of the typewriter.
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
   * The keystroke that happened which triggered this
   * `TypewriterChangedEvent`.
   *
   * @since 1.2.0
   */
  keystroke: TypewriterKeystroke;
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
   * The keystroke that happened which triggered this
   * `TypewriterFinishedEvent`.
   *
   * @since 1.2.0
   */
  keystroke: TypewriterKeystroke;
};

/**
 * Represents that the Typewriters cursor should now be blinking.
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
};

/**
 * A TypewriterEvent represents an event happened in the Typewriter.
 * For example the presented and dismissal of the TypewriterView.
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
