import { common } from "./common";

/**
 * Error which is thrown whenever the cooldown duration is zero or
 * less than zero. 
 * 
 * WARNING: when this error is thrown because a
 * `ActiveListCooldownDurationCallback` callback function returned a 
 * negative or zero duration, the activation / deactivation will still 
 * have occurred! This error is considered a developer error on your
 * part and you should prevent it, as the ActiveList is now invalid.
 */
export class ActiveListCooldownDurationError extends Error {
  constructor() {
    super(`${common} cooldown > duration cannot be negative or zero`);
    this.name = "ActiveListCooldownDurationError";
  }
}
