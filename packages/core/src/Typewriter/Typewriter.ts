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
  TypewriterPosition,
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

// TODO: build

// TODO: create docs

// TODO: word mode

// TODO: check since 1.2.0

// CURRENT: create composer, where the user can compose animations by typing an clicking.
// Perhaps this should even be the primary way of doing things.

/**
 * A component to create versatile typewriter animations with.
 *
 * A typewriter animation is an type of text based animation in which
 * a piece of text is typed one letter at a time at a certain interval.
 *
 * Has support for: multiple cursors, cursor selection, mouse movement,
 * and keyboard movement.
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
   * The actions which the `Typewriter` is going to perform.
   *
   * Basically the representation of the entire animation.
   *
   * The actions happen in a linear fashion, meaning the first item
   * in the array is chronologically the first action, and the last
   * item in the array the last action.
   *
   * @since 1.2.0
   */
  public readonly actions: TypewriterAction[] = [];

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
  public blinkAfter: number = 250;

  /**
   * Whether or not the `Typewriter` is currently playing.
   *
   * @since 1.2.0
   */
  public isPlaying: boolean = false;

  private _stopped: boolean = false;

  /**
   * Whether or not the `Typewriter` has finished playing
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
   * Tracks X types of changes:
   *
   * 1. INITIALIZED: fired when Typewriter is initialized
   *
   * 2. CHANGED: fired when a change in the text of the typewriter occurred,
   *    when a cursor moves, or a when aa cursors selection changes.
   *
   * 3. PLAYING: fired when play is called.
   *
   * 4. PAUSED: fired when pause is called.
   *
   * 5. STOPPED: fire when stop is called.
   *
   * 6. FINISHED: fired when the animation was finished. When the
   *    Typewriter is configured to repeat indefinitely the FINISHED
   *    event will never fire.
   *
   * 7. BLINKING: fired when one of the cursors started blinking.
   *
   * 8. REPEATING: fired when the animation starts repeating.
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
   * @throws {TypewriterBlinkAfterError} blinkAfter duration must be a positive number
   * @throws {TypewriterDelayError} delay duration must be a positive number
   * @throws {TypewriterRepeatError} repeat must be a positive number
   * @throws {TypewriterRepeatDelayError} repeatDelay must be a positive number or zero
   * @throws {TypewriterRepeatDelayError} repeatDelay must be a positive number or zero
   * @throws {TypewriterCursorOutOfBoundsError} cursor must be in bounds of text
   * @throws {TypewriterCursorNotAtSelectionEdgeError} when cursor has a selection the cursor must be on edges of the selection
   * @throws {TypewriterCursorSelectionOutOfBoundsError} the start and end of the selection must be in bounds of the text
   * @throws {TypewriterCursorSelectionInvalidRangeError} the start of a selection must on or after the end of a selection
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
   * @throws {TypewriterBlinkAfterError} blinkAfter duration must be a positive number
   * @throws {TypewriterDelayError} delay duration must be a positive number
   * @throws {TypewriterRepeatError} repeat must be a positive number
   * @throws {TypewriterRepeatDelayError} repeatDelay must be a positive number or zero
   * @throws {TypewriterRepeatDelayError} repeatDelay must be a positive number or zero
   * @throws {TypewriterCursorOutOfBoundsError} cursor must be in bounds of text
   * @throws {TypewriterCursorNotAtSelectionEdgeError} when cursor has a selection the cursor must be on edges of the selection
   * @throws {TypewriterCursorSelectionOutOfBoundsError} the start and end of the selection must be in bounds of the text
   * @throws {TypewriterCursorSelectionInvalidRangeError} the start of a selection must on or after the end of a selection
   * @since 1.2.0
   */
  public initialize(config: TypewriterConfig): void {
    // Clear the timers of the current active animation first, for when
    // the initialize is called mid animation, otherwise it will start
    // blinking cursors and doing animations.
    this._clearAnimation();

    // The`this.cursors` will get wiped, but we need to clear the
    // timers of the previous cursors, that may still be active.
    this.cursors.forEach((c) => {
      c._clearBlink();
    });

    // Clear actions and cursors.
    this.actions.length = 0;
    this.cursors.length = 0;

    // Configure history
    this._history._events.length = 0;
    this._history._setKeepHistoryFor(config.keepHistoryFor);

    this.text = config.text !== undefined ? config.text : '';
    this._originalText = this.text;

    // Get unicode text length.
    const textLength = Array.from(this.text).length;

    if (config.cursors) {
      config.cursors.forEach((c) => {
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
      this.cursors.push(new TypewriterCursor(this, textLength, '', undefined));
    }

    if (config.actions) {
      for (let i = 0; i < config.actions.length; i++) {
        const action = config.actions[i];

        if (action.delay <= 0) {
          throw new TypewriterDelayError();
        }

        // TODO: Check if cursor exists before applying action create new error

        this.actions.push(action);
      }
    }

    this._index = 0;

    // TODO: test autoplay disabled
    this.isPlaying = !!!config.autoPlay && this.actions.length > 0;
    this.isFinished = !this.isPlaying;

    this.blinkAfter = config.blinkAfter !== undefined ? config.blinkAfter : 250;

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
   * animation from that point. If the animation was finished
   * calling `play()` will restart the animation.
   *
   * When there are is no more animations the Typewriter will stop
   * automatically.
   *
   * Is called automatically when the Typewriter is instantiated
   * and there are `actions` configured and `autoPlay` is `true`.
   *
   * Note: the animation will only start when there are one or more
   * actions are defined.
   *
   * @since 1.2.0
   */
  public play(): void {
    // If the typewriter is finished restart the animation.
    if (this.isFinished) {
      this._init();
      // This includes hasBeenStoppedBefore.
      this.hasBeenStoppedBefore = false;
      this._resetTandC();
    } else if (this.isPlaying) {
      // Do nothing when already playing
      return;
    } else if (this._stopped) {
      this._stopped = false;

      this._resetTandC();
    }

    this.isPlaying = true;

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
    if (this.isFinished || (!this.isPlaying && !this._pauseStarted)) {
      return;
    }

    this._clearAnimation();

    this.isPlaying = false;
    this.hasBeenStoppedBefore = true;
    this._stopped = true;

    this._init();

    const event: TypewriterStoppedEvent = {
      type: 'STOPPED',
      time: new Date(),
    };

    this._inform(event);
  }

  private _init() {
    this.isFinished = false;
    this._index = 0;
    this._pauseStarted = null;
    this._repeated = 0;

    this.cursors.forEach((c) => (c.isBlinking = true));
  }

  private _tick(): void {
    // Get the current action, based on the "current" index.
    const action = this.actions[this._index];

    const cursor = this.cursors[action.cursor];

    // Calculate the time until the letter is typed.
    let delay = action.delay;

    // If paused then calculate remaining time.
    if (this._pauseStarted) {
      delay -= this._pauseStarted.getTime() - this._tickStarted.getTime();
    }

    // Set when this tick started to calculate resume after pause() call.
    this._tickStarted = new Date();

    // Now enter the action after the delay.
    this._animationTimeoutId = window.setTimeout(() => {
      // Array.from makes sure emoji's are counted as one, instead
      // of their separate unicode parts.
      const textArray = Array.from(this.text);

      // Stop blinking because we are starting to type.
      cursor.isBlinking = false;

      // Trigger the blink to start, after the `blinkAfter` timeout
      // will get debounced if the cursor does another key press.
      cursor._startBlink();

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
        } else if (action.key === typewriterActionTypeLeft) {
          noOp = this._actionLorR(cursor, -1, cursor.selection?.start || 0, 0);
        } else if (action.key === typewriterActionTypeRight) {
          noOp = this._actionLorR(
            cursor,
            1,
            cursor.selection?.end || 0,
            textArray.length
          );
        } else if (action.key === typewriterActionTypeSelectLeft) {
          noOp = this._actionSLorR(cursor, -1, 'start', 0);
        } else if (action.key === typewriterActionTypeSelectRight) {
          noOp = this._actionSLorR(cursor, 1, 'end', textArray.length);
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
              const hasOverlap = this._hasOverlap(c, removed);

              // Move all cursors that are after or on the current cursor
              // to their new positions.
              if (c.position > removed.start) {
                // If the cursor removes the selection of the other
                // cursor the position of that cursor becomes
                // the removed.start. But only if the position of
                // the cursor lies before the remove.end.
                if (
                  c.selection &&
                  hasOverlap &&
                  removed.start < c.selection.start &&
                  c.position < removed.end
                ) {
                  c.position = removed.start;
                } else {
                  c.position -= removed.no;
                }
              }

              // Update the selections of other cursors:
              // If user A selects a text and user B removes letters from the selection
              // the selection shrinks. Can even remove the selection this way!
              if (c.selection) {
                /*
                  We are dealing with two sets here, the "removed"
                  of the current cursor, and the "selection" of the other 
                  cursor.
                  
                  Legend: [] is current selection () = other selection

                  The variants then become:

                  1. The entire selection of the other cursor lies 
                     after the selection of the current cursor.

                     a[ap] noot (mies)

                     The other selection must move cursor selection
                     to the left.

                  2. The entire selection of the other cursor lies 
                     before the selection of the current cursor.

                     a(ap) noot [mies]

                     Nothing happens to the other selection.

                  3. The entire selection of the other cursor lies 
                     inside of the current cursor selection.

                     aap [n(oo)t] mies

                     The other selection gets deleted.

                  4. Part of the selection of the other cursor lies 
                     inside of the current cursor selection.

                     aap (n[oo]t) mies

                     The remaining selection becomes (nt).

                     ACTION: remove overlap

                  5. Part of the selection of the other cursor lies 
                     inside of the current cursor selection. But starts
                     left of the other selection.

                     aa[p (n]oot) mies

                     The remaining selection becomes (oot).

                     ACTION: remove overlap

                  6. Part of the selection of the other cursor lies 
                     inside of the current cursor selection. But starts
                     inside of the other selection.

                     aap (noo[t) m]ies

                     The remaining selection becomes (noo).

                     ACTION: remove overlap
                */

                // Is there overlap?
                if (hasOverlap) {
                  // How many positions do selection and remove have in common.
                  const overlap = this._overlap(c.selection, removed);

                  /*
                    Now there are two situations: either the 
                    selection.start lies before or on the removed.start, 
                    or it lies after the remove.start.

                    When it lies before or on the removed start, 
                    the selection.start does not need to change.

                    Scenario A: when it lies after: 
                    
                    AAP N[O(O]T MI)ES
                        
                    Removed:           { start: 5, end: 7 }
                    Initial selection: { start: 6, end: 11 }
                    Desired selection: { start: 5, end: 9 }

                    start = 6 - 1 = 5
                    end = 11 - 2 = 9

                    1 = overlap
                    2 = removed.no;

                    Scenario B: when it before or on: 

                    AAP N[(OO]T M)IES
                        
                    Removed:           { start: 5, end: 7 }
                    Initial selection: { start: 5, end: 10 }
                    Desired selection: { start: 5, end: 8 }

                    start = 5
                    end = 11 - 2 = 9

                    0 = do nothing
                    2 = overlap;
                  */
                  if (c.selection.start <= removed.start) {
                    c.selection.end -= overlap;
                  } else {
                    c.selection.start -= overlap;
                    c.selection.end -= removed.no;
                  }

                  // When start becomes end make it undefined,
                  // this happens when entire selection is removed.
                  if (c.selection.start === c.selection.end) {
                    c.selection = undefined;
                  }
                } else if (
                  // Is the selection is completely on the right of the removal
                  removed.start <= c.selection.start &&
                  removed.end <= c.selection.start
                ) {
                  // Then remove that many chars from the selection
                  c.selection.start -= removed.no;
                  c.selection.end -= removed.no;
                }
              }
            });
          }
        } else {
          // action is insert char

          if (cursor.selection) {
            // When something is selected it will delete the selected
            // text and insert the new char on that position

            const start = cursor.selection.start;
            const end = cursor.selection.end;

            const no = end - start;

            textArray.splice(cursor.selection.start, no);

            cursor.position = start;

            // Stores which positions have been removed, so we can
            // update the cursors later.
            const removed = {
              start,
              end,
              no,
            };

            // Insert the new key at the correct position.
            textArray.splice(cursor.position, 0, action.key);

            this.text = textArray.join('');

            this.cursors.forEach((c) => {
              if (cursor === c) {
                return;
              }

              if (c.selection) {
                // If the other cursors selection falls completely inside of the
                // selection of the current cursor then remove the selection.
                if (
                  c.selection.start >= removed.start &&
                  c.selection.end <= removed.end
                ) {
                  c.selection = undefined;
                  c.position = removed.start;
                } else {
                  const hasOverlap = this._hasOverlap(c, removed);

                  if (hasOverlap) {
                    // How many positions do selection and remove have in common.
                    const overlap = this._overlap(c.selection, removed);

                    if (c.selection.start > removed.start) {
                      c.selection.start -= removed.no - overlap;
                    }

                    if (c.selection.end === removed.end) {
                      c.selection.end -= removed.no;
                    } else if (c.selection.end !== removed.start) {
                      c.selection.end -= removed.no - 1;
                    }

                    c.selection.start = Math.max(0, c.selection.start);

                    // The new position becomes the position that is
                    // closest to the current position.
                    const distanceStart = Math.abs(
                      c.selection.start - c.position
                    );
                    const distanceEnd = Math.abs(c.selection.end - c.position);

                    c.position =
                      distanceStart < distanceEnd
                        ? c.selection.start
                        : c.selection.end;
                  } else if (
                    // Is the selection is completely on the right of the removal
                    removed.start <= c.selection.start &&
                    removed.end <= c.selection.start
                  ) {
                    // Minus the char that was added.
                    const removedNo = removed.no - 1;

                    // Minus the char that was added.
                    c.selection.start -= removedNo;

                    // Minus the char that was added.
                    c.selection.end -= removedNo;
                    c.position -= removedNo;

                    c.selection.start = Math.max(0, c.selection.start);
                  }
                }
              }
            });

            // Move the cursor that typed one to the right.
            cursor.position += 1;
          } else {
            // Insert the new key at the correct position.
            textArray.splice(cursor.position, 0, action.key);

            this.text = textArray.join('');

            this.cursors.forEach((c) => {
              if (cursor === c) {
                return;
              }

              // Update the selections
              if (c.selection) {
                // If cursor lies before the insert move the selection right
                if (cursor.position < c.selection.start) {
                  c.selection.start += 1;
                  c.selection.end += 1;
                }
                // If cursor lies before end stretch the selections end.
                else if (cursor.position < c.selection.end) {
                  c.selection.end += 1;
                }
              }

              // If the cursor types before the position of the
              // other cursor, +1 the other cursors position.
              if (cursor.position < c.position) {
                c.position += 1;
              }
            });

            // Move the cursor that typed one to the right.
            cursor.position += 1;
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

        // No-op whenever the cursor does not change position and the
        // selection does not change.
        if (
          cursor.position === position &&
          this._same(cursor.selection, action.selection)
        ) {
          noOp = true;
        } else {
          cursor.position = position;

          if (action.selection) {
            cursor.selection = {
              start: action.selection.start,
              end: action.selection.end,
            };
          } else {
            cursor.selection = undefined;
          }
        }
      }

      // Increase the index inside of the timeout so the when the
      // animation is paused the index is still the same as
      // before, so the _pauseStarted delay calculation still
      // works.
      this._index += 1;

      if (this._index >= this.actions.length) {
        // Are we finished?
        if (this.repeat === false || this.repeat === this._repeated + 1) {
          this.isFinished = true;
          this.isPlaying = false;

          const event: TypewriterFinishedEvent = {
            type: 'FINISHED',
            action,
            time: new Date(),
            cursor,
          };

          this._inform(event);
        } else {
          this._repeated += 1;

          if (!noOp) {
            const event: TypewriterChangedEvent = {
              type: 'CHANGED',
              action,
              time: new Date(),
              cursor,
            };

            this._inform(event);
          }

          this._animationTimeoutId = window.setTimeout(() => {
            this._index = 0;

            this._resetTandC();

            // Also make all cursors blink again.
            this.cursors.forEach((c) => {
              // Clear the blink of any cursor that still has a blink
              // queued so the blink from the previous animation does
              // not cross over to the next animation.
              c._clearBlink();

              c.isBlinking = true;
            });

            const event: TypewriterRepeatingEvent = {
              type: 'REPEATING',
              time: new Date(),
              cursor,
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
            cursor,
          };

          this._inform(event);
        }

        this._tick();
      }
    }, delay);
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

  private _resetTandC() {
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

  private _hasOverlap(c: TypewriterCursor, r: Range) {
    return (
      c.selection &&
      ((r.start >= c.selection.start && r.start <= c.selection.end) ||
        (r.end > c.selection.start && r.end <= c.selection.end))
    );
  }

  private _overlap(c: Range, r: Range) {
    return Math.min(c.end, r.end) - Math.max(c.start, r.start);
  }

  private _same(a: Range | undefined, b: Range | undefined) {
    // Are both undefined, or same object?
    if (a === b) {
      return true;
    }

    if (a && b) {
      return a.start === b.start && a.end === b.end;
    } else {
      // Either a or b are not defined, so they cannot be the same.
      return false;
    }
  }

  // handles left and right cursor movement, returns whether it is a no op or not.
  private _actionLorR(
    cursor: TypewriterCursor,
    mod: number,
    select: number,
    stop: number
  ): boolean {
    // Normally I would not write such a method but it reduces the code by a lot.

    // If cursor is at the start it is a no op if there is no selection.
    if (cursor.position === stop) {
      if (cursor.selection === undefined) {
        return true;
      }
    } else {
      if (cursor.selection) {
        // Move the cursor to the start of the selection
        cursor.position = select;
      } else {
        // Move the cursor to the left if there is no selection
        cursor.position += mod;
      }
    }

    // Whatever happens the selection is killed.
    cursor.selection = undefined;
    return false;
  }

  // handles left and right shift cursor movement, returns whether it is a no op or not.
  private _actionSLorR(
    cursor: TypewriterCursor,
    mod: number,
    which: 'start' | 'end',
    stop: number
  ): boolean {
    // Normally I would not write such a method but it reduces the code by a lot.

    // Is noOp whenever the user is already at the end of the text
    if (cursor.position === stop) {
      return true;
    } else {
      // Otherwise the position of the cursor moves to the right
      cursor.position += mod;
      if (cursor.selection) {
        // If there is already a selection expand right from the end
        cursor.selection[which] += mod;
      } else {
        // If no selection create a new one
        cursor.selection = { start: -1, end: -1 };

        cursor.selection[which === 'start' ? 'end' : 'start'] =
          cursor.position - mod;
        cursor.selection[which] = cursor.position;
      }
    }

    return false;
  }

  public _inform(event: TypewriterEvent): void {
    this._history._push(event);

    this._observer._inform(this, event);
  }

  /**
   * Iterates over the Typewriters text, and returns all positions in
   * the text. For each position you will be given a object of type:
   * `TypewriterPosition`, which contains all information about that
   * position, such as which cursors are on that position, and the
   * character on that position.
   *
   * When there is a cursor on the last position, you will receive an
   * additional `TypewriterPosition` which has an empty string for
   * the `character` field.
   *
   * IMPORTANT: in JavaScript some unicode characters have a length
   * bigger than 1. For example `"😃".length` is `2` not `1`.
   *
   * The Typewriter "normalizes" these so all unicode characters have
   * a length of 1, by calling `Array.from(text)`.
   *
   * This means that the `.length` of the `Typewriter.text` can differ
   * from the number of iterations you get from iterating over the
   * Typewriter!
   *
   * @returns {Iterator<TypewriterPosition>} an iterator which yields TypewriterCursor and strings.
   * @since 1.2.0
   */
  *[Symbol.iterator](): Iterator<TypewriterPosition> {
    // Transform to array which respects unicode.
    const text = Array.from(this.text);

    const cursorMap: Record<number, TypewriterCursor[]> = {};

    this.cursors.forEach((cursor) => {
      if (cursorMap[cursor.position]) {
        cursorMap[cursor.position].push(cursor);
      } else {
        cursorMap[cursor.position] = [cursor];
      }
    });

    for (let i = 0; i < text.length; i++) {
      const cursors = cursorMap[i];

      yield {
        position: i,
        cursors: cursors ? cursors : [],
        character: text[i],
        selected: this.cursors.filter(
          (cursor) =>
            cursor.selection &&
            i >= cursor.selection.start &&
            i < cursor.selection.end
        ),
      };
    }

    const finalCursors = cursorMap[text.length];
    if (finalCursors) {
      yield {
        position: text.length,
        character: '',
        cursors: finalCursors,
        selected: [],
      };
    }
  }
}

type Range = { start: number; end: number };

/*
  # Cursor rules as divined from google docs

  ## Own cursor rules

  1. When a text is selected and backspace is pressed the whole text
    vanishes.

  2. When a text is selected and a letter is typed the whole text is 
    replaced by the new letter.

  2. When the left arrow key is pressed the user deselects and moves
    to start of selection.

  3. When the right arrow key is pressed the user deselects and moves
    to end of selection. 

  ## Multiple selection rules

  1. If user A selects a text and user B types inside of the selection.
    
    Where inside is before last letter of selection but before
    first letter! 
    
    Than the selection of user A will automatically grow.

  2. If user A selects a text and user B removes letters from the selection
    the selection shrinks. Can even remove the selection this way!

  3. If user A selects a text and user B removes the text and more
    surrounding letters the selection of A disappears.

  # Multiple cursor type no selection

  1. If user A types before the position of cursor B the 
     cursor of B moves one to the right.

  2. If user A types after or on the position of cursor B the 
     cursor of B stays in position.
*/
