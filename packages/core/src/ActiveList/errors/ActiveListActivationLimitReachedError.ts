import { common } from './common';

/**
 * Error which is thrown whenever the ActiveList is in
 * `ActiveListMaxActivationLimitBehavior` mode `error`, when the
 * `maxActivationLimit` is exceeded.
 *
 * @since 1.0.0
 */
export class ActiveListActivationLimitReachedError extends Error {
  /**
   * ActiveListActivationLimitReachedError constructor
   *
   * @since 1.0.0
   */
  constructor() {
    super(`${common} activateByIndex > activation limit reached`);
    this.name = 'ActiveListActivationLimitReachedError';
  }
}
