import { _AutoDismiss } from './AutoDismiss';
import {
  ViewChannelViewAutoDismiss,
  ViewChannelViewAutoDismissConfig,
} from './types';
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
 * 
 * @since 1.0.0
 */
export class ViewChannelView<T, R> {
  /**
   * Whether or not this ViewChannelView is presented.
   * 
   * @since 1.0.0
   */
  public isPresented: boolean;

  /**
   * Reference to the ViewChannel is it a part of.
   * 
   * @since 1.0.0
   */
  public viewChannel: ViewChannel<T, R>;

  /**
   * The index of the `ViewChannelView` which it has within the `contents`.
   * 
   * @since 1.0.0
   */
  public index: number;

  /**
   * The data for the presented view, "data" can be be anything from
   * an object, string, array etc etc. It is used to pass along data
   * to the view you might need to display the view, such as the
   * text for a flash message or confirmation dialog.
   *
   * By default the value is `undefined`.
   * 
   * @since 1.0.0
   */
  public data: T;

  /**
   * The priority the `ViewChannelView` will have within the
   * `ViewChannel` the lower the priority the closer it will be
   * to the start of the `ViewChannel` content array.
   * 
   * @since 1.0.0
   */
  public priority: number[];

  /**
   * Whether or not `autoDismiss` is enabled. When `autoDismiss` is
   * enabled it will dismiss the view, based on the `duration`.
   *
   * Defaults to no autoDismiss, meaning it will stay visible forever,
   * until it is dismissed.
   * 
   * @since 1.0.0
   */
  private _autoDismiss: _AutoDismiss<T, R>;

  /**
   * AutoDismiss means that the ViewChannelView will dismiss itself
   * after a duration.
   *
   * Contains whether or not the autoDismiss is playing via `isPlaying`
   * and the current duration via `duration`.
   * 
   * @since 1.0.0
   */
  public readonly autoDismiss: ViewChannelViewAutoDismiss = {
    isPlaying: false,
    duration: 0,
  };

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
   * 
   * @since 1.0.0
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
   * @param {ViewChannel<T, R>} viewChannel The ViewChannel this ViewChannelView belongs to.
   * @param {number} index The index of this ViewChannelView within the ViewChannel.
   * @param {T} data The data of this ViewChannelView.
   * @param {number} priority The priority this ViewChannelView has within the ViewChannel
   * @param {ViewChannelViewAutoDismissConfig<R>} autoDismiss Whether or not this ViewChannelView is auto dismissed after a duration. 
   * 
   * @since 1.0.0
   */
  constructor(
    viewChannel: ViewChannel<T, R>,
    index: number,
    data: T,
    priority: number[],
    autoDismissConfig?: ViewChannelViewAutoDismissConfig<R>
  ) {
    // Set to false in the ViewChannel _doRemoveByIndex method
    this.isPresented = true;

    this.viewChannel = viewChannel;
    this.index = index;
    this.data = data;
    this.priority = priority;

    this.result = new Promise((resolve) => {
      this._resolve = resolve;
    });

    this._autoDismiss = new _AutoDismiss(this, autoDismissConfig);
    this._autoDismiss._play(false);

    this.autoDismiss.duration = autoDismissConfig?.duration ?? 0;
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
   * Note: if the `ViewChannelView` property `isPresented` is `false`
   * the removal is ignored.
   *
   * Note: if the `ViewChannelView` does not exist in the views array it
   * will throw an error.
   *
   * @param {number} index The index of the ViewChannelView to dismiss
   * @param {R} result The value to resolve the promise of the ViewChannelView with.
   * @throws {ViewChannelNotFoundError} item must be in the views array based on === equality
   * @since 1.0.0
   */
  public dismiss(result: R): void {
    this.viewChannel.dismiss(this, result);
  }

  /**
   * Will resume auto dismissing the ViewChannelView based on the
   * active autoDismiss. When `autoDismiss` is not defined nothing
   * will happen when calling play.
   *
   * Important: you only need to call `play` yourself when also using
   * either `pause` or `stop`, as `play` is called automatically when
   * a view is presented.
   *
   * @throws {ViewChannelAutoDismissDurationError} autoDismiss duration must be a positive number when defined
   * 
   * @since 1.0.0
   */
  public play(): void {
    this._autoDismiss._play(true);
  }

  /**
   * When the ViewChannelView is playing it will pause the
   * autoDismiss.
   *
   * When paused, the current autoDismiss duration is remember and
   * resumed from that position, when `play` is called again.
   *
   * For example: when the duration is 1 second and the `pause` is
   * called after 0.8 seconds, it will after `play` is called, take
   * 0.2 seconds to dismiss this view.
   *
   * Note: if the autoDismiss is already paused calling `pause` again
   * will do nothing, the time used for the remaining duration is
   * based on the first pause.
   * 
   * @since 1.0.0
   */
  public pause(): void {
    this._autoDismiss._pause();
  }

  /**
   * When the ViewChannelView is playing it will stop the autoDismiss.
   *
   * By calling `play` again it is possible to restart the autoDismiss.
   * However the duration will behave in this scenario as it if was
   * reset.
   *
   * For example: when the duration is 1 second and the `stop` is
   * called after 0.8 seconds, it will after `play` is called, take
   * 1 second to dismiss this view.
   * 
   * @since 1.0.0
   */
  public stop(): void {
    this._autoDismiss._stop();
  }

  /**
   * Changes the data of this ViewChannelView, and informs the 
   * subscribers of the change. 
   * 
   * Note: if you provide the exact same `data` it will still set the 
   * `data` and inform the subscribers, even though nothing has
   * actually changed. 
   * 
   * This way, when `data` is an object or an array, you can mutate
   * the object / array directly, and pass in the same `data` object
   * to the `changeData`, without having to create copies.
   * 
   *
   * @param {T} data The new data for this ViewChannelView
   * @since 1.6.0
   */
  public changeData(data: T): void {
    this.viewChannel.changeData(this, data);
  }
}
