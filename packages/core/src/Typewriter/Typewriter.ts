/*
  This import will be removed during the minification build so terser
  leaves it alone. Make sure that it is not committed into git as an 
  uncommented line!

  If you run build and the line below is commented you will get
  this error: `Cannot find name 'uiloosLicenseChecker'`.

  See rollup.minification.config.js for more information
*/
import * as uiloosLicenseChecker from '../license/license';

import { UnsubscribeFunction } from '../generic';
import { _History } from '../private/History';
import { _Observer } from '../private/Observer';
import {
  TypewriterChangedEvent,
  TypewriterConfig,
  TypewriterCursorConfig,
  TypewriterEvent,
  TypewriterFinishedEvent,
  TypewriterInitializedEvent,
  TypewriterKeystroke,
  typewriterKeyStrokeBackspace,
  typewriterKeyStrokeClearAll,
  typewriterKeyStrokeLeft,
  typewriterKeyStrokeRight,
  TypewriterPausedEvent,
  TypewriterPlayingEvent,
  TypewriterRepeatingEvent,
  TypewriterStoppedEvent,
  TypewriterSubscriber,
} from './types';
import { TypewriterBlinkAfterError } from './errors/TypewriterBlinkAfterError';
import { TypewriterDelayError } from './errors/TypewriterDelayError';
import { TypewriterRepeatError } from './errors/TypewriterRepeatError';
import { TypewriterRepeatDelayError } from './errors/TypewriterRepeatDelayError';
import { TypewriterInvalidCursorError } from './errors/TypewriterInvalidCursorError';
import { TypewriterCursor } from './TypewriterCursor';

// TODO: builders: ascii, marble, fluentapi

// TODO: Cursor movement

// TODO: multi blinking cursors,

// TODO: Cursor selection

/**
 * A component to create versatile typewriter animations with.
 *
 * A typewriter animation is an type of text based animation in which
 * a piece of text is typed one letter at a time at a certain
 * interval.
 *
 * TODO bit about fluent api and from array builder.
 *
 * @since 1.2.0
 */
export class Typewriter {
  /**
   * The cursors the `Typewriter` has.
   *
   * The `cursors` is an array, each index in the array represents
   * a cursor, and the value at that index the position of that
   * cursor
   *
   * For example when `cursors` is set to `[4, 10, 1]`. It means
   * that there are 3 cursors, with the following positions:
   *
   *    1. Cursor with index 0 is at position 4 in the `text`.
   *    2. Cursor with index 1 is at position 10 in the `text`.
   *    3. Cursor with index 2 is at position 1 in the `text`.
   *
   * Defaults to one cursor at the end of the provided `text`.
   */
  public readonly cursors: TypewriterCursor[] = [];

  // Keeps track of the original text provided by the config, needed
  // for stop() / play() based restart and repeat.
  private readonly _originalCursors: TypewriterCursorConfig[] = [];

  /**
   * The keystrokes the `Typewriter` is going to make, per cursor.
   *
   * A representation of the entire animation.
   *
   * An array of arrays each subarray represents the animation that
   * the TypewriterCursor at the index of the subarray is going to
   * make.
   *
   * @since 1.2.0
   */
  public readonly keystrokesPerCursor: TypewriterKeystroke[][] = [];

  /**
   * The current text the `Typewriter` has typed.
   *
   * @since 1.2.0
   */
  public text: string = '';

  // Keeps track of the original text provided by the config, needed
  // for stop() / play() based restart and repeat.
  private _originalText = '';

  /**
   * Configures how long the delay is until the cursor starts
   * blinking.
   *
   * A cursor does not blink when the user is typing, only when the
   * user has stopped typing then after a little while the cursor
   * will start blinking.
   *
   * @since 1.2.0
   */
  public blinkAfter: number = 50;

  /**
   * Whether or not the `TypeWriter` is currently playing.
   *
   * @since 1.2.0
   */
  public isPlaying: boolean = false;

  private _stopped: boolean = false;

  /**
   * Whether or not the `TypeWriter` has finished playing
   * the entire animation.
   *
   * Note: when `repeat` is configured as `true` the animation will
   * never finish.
   *
   * @since 1.2.0
   */
  public isFinished: boolean = false;

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
   * @since 1.2.0
   */
  public repeat: boolean | number = false;

  /**
   * The time in milliseconds the animation is paused in between repeats.
   *
   *  @since 1.2.0
   */
  public repeatDelay: number = 0;

  private _repeated = 0;

  /**
   * Whether or not the Typewriter has been stopped at one
   * point before.
   *
   * Use case: say you are making an animation which has a stop button
   * to stop the animation. Say you also have another feature: a pause
   * whenever the user hovers over the typewriter animation. These two
   * features would cause a conflict:
   *
   * Whenever the mouse over happens you call `play()`, which negates
   * the `stop()`, causing the typewriter to play again.
   *
   * To fix this problem you should on the mouse over not call
   * `play()` whenever `hasBeenStoppedBefore` is `true`.
   *
   * @since 1.2.0
   */
  public hasBeenStoppedBefore: boolean = false;

  // Reference to the current keystroke
  private _index = 0;

  // The amount of ticks in the animation.
  private _noTicks = 0;

  // The cursor which will deliver the final click in this animation.
  private _finalCursor = 0;

  /*
    The timeoutId given back by calling window.setTimeout for when 
    animation is playing. Is kept here so it can be cleared via
    window.clearTimeout.
  */
  private _animationTimeoutId: number | null = null;

  /*
    The date on which the tick() started, used to calculate
    what the duration should be after a pause is resumed.
  */
  private _tickStarted: Date = new Date();

  /*
    The date on which the pause started, used to calculate
    what the duration should be after a pause is resumed.
  */
  private _pauseStarted: Date | null = null;

  private _history: _History<TypewriterEvent> = new _History();

  /**
   * Contains the history of the changes in the views array.
   *
   * Tracks X types of changes: TODO CHANGES
   *
   *
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
   * @since 1.2.0
   */
  public history: TypewriterEvent[] = this._history._events;

  private _observer: _Observer<Typewriter, TypewriterEvent> = new _Observer();

  /**
   * Creates an Typewriter based on the TypewriterConfig config.
   *
   * You can also optionally provide an subscriber so you can get
   * informed of the changes happening to the Typewriter.
   *
   * Will start running the animation automatically.
   *
   * @param {TypewriterConfig} config The initial configuration of the Typewriter.
   * @param {TypewriterSubscriber | undefined} subscriber An optional subscriber which responds to changes in the Typewriter.
   *
   * @since 1.2.0
   */
  constructor(
    config: TypewriterConfig = {},
    subscriber?: TypewriterSubscriber
  ) {
    uiloosLicenseChecker.licenseChecker._checkLicense();

    if (subscriber) {
      this.subscribe(subscriber);
    }

    this.initialize(config);
  }

  /**
   * Initializes the Typewriter based on the config provided.
   * This can effectively reset the Typewriter when called,
   * including the history.
   *
   * Will start running the animation automatically.
   *
   * @param {TypewriterConfig} config The new configuration which will override the old one
   * @throws {TypeWriterBlinkAfterError} blinkAfter duration must be a positive number
   * @throws {TypewriterDelayError} delay duration must be a positive number
   * @since 1.2.0
   */
  public initialize(config: TypewriterConfig): void {
    // Configure history
    this._history._events.length = 0;
    this._history._setKeepHistoryFor(config.keepHistoryFor);

    this.text = config.text !== undefined ? config.text : '';
    this._originalText = this.text;

    this.keystrokesPerCursor.length = 0;
    this.cursors.length = 0;

    // Get unicode text length.
    const textLength = Array.from(this.text).length;

    if (config.cursors) {
      config.cursors.forEach((c) => {
        this.keystrokesPerCursor.push([]);

        this.cursors.push(
          new TypewriterCursor(this, c.position, c.name ? c.name : '')
        );
      });
    } else {
      this.keystrokesPerCursor.push([]);
      this.cursors.push(new TypewriterCursor(this, textLength, ''));
    }

    if (config.keystrokes) {
      for (let i = 0; i < config.keystrokes.length; i++) {
        const keystroke = config.keystrokes[i];

        if (keystroke.delay <= 0) {
          throw new TypewriterDelayError();
        }

        this.keystrokesPerCursor[keystroke.cursor].push(keystroke);
      }
    }

    this.keystrokesPerCursor.forEach((keystrokes, cursor) => {
      if (keystrokes.length > this._noTicks) {
        this._noTicks = keystrokes.length;
        this._finalCursor = cursor;
      }
    });

    // The number of ticks is the cursor with the most strokes.
    this._noTicks = this.keystrokesPerCursor.reduce((acc, keystrokes) => {
      return Math.max(acc, keystrokes.length);
    }, 0);

    this._index = 0;

    this.isPlaying = this._noTicks > 0;
    this.isFinished = !this.isPlaying;

    this.blinkAfter = config.blinkAfter !== undefined ? config.blinkAfter : 50;

    if (this.blinkAfter <= 0) {
      throw new TypewriterBlinkAfterError();
    }

    this._repeated = 0;
    this.repeat = config.repeat !== undefined ? config.repeat : false;

    if (typeof this.repeat === 'number' && this.repeat <= 0) {
      throw new TypewriterRepeatError();
    }

    this.repeatDelay =
      config.repeatDelay !== undefined ? config.repeatDelay : 0;

    if (this.repeatDelay < 0) {
      throw new TypewriterRepeatDelayError();
    }

    this._originalCursors.length = 0;

    // Check cursors, and store copy.
    for (let i = 0; i < this.cursors.length; i++) {
      const cursor = this.cursors[i];

      // Store original cursors
      this._originalCursors.push({
        position: cursor.position,
        name: cursor.name,
      });

      const position = cursor.position;

      // Consider the text `test` the cursor can be at
      // before t 0, after t 1, after e 2, after s 3 and after t 4
      if (position < 0 || position > textLength) {
        throw new TypewriterInvalidCursorError();
      }
    }

    this.hasBeenStoppedBefore = false;

    this._clearAnimation();

    this.cursors.forEach((c) => c._clearBlink());

    this._pauseStarted = null;

    if (this.isPlaying) {
      // Call tick instead of play to prevent the PLAYING event.
      this._tick();
    }

    const event: TypewriterInitializedEvent = {
      type: 'INITIALIZED',
      time: new Date(),
    };

    this._inform(event);
  }

  /**
   * Subscribe to changes of the Typewriter. The function you
   * provide will get called whenever changes occur in the
   * Typewriter.
   *
   * Returns an unsubscribe function which when called will unsubscribe
   * from the Typewriter.
   *
   * @param {TypewriterSubscriber} subscriber The subscriber which responds to changes in the Typewriter.
   * @returns {UnsubscribeFunction} A function which when called will unsubscribe from the Typewriter.
   *
   * @since 1.2.0
   */
  public subscribe(subscriber: TypewriterSubscriber): UnsubscribeFunction {
    return this._observer._subscribe(subscriber);
  }

  /**
   * Unsubscribe the subscriber so it no longer receives changes / updates
   * of the state changes of the Typewriter.
   *
   * @param {TypewriterSubscriber} subscriber The subscriber which you want to unsubscribe.
   *
   * @since 1.2.0
   */
  public unsubscribe(subscriber: TypewriterSubscriber): void {
    this._observer._unsubscribe(subscriber);
  }

  /**
   * When the Typewriter is paused or stopped it will start the
   * animation.
   *
   * When there are is no more animations the TypeWriter will stop
   * automatically.
   *
   * Is called automatically when the Typewriter is instantiated
   * and there are `keystrokes` configured.
   *
   * Note: the animation will only start when there are one or more
   * keystrokes are defined.
   *
   * @since 1.2.0
   */
  public play(): void {
    // Do nothing when already playing
    if (this.isPlaying) {
      return;
    }

    this.isPlaying = true;

    if (this._stopped) {
      this._stopped = false;

      this.reset();
    }

    this._tick();

    const event: TypewriterPlayingEvent = {
      type: 'PLAYING',
      time: new Date(),
    };

    this._inform(event);
  }

  /**
   * When the Typewriter is playing it will pause the animation, as
   * if the person using the typewriter stops typing, this means that
   * the cursor will start blinking again.
   *
   * Calling `play()` again will continue the animation.
   *
   * For example: when the `pause` of the current `TypewriterKeystroke`
   * is 1 second and the `pause` is called after 0.8 seconds, it will
   * after `play` is called, take 0.2 seconds to go to the next
   * keystroke.
   *
   * @since 1.2.0
   */
  public pause(): void {
    // Do nothing when not playing
    if (!this.isPlaying) {
      return;
    }

    this._clearAnimation();

    this.isPlaying = false;

    // Store the time when the pause was pressed, so we can calculate
    // the resuming duration later.
    this._pauseStarted = new Date();

    this.cursors.forEach((c) => c._startBlink());

    const event: TypewriterPausedEvent = {
      type: 'PAUSED',
      time: new Date(),
    };

    this._inform(event);
  }

  /**
   * When the Typewriter is playing it will stop the animation.
   *
   * Calling `play()` again will restart the animation.
   *
   * Note: this will keep the text of the Typewriter as is, util
   * `play()` is called again then the text will reset.
   *
   * Note: calling stop will also reset the number of repeats if
   * `repeat` was set to a number.
   *
   * @since 1.2.0
   */
  public stop(): void {
    // Allow for pause then stop, but not stop then stop.
    if (!this.isPlaying && !this._pauseStarted) {
      return;
    }

    this._clearAnimation();

    this.isFinished = false;
    this.isPlaying = false;
    this.hasBeenStoppedBefore = true;
    this._index = 0;
    this._pauseStarted = null;
    this._stopped = true;
    this._repeated = 0;

    this.cursors.forEach((c) => (c.isBlinking = true));
    // this.cursors.forEach((c) => c._startBlink());

    const event: TypewriterStoppedEvent = {
      type: 'STOPPED',
      time: new Date(),
    };

    this._inform(event);
  }

  private _tick(): void {
    for (let i = 0; i < this.keystrokesPerCursor.length; i++) {
      const keystrokes = this.keystrokesPerCursor[i];

      // Get the current keystroke.
      const keystroke = keystrokes[this._index];

      // Do nothing if the cursor no longer has any strokes.
      if (keystroke === undefined) {
        break;
      }

      // Is this the last stroke within this tick?
      const lastStrokeInTick = i === this.keystrokesPerCursor.length - 1;

      const cursor = this.cursors[keystroke.cursor];

      // Trigger the blink to start, will get debounced if the cursor
      // does another key press.
      cursor._startBlink();

      // Calculate the time until the letter is typed.
      let delay = keystroke.delay;

      // If paused then calculate remaining time.
      if (this._pauseStarted) {
        delay =
          delay - (this._pauseStarted.getTime() - this._tickStarted.getTime());
      }

      // Set when this tick started to calculate resume after pause() call.
      this._tickStarted = new Date();

      // Now enter the keystroke after the delay.
      this._animationTimeoutId = window.setTimeout(() => {
        // Array.from makes sure emoji's are counted as one, instead
        // of their separate unicode parts.
        const textArray = Array.from(this.text);

        // Stop blinking because we are starting to type.
        cursor.isBlinking = false;

        // Whether or not this particular keystroke is a no op.
        let noOp = false;

        // Figure out what to do with the text next
        if (keystroke.key === typewriterKeyStrokeClearAll) {
          // If it is already empty it is a noOp.
          if (this.text === '') {
            noOp = true;
          } else {
            this.text = '';

            // Reset all cursors to position 0.
            this.cursors.forEach((cursor) => {
              cursor.position = 0;
            });
          }
        } else if (keystroke.key === typewriterKeyStrokeBackspace) {
          const position = cursor.position;

          // If the index is currently zero, just ignore the back-space
          // it should count as a no op.
          if (position !== 0) {
            textArray.splice(position - 1, 1);

            this.text = textArray.join('');

            // Move the cursor that typed one to the left, move all
            // cursors that are now past the end of the text to
            // the end of the text.
            this.cursors.forEach((cursor, index) => {
              if (index === keystroke.cursor) {
                // Current one to the left
                cursor.position -= 1;
              } else if (cursor.position > textArray.length) {
                // Reset bounds if out of bounds.
                cursor.position = textArray.length;
              }
            });
          } else {
            noOp = true;
          }
        } else if (keystroke.key === typewriterKeyStrokeLeft) {
          if (cursor.position === 0) {
            noOp = true;
          } else {
            cursor.position -= 1;
          }
        } else if (keystroke.key === typewriterKeyStrokeRight) {
          if (cursor.position === textArray.length) {
            noOp = true;
          } else {
            cursor.position += 1;
          }

        } else {
          // Insert the new key at the correct position.
          textArray.splice(cursor.position, 0, keystroke.key);

          this.text = textArray.join('');

          // Move the cursor that typed one to the right.
          cursor.position += 1;
        }

        // Increase the index inside of the timeout so the when the
        // animation is paused the index is still the same as
        // before, so the _pauseStarted delay calculation still
        // works.
        if (lastStrokeInTick) {
          this._index += 1;
        }

        if (
          this._index >= this._noTicks &&
          this._finalCursor === keystroke.cursor
        ) {
          // Are we finished?
          if (this.repeat === false || this.repeat === this._repeated + 1) {
            this.isFinished = true;
            this.isPlaying = false;

            const event: TypewriterFinishedEvent = {
              type: 'FINISHED',
              keystroke,
              time: new Date(),
            };

            this._inform(event);
          } else {
            this._repeated += 1;

            if (!noOp) {
              const event: TypewriterChangedEvent = {
                type: 'CHANGED',
                keystroke,
                time: new Date(),
              };

              this._inform(event);
            }

            this._animationTimeoutId = window.setTimeout(() => {
              this._index = 0;

              // TODO: restore extract
              this.reset();

              const event: TypewriterRepeatingEvent = {
                type: 'REPEATING',
                time: new Date(),
              };

              this._inform(event);

              this._tick();
            }, this.repeatDelay);
          }
        } else {
          if (!noOp) {
            const event: TypewriterChangedEvent = {
              type: 'CHANGED',
              keystroke,
              time: new Date(),
            };

            this._inform(event);
          }

          this._tick();
        }
      }, delay);
    }
  }

  private _clearAnimation(): void {
    if (this._animationTimeoutId) {
      window.clearTimeout(this._animationTimeoutId);

      // This is just a very minor performance boost. One other reason
      // to do this is that when debugging this code, it is slightly
      // easier to follow due to the `_animationTimeoutId` getting
      // cleaned up, otherwise it looks like the timeout is still in
      // progress.
      this._animationTimeoutId = null;
      return;
    }
  }

  private reset() {
    this.text = this._originalText;

    // Copy the cursor here otherwise it will be mutated on the
    // second repeat.
    this._originalCursors.forEach((copy, index) => {
      const cursor = this.cursors[index] as TypewriterCursor;

      cursor.name = copy.name ? copy.name : '';
      cursor.position = copy.position;
    });
  }

  public _inform(event: TypewriterEvent): void {
    this._history._push(event);

    this._observer._inform(this, event);
  }
}
