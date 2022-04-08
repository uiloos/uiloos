import { ActionOptions, ActiveContent, AutoplayConfig } from '..';

export class Autoplay<T> {
  /*
    The timeoutId given back by calling window.setTimeout for when 
    autoplay is enabled. Is kept here so it can be cleared via
    window.clearTimeout.
  */
  private autoplayTimeoutId: number | null = null;

  /*
    The date on which the autoplay started, used to calculate
    what the interval should be after a pause is resumed.
  */
  private autoplayStarted: Date = new Date();

  /*
    The date on which the pause started, used to calculate
    what the interval should be after a pause is resumed.
  */
  private pauseStarted: Date | null = null;

  /*
    The current interval time of the current active content, used to calculate
    what the interval should be after a pause is resumed.
  */
  private autoplayCurrentInterval: number = 0;

  /**
   * Contains the configuration of the autoplay.
   */
  private config?: AutoplayConfig<T> | null = null;

  /**
   * Reference to the active content is it a part of.
   */
  private activeContent: ActiveContent<T>;

  constructor(
    activeContent: ActiveContent<T>,
    config: AutoplayConfig<T> | null
  ) {
    this.activeContent = activeContent;
    this.config = config;
  }

  public setConfig(config: AutoplayConfig<T> | null): void {
    this.config = config;
  }

  public isPlaying(): boolean {
    return this.autoplayTimeoutId !== null;
  }

  public play(): void {
    // Cancel timer to prevent multiple timeouts from being active.
    this.cancelTimer();

    // Stop the interval when autoplay is false or when the content
    // has become empty.
    if (!this.config || this.activeContent.isEmpty()) {
      return;
    }

    const interval = this.pauseStarted
      ? this.autoplayCurrentInterval -
        (this.pauseStarted.getTime() - this.autoplayStarted.getTime())
      : typeof this.config.interval === 'number'
      ? this.config.interval
      : this.config.interval(
          // This cast is valid because there is content at this point
          // and one content must always be active.
          this.activeContent.lastActivated as T,
          this.activeContent.lastActivatedIndex
        );

    if (interval <= 0) {
      throw new Error(
        'uiloos > ActiveContent.autoplay interval cannot be negative or zero'
      );
    }

    this.autoplayCurrentInterval = interval;
    this.autoplayStarted = new Date();

    this.autoplayTimeoutId = window.setTimeout(() => {
      // It could happen that during the interval the contents is
      // now empty due to a removal, in this case we simply want to
      // do nothing.
      if (this.activeContent.isEmpty()) {
        return;
      }

      // Clear the timeout now that we have performed it. This way
      // the call to `cancelTimer` which is triggered by the following chain:
      // `next->activateByIndex->onActiveIndexChanged->play->cancelTimer`
      // does not need to call window.clearTimeout. This is just a
      // very minor performance boost. On other reason to do this
      // is that when debugging this code, it is slightly easier to
      // follow due to the `autoplayTimeoutId` getting cleaned up,
      // otherwise it looks like the timeout is still in progress.
      this.autoplayTimeoutId = null;

      // Call next to actually trigger going to the next active content.
      this.activeContent.activateNext({ isUserInteraction: false });
    }, interval);
  }

  public pause(): void {
    // Store the time when the pause was pressed, so we can calculate
    // the resuming interval later.
    this.pauseStarted = new Date();

    this.cancelTimer();
  }

  public stop(): void {
    this.cancelTimer();

    this.pauseStarted = null;
  }

  private cancelTimer() {
    if (this.autoplayTimeoutId !== null) {
      window.clearTimeout(this.autoplayTimeoutId);
      this.autoplayTimeoutId = null;
    }
  }

  public onDeactivation(actionOptions: ActionOptions<T>) {
    // If there is no autoplay config do not bother.
    if (!this.config) {
      return;
    }

    if (this.shouldStopOnUserInteraction(actionOptions, this.config)) {
      this.stop();
    }
  }

  public onActiveIndexChanged(index: number, actionOptions: ActionOptions<T>) {
    // If there is no autoplay config do not bother.
    if (!this.config) {
      return;
    }

    if (this.shouldStopOnUserInteraction(actionOptions, this.config)) {
      this.stop();
    } else if (
      this.activeContent.isCircular === false &&
      index === this.activeContent.getLastIndex()
    ) {
      // When the ActiveContent is linear stop autoplay at the end.
      this.stop();
    } else {
      // Move the autoplay to the next "timer", needed because
      // each "item" can have a unique "interval" in which it
      // is active.

      this.play();
    }
  }

  private shouldStopOnUserInteraction(
    actionOptions: ActionOptions<T>,
    config: AutoplayConfig<T>
  ): boolean {
    // Stop when autoPlay.stopsOnUserInteraction is true and this
    // is a user interaction.
    return !!(
      actionOptions &&
      actionOptions.isUserInteraction &&
      config.stopsOnUserInteraction
    );
  }
}
