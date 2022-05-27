
import { ActiveList } from './ActiveList';
import { ActiveListContent } from './ActiveListContent';
import { ActiveListAutoplayDurationError } from './errors/ActiveListAutoplayDurationError';
import { ActiveListAutoplayConfig, ActiveListActivationOptions } from './types';

// Autoplay is a PRIVATE class, it should not be exposed directly.
export class Autoplay<T> {
  /*
    The timeoutId given back by calling window.setTimeout for when 
    autoplay is enabled. Is kept here so it can be cleared via
    window.clearTimeout.
  */
  private _autoplayTimeoutId: number | null = null;

  /*
    The date on which the autoplay started, used to calculate
    what the duration should be after a pause is resumed.
  */
  private _autoplayStarted: Date = new Date();

  /*
    The date on which the pause started, used to calculate
    what the duration should be after a pause is resumed.
  */
  private _pauseStarted: Date | null = null;

  /*
    The current duration time of the current active content, used to calculate
    what the duration should be after a pause is resumed.
  */
  private _autoplayCurrentDuration: number = 0;

  /**
   * Contains the configuration of the autoplay.
   */
  private _config?: ActiveListAutoplayConfig<T> | null = null;

  /**
   * Reference to the active content is it a part of.
   */
  private _activeList: ActiveList<T>;

  constructor(
    activeList: ActiveList<T>,
    config: ActiveListAutoplayConfig<T> | null
  ) {
    this._activeList = activeList;
    this._config = config;
  }

  public _setConfig(config: ActiveListAutoplayConfig<T> | null): void {
    this._config = config;
  }

  public _isPlaying(): boolean {
    return this._autoplayTimeoutId !== null;
  }

  public _play(): void {
    // Cancel timer to prevent multiple timeouts from being active.
    this._cancelTimer();

    // Stop playing when autoplay is false, when the content has
    // become empty, or when there is no more lastActivatedContent.
    if (
      !this._config ||
      this._activeList.isEmpty() ||
      this._activeList.lastActivatedContent === null
    ) {
      return;
    }

    const duration = this._getDuration(
      this._config,
      this._activeList.lastActivatedContent
    );

    if (duration <= 0) {
      throw new ActiveListAutoplayDurationError();
    }

    this._autoplayCurrentDuration = duration;
    this._autoplayStarted = new Date();

    this._autoplayTimeoutId = window.setTimeout(() => {
      // It could happen that during the "duration" the contents, or
      // active is  now empty due to a removal / deactivation, in this
      // case we simply want to do nothing.
      if (
        this._activeList.isEmpty() ||
        this._activeList.lastActivatedContent === null
      ) {
        return;
      }

      // Clear the timeout now that we have performed it. This way
      // the call to `cancelTimer` which is triggered by the following chain:
      // `next->activateByIndex->onActiveIndexChanged->play->cancelTimer`
      // does not need to call window.clearTimeout. This is just a
      // very minor performance boost. On other reason to do this
      // is that when debugging this code, it is slightly easier to
      // follow due to the `_autoplayTimeoutId` getting cleaned up,
      // otherwise it looks like the timeout is still in progress.
      this._autoplayTimeoutId = null;

      // Call next to actually trigger going to the next active content.
      this._activeList.activateNext({ isUserInteraction: false });
    }, duration);
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
      _autoplayStarted Date.
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
    if (this._autoplayTimeoutId !== null) {
      window.clearTimeout(this._autoplayTimeoutId);
      this._autoplayTimeoutId = null;
    }
  }

  public _onDeactivation(activationOptions: ActiveListActivationOptions<T>) {
    // If there is no autoplay config do not bother.
    if (!this._config) {
      return;
    }

    if (this._shouldStopOnUserInteraction(activationOptions, this._config)) {
      this._stop();
    }
  }

  public onActiveIndexChanged(
    index: number,
    activationOptions: ActiveListActivationOptions<T>
  ) {
    // If there is no autoplay config do not bother.
    if (!this._config) {
      return;
    }

    if (this._shouldStopOnUserInteraction(activationOptions, this._config)) {
      this._stop();
    } else if (
      this._activeList.isCircular === false &&
      index === this._activeList.getLastIndex()
    ) {
      // When the ActiveList is linear stop autoplay at the end.
      this._stop();
    } else {
      // Move the autoplay to the next "timer", needed because
      // each "item" can have a unique "duration" in which it
      // is active.

      this._play();
    }
  }

  private _shouldStopOnUserInteraction(
    activationOptions: ActiveListActivationOptions<T>,
    config: ActiveListAutoplayConfig<T>
  ): boolean {
    // Stop when autoPlay.stopsOnUserInteraction is true and this
    // is a user interaction.
    return !!(
      activationOptions &&
      activationOptions.isUserInteraction &&
      config.stopsOnUserInteraction
    );
  }

  private _getDuration(
    config: ActiveListAutoplayConfig<T>,
    lastActivatedContent: ActiveListContent<T>
  ): number {
    if (this._pauseStarted) {
      return (
        this._autoplayCurrentDuration -
        (this._pauseStarted.getTime() - this._autoplayStarted.getTime())
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

        1. Stop the autoplay completely.

        2. Activate the first item after a fallback duration, this 
           would be an extra config item.
          
        3. Activate the first item immediately without a delay. Or with
           a timeout of 0 seconds.

        All seem reasonable, but there is one deciding factor: what
        happens when the user deactivates all items. When this happens
        I think we should stop the autoplay. The reason is this: say
        the end-user sees 1 active item, and he deactivates it, what
        does the autoplay trigger, the start or the next item...

        Both options would feel really strange, so the best thing is
        to simply stop.

        Now it is very important to document this behavior, that when
        no items remain active, that the autoplay stops.
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
