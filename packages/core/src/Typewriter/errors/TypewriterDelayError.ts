import { common, name } from './common';

/**
 * Error which is thrown whenever the configured delay for a
 * TypewriterAction is zero or less than zero.
 *
 * @since 1.2.0
 */
export class TypewriterDelayError extends Error {
  /**
   * TypewriterDelayError constructor
   *
   * @since 1.2.0
   */
  constructor() {
    super(`${common} delay cannot be negative or zero`);
    this.name = `${name}DelayError`;
  }
}
