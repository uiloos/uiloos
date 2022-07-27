import { ViewChannelAutoDismiss } from './types';
import { ViewChannel } from './ViewChannel';

/**
 * A ViewChannelView is a class which represents visual elements which
 * are visible for a certain amount of time, or until when the user 
 * performs a certain action.
 * 
 * For example:
 * 
 *  1. A notification, a piece of text telling the user some event
 *     happened within the application.
 * 
 *  2. A flash message, a small temporary message telling the user
 *     an action was successful or failed. They disappear after a 
 *     certain amount of time, or when the user clicks on them.
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
 * A ViewChannelView is always tied to a ViewChannel in which it 
 * appears.
 * 
 * You should never instantiate a `ViewChannelView` directly, instead
 * you should call `present` on the `ViewChannel` and provide a 
 * `ViewChannelViewConfig` from which the `ViewChannelView` is 
 * instantiated.
 */
export class ViewChannelView<T, R> {
  /**
   * Whether or not this ViewChannelView is presented.
   */
  public isPresented: boolean;

  /**
   * Reference to the ViewChannel is it a part of.
   */
  public viewChannel: ViewChannel<T, R>;

  /**
   * The index of the `ViewChannelView` which it has within the `contents`.
   */
  public index: number;

  /**
   * The data for the presented view, "data" can be be anything from 
   * an object, string, array etc etc. It is used to pass along data 
   * to the view you might need to display the view, such as the 
   * text for a flash message or confirmation dialog.
   * 
   * By default the value is `undefined`.
   */
  public data: T;

  /**
   * The priority the `ViewChannelView` will have within the
   * `ViewChannel` the lower the priority the closer it will be
   * to the start of the `ViewChannel`'s content array.
   */
  public priority: number[];

  /**
   * Whether or not `autoDismiss` is enabled. When `autoDismiss` is
   * enabled it will dismiss the view, based on the `duration`.
   *
   * Defaults to no autoDismiss, meaning it will stay visible forever,
   * until it is dismissed.
   */
  public autoDismiss?: ViewChannelAutoDismiss<R>;

  /**
   * A promise which will be resolved with the result (R) when this
   * ViewChannelView is dismissed. This promise will never be rejected
   * only resolved.
   * 
   * For example when making a confirmation dialog, you could set the 
   * result to `"CONFIRM"` when the user presses the confirm button, 
   * and set the result to `"CANCEL"` when the user either presses the 
   * cancel button, or clicks outside of the dialog.
   * 
   * This allows you to `await` for the promise to be fulfilled, and
   * take the result an perform actions based on that result.
   * 
   * Note: this promise might never get resolved if "dismiss" is 
   * never called.
   */
  public result: Promise<R>;

  // @ts-ignore-error The `new Promise` writes the _resolve in the constructor.
  public _resolve: (result: R | PromiseLike<R>) => void = null;

  /**
   * Creates an ViewChannelView which belongs to the given ViewChannel.
   *
   * Note: you should never create instances of ViewChannelView yourself. You
   * are supposed to let ViewChannel do this for you.
   *
   * @param {ViewChannel<T>} viewChannel The ViewChannel this ViewChannelView belongs to.
   * @param {number} index The index of this ViewChannelView within the ViewChannel.
   * @param {T} data The data function which when called provides the data for this ViewChannelView.
   * @param {number} priority The priority this ViewChannelView has within the ViewChannel
   * @param {ViewChannelAutoDismiss<R} autoDismiss Whether or not this ViewChannelView is auto dismissed after a duration.
   */
  constructor(
    viewChannel: ViewChannel<T, R>,
    index: number,
    data: T,
    priority: number[],
    autoDismiss?: ViewChannelAutoDismiss<R>
  ) {
    // Set to false in the ViewChannel's _doRemoveByIndex method
    this.isPresented = true;

    this.viewChannel = viewChannel;
    this.index = index;
    this.data = data;
    this.priority = priority;
    this.autoDismiss = autoDismiss;

    this.result = new Promise((resolve) => {
      this._resolve = resolve;
    });

    if (this.autoDismiss) {
      const result = this.autoDismiss.result;

      const durationTimeoutId = window.setTimeout(() => {
        // Check if we are still visible as we might 
        // already have been removed during the duration.
        // Note this is technically to prevent edge cases, 
        // because when the promise is resolved the timeout
        // should have already been cleared via the clearTimeout. 
        // I've not encountered this edge case ever happening in in 
        // the wild. I'm keeping it just to be sure.
        if (this.isPresented) {
          this.viewChannel._doRemoveByIndex(this.index, result, 'AUTO_DISMISS');
        }
      }, this.autoDismiss.duration);

      // Whenever the promise is resolved clear the timeout, this way
      // the timeout is cleared when the end-user dismisses the
      // view. 
      this.result.then(() => {
        window.clearTimeout(durationTimeoutId);
      });
    }
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
   * If the `ViewChannelView` does not exist in the views array it 
   * will throw an error. This can occur if the `ViewChannelView` has 
   * already been  dismissed, and calling dismiss again.
   * 
   * @param {number} index The index of the ViewChannelView to dismiss
   * @param {R} result The value to resolve the promise of the ViewChannelView with. 
   * @throws {ViewChannelNotFoundError} item must be in the views array based on === equality
   */
  public dismiss(result: R): void {
    this.viewChannel.dismiss(this, result);
  }
}
