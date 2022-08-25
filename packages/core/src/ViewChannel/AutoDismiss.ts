import { ViewChannelAutoDismissDurationError } from './errors/ViewChannelAutoDismissDurationError';
import {
  ViewChannelViewAutoDismissConfig,
  ViewChannelViewAutoDismissPausedEvent,
  ViewChannelViewAutoDismissPlayingEvent,
  ViewChannelViewAutoDismissStoppedEvent,
} from './types';
import { ViewChannelView } from './ViewChannelView';

// _AutoDismiss is a PRIVATE class, it should not be exposed directly.
export class _AutoDismiss<T, R> {
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
  private _config?: ViewChannelViewAutoDismissConfig<R> | null = null;

  /**
   * Reference to the ViewChannelView is it a part of.
   */
  private _view: ViewChannelView<T, R>;

  constructor(
    view: ViewChannelView<T, R>,
    config?: ViewChannelViewAutoDismissConfig<R>
  ) {
    this._view = view;
    this._config = config;
  }

  public _play(inform: boolean): void {
    if (this._view.autoDismiss.isPlaying) {
      return;
    }

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

    // The `autoPlayDuration` should not be affected by a pause.
    if (this._pauseStarted === null) {
      this._view.autoDismiss.duration = duration;
    }

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
        this._view.autoDismiss.isPlaying = false;
        this._view.autoDismiss.duration = 0;

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

    this._view.autoDismiss.isPlaying = true;

    if (inform) {
      const event: ViewChannelViewAutoDismissPlayingEvent<T, R> = {
        type: 'AUTO_DISMISS_PLAYING',
        view: this._view,
        index: this._view.index,
        time: new Date(),
      };

      this._view.viewChannel._inform(event);
    }
  }

  public _pause(): void {
    if (!this._view.autoDismiss.isPlaying) {
      return;
    }

    // Store the time when the pause was pressed, so we can calculate
    // the resuming duration later.
    this._pauseStarted = new Date();

    this._cancelTimer();

    this._view.autoDismiss.isPlaying = false;

    const event: ViewChannelViewAutoDismissPausedEvent<T, R> = {
      type: 'AUTO_DISMISS_PAUSED',
      view: this._view,
      index: this._view.index,
      time: new Date(),
    };

    this._view.viewChannel._inform(event);
  }

  public _stop(): void {
    // Allow for pause then stop, but not stop then stop.
    if (!this._view.autoDismiss.isPlaying && !this._pauseStarted) {
      return;
    }

    this._cancelTimer();

    this._pauseStarted = null;

    this._view.autoDismiss.isPlaying = false;
    this._view.autoDismiss.duration = 0;

    const event: ViewChannelViewAutoDismissStoppedEvent<T, R> = {
      type: 'AUTO_DISMISS_STOPPED',
      view: this._view,
      index: this._view.index,
      time: new Date(),
    };

    this._view.viewChannel._inform(event);
  }

  private _cancelTimer() {
    if (this._autoDismissTimeoutId !== null) {
      window.clearTimeout(this._autoDismissTimeoutId);
      this._autoDismissTimeoutId = null;
    }
  }

  private _getDuration(config: ViewChannelViewAutoDismissConfig<R>): number {
    if (this._pauseStarted) {
      return (
        this._autoDismissCurrentDuration -
        (this._pauseStarted.getTime() - this._autoDismissStarted.getTime())
      );
    }

    return config.duration;
  }
}
