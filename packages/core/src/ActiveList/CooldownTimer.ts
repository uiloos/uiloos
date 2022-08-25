import { ActiveList } from './ActiveList';
import { ActiveListContent } from './ActiveListContent';
import { ActiveListCooldownDurationError } from './errors/ActiveListCooldownDurationError';
import { ActiveListActivationOptions, ActiveListCooldownConfig } from './types';

// _CooldownTimer is a PRIVATE class, it should not be exposed directly.
export class _CooldownTimer<T> {
  // The time in unix epoch the last activation occurred. Is used
  // to calculate the cooldown time.
  private _lastTime: number = Date.now();

  // The time in unix epoch the cooldown will end
  private _cooldownEnds: number = Date.now() - 1;

  // The current cooldown is stored here
  private _cooldown: ActiveListCooldownConfig<T> | undefined = undefined;

  // Reference to the active content is it a part of.
  private _activeList: ActiveList<T>;

  constructor(activeList: ActiveList<T>, cooldown: ActiveListCooldownConfig<T> | undefined) {
    if (typeof cooldown === 'number') {
      this._assertDuration(cooldown);
    }

    this._activeList = activeList;

    this._cooldown = cooldown;
  }

  public _isActive(activationOptions: ActiveListActivationOptions<T>): boolean {
    // When the interaction was not caused by a user it should not
    // be affected by the cooldown.
    if (!activationOptions.isUserInteraction) {
      return false;
    }

    const now = Date.now();

    return now <= this._cooldownEnds;
  }

  public _setCooldown(activationOptions: ActiveListActivationOptions<T>, content: ActiveListContent<T>): void {
    // When not a user interaction, do not set the `_lastTime` and
    // `_cooldownEnds` so the current cooldown is remembered.
    if (!activationOptions.isUserInteraction) {
      return;
    }
    
    const duration = this._getDuration(activationOptions, content);

    this._lastTime = Date.now();

    this._cooldownEnds = this._lastTime + duration;
  }

  private _getDuration(activationOptions: ActiveListActivationOptions<T>, content: ActiveListContent<T>): number {
    let duration = -1;

    // Check against undefined because cooldown can also be zero,
    // which is a falsey value.
    if (activationOptions.cooldown !== undefined) {
      duration = this._getDurationFromConfig(activationOptions.cooldown, content);
    } else if (this._cooldown !== undefined) {
      duration = this._getDurationFromConfig(this._cooldown, content);
    } else {
      // Do not assert the cooldown on purpose here as it is just
      // the default cooldown.
      return -1;
    }
    
    this._assertDuration(duration);

    return duration;
  }

  private _getDurationFromConfig(
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
        activeList: this._activeList,
      });
    }
  }

  private _assertDuration(cooldownValue: number) {
    if (cooldownValue <= 0) {
      throw new ActiveListCooldownDurationError();
    }
  }
}
