
import { ActiveList } from './ActiveList';
import { ActiveListContent } from './ActiveListContent';
import { ActiveListAutoplayDurationError } from './errors/ActiveListAutoplayDurationError';
import { ActiveListAutoplayConfig, ActiveListActivationOptions } from './types';

export class Autoplay<T> {
  /*
    The timeoutId given back by calling window.setTimeout for when 
    autoplay is enabled. Is kept here so it can be cleared via
    window.clearTimeout.
  */
  private autoplayTimeoutId: number | null = null;

  /*
    The date on which the autoplay started, used to calculate
    what the duration should be after a pause is resumed.
  */
  private autoplayStarted: Date = new Date();

  /*
    The date on which the pause started, used to calculate
    what the duration should be after a pause is resumed.
  */
  private pauseStarted: Date | null = null;

  /*
    The current duration time of the current active content, used to calculate
    what the duration should be after a pause is resumed.
  */
  private autoplayCurrentDuration: number = 0;

  /**
   * Contains the configuration of the autoplay.
   */
  private config?: ActiveListAutoplayConfig<T> | null = null;

  /**
   * Reference to the active content is it a part of.
   */
  private activeList: ActiveList<T>;

  constructor(
    activeList: ActiveList<T>,
    config: ActiveListAutoplayConfig<T> | null
  ) {
    this.activeList = activeList;
    this.config = config;
  }

  public setConfig(config: ActiveListAutoplayConfig<T> | null): void {
    this.config = config;
  }

  public isPlaying(): boolean {
    return this.autoplayTimeoutId !== null;
  }

  public play(): void {
    // Cancel timer to prevent multiple timeouts from being active.
    this.cancelTimer();

    // Stop playing when autoplay is false, when the content has
    // become empty, or when there is no more lastActivatedContent.
    if (
      !this.config ||
      this.activeList.isEmpty() ||
      this.activeList.lastActivatedContent === null
    ) {
      return;
    }

    const duration = this.getDuration(
      this.config,
      this.activeList.lastActivatedContent
    );

    if (duration <= 0) {
      throw new ActiveListAutoplayDurationError();
    }

    this.autoplayCurrentDuration = duration;
    this.autoplayStarted = new Date();

    this.autoplayTimeoutId = window.setTimeout(() => {
      // It could happen that during the "duration" the contents, or
      // active is  now empty due to a removal / deactivation, in this
      // case we simply want to do nothing.
      if (
        this.activeList.isEmpty() ||
        this.activeList.lastActivatedContent === null
      ) {
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
      this.activeList.activateNext({ isUserInteraction: false });
    }, duration);
  }

  public pause(): void {
    // Store the time when the pause was pressed, so we can calculate
    // the resuming duration later.
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

  public onDeactivation(activationOptions: ActiveListActivationOptions<T>) {
    // If there is no autoplay config do not bother.
    if (!this.config) {
      return;
    }

    if (this.shouldStopOnUserInteraction(activationOptions, this.config)) {
      this.stop();
    }
  }

  public onActiveIndexChanged(
    index: number,
    activationOptions: ActiveListActivationOptions<T>
  ) {
    // If there is no autoplay config do not bother.
    if (!this.config) {
      return;
    }

    if (this.shouldStopOnUserInteraction(activationOptions, this.config)) {
      this.stop();
    } else if (
      this.activeList.isCircular === false &&
      index === this.activeList.getLastIndex()
    ) {
      // When the ActiveList is linear stop autoplay at the end.
      this.stop();
    } else {
      // Move the autoplay to the next "timer", needed because
      // each "item" can have a unique "duration" in which it
      // is active.

      this.play();
    }
  }

  private shouldStopOnUserInteraction(
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

  private getDuration(
    config: ActiveListAutoplayConfig<T>,
    lastActivatedContent: ActiveListContent<T>
  ): number {
    if (this.pauseStarted) {
      return (
        this.autoplayCurrentDuration -
        (this.pauseStarted.getTime() - this.autoplayStarted.getTime())
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
        activeList: this.activeList,
      });
    }
  }
}
