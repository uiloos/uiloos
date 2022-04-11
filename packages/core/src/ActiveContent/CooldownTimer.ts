import { ActiveContent } from './ActiveContent';
import { Content } from './Content';
import { ActivationOptions, CooldownConfig } from './types';

export class CooldownTimer<T> {
  // The time in unix epoch the last activation occurred. Is used
  // to calculate the cooldown time.
  private lastTime: number = Date.now();

  // The time in unix epoch the cooldown will end
  private cooldownEnds: number = Date.now() - 1;

  // The current cooldown is stored here
  private cooldown: CooldownConfig<T> | undefined = undefined;

  // Reference to the active content is it a part of.
  private activeContent: ActiveContent<T>;

  constructor(activeContent: ActiveContent<T>, cooldown: CooldownConfig<T> | undefined) {
    if (typeof cooldown === 'number') {
      this.assertCooldownNotNegativeOrZero(cooldown);
    }

    this.activeContent = activeContent;

    this.cooldown = cooldown;
  }

  public isActive(activationOptions: ActivationOptions<T>): boolean {
    // When the interaction was not caused by a user it should not
    // be affected by the cooldown.
    if (!activationOptions.isUserInteraction) {
      return false;
    }

    const now = Date.now();

    return now <= this.cooldownEnds;
  }

  public setCooldown(activationOptions: ActivationOptions<T>, content: Content<T>): void {
    // When not a user interaction, do not set the `lastTime` and
    // `cooldownEnds` so the current cooldown is remembered.
    if (!activationOptions.isUserInteraction) {
      return;
    }
    
    const duration = this.getDuration(activationOptions, content);

    this.lastTime = Date.now();

    this.cooldownEnds = this.lastTime + duration;
  }

  private getDuration(activationOptions: ActivationOptions<T>, content: Content<T>): number {
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

    this.assertCooldownNotNegativeOrZero(duration);

    return duration;
  }

  private getDurationFromConfig(
    cooldownConfig: CooldownConfig<T>,
    content: Content<T>
  ): number {
    if (typeof cooldownConfig === 'number') {
      return cooldownConfig;
    } else {
      return cooldownConfig({
        index: content.index,
        content: content,
        value: content.value,
        activeContent: this.activeContent,
      });
    }
  }

  private assertCooldownNotNegativeOrZero(cooldownValue: number) {
    if (cooldownValue <= 0) {
      throw new Error('uiloos > cooldown cannot be negative or zero');
    }
  }
}
