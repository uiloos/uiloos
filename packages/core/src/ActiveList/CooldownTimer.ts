import { ActiveList } from './ActiveList';
import { ActiveListContent } from './ActiveListContent';
import { ActiveListCooldownDurationError } from './errors/ActiveListCooldownDurationError';
import { ActiveListActivationOptions, ActiveListCooldownConfig } from './types';

export class CooldownTimer<T> {
  // The time in unix epoch the last activation occurred. Is used
  // to calculate the cooldown time.
  private lastTime: number = Date.now();

  // The time in unix epoch the cooldown will end
  private cooldownEnds: number = Date.now() - 1;

  // The current cooldown is stored here
  private cooldown: ActiveListCooldownConfig<T> | undefined = undefined;

  // Reference to the active content is it a part of.
  private activeList: ActiveList<T>;

  constructor(activeList: ActiveList<T>, cooldown: ActiveListCooldownConfig<T> | undefined) {
    if (typeof cooldown === 'number') {
      this.assertDuration(cooldown);
    }

    this.activeList = activeList;

    this.cooldown = cooldown;
  }

  public isActive(activationOptions: ActiveListActivationOptions<T>): boolean {
    // When the interaction was not caused by a user it should not
    // be affected by the cooldown.
    if (!activationOptions.isUserInteraction) {
      return false;
    }

    const now = Date.now();

    return now <= this.cooldownEnds;
  }

  public setCooldown(activationOptions: ActiveListActivationOptions<T>, content: ActiveListContent<T>): void {
    // When not a user interaction, do not set the `lastTime` and
    // `cooldownEnds` so the current cooldown is remembered.
    if (!activationOptions.isUserInteraction) {
      return;
    }
    
    const duration = this.getDuration(activationOptions, content);

    this.lastTime = Date.now();

    this.cooldownEnds = this.lastTime + duration;
  }

  private getDuration(activationOptions: ActiveListActivationOptions<T>, content: ActiveListContent<T>): number {
    let duration = -1;

    // Check against undefined because cooldown can also be zero,
    // which is a falsey value.
    if (activationOptions.cooldown !== undefined) {
      duration = this.getDurationFromConfig(activationOptions.cooldown, content);
    } else if (this.cooldown !== undefined) {
      duration = this.getDurationFromConfig(this.cooldown, content);
    } else {
      // Do not assert the cooldown on purpose here as it is just
      // the default cooldown.
      return -1;
    }
    
    this.assertDuration(duration);

    return duration;
  }

  private getDurationFromConfig(
    cooldownConfig: ActiveListCooldownConfig<T>,
    content: ActiveListContent<T>
  ): number {
    if (typeof cooldownConfig === 'number') {
      return cooldownConfig;
    } else {
      return cooldownConfig({
        index: content.index,
        content: content,
        value: content.value,
        activeList: this.activeList,
      });
    }
  }

  private assertDuration(cooldownValue: number) {
    if (cooldownValue <= 0) {
      throw new ActiveListCooldownDurationError();
    }
  }
}
