import { common } from "./common";

/**
 * Error which is thrown whenever the ActiveList is in 
 * `ActiveListMaxActivationLimitBehavior` mode `error`, when the
 * `maxActivationLimit` is exceeded.
 */
export class ActiveListActivationLimitReachedError extends Error {
  constructor() {
    super(`${common} activateByIndex > activation limit reached`);
    this.name = "ActiveListActivationLimitReachedError";
  }
}
