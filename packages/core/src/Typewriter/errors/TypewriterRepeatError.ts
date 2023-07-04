import { common, name } from './common';

/**
 * Error which is thrown whenever the configured repeat is zero
 * or less than zero.
 *
 * @since 1.2.0
 */
export class TypewriterRepeatError extends Error {
  /**
   * TypewriterRepeatError constructor
   *
   * @since 1.2.0
   */
  constructor() {
    super(`${common} repeat cannot be negative or zero`);
    this.name = `${name}RepeatError`;
  }
}
