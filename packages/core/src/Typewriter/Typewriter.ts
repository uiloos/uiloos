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
  TypewriterAction,
  typewriterActionTypeBackspace,
  typewriterActionTypeClearAll,
  typewriterActionTypeLeft,
  typewriterActionTypeRight,
  typewriterActionTypeSelectLeft,
  typewriterActionTypeSelectRight,
  TypewriterChangedEvent,
  TypewriterConfig,
  TypewriterCursorConfig,
  TypewriterEvent,
  TypewriterFinishedEvent,
  TypewriterInitializedEvent,
  TypewriterPausedEvent,
  TypewriterPlayingEvent,
  TypewriterRepeatingEvent,
  TypewriterStoppedEvent,
  TypewriterSubscriber,
} from './types';
import { TypewriterCursor } from './TypewriterCursor';
import { TypewriterBlinkAfterError } from './errors/TypewriterBlinkAfterError';
import { TypewriterDelayError } from './errors/TypewriterDelayError';
import { TypewriterRepeatError } from './errors/TypewriterRepeatError';
import { TypewriterRepeatDelayError } from './errors/TypewriterRepeatDelayError';
import { TypewriterCursorOutOfBoundsError } from './errors/TypewriterCursorOutOfBoundsError';
import { TypewriterCursorNotAtSelectionEdgeError } from './errors/TypewriterCursorNotPlacedAtBoundsOfSelectionError';
import { TypewriterCursorSelectionInvalidRangeError } from './errors/TypewriterCursorSelectionInvalidRangeError';
import { TypewriterCursorSelectionOutOfBoundsError } from './errors/TypewriterCursorSelectionOutOfBoundsError';

// TODO: builders: ascii, marble, fluentapi

// TODO: Cursor selection

// TODO: Check if we can reduce code, check the _.tick especially.

// TODO: Test for multiple cursors.

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
   * @since 1.2.0
   */
  public readonly cursors: TypewriterCursor[] = [];

  // Keeps track of the original text provided by the config, needed
  // for stop() / play() based restart and repeat.
  private readonly _originalCursors: TypewriterCursorConfig[] = [];

  /**
   * The actions the `Typewriter` is going to make, per cursor.
   *
   * A representation of the entire animation.
   *
   * An array of arrays each subarray represents the animation that
   * the TypewriterCursor at the index of the subarray is going to
   * make.
   *
   * @since 1.2.0
   */
  public readonly actionsPerCursor: TypewriterAction[][] = [];

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

  // The amount of repeats the Typewriter currently did.
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

  // Reference to the current action
  private _index = 0;

  // The amount of ticks in the animation.
  private _noTicks = 0;

  // The cursor which will deliver the final tick in this animation.
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

    this.actionsPerCursor.length = 0;
    this.cursors.length = 0;

    // Get unicode text length.
    const textLength = Array.from(this.text).length;

    if (config.cursors) {
      config.cursors.forEach((c) => {
        this.actionsPerCursor.push([]);

        this.cursors.push(
          new TypewriterCursor(
            this,
            c.position,
            c.name ? c.name : '',
            c.selection
          )
        );
      });
    } else {
      this.actionsPerCursor.push([]);
      this.cursors.push(new TypewriterCursor(this, textLength, '', undefined));
    }

    if (config.actions) {
      for (let i = 0; i < config.actions.length; i++) {
        const action = config.actions[i];

        if (action.delay <= 0) {
          throw new TypewriterDelayError();
        }

        this.actionsPerCursor[action.cursor].push(action);
      }
    }

    this.actionsPerCursor.forEach((actions, cursor) => {
      if (actions.length > this._noTicks) {
        this._noTicks = actions.length;
        this._finalCursor = cursor;
      }
    });

    // The number of ticks is the cursor with the most strokes.
    this._noTicks = this.actionsPerCursor.reduce((acc, actions) => {
      return Math.max(acc, actions.length);
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

    // TODO should the checking not happen when the cursor is initialized?

    // Check cursors, and store copy.
    for (let i = 0; i < this.cursors.length; i++) {
      const cursor = this.cursors[i];

      // Store original cursors
      this._originalCursors.push({
        position: cursor.position,
        name: cursor.name,
        selection: cursor.selection
          ? {
              start: cursor.selection.start,
              end: cursor.selection.end,
            }
          : undefined,
      });

      const position = cursor.position;

      // Consider the text `test` the cursor can be at
      // before t 0, after t 1, after e 2, after s 3 and after t 4
      if (position < 0 || position > textLength) {
        throw new TypewriterCursorOutOfBoundsError();
      }

      if (cursor.selection) {
        const { start, end } = cursor.selection;

        // Either the start or the end should be on the position of the cursor
        if (position !== start && position !== end) {
          throw new TypewriterCursorNotAtSelectionEdgeError();
        }

        // Start should be in bounds
        if (start < 0 || start > textLength) {
          throw new TypewriterCursorSelectionOutOfBoundsError('start');
        }

        // End should be in bounds
        if (end < 0 || end > textLength) {
          throw new TypewriterCursorSelectionOutOfBoundsError('end');
        }

        // Start needs to be smaller than end otherwise there is no selection.
        if (start >= end) {
          throw new TypewriterCursorSelectionInvalidRangeError();
        }
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
   * and there are `actions` configured.
   *
   * Note: the animation will only start when there are one or more
   * actions are defined.
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

      this._reset();
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
   * action.
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

    const event: TypewriterStoppedEvent = {
      type: 'STOPPED',
      time: new Date(),
    };

    this._inform(event);
  }

  private _tick(): void {
    for (let i = 0; i < this.actionsPerCursor.length; i++) {
      const actions = this.actionsPerCursor[i];
      
      // Get the current action, based on the "current" index.
      const action = actions[this._index];

      // Do nothing if the cursor no longer has any strokes.
      if (action === undefined) {
        console.log(i, "stopping");
        continue;
      }

      // Is this the last stroke within this tick?
      const lastStrokeInTick = i === this.actionsPerCursor.length - 1;

      const cursor = this.cursors[action.cursor];

      // Trigger the blink to start, will get debounced if the cursor
      // does another key press.
      cursor._startBlink();

      // Calculate the time until the letter is typed.
      let delay = action.delay;

      // If paused then calculate remaining time.
      if (this._pauseStarted) {
        delay =
          delay - (this._pauseStarted.getTime() - this._tickStarted.getTime());
      }

      // Set when this tick started to calculate resume after pause() call.
      this._tickStarted = new Date();

      // Now enter the action after the delay.
      this._animationTimeoutId = window.setTimeout(() => {
        // @ts-expect-error ja ja
        console.log(this._index, action.key);

        // Array.from makes sure emoji's are counted as one, instead
        // of their separate unicode parts.
        const textArray = Array.from(this.text);

        // Stop blinking because we are starting to type.
        cursor.isBlinking = false;

        // Whether or not this particular action is a no op.
        let noOp = false;

        if (action.type === 'keyboard') {
          // Figure out what to do with the text next
          if (action.key === typewriterActionTypeClearAll) {
            // If it is already empty it is a noOp.
            if (this.text === '') {
              noOp = true;
            } else {
              this.text = '';

              // Reset all cursors to position 0, and reset the selection.
              this.cursors.forEach((c) => {
                c.position = 0;
                c.selection = undefined;
              });
            }
          } else if (action.key === typewriterActionTypeBackspace) {
            // Stores which positions have been removed, so we can
            // update the cursors later.
            const removed = {
              start: -1,
              end: -1,
              no: -1,
            };

            // When there is a selection, remove the entire selection.
            if (cursor.selection) {
              const start = cursor.selection.start;
              const end = cursor.selection.end;

              const no = end - start;

              textArray.splice(cursor.selection.start, no);
              this.text = textArray.join('');

              removed.start = start;
              removed.end = end;
              removed.no = no;

              cursor.position = cursor.selection.start;
            } else {
              const position = cursor.position;

              // If the index is currently zero, just ignore the back-space
              // it should count as a no op.
              if (position !== 0) {
                textArray.splice(position - 1, 1);
                this.text = textArray.join('');

                removed.start = position - 1;
                removed.end = position;
                removed.no = 1;
              } else {
                noOp = true;
              }
            }

            cursor.selection = undefined;

            if (!noOp) {
              this.cursors.forEach((c) => {
                // Move all cursors that were after the insert to their next positions.
                if (c.position > removed.start) {
                  c.position -= removed.no;
                }

                // TODO: test multi cursors properly start and end can go out of bounds

                // Update the selections of other cursors:
                // If user A selects a text and user B removes letters from the selection
                // the selection shrinks. Can even remove the selection this way!
                if (c.selection && c.selection.start >= removed.start) {
                  c.selection.start -= removed.no;
                  c.selection.end -= removed.no;

                  if (c.selection.start === c.selection.end) {
                    c.selection = undefined;
                  }
                }
              });
            }
          } else if (action.key === typewriterActionTypeLeft) {
            // If cursor is at the start it is a no op if there is no selection.
            if (cursor.position === 0) {
              if (cursor.selection === undefined) {
                noOp = true;
              }
            } else {
              if (cursor.selection) {
                // Move the cursor to the start of the selection
                cursor.position = cursor.selection.start;
              } else {
                // Move the cursor to the left if there is no selection
                cursor.position -= 1;
              }
            }

            // Whatever happens the selection is killed.
            cursor.selection = undefined;
          } else if (action.key === typewriterActionTypeRight) {
            // If cursor is at the end it is a no op if there is no selection.
            if (cursor.position === textArray.length) {
              if (cursor.selection === undefined) {
                noOp = true;
              }
            } else {
              if (cursor.selection) {
                // Move the cursor to the end of the selection
                cursor.position = cursor.selection.end;
              } else {
                // Move the cursor to the right if there is no selection
                cursor.position += 1;
              }
            }

            // Whatever happens the selection is killed.
            cursor.selection = undefined;
          } else if (action.key === typewriterActionTypeSelectLeft) {
            // Is noOp whenever the user is already at the start of the text
            if (cursor.position === 0) {
              noOp = true;
            } else {
              // Otherwise the position of the cursor moves to the left
              cursor.position -= 1;
              if (cursor.selection) {
                // If there is already a selection expand left from the start.
                cursor.selection.start -= 1;
              } else {
                // If no selection create a new one
                cursor.selection = {
                  start: cursor.position,
                  end: cursor.position + 1,
                };
              }
            }
          } else if (action.key === typewriterActionTypeSelectRight) {
            // Is noOp whenever the user is already at the end of the text
            if (cursor.position === textArray.length) {
              noOp = true;
            } else {
              // Otherwise the position of the cursor moves to the right
              cursor.position += 1;
              if (cursor.selection) {
                // If there is already a selection expand right from the end
                cursor.selection.end += 1;
              } else {
                // If no selection create a new one
                cursor.selection = {
                  start: cursor.position - 1,
                  end: cursor.position,
                };
              }
            }
          } else {
            // action is insert char

            if (cursor.selection) {
              // When something is selected it will delete the selected
              // text and insert the new char on that position

              // Stores which positions have been removed, so we can
              // update the cursors later.
              const removed = {
                start: -1,
                end: -1,
                no: -1,
              };

              const start = cursor.selection.start;
              const end = cursor.selection.end;

              const no = end - start;

              textArray.splice(cursor.selection.start, no);

              removed.start = start;
              removed.end = end;
              removed.no = no;

              cursor.position = removed.start;

              // Insert the new key at the correct position.
              textArray.splice(cursor.position, 0, action.key);

              this.text = textArray.join('');

              // Move the cursor that typed one to the right.
              cursor.position += 1;

              this.cursors.forEach((c) => {
                // Update the selections

                 // TODO: test multi cursors properly start and end can go out of bounds

                // If user A selects a text and user B types inside of the selection.
                // Where inside is before last letter of selection but before
                // first letter! Then the selection of user A will automatically grow.
                if (c.selection && c.selection.start >= removed.start) {
                  c.selection.start -= removed.no;
                  c.selection.end -= removed.no;

                  if (c.selection.start === c.selection.end) {
                    c.selection = undefined;
                  }
                }
              });
            } else {
              // Insert the new key at the correct position.
              textArray.splice(cursor.position, 0, action.key);

              this.text = textArray.join('');

              // Move the cursor that typed one to the right.
              cursor.position += 1;

              this.cursors.forEach((c) => {
                // Update the selections
                if (c.selection && c.selection.start >= c.position) {
                  c.selection.end += 1;
                }
              });
            }

            cursor.selection = undefined;
          }
        } else {
          // action.type === 'mouse'

          /* 
            When you click far to the left or right of a line inside
            of a text editor you move the cursor to the closest 
            position. So we allow negative numbers and larger 
            numbers than the text is wide to allow this.
          */
          const position = Math.min(
            textArray.length,
            Math.max(0, action.position)
          );

          if (cursor.position === position) {
            if (cursor.selection === undefined) {
              noOp = true;
            }
          } else {
            cursor.position = position;
          }

          cursor.selection = undefined;
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
          this._finalCursor === action.cursor
        ) {
          // Are we finished?
          if (this.repeat === false || this.repeat === this._repeated + 1) {
            this.isFinished = true;
            this.isPlaying = false;

            const event: TypewriterFinishedEvent = {
              type: 'FINISHED',
              action,
              time: new Date(),
            };

            this._inform(event);
          } else {
            this._repeated += 1;

            if (!noOp) {
              const event: TypewriterChangedEvent = {
                type: 'CHANGED',
                action,
                time: new Date(),
              };

              this._inform(event);
            }

            this._animationTimeoutId = window.setTimeout(() => {
              this._index = 0;

              this._reset();

              // Also make all cursors blink again.
              this.cursors.forEach((c) => (c.isBlinking = true));

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
              action,
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

  private _reset() {
    this.text = this._originalText;

    // Copy the cursor here otherwise it will be mutated on the
    // second repeat.
    this._originalCursors.forEach((copy, index) => {
      const cursor = this.cursors[index] as TypewriterCursor;

      cursor.name = copy.name ? copy.name : '';
      cursor.position = copy.position;

      if (copy.selection) {
        cursor.selection = {
          start: copy.selection.start,
          end: copy.selection.end,
        };
      } else {
        cursor.selection = undefined;
      }
    });
  }

  public _inform(event: TypewriterEvent): void {
    this._history._push(event);

    this._observer._inform(this, event);
  }
}
