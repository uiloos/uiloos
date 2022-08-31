/*
  This import will be removed during the minification build so terser
  leaves it alone. Make sure that it is not committed into git as an 
  uncommented line!

  If you run build and the line below is commented you will get
  this error: `Cannot find name 'uiloosLicenseChecker'`.

  See rollup.minification.config.js for more information
*/
import { UnsubscribeFunction } from '../generic';
import { _History } from '../private/History';
import { _Observer } from '../private/Observer';
import * as uiloosLicenseChecker from '../license/license';
import { ViewChannelIndexOutOfBoundsError } from './errors/ViewChannelIndexOutOfBoundsError';
import { ViewChannelViewNotFoundError } from './errors/ViewChannelViewNotFoundError';
import {
  ViewChannelConfig,
  ViewChannelEvent,
  ViewChannelInitializedEvent,
  ViewChannelSubscriber,
  ViewChannelViewConfig,
  ViewChannelViewPresentedEvent,
  ViewChannelViewDismissedEvent,
  ViewChannelViewDismissedEventReason,
  ViewChannelViewDismissedAllEvent,
} from './types';
import { ViewChannelView } from './ViewChannelView';

/**
 * A ViewChannel is a class which represents an area on the screen
 * which contains visual elements (views) which are visible for a
 * certain amount of time, or until when the user performs a certain
 * action.
 *
 * The `ViewChannel` can be used to implement multiple types of
 * components:
 *
 *  1. A notification side bar in which the user sees notifications
 *     of the application for a limited amount of time.
 *
 *  2. A flash message area which contain messages that tell the user
 *     an action was successful or not. They disappear after a certain
 *     amount of time, or when the user clicks on them.
 *
 *  3. A modal: a window / frame which appears when the user must
 *     perform a specific action. The modal closes when the user
 *     either performs the action, or when the user cancels the
 *     action.
 *
 *  4. A confirmation dialog: a small window / frame which appears
 *     asking the user if they are sure they want to perform a
 *     certain action.
 *
 * The general idea is that often areas on the screen exists which
 * contain contain a specific type of visual element. These elements
 * are often presented (triggered) from code at a distance from the
 * area they are displayed in. This is why `ViewChannel` is considered
 * a "channel", it is a way of transporting views.
 *
 * This way you can have one part of the code consume the channel,
 * and use it to simply display the views, and many places (in code)
 * where you put views on the channel.
 *
 * The idea of the ViewChannel is that you instantiate one for each
 * type of View you want to support, for example: you might have a
 * flash message and a modal ViewChannel instance. Then you use these
 * instances to send "views" to the channel.
 *
 * The ViewChannel also has a concept of "priority". Sometimes one
 * view has more priority than another view. The ViewChannel will
 * make sure that the views are sorted by priority. The higher the
 * priority the earlier in the `views` array the view is placed.
 * This makes the ViewChannel a priority queue like data structure.
 * 
 * @since 1.0.0
 */
export class ViewChannel<T, R = void> {
  /**
   * The `ViewChannelView` instances which the `ViewChannel` holds.
   * 
   * @since 1.0.0
   */
  public readonly views: ViewChannelView<T, R>[] = [];

  private _history: _History<ViewChannelEvent<T, R>> = new _History();

  /**
   * Contains the history of the changes in the views array.
   *
   * Tracks 3 types of changes:
   *
   *  1. INITIALIZED, fired when ViewChannel is initialized
   *
   *  2. PRESENTED, fired when ViewChannel presented a ViewChannelView
   *
   *  3. DISMISSED, fired when ViewChannel dismissed a ViewChannelView
   *
   *  4. AUTO_DISMISS_PLAYING, fired when ViewChannelView started to 
   *     play after a stop or pause
   *
   *  5. AUTO_DISMISS_PAUSED, fired when a ViewChannelView auto 
   *     dismiss was paused.
   *
   *  6. AUTO_DISMISS_STOPPED, fired when a ViewChannelView auto 
   *     dismiss was stopped.
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
   * @since 1.0.0
   */
  public history: ViewChannelEvent<T, R>[] = this._history._events;

  private _observer: _Observer<ViewChannel<T, R>, ViewChannelEvent<T, R>> =
    new _Observer();

  /**
   * Creates an ViewChannel based on the ViewChannelConfig config.
   *
   * You can also optionally provide an subscriber so you can get
   * informed of the changes happening to the ViewChannel.
   *
   * @param {ViewChannelConfig<T>} config The initial configuration of the ViewChannel.
   * @param {ViewChannelSubscriber<T> | undefined} subscriber An optional subscriber which responds to changes in the ViewChannel.
   * 
   * @since 1.0.0
   */
  constructor(
    config: ViewChannelConfig = {},
    subscriber?: ViewChannelSubscriber<T, R>
  ) {
    uiloosLicenseChecker.licenseChecker._checkLicense();

    if (subscriber) {
      this.subscribe(subscriber);
    }

    this.initialize(config);
  }

  /**
   * Initializes the ViewChannel based on the config provided.
   * This can effectively resets the ViewChannel when called,
   * including the history.
   *
   * @param {ViewChannelConfig<T>} config The new configuration which will override the old one
   * 
   * @since 1.0.0
   */
  public initialize(config: ViewChannelConfig): void {
    // Configure history
    this._history._events.length = 0;
    this._history._setKeepHistoryFor(config.keepHistoryFor);

    this._clearViews();

    const event: ViewChannelInitializedEvent = {
      type: 'INITIALIZED',
      time: new Date(),
    };

    this._inform(event);
  }

  /**
   * Subscribe to changes of the ViewChannel. The function you
   * provide will get called whenever changes occur in the
   * ViewChannel.
   *
   * Returns an unsubscribe function which when called will unsubscribe
   * from the ViewChannel.
   *
   * @param {ViewChannelSubscriber<T>} subscriber The subscriber which responds to changes in the ViewChannel.
   * @returns {UnsubscribeFunction} A function which when called will unsubscribe from the ViewChannel.
   * 
   * @since 1.0.0
   */
  public subscribe(
    subscriber: ViewChannelSubscriber<T, R>
  ): UnsubscribeFunction {
    return this._observer._subscribe(subscriber);
  }

  /**
   * Unsubscribe the subscriber so it no longer receives changes / updates
   * of the state changes of the ViewChannel.
   *
   * @param {ViewChannelSubscriber<T>} subscriber The subscriber which you want to unsubscribe.
   * 
   * @since 1.0.0
   */
  public unsubscribe(subscriber: ViewChannelSubscriber<T, R>): void {
    this._observer._unsubscribe(subscriber);
  }

  /**
   * Takes the provided `ViewChannelViewConfig` turns it into a
   * `ViewChannelView`, and places the `ViewChannelView` into the
   * `views` array based on the priority given.
   *
   * @param {ViewChannelConfig<T, R>} viewConfig The configuration for the view which is presented and returned.
   * @returns {ViewChannelView<R>} The view which was presented
   * @throws {ViewChannelAutoDismissDurationError} autoDismiss duration must be a positive number when defined
   * 
   * @since 1.0.0
   */
  public present(
    viewConfig: ViewChannelViewConfig<T, R>
  ): ViewChannelView<T, R> {
    // Make sure a view always has a priority when not supplied.
    const priority = viewConfig.priority ? viewConfig.priority : 0;
    const priorityArray = Array.isArray(priority) ? priority : [priority];

    const index = this._getIndexForPriority(priorityArray);

    const view: ViewChannelView<T, R> = new ViewChannelView<T, R>(
      this,
      index,
      viewConfig.data,
      priorityArray,
      viewConfig.autoDismiss
    );

    // Insert into the correct position
    this.views.splice(index, 0, view);

    this._repairIndexes();

    const event: ViewChannelViewPresentedEvent<T, R> = {
      type: 'PRESENTED',
      view,
      index,
      time: new Date(),
    };

    this._inform(event);

    return view;
  }

  public _doRemoveByIndex(
    index: number,
    result: R,
    reason: ViewChannelViewDismissedEventReason
  ): void {
    if (index < 0 || index >= this.views.length) {
      throw new ViewChannelIndexOutOfBoundsError();
    }

    const view = this.views[index];

    // Remove the view by mutating views
    this.views.splice(index, 1);

    this._repairIndexes();

    view.isPresented = false;
    view.autoDismiss.duration = 0;
    view.autoDismiss.isPlaying = false;

    view._resolve(result);

    const event: ViewChannelViewDismissedEvent<T, R> = {
      type: 'DISMISSED',
      view,
      index,
      reason,
      time: new Date(),
    };

    this._inform(event);
  }

  /**
   * Dismisses the `ViewChannelView` which resides at the index of
   * the `views` array, with the given result.
   *
   * The result (R) is the value with which the promise of the
   * `ViewChannelView` will be resolved. For example when making a
   * confirmation dialog, you could set the result to `"CONFIRM"` when
   * the user presses the confirm button, and set the result to
   * `"CANCEL"` when the user either presses the cancel button, or
   * clicks outside of the dialog.
   *
   * If the index does not exist an error will be thrown.
   *
   * @param {number} index The index of the ViewChannelView to dismiss
   * @param {R} result The value to resolve the promise of the ViewChannelView with.
   * @throws {ViewChannelIndexOutOfBoundsError} index cannot be out of bounds
   * @since 1.0.0
   */
  public dismissByIndex(index: number, result: R): void {
    this._doRemoveByIndex(index, result, 'USER_INTERACTION');
  }

  /**
   * Dismisses the `ViewChannelView` with the given result.
   *
   * The result (R) is the value with which the promise of the
   * `ViewChannelView` will be resolved. For example when making a
   * confirmation dialog, you could set the result to `"CONFIRM"` when
   * the user presses the confirm button, and set the result to
   * `"CANCEL"` when the user either presses the cancel button, or
   * clicks outside of the dialog.
   *
   * Note: if the `ViewChannelView` `isPresented` is `false` the
   * removal is ignored.
   *
   * Note: if the `ViewChannelView` does not exist in the views array it
   * will throw an error.
   *
   * @param {number} index The index of the ViewChannelView to dismiss
   * @param {R} result The value to resolve the promise of the ViewChannelView with.
   * @throws {ViewChannelNotFoundError} item must be in the views array based on === equality
   * @since 1.0.0
   */
  public dismiss(view: ViewChannelView<T, R>, result: R): void {
    // If the view was already dismissed simply ignore the dismissal.
    // This can happen when the developer makes a mistake by calling
    // it twice. Which is quite easy to do when having multiple
    // timeouts.
    if (!view.isPresented) {
      return;
    }

    const index = this.views.indexOf(view);

    if (index === -1) {
      throw new ViewChannelViewNotFoundError();
    }

    this.dismissByIndex(index, result);
  }

  /**
   * Dismisses all `ViewChannelView`s within this `ViewChannel` with
   * the given result.
   *
   * The result (R) is the value with which the promise of all the
   * `ViewChannelView` will be resolved with . For example when making
   * a notifications bar, you could set the result to `"CLEARED"` when
   * the user presses the a "clear all" button.
   *
   * Note: when there are no ViewChannelViews displayed (in the views
   * array) calling dismissAll will result in nothing happening.
   *
   * @param {R} result The value to resolve the promises of all the ViewChannelViews within the ViewChannel.
   * @since 1.0.0
   */
  public dismissAll(result: R): void {
    // Do nothing when there are no views
    if (this.views.length === 0) {
      return;
    }

    /*
      Note: We cannot use _doRemoveByIndex or dismissByIndex here 
      because then the indexes will be repaired in between causing the 
      collected indexes to be incorrect. 
    */

    // Contains indexes for all removed views for the event.
    const indexes: number[] = [];

    // Copy the views so we can resolve them later.
    const dismissedViews = [...this.views];

    // Clear all views first
    this._clearViews();

    // Resolve all promises and collect indexes.
    dismissedViews.forEach((view) => {
      view.isPresented = false;
      view._resolve(result);

      indexes.push(view.index);
    });

    const event: ViewChannelViewDismissedAllEvent<T, R> = {
      type: 'DISMISSED_ALL',
      views: dismissedViews,
      indexes,
      time: new Date(),
    };

    this._inform(event);
  }

  // Gets the index for the given priority, based on what is already
  // in the views array.
  private _getIndexForPriority(priority: number[]): number {
    for (let view of this.views) {
      // One of the arrays could be larger than the other, we must
      // loop over the largest array so each level is visited, if
      // we did not do this we do not get the chance to pad with
      // zero.
      const largestArray =
        priority.length > view.priority.length ? priority : view.priority;

      for (let level = 0; level < largestArray.length; level++) {
        const inserted = this._getPriorityAtLevel(priority, level);
        const existing = this._getPriorityAtLevel(view.priority, level);

        if (inserted < existing) {
          return view.index;
        }
      }
    }

    // If no suitable index is found, it must either be the first
    // item ever inserted, or it has the lowest priority. Which
    // is why returning the length works, if the array is empty
    // it will return 0 for when the array is empty. If the array is
    // not empty it will return the next index.
    return this.views.length;
  }

  // Gets the priority for the level, defaulting to zero (highest priority)
  // when priority is not found.
  private _getPriorityAtLevel(priorityArray: number[], level: number): number {
    const priority = priorityArray[level];

    // Not written as ternary to see paths hit in code coverage, will
    // be made more efficient by terser anyway upon build.
    if (priority !== undefined) {
      return priority;
    } else {
      return 0;
    }
  }

  // Restore the "index" of the views after a mutation occurred.
  private _repairIndexes(): void {
    this.views.forEach((view, index) => {
      view.index = index;
    });
  }

  private _clearViews() {
    this.views.length = 0;
  }

  public _inform(event: ViewChannelEvent<T, R>): void {
    this._history._push(event);

    this._observer._inform(this, event);
  }
}
