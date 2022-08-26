import { ActiveList } from './ActiveList';
import { ActiveListContent } from './ActiveListContent';
import { ActiveListAutoPlayDurationError } from './errors/ActiveListAutoPlayDurationError';
import {
  ActiveListAutoPlayConfig,
  ActiveListActivationOptions,
  ActiveListAutoPlayPlayingEvent,
  ActiveListAutoPlayPausedEvent,
  ActiveListAutoPlayStoppedEvent,
} from './types';

// AutoPlay is a PRIVATE class, it should not be exposed directly.
export class _AutoPlay<T> {
  /*
    The timeoutId given back by calling window.setTimeout for when 
    autoPlay is enabled. Is kept here so it can be cleared via
    window.clearTimeout.
  */
  private _autoPlayTimeoutId: number | null = null;

  /*
    The date on which the autoPlay started, used to calculate
    what the duration should be after a pause is resumed.
  */
  private _autoPlayStarted: Date = new Date();

  /*
    The date on which the pause started, used to calculate
    what the duration should be after a pause is resumed.
  */
  private _pauseStarted: Date | null = null;

  /*
    The current duration time of the current active content, used to calculate
    what the duration should be after a pause is resumed.
  */
  private _autoPlayCurrentDuration: number = 0;

  /**
   * Contains the configuration of the autoPlay.
   */
  private _config?: ActiveListAutoPlayConfig<T> | null = null;

  /**
   * Reference to the active content is it a part of.
   */
  private _activeList: ActiveList<T>;

  constructor(
    activeList: ActiveList<T>,
    config: ActiveListAutoPlayConfig<T> | null
  ) {
    this._activeList = activeList;
    this._config = config;
  }

  public _setConfig(config: ActiveListAutoPlayConfig<T> | null): void {
    this._config = config;
  }

  public _play(inform: boolean): void {
    // Cancel timer to prevent multiple timeouts from being active.
    this._cancelTimer();

    // Do not start playing if there is no config or when there is no
    // more lastActivatedContent (in which case we cannot get a duration).
    if (!this._config || this._activeList.lastActivatedContent === null) {
      // There is no need to call stop here as this has already
      // been done.
      return;
    }

    const duration = this._getDuration(
      this._config,
      this._activeList.lastActivatedContent
    );

    if (duration <= 0) {
      throw new ActiveListAutoPlayDurationError();
    }

    this._autoPlayCurrentDuration = duration;
  
    // The `autoPlayDuration` should not be affected by a pause.
    if (this._pauseStarted === null) {
      this._activeList.autoPlay.duration = duration;
    }

    this._autoPlayStarted = new Date();

    this._autoPlayTimeoutId = window.setTimeout(() => {
      // Clear the timeout now that we have performed it. This way
      // the call to `cancelTimer` which is triggered by the following chain:
      // `next->activateByIndex->onActiveIndexChanged->play->cancelTimer`
      // does not need to call window.clearTimeout. This is just a
      // very minor performance boost. On other reason to do this
      // is that when debugging this code, it is slightly easier to
      // follow due to the `_autoPlayTimeoutId` getting cleaned up,
      // otherwise it looks like the timeout is still in progress.
      this._autoPlayTimeoutId = null;

      // Call next to actually trigger going to the next active content.
      this._activeList.activateNext({ isUserInteraction: false });
    }, duration);

    this._activeList.autoPlay.isPlaying = true;

    if (inform) {
      const event: ActiveListAutoPlayPlayingEvent = {
        type: 'AUTO_PLAY_PLAYING',
        time: new Date(),
      };

      this._activeList._inform(event);
    }
  }

  public _pause(): void {
    if (!this._activeList.autoPlay.isPlaying) {
      return;
    }

    // Store the time when the pause was pressed, so we can calculate
    // the resuming duration later.
    this._pauseStarted = new Date();

    this._cancelTimer();

    this._activeList.autoPlay.isPlaying = false;

    const event: ActiveListAutoPlayPausedEvent = {
      type: 'AUTO_PLAY_PAUSED',
      time: new Date(),
    };

    this._activeList._inform(event);
  }

  public _stop(): void {
    // Allow for pause then stop, but not stop then stop.
    if (!this._activeList.autoPlay.isPlaying && !this._pauseStarted) {
      return;
    }

    this._cancelTimer();

    this._pauseStarted = null;

    this._activeList.autoPlay.isPlaying = false;
    this._activeList.autoPlay.duration = 0;

    const event: ActiveListAutoPlayStoppedEvent = {
      type: 'AUTO_PLAY_STOPPED',
      time: new Date(),
    };

    this._activeList._inform(event);
  }

  private _cancelTimer() {
    if (this._autoPlayTimeoutId !== null) {
      window.clearTimeout(this._autoPlayTimeoutId);
      this._autoPlayTimeoutId = null;
    }
  }

  public _onDeactivation(activationOptions: ActiveListActivationOptions<T>) {
    // If there are no more lastActivatedContent stop, as we cannot
    // get a duration in this case.
    if (this._activeList.lastActivatedContent === null) {
      this._stop();
      return;
    }

    // If there is no autoPlay config do not bother.
    if (!this._config) {
      return;
    }

    if (this._shouldStopOnUserInteraction(activationOptions, this._config)) {
      this._stop();
      return;
    }
  }

  public onActiveIndexChanged(
    index: number,
    activationOptions: ActiveListActivationOptions<T>
  ) {
    // If there is no autoPlay config do not bother.
    if (!this._config) {
      return;
    }

    if (this._shouldStopOnUserInteraction(activationOptions, this._config)) {
      this._stop();
    } else if (
      this._activeList.isCircular === false &&
      index === this._activeList.getLastIndex()
    ) {
      // When the ActiveList is linear stop autoPlay at the end.
      this._stop();
    } else {
      // Move the autoPlay to the next "timer", needed because
      // each "item" can have a unique "duration" in which it
      // is active.

      this._play(false);
    }
  }

  private _shouldStopOnUserInteraction(
    activationOptions: ActiveListActivationOptions<T>,
    config: ActiveListAutoPlayConfig<T>
  ): boolean {
    // Stop when autoPlay.stopsOnUserInteraction is true and this
    // is a user interaction.
    return !!(
      activationOptions &&
      activationOptions.isUserInteraction !== false && // So undefined is treated as true.
      config.stopsOnUserInteraction
    );
  }

  private _getDuration(
    config: ActiveListAutoPlayConfig<T>,
    lastActivatedContent: ActiveListContent<T>
  ): number {
    if (this._pauseStarted) {
      return (
        this._autoPlayCurrentDuration -
        (this._pauseStarted.getTime() - this._autoPlayStarted.getTime())
      );
    }

    if (typeof config.duration === 'number') {
      return config.duration;
    } else {
      /*
        Thoughts about duration.

        When `duration` is a function the duration is based on the
        content which is activated. But herein lies a small problem:
        what if the `lastActivatedContent` is `null`. 

        The `lastActivatedContent` can be `null` whenever no content
        is activate at this moment. You might think if no content is 
        active then there cannot be a duration, which is true, but...

        When the `duration` is a `number` and the `lastActivatedContent`
        is `null` we could simply activate the first item. 

        So what do we do? The answer is at least the same behavior
        for when the `duration` is a `number` or when the duration
        is a `function`, otherwise it will become to complex.

        So these are the options, for when `lastActivatedContent` is 
        `null`, regardless of the type of `duration`:

        1. Stop the autoPlay completely.

        2. Activate the first item after a fallback duration, this 
           would be an extra config item.
          
        3. Activate the first item immediately without a delay. Or with
           a timeout of 0 seconds.

        All seem reasonable, but there is one deciding factor: what
        happens when the user deactivates all items. When this happens
        I think we should stop the autoPlay. The reason is this: say
        the end-user sees 1 active item, and he deactivates it, what
        does the autoPlay trigger, the start or the next item...

        Both options would feel really strange, so the best thing is
        to simply stop.

        Now it is very important to document this behavior, that when
        no items remain active, that the autoPlay stops.
      */

      return config.duration({
        index: lastActivatedContent.index,
        content: lastActivatedContent,
        value: lastActivatedContent.value,
        activeList: this._activeList,
      });
    }
  }
}
