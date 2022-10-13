import { common } from "./common";

/**
 * Error which is thrown whenever the configured blinkAfter is zero 
 * or less than zero. 
 * 
 * @since 1.2.0
 */
export class TypewriterBlinkAfterError extends Error {
  constructor() {
    super(`${common} blinkAfter cannot be negative or zero`);
    this.name = "TypewriterBlinkAfterError";
  }
}
