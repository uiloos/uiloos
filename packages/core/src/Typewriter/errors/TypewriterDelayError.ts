import { common } from "./common";

/**
 * Error which is thrown whenever the configured delay for a
 * TypewriterKeystroke is zero or less than zero. 
 * 
 * @since 1.2.0
 */
export class TypewriterDelayError extends Error {
  constructor() {
    super(`${common} delay cannot be negative or zero`);
    this.name = "TypewriterDelayError";
  }
}
