import { common } from "./common";

/**
 * Error which is thrown whenever the Typewriter is configured with an 
 * action which uses a cursor which does not exist.
 * 
 * @since 1.2.0
 */
export class TypewriterActionUnknownCursorError extends Error {
  constructor() {
    super(`${common} action uses an unknown cursor`);
    this.name = "TypewriterActionUnknownCursorError";
  }
}
