import { common, name } from "./common";

/**
 * Error which is thrown whenever the configured repeatDelay is less 
 * than zero. 
 * 
 * @since 1.2.0
 */
export class TypewriterRepeatDelayError extends Error {
  constructor() {
    super(`${common} repeatDelay cannot be a negative number`);
    this.name = `${name}RepeatDelayError`;
  }
}
