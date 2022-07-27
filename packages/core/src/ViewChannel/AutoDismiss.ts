import { ViewChannelAutoDismissDurationError } from './errors/ViewChannelAutoDismissDurationError';
import { ViewChannelAutoDismissConfig } from './types';
import { ViewChannelView } from './ViewChannelView';

// Autodismiss is a PRIVATE class, it should not be exposed directly.
export class AutoDismiss<T, R> {
  /*
    The timeoutId given back by calling window.setTimeout for when 
    autoDismiss is enabled. Is kept here so it can be cleared via
    window.clearTimeout.
  */
  private _autoDismissTimeoutId: number | null = null;

  /*
    The date on which the autoDismiss started, used to calculate
    what the duration should be after a pause is resumed.
  */
  private _autoDismissStarted: Date = new Date();

  /*
    The date on which the pause started, used to calculate
    what the duration should be after a pause is resumed.
  */
  private _pauseStarted: Date | null = null;

  /*
    The current duration time of the current ViewChannelView, used to calculate
    what the duration should be after a pause is resumed.
  */
  private _autoDismissCurrentDuration: number = 0;

  /**
   * Contains the configuration of the autoDismiss.
   */
  private _config?: ViewChannelAutoDismissConfig<R> | null = null;

  /**
   * Reference to the ViewChannelView is it a part of.
   */
  private _view: ViewChannelView<T, R>;

  constructor(
    view: ViewChannelView<T, R>,
    config?: ViewChannelAutoDismissConfig<R>
  ) {
    this._view = view;
    this._config = config;
  }

  public _isPlaying(): boolean {
    return this._autoDismissTimeoutId !== null;
  }

  public _play(): void {
    // Cancel timer to prevent multiple timeouts from being active.
    this._cancelTimer();

    // Do not start playing if there is no config.
    if (!this._config) {
      return;
    }

    const duration = this._getDuration(this._config);

    if (duration <= 0) {
      throw new ViewChannelAutoDismissDurationError();
    }

    this._autoDismissCurrentDuration = duration;
    this._autoDismissStarted = new Date();

    const result = this._config.result;

    this._autoDismissTimeoutId = window.setTimeout(() => {
      // Check if we are still visible as we might
      // already have been removed during the duration.
      // Note this is technically to prevent edge cases,
      // because when the promise is resolved the timeout
      // should have already been cleared via the clearTimeout.
      // I've not encountered this edge case ever happening in in
      // the wild. I'm keeping it just to be sure.
      if (this._view.isPresented) {
        this._view.viewChannel._doRemoveByIndex(
          this._view.index,
          result,
          'AUTO_DISMISS'
        );
      }

      // This is just a very minor performance boost. On other reason
      // to do this is that when debugging this code, it is slightly
      // easier to follow due to the `_autoDismissTimeoutId` getting
      // cleaned up, otherwise it looks like the timeout is still in
      // progress.
      this._autoDismissTimeoutId = null;
    }, duration);

    // Whenever the promise is resolved clear the timeout, this way
    // the timeout is cleared when the end-user dismisses the
    // view.
    this._view.result.then(() => {
      this._cancelTimer();
    });
  }

  public _pause(): void {
    /* 
      A user can call pause multiple times, by accident, these 
      subsequent calls should be ignored to prevent bugs:
    
      I (Maarten Hus) wrote a carousel example which paused when the 
      users mouse entered the carousel. When moving the mouse over the
      carousel whilst the duration had not passed, caused the 
      "_pauseStarted" to move into the future. 

      This could then in turn result in a negative duration, because
      the _pauseStarted Date could become higher than the 
      _autoDismissStarted Date.
    */
    if (this._pauseStarted) {
      return;
    }

    // Store the time when the pause was pressed, so we can calculate
    // the resuming duration later.
    this._pauseStarted = new Date();

    this._cancelTimer();
  }

  public _stop(): void {
    this._cancelTimer();

    this._pauseStarted = null;
  }

  private _cancelTimer() {
    if (this._autoDismissTimeoutId !== null) {
      window.clearTimeout(this._autoDismissTimeoutId);
      this._autoDismissTimeoutId = null;
    }
  }

  private _getDuration(config: ViewChannelAutoDismissConfig<R>): number {
    if (this._pauseStarted) {
      return (
        this._autoDismissCurrentDuration -
        (this._pauseStarted.getTime() - this._autoDismissStarted.getTime())
      );
    }

    return config.duration;
  }
}
