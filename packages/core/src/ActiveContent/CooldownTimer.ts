import { ActivationOptions, CooldownConfig } from './types';

export class CooldownTimer<T> {
  // The time in unix epoch the last activation occurred. Is used
  // to calculate the cooldown time.
  private lastTime: number = Date.now();

  // The current cooldown is stored here
  private cooldown: CooldownConfig<T> | undefined = undefined;

  constructor(cooldown: CooldownConfig<T> | undefined) {
    if (typeof cooldown === 'number') {
      this.assertCooldownNotNegativeOrZero(cooldown);
    }

    this.cooldown = cooldown;
  }

  public isActive(
    activationOptions: ActivationOptions<T>,
    item: T,
    index: number
  ): boolean {
    // When the interaction was not caused by a user it should not
    // be affected by the cooldown.
    if (!activationOptions.isUserInteraction) {
      return false;
    }

    // Check against undefined because cooldown can also be zero,
    // which is a falsey value.
    if (activationOptions.cooldown !== undefined) {
      return this.isCooldownActive(activationOptions.cooldown, item, index);
    } else if (this.cooldown !== undefined) {
      return this.isCooldownActive(this.cooldown, item, index);
    }

    // If there are no cooldown options no cooldown is active.
    return false;
  }

  public setLastTime() {
    this.lastTime = Date.now();
  }

  private isCooldownActive(
    cooldownConfig: CooldownConfig<T>,
    item: T,
    index: number
  ): boolean {
    // If it is a function call it for the cooldown
    const cooldownValue =
      typeof cooldownConfig === 'number'
        ? cooldownConfig
        : cooldownConfig(item, index);

    this.assertCooldownNotNegativeOrZero(cooldownValue);

    const now = Date.now();
    const cooldownEnds = this.lastTime + cooldownValue;

    return now <= cooldownEnds;
  }

  private assertCooldownNotNegativeOrZero(cooldownValue: number) {
    if (cooldownValue <= 0) {
      throw new Error('uiloos > cooldown cannot be negative or zero');
    }
  }
}
