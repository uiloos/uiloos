import { ActiveList } from './ActiveList';
import { ActiveListContent } from './ActiveListContent';
import { ActiveListCooldownDurationError } from './errors/ActiveListCooldownDurationError';
import {
  ActiveListActivationOptions,
  ActiveListCooldownConfig,
  ActiveListCooldownEndedEvent,
  ActiveListCooldownStartedEvent,
} from './types';

// _CooldownTimer is a PRIVATE class, it should not be exposed directly.
export class _CooldownTimer<T> {
  /*
    The timeoutId given back by calling window.setTimeout for when 
    cooldown is enabled. Is kept here so it can be cleared via
    window.clearTimeout.
  */
  private _cooldownTimeoutId: number | null = null;

  // The current cooldown config is stored here
  private _cooldown: ActiveListCooldownConfig<T> | undefined = undefined;

  // Reference to the ActiveList is it a part of.
  private _activeList: ActiveList<T>;

  constructor(
    activeList: ActiveList<T>,
    cooldown: ActiveListCooldownConfig<T> | undefined
  ) {
    if (typeof cooldown === 'number') {
      this._assertDuration(cooldown);
    }

    this._activeList = activeList;

    this._cooldown = cooldown;
  }

  public _isActive(activationOptions: ActiveListActivationOptions<T>): boolean {
    // When the interaction was not caused by a user it should not
    // be affected by the cooldown. Note that `undefined` is treated
    // as `true`.
    if (activationOptions.isUserInteraction === false) {
      return false;
    }

    return this._activeList.cooldown.isActive;
  }

  public _setCooldown(
    activationOptions: ActiveListActivationOptions<T>,
    content: ActiveListContent<T>
  ): void {
    // When not a user interaction do nothing, as non user interactions
    // bypass any cooldown. Note that `undefined` is treated as `true`.
    if (activationOptions.isUserInteraction === false) {
      return;
    }

    const duration = this._getDuration(activationOptions, content);

    if (duration === -1) {
      this._stopCooldown();
      return;
    }

    this._activeList.cooldown.isActive = true;
    this._activeList.cooldown.duration = duration;

    this._cooldownTimeoutId = window.setTimeout(() => {
      this._stopCooldown();
    }, duration);

    const event: ActiveListCooldownStartedEvent = {
      type: 'COOLDOWN_STARTED',
      time: new Date(),
    };

    this._activeList._inform(event);
  }

  private _getDuration(
    activationOptions: ActiveListActivationOptions<T>,
    content: ActiveListContent<T>
  ): number {
    let duration = -1;

    // Check against undefined because cooldown can also be zero,
    // which is a falsey value.
    if (activationOptions.cooldown !== undefined) {
      duration = this._getDurationFromConfig(
        activationOptions.cooldown,
        content
      );
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

  private _stopCooldown() {
    if (this._cooldownTimeoutId) {
      window.clearTimeout(this._cooldownTimeoutId);
    }

    if (!this._activeList.cooldown.isActive) {
      return;
    }

    this._activeList.cooldown.isActive = false;
    this._activeList.cooldown.duration = 0;

    const event: ActiveListCooldownEndedEvent = {
      type: 'COOLDOWN_ENDED',
      time: new Date(),
    };

    this._activeList._inform(event);
  }
}
