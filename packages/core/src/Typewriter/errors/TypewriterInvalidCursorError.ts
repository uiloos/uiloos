import { common } from "./common";

/**
 * Error which is thrown whenever the cursors are placed outside
 * of the text of the Typewriter.
 * 
 * @since 1.2.0
 */
export class TypewriterInvalidCursorError extends Error {
  constructor() {
    super(`${common} cursor is out of bounds`);
    this.name = "TypewriterInvalidCursorError";
  }
}
